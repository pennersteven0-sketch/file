'use client';

import React, { createContext, useState } from 'react';
import type { Quote, Job, TeamMember, Client } from '@/lib/types';
import { quotes as initialQuotes, jobs as initialJobs, teamMembers } from '@/lib/data';

type AppContextType = {
  isSidebarOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  quotes: Quote[];
  jobs: Job[];
  addQuote: (quote: Quote) => void;
  updateQuote: (quote: Quote) => void;
  updateQuoteStatus: (quoteId: string, status: Quote['status']) => void;
  deleteQuote: (quoteId: string) => void;
  updateQuoteDates: (quoteId: string, dates: Date[]) => void;
  addJob: (job: Job) => void;
};

export const AppContext = createContext<AppContextType>({
  isSidebarOpen: false,
  setOpen: () => {},
  quotes: [],
  jobs: [],
  addQuote: () => {},
  updateQuote: () => {},
  updateQuoteStatus: () => {},
  deleteQuote: () => {},
  updateQuoteDates: () => {},
  addJob: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setOpen] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  const addJob = (job: Job) => {
    setJobs(prevJobs => [job, ...prevJobs]);
  };

  const addQuote = (quote: Quote) => {
    setQuotes(prevQuotes => [quote, ...prevQuotes]);
  };
  
  const updateQuote = (updatedQuote: Quote) => {
    setQuotes(prevQuotes =>
      prevQuotes.map(q => (q.id === updatedQuote.id ? updatedQuote : q))
    );
  };
  
  const updateQuoteStatus = (quoteId: string, status: Quote['status']) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    if (status === 'Accepted') {
      const newJob: Job = {
        id: `job-${Date.now()}`,
        title: quote.formData?.jobDetails || `Job from Quote ${quote.quoteNumber}`,
        location: 'TBD', // This can be enhanced later
        dates: quote.dates,
        client: quote.client,
        team: teamMembers.slice(0, 3), // Default team
        tasks: [], // Start with no tasks
        status: 'Scheduled',
        description: quote.formData?.jobDetails || '',
        quoteDetails: quote,
      };
      addJob(newJob);
      deleteQuote(quoteId);
    } else {
        setQuotes(prevQuotes =>
            prevQuotes.map(q => (q.id === quoteId ? { ...q, status } : q))
        );
    }
  };

  const deleteQuote = (quoteId: string) => {
    setQuotes(prevQuotes => prevQuotes.filter(q => q.id !== quoteId));
  };
  
  const updateQuoteDates = (quoteId: string, dates: Date[]) => {
    setQuotes(prevQuotes =>
      prevQuotes.map(q => (q.id === quoteId ? { ...q, dates } : q))
    );
  };


  return (
    <AppContext.Provider value={{ isSidebarOpen, setOpen, quotes, jobs, addQuote, updateQuote, updateQuoteStatus, deleteQuote, updateQuoteDates, addJob }}>
      {children}
    </AppContext.Provider>
  );
};
