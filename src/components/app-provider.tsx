'use client';

import React, { createContext, useState } from 'react';
import type { Quote, Job, TeamMember, Client } from '@/lib/types';
import { quotes as initialQuotes, jobs as initialJobs, teamMembers as initialTeamMembers } from '@/lib/data';

type AppContextType = {
  isSidebarOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  quotes: Quote[];
  jobs: Job[];
  teamMembers: TeamMember[];
  addQuote: (quote: Quote) => void;
  updateQuote: (quote: Quote) => void;
  updateQuoteStatus: (quoteId: string, status: Quote['status']) => void;
  deleteQuote: (quoteId: string) => void;
  updateQuoteDates: (quoteId: string, dates: Date[]) => void;
  addJob: (job: Job) => void;
  updateJob: (job: Job) => void;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (memberId: string) => void;
};

export const AppContext = createContext<AppContextType>({
  isSidebarOpen: false,
  setOpen: () => {},
  quotes: [],
  jobs: [],
  teamMembers: [],
  addQuote: () => {},
  updateQuote: () => {},
  updateQuoteStatus: () => {},
  deleteQuote: () => {},
  updateQuoteDates: () => {},
  addJob: () => {},
  updateJob: () => {},
  addTeamMember: () => {},
  updateTeamMember: () => {},
  deleteTeamMember: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setOpen] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);

  const addJob = (job: Job) => {
    setJobs(prevJobs => [job, ...prevJobs]);
  };
  
  const updateJob = (updatedJob: Job) => {
    setJobs(prevJobs =>
      prevJobs.map(j => (j.id === updatedJob.id ? updatedJob : j))
    );
  };

  const addQuote = (quote: Quote) => {
    setQuotes(prevQuotes => [quote, ...prevQuotes]);
  };
  
  const updateQuote = (updatedQuote: Quote) => {
    setQuotes(prevQuotes =>
      prevQuotes.map(q => (q.id === updatedQuote.id ? updatedQuote : q))
    );
    
    // If the quote is part of a job, update the job too.
    const jobToUpdate = jobs.find(j => j.quoteDetails?.id === updatedQuote.id);
    if (jobToUpdate) {
        const updatedJob: Job = {
            ...jobToUpdate,
            quoteDetails: updatedQuote,
            title: updatedQuote.formData?.jobDetails || jobToUpdate.title,
        };
        updateJob(updatedJob);
    }
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
        team: [],
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
  
  const addTeamMember = (member: TeamMember) => {
    setTeamMembers(prev => [member, ...prev]);
  };

  const updateTeamMember = (updatedMember: TeamMember) => {
    setTeamMembers(prev =>
      prev.map(m => (m.id === updatedMember.id ? updatedMember : m))
    );
    // Also update this member in any job they are assigned to
    setJobs(prevJobs =>
      prevJobs.map(job => ({
        ...job,
        team: job.team.map(tm => (tm.id === updatedMember.id ? updatedMember : tm)),
      }))
    );
  };

  const deleteTeamMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
     // Also remove this member from any job they are assigned to
     setJobs(prevJobs =>
      prevJobs.map(job => ({
        ...job,
        team: job.team.filter(tm => tm.id !== memberId),
      }))
    );
  };


  return (
    <AppContext.Provider value={{ 
        isSidebarOpen, setOpen, 
        quotes, jobs, teamMembers,
        addQuote, updateQuote, updateQuoteStatus, deleteQuote, updateQuoteDates, 
        addJob, updateJob,
        addTeamMember, updateTeamMember, deleteTeamMember
      }}>
      {children}
    </AppContext.Provider>
  );
};

    