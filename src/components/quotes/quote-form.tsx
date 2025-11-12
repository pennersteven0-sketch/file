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
  width: z.coerce.number().positive(),
  length: z.coerce.number().positive(),
  thickness: z.coerce.number().positive(),
});

const footingSchema = z.object({
  length: z.coerce.number().positive(),
  width: z.coerce.number().positive(),
  depth: z.coerce.number().positive(),
});

const pierHoleSchema = z.object({
  count: z.coerce.number().int().positive(),
  diameter: z.coerce.number().positive(),
  depth: z.coerce.number().positive(),
});

const costSchema = z.object({
  concretePrice: z.coerce.number().min(0),
  rebarPrice: z.coerce.number().min(0),
  laborPrice: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(100),
});

const quoteFormSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email('Invalid email address').optional(),
  jobDetails: z.string().min(1, 'Job details are required'),
  slabs: z.array(slabSchema),
  footings: z.array(footingSchema),
  pierHoles: z.array(pierHoleSchema),
  costs: costSchema,
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
      pierHoles: [],
      costs: {
        concretePrice: 200, // $/cubic yard
        rebarPrice: 1.5, // $/linear foot
        laborPrice: 5, // $/square foot
        taxRate: 8, // percentage
      },
    },
  });

  const { fields: slabFields, append: appendSlab, remove: removeSlab } = useFieldArray({ control: form.control, name: 'slabs' });
  const { fields: footingFields, append: appendFooting, remove: removeFooting } = useFieldArray({ control: form.control, name: 'footings' });
  const { fields: pierHoleFields, append: appendPierHole, remove: removePierHole } = useFieldArray({ control: form.control, name: 'pierHoles' });

  const watchedValues = useWatch({ control: form.control });

  const calculations = useMemo(() => {
    const { slabs, footings, pierHoles, costs } = watchedValues;

    // Slab Calculations
    const totalSlabSqFt = (slabs || []).reduce((acc, s) => acc + (s.length || 0) * (s.width || 0), 0);
    const totalSlabCubicFt = (slabs || []).reduce((acc, s) => acc + (s.length || 0) * (s.width || 0) * ((s.thickness || 0) / 12), 0);
    const slabRebar = (slabs || []).reduce((acc, s) => acc + ((s.length || 0) * (Math.ceil((s.width || 0) / 2)) + (s.width || 0) * (Math.ceil((s.length || 0) / 2))), 0);

    // Footing Calculations
    const totalFootingCubicFt = (footings || []).reduce((acc, f) => acc + (f.length || 0) * ((f.width || 0) / 12) * ((f.depth || 0) / 12), 0);
    // Assuming 2 rows of rebar in footings
    const footingRebar = (footings || []).reduce((acc, f) => acc + (f.length || 0) * 2, 0);

    // Pier Hole Calculations
    const totalPierHoleCubicFt = (pierHoles || []).reduce((acc, p) => {
        const radius = ((p.diameter || 0) / 12) / 2;
        return acc + ((p.count || 0) * Math.PI * Math.pow(radius, 2) * ((p.depth || 0) / 12));
    }, 0);
    
    // Concrete
    const totalCubicFt = totalSlabCubicFt + totalFootingCubicFt + totalPierHoleCubicFt;
    const totalCubicYards = totalCubicFt / 27;
    const concreteCost = totalCubicYards * (costs?.concretePrice || 0);
    
    // Rebar
    const totalRebar = slabRebar + footingRebar;
    const rebarCost = totalRebar * (costs?.rebarPrice || 0);

    // Labor
    const laborCost = totalSlabSqFt * (costs?.laborPrice || 0);
    
    // Totals
    const subtotal = concreteCost + rebarCost + laborCost;
    const tax = subtotal * ((costs?.taxRate || 0) / 100);
    const total = subtotal + tax;

    return {
      totalSlabSqFt: totalSlabSqFt.toFixed(2),
      totalCubicYards: totalCubicYards.toFixed(2),
      concreteCost: concreteCost.toFixed(2),
      totalRebar: totalRebar.toFixed(2),
      rebarCost: rebarCost.toFixed(2),
      laborCost: laborCost.toFixed(2),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
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
                <FormItem><FormLabel>Client Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="clientPhone" render={({ field }) => (
                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="555-123-4567" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="clientEmail" render={({ field }) => (
            <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input placeholder="john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="jobDetails" render={({ field }) => (
            <FormItem><FormLabel>Job Details</FormLabel><FormControl><Textarea placeholder="Briefly describe the job" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>

        <Separator />
        
        <SectionTitle>Measurements</SectionTitle>
        
        {/* Slabs */}
        <div className="space-y-2">
            <FormLabel>Slab Dimensions (ft, ft, in)</FormLabel>
            {slabFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                    <FormField control={form.control} name={`slabs.${index}.length`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Length (ft)" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`slabs.${index}.width`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Width (ft)" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`slabs.${index}.thickness`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Thickness (in)" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSlab(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendSlab({ length: 0, width: 0, thickness: 4 })}><PlusCircle className="mr-2 h-4 w-4" />Add Slab</Button>
        </div>

        {/* Footings */}
        <div className="space-y-2">
            <FormLabel>Footing Dimensions (ft, in, in)</FormLabel>
            {footingFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                    <FormField control={form.control} name={`footings.${index}.length`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Length (ft)" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`footings.${index}.width`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Width (in)" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`footings.${index}.depth`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Depth (in)" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFooting(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendFooting({ length: 0, width: 12, depth: 12 })}><PlusCircle className="mr-2 h-4 w-4" />Add Footing</Button>
        </div>

        {/* Pier Holes */}
        <div className="space-y-2">
            <FormLabel>Peer Hole Dimensions (Round)</FormLabel>
            {pierHoleFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                    <FormField control={form.control} name={`pierHoles.${index}.count`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="No. of holes" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`pierHoles.${index}.diameter`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Diameter (in)" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name={`pierHoles.${index}.depth`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input type="number" placeholder="Depth (in)" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removePierHole(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendPierHole({ count: 0, diameter: 12, depth: 24 })}><PlusCircle className="mr-2 h-4 w-4" />Add Pier Holes</Button>
        </div>

        <Separator />
        
        <SectionTitle>Costing</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <FormField control={form.control} name="costs.concretePrice" render={({ field }) => (<FormItem><FormLabel>Concrete Price/yd³</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)}/>
             <FormField control={form.control} name="costs.rebarPrice" render={({ field }) => (<FormItem><FormLabel>Rebar Price/ft</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)}/>
             <FormField control={form.control} name="costs.laborPrice" render={({ field }) => (<FormItem><FormLabel>Labor Price/ft²</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)}/>
             <FormField control={form.control} name="costs.taxRate" render={({ field }) => (<FormItem><FormLabel>Tax Rate (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)}/>
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
                    <p className="font-semibold">Subtotal: <span className="font-bold">${calculations.subtotal}</span></p>
                    <p className="text-sm">Tax ({watchedValues.costs?.taxRate || 0}%): <span className="font-medium">${calculations.tax}</span></p>
                    <p className="text-xl font-bold">Total: <span className="text-primary">${calculations.total}</span></p>
                </div>
            </CardContent>
        </Card>


        <Button type="submit" className="w-full">Create Quote</Button>
      </form>
    </Form>
  );
}
