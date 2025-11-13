'use client';

import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { Card, CardContent } from '../ui/card';
import { useMemo } from 'react';

const slabSchema = z.object({
  width: z.coerce.number().positive().optional().nullable(),
  length: z.coerce.number().positive().optional().nullable(),
  thickness: z.coerce.number().positive().optional().nullable(),
});

const footingSchema = z.object({
  length: z.coerce.number().positive().optional().nullable(),
  width: z.coerce.number().positive().optional().nullable(),
  depth: z.coerce.number().positive().optional().nullable(),
});

const roundPierHoleSchema = z.object({
  count: z.coerce.number().int().positive().optional().nullable(),
  diameter: z.coerce.number().positive().optional().nullable(),
  depth: z.coerce.number().positive().optional().nullable(),
});

const squarePierHoleSchema = z.object({
  count: z.coerce.number().int().positive().optional().nullable(),
  width: z.coerce.number().positive().optional().nullable(),
  length: z.coerce.number().positive().optional().nullable(),
  depth: z.coerce.number().positive().optional().nullable(),
});

const costSchema = z.object({
  concretePrice: z.coerce.number().min(0).optional().nullable(),
  rebarPrice: z.coerce.number().min(0).optional().nullable(),
  laborPrice: z.coerce.number().min(0).optional().nullable(),
});

