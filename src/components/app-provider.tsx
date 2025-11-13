'use client';

import React, { createContext, useState } from 'react';
import type { Quote, Job, TeamMember, Client } from '@/lib/types';
import { quotes as initialQuotes, jobs as initialJobs } from '@/lib/data';

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
  acceptQuoteAndCreateJob: (quoteId: string) => void;
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
  acceptQuoteAndCreateJob: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setOpen] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  const addQuote = (quote: Quote) => {
    setQuotes(prevQuotes => [quote, ...prevQuotes]);
  };
  
  const updateQuote = (updatedQuote: Quote) => {
    setQuotes(prevQuotes =>
      prevQuotes.map(q => (q.id === updatedQuote.id ? updatedQuote : q))
    );
  };
  
  const acceptQuoteAndCreateJob = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    // A real app would have a more robust way to assign a team
    const defaultTeam: TeamMember[] = [];

    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: quote.formData?.jobDetails || `Job for ${quote.client.name}`,
      location: 'TBD', // This could be part of the quote form in the future
      dates: quote.dates, // Use array of dates
      client: quote.client,
      team: defaultTeam,
      tasks: [], // Start with empty tasks, can be generated from description
      status: 'Scheduled',
      description: quote.formData?.jobDetails || '',
      quoteDetails: quote,
    };
    
    setJobs(prevJobs => [newJob, ...prevJobs]);
    setQuotes(prevQuotes => prevQuotes.filter(q => q.id !== quoteId));
  };


  const updateQuoteStatus = (quoteId: string, status: Quote['status']) => {
    if (status === 'Accepted') {
      acceptQuoteAndCreateJob(quoteId);
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
    <AppContext.Provider value={{ isSidebarOpen, setOpen, quotes, jobs, addQuote, updateQuote, updateQuoteStatus, deleteQuote, updateQuoteDates, acceptQuoteAndCreateJob }}>
      {children}
    </AppContext.Provider>
  );
};
