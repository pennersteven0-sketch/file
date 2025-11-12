'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { clients } from '@/lib/data';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

const quoteItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(0.1, 'Quantity must be positive'),
  unitPrice: z.coerce.number().min(0, 'Unit price cannot be negative'),
});

const quoteFormSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  jobDetails: z.string().min(1, 'Job details are required'),
  items: z.array(quoteItemSchema).min(1, 'At least one line item is required'),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

export function QuoteForm() {
  const { toast } = useToast();
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      clientId: '',
      jobDetails: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const subtotal = form.watch('items').reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  function onSubmit(data: QuoteFormValues) {
    console.log(data);
    toast({
      title: 'Quote Created',
      description: 'The new quote has been successfully saved.',
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="jobDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Details</FormLabel>
              <FormControl>
                <Textarea placeholder="Briefly describe the job" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Line Items</FormLabel>
          <div className="space-y-4 mt-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-end">
                <FormField
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      {index === 0 && <FormLabel className="text-xs">Description</FormLabel>}
                      <FormControl>
                        <Input placeholder="Material or Labor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem className="w-24">
                      {index === 0 && <FormLabel className="text-xs">Qty</FormLabel>}
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.unitPrice`}
                  render={({ field }) => (
                    <FormItem className="w-28">
                      {index === 0 && <FormLabel className="text-xs">Unit Price</FormLabel>}
                      <FormControl>
                        <Input type="number" placeholder="$0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
        
        <Separator />

        <div className="space-y-2 text-right">
            <p className="text-sm">Subtotal: <span className="font-medium">${subtotal.toFixed(2)}</span></p>
            <p className="text-sm">Tax (8%): <span className="font-medium">${tax.toFixed(2)}</span></p>
            <p className="text-lg font-bold">Total: <span className="text-primary">${total.toFixed(2)}</span></p>
        </div>


        <Button type="submit" className="w-full">Create Quote</Button>
      </form>
    </Form>
  );
}
