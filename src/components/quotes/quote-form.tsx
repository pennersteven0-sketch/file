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
import { cn } from '@/lib/utils';

const slabSchema = z.object({
  width: z.coerce.number().positive().optional().nullable(),
  length: z.coerce.number().positive().optional().nullable(),
  thickness: z.coerce.number().positive().optional().nullable(),
  rebarSpacing: z.coerce.number().positive().optional().nullable(),
});

const footingSchema = z.object({
  length: z.coerce.number().positive().optional().nullable(),
  width: z.coerce.number().positive().optional().nullable(),
  depth: z.coerce.number().positive().optional().nullable(),
  rebarRows: z.coerce.number().int().positive().optional().nullable(),
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

const travelCostSchema = z.object({
  trips: z.coerce.number().int().positive().optional().nullable(),
  trucks: z.coerce.number().int().positive().optional().nullable(),
  miles: z.coerce.number().positive().optional().nullable(),
});

const laborSchema = z.object({
  employees: z.coerce.number().int().positive().optional().nullable(),
  days: z.coerce.number().positive().optional().nullable(),
  costPerDay: z.coerce.number().positive().optional().nullable(),
});

const equipmentSchema = z.object({
    name: z.string().optional(),
    daysUsed: z.coerce.number().positive().optional().nullable(),
    pricePerDay: z.coerce.number().positive().optional().nullable(),
});

const otherExpenseSchema = z.object({
    name: z.string().optional(),
    cost: z.coerce.number().positive().optional().nullable(),
    costPerSqFt: z.coerce.number().positive().optional().nullable(),
});

const costSchema = z.object({
  concretePrice: z.coerce.number().min(0).optional().nullable(),
  rebarPrice: z.coerce.number().min(0).optional().nullable(),
  travelPrice: z.coerce.number().min(0).optional().nullable(),
});

const profitSchema = z.object({
    fixedAmount: z.coerce.number().min(0).optional().nullable(),
    perSquareFoot: z.coerce.number().min(0).optional().nullable(),
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
  travelCosts: z.array(travelCostSchema).optional(),
  labor: z.array(laborSchema).optional(),
  equipment: z.array(equipmentSchema).optional(),
  otherExpenses: z.array(otherExpenseSchema).optional(),
  costs: costSchema.optional(),
  profit: profitSchema.optional(),
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
      travelCosts: [],
      labor: [],
      equipment: [],
      otherExpenses: [],
      costs: {
        concretePrice: 200, // $/cubic yard
        rebarPrice: 5, // $/stick
        travelPrice: 2.5, // $/mile
      },
      profit: {
          fixedAmount: 0,
          perSquareFoot: 0,
      }
    },
  });

  const { fields: slabFields, append: appendSlab, remove: removeSlab } = useFieldArray({ control: form.control, name: 'slabs' });
  const { fields: footingFields, append: appendFooting, remove: removeFooting } = useFieldArray({ control: form.control, name: 'footings' });
  const { fields: roundPierHoleFields, append: appendRoundPierHole, remove: removeRoundPierHole } = useFieldArray({ control: form.control, name: 'roundPierHoles' });
  const { fields: squarePierHoleFields, append: appendSquarePierHole, remove: removeSquarePierHole } = useFieldArray({ control: form.control, name: 'squarePierHoles' });
  const { fields: travelCostFields, append: appendTravelCost, remove: removeTravelCost } = useFieldArray({ control: form.control, name: 'travelCosts' });
  const { fields: laborFields, append: appendLabor, remove: removeLabor } = useFieldArray({ control: form.control, name: 'labor' });
  const { fields: equipmentFields, append: appendEquipment, remove: removeEquipment } = useFieldArray({ control: form.control, name: 'equipment' });
  const { fields: otherExpenseFields, append: appendOtherExpense, remove: removeOtherExpense } = useFieldArray({ control: form.control, name: 'otherExpenses' });


  const watchedValues = useWatch({ control: form.control });

  const calculations = useMemo(() => {
    const { slabs, footings, roundPierHoles, squarePierHoles, travelCosts, labor, equipment, otherExpenses, costs, profit } = watchedValues;
    const REBAR_STICK_LENGTH = 20; // feet
    const REBAR_WASTE_FACTOR = 1.10; // 10%

    // Slab Calculations
    const totalSlabSqFt = (slabs || []).reduce((acc, s) => acc + (s.length || 0) * (s.width || 0), 0);
    const totalSlabCubicFt = (slabs || []).reduce((acc, s) => acc + (s.length || 0) * (s.width || 0) * ((s.thickness || 0) / 12), 0);
    const slabRebarLinearFeet = (slabs || []).reduce((acc, s) => {
        const spacingInFt = (s.rebarSpacing || 0) / 12;
        if (!s.length || !s.width || !spacingInFt) return acc;
        const rebarLengthwise = s.length * Math.ceil(s.width / spacingInFt);
        const rebarWidthwise = s.width * Math.ceil(s.length / spacingInFt);
        return acc + rebarLengthwise + rebarWidthwise;
    }, 0);


    // Footing Calculations
    const totalFootingCubicFt = (footings || []).reduce((acc, f) => acc + (f.length || 0) * ((f.width || 0) / 12) * ((f.depth || 0) / 12), 0);
    const footingRebarLinearFeet = (footings || []).reduce((acc, f) => acc + (f.length || 0) * (f.rebarRows || 0), 0);

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
    const totalRebarLinearFeet = slabRebarLinearFeet + footingRebarLinearFeet;
    const totalRebarWithWaste = totalRebarLinearFeet * REBAR_WASTE_FACTOR;
    const rebarSticks = Math.ceil(totalRebarWithWaste / REBAR_STICK_LENGTH);
    const rebarCost = rebarSticks * (costs?.rebarPrice || 0);

    // Labor
    const laborCost = (labor || []).reduce((acc, l) => {
      return acc + (l.employees || 0) * (l.days || 0) * (l.costPerDay || 0);
    }, 0);

    // Equipment
    const equipmentCost = (equipment || []).reduce((acc, e) => {
      return acc + (e.daysUsed || 0) * (e.pricePerDay || 0);
    }, 0);
    
    // Travel
    const travelCost = (travelCosts || []).reduce((acc, t) => {
        return acc + (t.trips || 0) * (t.trucks || 0) * (t.miles || 0) * (costs?.travelPrice || 0);
    }, 0);
    
    // Other Expenses
    const otherExpensesCost = (otherExpenses || []).reduce((acc, e) => {
        const fixedCost = parseFloat(String(e.cost || 0));
        const sqFtCost = parseFloat(String(e.costPerSqFt || 0)) * totalSlabSqFt;
        return acc + fixedCost + sqFtCost;
    }, 0);

    // Totals
    const totalCosts = concreteCost + rebarCost + laborCost + equipmentCost + travelCost + otherExpensesCost;
    const totalCostPerSqFt = totalSlabSqFt > 0 ? totalCosts / totalSlabSqFt : 0;
    
    // Profit
    const profitAmount = (profit?.fixedAmount || 0) + ((profit?.perSquareFoot || 0) * totalSlabSqFt);
    
    // Grand Total
    const quoteTotal = totalCosts + profitAmount;

    return {
      totalSlabSqFt: totalSlabSqFt.toFixed(2),
      totalCubicYards: totalCubicYards.toFixed(2),
      concreteCost: concreteCost.toFixed(2),
      rebarSticks: rebarSticks,
      rebarCost: rebarCost.toFixed(2),
      laborCost: laborCost.toFixed(2),
      equipmentCost: equipmentCost.toFixed(2),
      travelCost: travelCost.toFixed(2),
      otherExpensesCost: otherExpensesCost.toFixed(2),
      totalCosts: totalCosts.toFixed(2),
      totalCostPerSqFt: totalCostPerSqFt.toFixed(2),
      profitAmount: profitAmount.toFixed(2),
      quoteTotal: quoteTotal.toFixed(2),
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
        <div className="space-y-4">
            <h4 className="font-medium">Slabs</h4>
            {slabFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField control={form.control} name={`slabs.${index}.length`} render={({ field }) => (<FormItem><FormLabel>Length (ft)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`slabs.${index}.width`} render={({ field }) => (<FormItem><FormLabel>Width (ft)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`slabs.${index}.thickness`} render={({ field }) => (<FormItem><FormLabel>Thickness (in)</FormLabel><FormControl><Input type="number" placeholder="4" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`slabs.${index}.rebarSpacing`} render={({ field }) => (<FormItem><FormLabel>Rebar Spacing (in)</FormLabel><FormControl><Input type="number" placeholder="18" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeSlab(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendSlab({ length: null, width: null, thickness: 4, rebarSpacing: 18 })}><PlusCircle className="mr-2 h-4 w-4" />Add Slab</Button>
        </div>

        {/* Footings */}
        <div className="space-y-4">
            <h4 className="font-medium">Footings</h4>
            {footingFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField control={form.control} name={`footings.${index}.length`} render={({ field }) => (<FormItem><FormLabel>Length (ft)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`footings.${index}.width`} render={({ field }) => (<FormItem><FormLabel>Width (in)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`footings.${index}.depth`} render={({ field }) => (<FormItem><FormLabel>Depth (in)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`footings.${index}.rebarRows`} render={({ field }) => (<FormItem><FormLabel>Rebar Rows</FormLabel><FormControl><Input type="number" placeholder="2" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeFooting(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendFooting({ length: null, width: null, depth: null, rebarRows: 2 })}><PlusCircle className="mr-2 h-4 w-4" />Add Footing</Button>
        </div>

        {/* Round Pier Holes */}
        <div className="space-y-4">
            <h4 className="font-medium">Round Pier Holes</h4>
            {roundPierHoleFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name={`roundPierHoles.${index}.count`} render={({ field }) => (<FormItem><FormLabel>No. of holes</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`roundPierHoles.${index}.diameter`} render={({ field }) => (<FormItem><FormLabel>Diameter (in)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`roundPierHoles.${index}.depth`} render={({ field }) => (<FormItem><FormLabel>Depth (in)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeRoundPierHole(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendRoundPierHole({ count: null, diameter: null, depth: null })}><PlusCircle className="mr-2 h-4 w-4" />Add Round Pier Hole</Button>
        </div>

        {/* Square Pier Holes */}
        <div className="space-y-4">
            <h4 className="font-medium">Square Pier Holes</h4>
            {squarePierHoleFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField control={form.control} name={`squarePierHoles.${index}.count`} render={({ field }) => (<FormItem><FormLabel>No. of holes</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`squarePierHoles.${index}.length`} render={({ field }) => (<FormItem><FormLabel>Length (in)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`squarePierHoles.${index}.width`} render={({ field }) => (<FormItem><FormLabel>Width (in)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`squarePierHoles.${index}.depth`} render={({ field }) => (<FormItem><FormLabel>Depth (in)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeSquarePierHole(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendSquarePierHole({ count: null, length: null, width: null, depth: null })}><PlusCircle className="mr-2 h-4 w-4" />Add Square Pier Hole</Button>
        </div>

        <Separator />
        
        <SectionTitle>Costing</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <FormField control={form.control} name="costs.concretePrice" render={({ field }) => (<FormItem><FormLabel>Concrete Price/yd³</FormLabel><FormControl><Input type="number" placeholder="200" {...field} value={field.value ?? ''} /></FormControl></FormItem>)}/>
             <FormField control={form.control} name="costs.rebarPrice" render={({ field }) => (<FormItem><FormLabel>Rebar Price/20ft stick</FormLabel><FormControl><Input type="number" placeholder="5" {...field} value={field.value ?? ''} /></FormControl></FormItem>)}/>
             <FormField control={form.control} name="costs.travelPrice" render={({ field }) => (<FormItem><FormLabel>Travel Price/mile</FormLabel><FormControl><Input type="number" placeholder="2.5" {...field} value={field.value ?? ''} /></FormControl></FormItem>)}/>
        </div>

        <Separator />

        <SectionTitle>Labor</SectionTitle>
        <div className="space-y-4">
            {laborFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name={`labor.${index}.employees`} render={({ field }) => (<FormItem><FormLabel>No. of employees</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`labor.${index}.days`} render={({ field }) => (<FormItem><FormLabel>No. of days</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`labor.${index}.costPerDay`} render={({ field }) => (<FormItem><FormLabel>Daily Rate per Employee</FormLabel><FormControl><Input type="number" placeholder="200" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeLabor(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendLabor({ employees: null, days: null, costPerDay: 200 })}><PlusCircle className="mr-2 h-4 w-4" />Add Labor</Button>
        </div>
        
        <Separator />
        
        <SectionTitle>Equipment Costs</SectionTitle>
        <div className="space-y-4">
            {equipmentFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name={`equipment.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Equipment Name</FormLabel><FormControl><Input placeholder="e.g. Concrete Pump" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`equipment.${index}.daysUsed`} render={({ field }) => (<FormItem><FormLabel>Days Used</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`equipment.${index}.pricePerDay`} render={({ field }) => (<FormItem><FormLabel>Price Per Day</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEquipment(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendEquipment({ name: '', daysUsed: null, pricePerDay: null })}><PlusCircle className="mr-2 h-4 w-4" />Add Equipment</Button>
        </div>

        <Separator />

        <SectionTitle>Travel Costs</SectionTitle>
        <div className="space-y-4">
            {travelCostFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name={`travelCosts.${index}.trips`} render={({ field }) => (<FormItem><FormLabel>No. of trips</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`travelCosts.${index}.trucks`} render={({ field }) => (<FormItem><FormLabel>No. of trucks</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`travelCosts.${index}.miles`} render={({ field }) => (<FormItem><FormLabel>Miles per trip</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeTravelCost(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendTravelCost({ trips: null, trucks: null, miles: null })}><PlusCircle className="mr-2 h-4 w-4" />Add Trip</Button>
        </div>
        
        <Separator />
        
        <SectionTitle>Other Expenses</SectionTitle>
        <div className="space-y-4">
            {otherExpenseFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name={`otherExpenses.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Expense Name</FormLabel><FormControl><Input placeholder="e.g. Permit Fee" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`otherExpenses.${index}.cost`} render={({ field }) => (<FormItem><FormLabel>Cost</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`otherExpenses.${index}.costPerSqFt`} render={({ field }) => (<FormItem><FormLabel>Cost Per Sq. Ft.</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeOtherExpense(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendOtherExpense({ name: '', cost: null, costPerSqFt: null })}><PlusCircle className="mr-2 h-4 w-4" />Add Expense</Button>
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
                        <p className="font-medium">Total Rebar (sticks):</p>
                        <p className="text-muted-foreground">{calculations.rebarSticks}</p>
                    </div>
                    <div>
                        <p className="font-medium">Cost / Sq Ft:</p>
                        <p className="text-muted-foreground">${calculations.totalCostPerSqFt}</p>
                    </div>
                </div>
                <Separator />
                <div className="space-y-2 text-right">
                    <p>Concrete: <span className="font-medium">${calculations.concreteCost}</span></p>
                    <p>Rebar: <span className="font-medium">${calculations.rebarCost}</span></p>
                    <p>Labor: <span className="font-medium">${calculations.laborCost}</span></p>
                    <p>Equipment: <span className="font-medium">${calculations.equipmentCost}</span></p>
                    <p>Travel: <span className="font-medium">${calculations.travelCost}</span></p>
                    <p>Other Expenses: <span className="font-medium">${calculations.otherExpensesCost}</span></p>
                    <Separator className="my-2"/>
                    <p className="text-xl font-bold">Total Costs: <span className="text-primary">${calculations.totalCosts}</span></p>
                </div>
            </CardContent>
        </Card>

        <Separator />

        <SectionTitle>Profit</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="profit.fixedAmount" render={({ field }) => (<FormItem><FormLabel>Fixed Profit Amount</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl></FormItem>)}/>
             <FormField control={form.control} name="profit.perSquareFoot" render={({ field }) => (<FormItem><FormLabel>Profit Per Sq. Ft.</FormLabel><FormControl><Input type="number" placeholder="0" {...field} value={field.value ?? ''} /></FormControl></FormItem>)}/>
        </div>
        
        <Separator />

        <Card className="mt-6 bg-muted/50">
            <CardContent className="p-6 space-y-4">
                <div className="space-y-2 text-right">
                    <p>Total Costs: <span className="font-medium">${calculations.totalCosts}</span></p>
                    <p>Profit: <span className="font-medium">${calculations.profitAmount}</span></p>
                    <Separator className="my-2"/>
                    <p className="text-2xl font-bold">Quote Total: <span className="text-primary">${calculations.quoteTotal}</span></p>
                </div>
            </CardContent>
        </Card>


        <Button type="submit" className="w-full">Create Quote</Button>
      </form>
    </Form>
  );
}