const quoteFormSchema = z.object({
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  jobDetails: z.string().optional(),
  slabs: z.array(slabSchema).optional(),
  footings: z.array(footingSchema).optional(),
  roundPierHoles: z.array(roundPierHoleSchema).optional(),
  squarePierHoles: z.array(squarePierHoleSchema).optional(),
  costs: costSchema.optional(),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold mt-6 mb-2">{children}</h3>
);

export function QuoteForm() {
  const { toast } = useToast();
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      jobDetails: '',
      slabs: [],
      footings: [],
      roundPierHoles: [],
      squarePierHoles: [],
      costs: {
        concretePrice: 200, // $/cubic yard
        rebarPrice: 1.5, // $/linear foot
        laborPrice: 5, // $/square foot
      },
    },
  });

  const { fields: slabFields, append: appendSlab, remove: removeSlab } = useFieldArray({ control: form.control, name: 'slabs' });
  const { fields: footingFields, append: appendFooting, remove: removeFooting } = useFieldArray({ control: form.control, name: 'footings' });
  const { fields: roundPierHoleFields, append: appendRoundPierHole, remove: removeRoundPierHole } = useFieldArray({ control: form.control, name: 'roundPierHoles' });
  const { fields: squarePierHoleFields, append: appendSquarePierHole, remove: removeSquarePierHole } = useFieldArray({ control: form.control, name: 'squarePierHoles' });


  const watchedValues = useWatch({ control: form.control });

  const calculations = useMemo(() => {
    const { slabs, footings, roundPierHoles, squarePierHoles, costs } = watchedValues;

    // Slab Calculations
    const totalSlabSqFt = (slabs || []).reduce((acc, s) => acc + (s.length || 0) * (s.width || 0), 0);
    const totalSlabCubicFt = (slabs || []).reduce((acc, s) => acc + (s.length || 0) * (s.width || 0) * ((s.thickness || 0) / 12), 0);
    const slabRebar = (slabs || []).reduce((acc, s) => acc + ((s.length || 0) * (Math.ceil((s.width || 0) / 2)) + (s.width || 0) * (Math.ceil((s.length || 0) / 2))), 0);

    // Footing Calculations
    const totalFootingCubicFt = (footings || []).reduce((acc, f) => acc + (f.length || 0) * ((f.width || 0) / 12) * ((f.depth || 0) / 12), 0);
    // Assuming 2 rows of rebar in footings
    const footingRebar = (footings || []).reduce((acc, f) => acc + (f.length || 0) * 2, 0);

    // Round Pier Hole Calculations
    const totalRoundPierHoleCubicFt = (roundPierHoles || []).reduce((acc, p) => {
        const radius = ((p.diameter || 0) / 12) / 2;
        return acc + ((p.count || 0) * Math.PI * Math.pow(radius, 2) * ((p.depth || 0) / 12));
    }, 0);
    
    // Square Pier Hole Calculations
    const totalSquarePierHoleCubicFt = (squarePierHoles || []).reduce((acc, p) => {
        return acc + ((p.count || 0) * ((p.length || 0) / 12) * ((p.width || 0) / 12) * ((p.depth || 0) / 12));
    }, 0);

    // Concrete
    const totalCubicFt = totalSlabCubicFt + totalFootingCubicFt + totalRoundPierHoleCubicFt + totalSquarePierHoleCubicFt;
    const totalCubicYards = totalCubicFt / 27;
    const concreteCost = totalCubicYards * (costs?.concretePrice || 0);
    
    // Rebar
    const totalRebar = slabRebar + footingRebar;
    const rebarCost = totalRebar * (costs?.rebarPrice || 0);

    // Labor
    const laborCost = totalSlabSqFt * (costs?.laborPrice || 0);
    
    // Totals
    const total = concreteCost + rebarCost + laborCost;

    return {
      totalSlabSqFt: totalSlabSqFt.toFixed(2),
      totalCubicYards: totalCubicYards.toFixed(2),
      concreteCost: concreteCost.toFixed(2),
      totalRebar: totalRebar.toFixed(2),
      rebarCost: rebarCost.toFixed(2),
      laborCost: laborCost.toFixed(2),
      total: total.toFixed(2),
    };
  }, [watchedValues]);

  function onSubmit(data: QuoteFormValues) {
    console.log({ ...data, calculations });
    toast({
      title: 'Quote Created',
      description: 'The new quote has been successfully saved.',
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <SectionTitle>Client Information</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="clientName" render={({ field }) => (
                <FormItem><FormLabel>Client Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="clientPhone" render={({ field }) => (
                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="555-123-4567" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="clientEmail" render={({ field }) => (
            <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input placeholder="john.doe@example.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="jobDetails" render={({ field }) => (
            <FormItem><FormLabel>Job Details</FormLabel><FormControl><Textarea placeholder="Briefly describe the job" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
        )}/>

        <Separator />
        
        <SectionTitle>Measurements</SectionTitle>
        
        {/* Slabs */}
        <div className="space-y-2">
            <FormLabel>Slab Dimensions (ft, ft, in)</FormLabel>
            {slabFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                    <FormField control={form.control} name={`slabs.${index}.length`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Length (ft)" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`slabs.${index}.width`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Width (ft)" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`slabs.${index}.thickness`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Thickness (in)" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSlab(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendSlab({ length: null, width: null, thickness: 4 })}><PlusCircle className="mr-2 h-4 w-4" />Add Slab</Button>
        </div>

        {/* Footings */}
        <div className="space-y-2">
            <FormLabel>Footing Dimensions (ft, in, in)</FormLabel>
            {footingFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                    <FormField control={form.control} name={`footings.${index}.length`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Length (ft)" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`footings.${index}.width`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Width (in)" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`footings.${index}.depth`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Depth (in)" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFooting(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendFooting({ length: null, width: 12, depth: 12 })}><PlusCircle className="mr-2 h-4 w-4" />Add Footing</Button>
        </div>

        {/* Round Pier Holes */}
        <div className="space-y-2">
            <FormLabel>Round Pier Hole Dimensions (count, in, in)</FormLabel>
            {roundPierHoleFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                    <FormField control={form.control} name={`roundPierHoles.${index}.count`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="No. of holes" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`roundPierHoles.${index}.diameter`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Diameter (in)" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`roundPierHoles.${index}.depth`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Depth (in)" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeRoundPierHole(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendRoundPierHole({ count: null, diameter: 12, depth: 24 })}><PlusCircle className="mr-2 h-4 w-4" />Add Round Pier Holes</Button>
        </div>

        {/* Square Pier Holes */}
        <div className="space-y-2">
            <FormLabel>Square Pier Hole Dimensions (count, in, in, in)</FormLabel>
            {squarePierHoleFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                    <FormField control={form.control} name={`squarePierHoles.${index}.count`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="No. of holes" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`squarePierHoles.${index}.length`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Length (in)" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`squarePierHoles.${index}.width`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Width (in)" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`squarePierHoles.${index}.depth`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Depth (in)" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSquarePierHole(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendSquarePierHole({ count: null, length: 12, width: 12, depth: 24 })}><PlusCircle className="mr-2 h-4 w-4" />Add Square Pier Holes</Button>
        </div>


        <Separator />
        
        <SectionTitle>Costing</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <FormField control={form.control} name="costs.concretePrice" render={({ field }) => (<FormItem><FormLabel>Concrete Price/yd³</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem>)}/>
             <FormField control={form.control} name="costs.rebarPrice" render={({ field }) => (<FormItem><FormLabel>Rebar Price/ft</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem>)}/>
             <FormField control={form.control} name="costs.laborPrice" render={({ field }) => (<FormItem><FormLabel>Labor Price/ft²</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem>)}/>
        </div>

        <Separator />

        <SectionTitle>Estimated Costs</SectionTitle>
        <Card>
            <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-medium">Total Sq Ft:</p>
                        <p className="text-muted-foreground">{calculations.totalSlabSqFt}</p>
                    </div>
                    <div>
                        <p className="font-medium">Total Concrete (yd³):</p>
                        <p className="text-muted-foreground">{calculations.totalCubicYards}</p>
                    </div>
                    <div>
                        <p className="font-medium">Total Rebar (ft):</p>
                        <p className="text-muted-foreground">{calculations.totalRebar}</p>
                    </div>
                </div>
                <Separator />
                <div className="space-y-2 text-right">
                    <p>Concrete: <span className="font-medium">${calculations.concreteCost}</span></p>
                    <p>Rebar: <span className="font-medium">${calculations.rebarCost}</span></p>
                    <p>Labor: <span className="font-medium">${calculations.laborCost}</span></p>
                    <Separator className="my-2"/>
                    <p className="text-xl font-bold">Total: <span className="text-primary">${calculations.total}</span></p>
                </div>
            </CardContent>
        </Card>


        <Button type="submit" className="w-full">Create Quote</Button>
      </form>
    </Form>
  );
}
