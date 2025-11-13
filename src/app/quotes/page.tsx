'use client';

import { useContext, useState } from 'react';
import type { Quote } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, CheckCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { QuoteForm } from '@/components/quotes/quote-form';
import { AppContext } from '@/components/app-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CalendarPopover } from '@/components/quotes/calendar-popover';


function QuoteStatusBadge({ status, onStatusChange, onDelete }: { status: Quote['status'], onStatusChange: (status: Quote['status']) => void, onDelete: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const variant: { [key in Quote['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Draft': 'secondary',
    'Sent': 'default',
    'Accepted': 'outline',
    'Rejected': 'destructive',
  };
  const bgClass: { [key in Quote['status']]?: string } = {
    'Accepted': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300',
    'Sent': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300',
  }

  const handleDelete = () => {
    onDelete();
    setDialogOpen(false);
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Badge variant={variant[status]} className={`${bgClass[status]} cursor-pointer`}>{status}</Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onStatusChange('Accepted')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Accepted</span>
          </DropdownMenuItem>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem 
              className="text-destructive"
              onSelect={(e) => e.preventDefault()} // Prevents DropdownMenu from closing
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the quote.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function QuotesPage() {
  const { quotes, updateQuoteStatus, deleteQuote, updateQuoteDates } = useContext(AppContext);

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground">Manage and create new quotes for clients.</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Quote
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create New Quote</SheetTitle>
              <SheetDescription>
                Fill out the details below to generate a new quote.
              </SheetDescription>
            </SheetHeader>
            <QuoteForm />
          </SheetContent>
        </Sheet>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Select Dates</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map(quote => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                  <TableCell>{quote.client.name}</TableCell>
                  <TableCell>
                    <CalendarPopover 
                      dates={quote.dates}
                      onDatesChange={(newDates) => updateQuoteDates(quote.id, newDates)}
                    />
                  </TableCell>
                  <TableCell>${quote.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <QuoteStatusBadge 
                      status={quote.status}
                      onStatusChange={(newStatus) => updateQuoteStatus(quote.id, newStatus)}
                      onDelete={() => deleteQuote(quote.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
