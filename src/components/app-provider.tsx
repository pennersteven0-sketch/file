'use client';

import React, { createContext, useState, useMemo } from 'react';
import type { Quote, Job, TeamMember, Client } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';

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
  const firestore = useFirestore();

  const quotesRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'quotes') : null),
    [firestore]
  );
  const { data: quotesData } = useCollection<Quote>(quotesRef);
  const quotes = quotesData || [];

  const jobsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'jobs') : null),
    [firestore]
  );
  const { data: jobsData } = useCollection<Job>(jobsRef);
  const jobs = jobsData || [];

  const teamMembersRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'teamMembers') : null),
    [firestore]
  );
  const { data: teamMembersData } = useCollection<TeamMember>(teamMembersRef);
  const teamMembers = teamMembersData || [];

  const addJob = (job: Job) => {
    if (!firestore) return;
    const newJobRef = doc(firestore, 'jobs', job.id);
    setDocumentNonBlocking(newJobRef, job, {});
  };
  
  const updateJob = (updatedJob: Job) => {
    if (!firestore) return;
    const jobRef = doc(firestore, 'jobs', updatedJob.id);
    updateDocumentNonBlocking(jobRef, updatedJob);
  };

  const addQuote = (quote: Quote) => {
    if (!firestore) return;
    const newQuoteRef = doc(firestore, 'quotes', quote.id);
    setDocumentNonBlocking(newQuoteRef, quote, {});
  };
  
  const updateQuote = (updatedQuote: Quote) => {
    if (!firestore) return;
    const quoteRef = doc(firestore, 'quotes', updatedQuote.id);
    updateDocumentNonBlocking(quoteRef, updatedQuote);
    
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
    if (!quote || !firestore) return;

    if (status === 'Accepted') {
      const newJob: Job = {
        id: `job-${Date.now()}`,
        title: quote.formData?.jobDetails || `Job from Quote ${quote.quoteNumber}`,
        location: 'TBD',
        dates: quote.dates.map(d => new Date(d)),
        client: quote.client,
        team: [],
        tasks: [],
        status: 'Scheduled',
        description: quote.formData?.jobDetails || '',
        quoteDetails: quote,
      };
      addJob(newJob);
      deleteQuote(quoteId);
    } else {
        const quoteRef = doc(firestore, 'quotes', quoteId);
        updateDocumentNonBlocking(quoteRef, { status });
    }
  };

  const deleteQuote = (quoteId: string) => {
    if (!firestore) return;
    const quoteRef = doc(firestore, 'quotes', quoteId);
    deleteDocumentNonBlocking(quoteRef);
  };
  
  const updateQuoteDates = (quoteId: string, dates: Date[]) => {
    if (!firestore) return;
    const quoteRef = doc(firestore, 'quotes', quoteId);
    updateDocumentNonBlocking(quoteRef, { dates });
  };
  
  const addTeamMember = (member: TeamMember) => {
    if (!firestore) return;
    const newMemberRef = doc(firestore, 'teamMembers', member.id);
    setDocumentNonBlocking(newMemberRef, member, {});
  };

  const updateTeamMember = (updatedMember: TeamMember) => {
    if (!firestore) return;
    const memberRef = doc(firestore, 'teamMembers', updatedMember.id);
    updateDocumentNonBlocking(memberRef, updatedMember);

    // Also update this member in any job they are assigned to
    jobs.forEach(job => {
      if (job.team.some(tm => tm.id === updatedMember.id)) {
        const updatedJob = {
          ...job,
          team: job.team.map(tm => (tm.id === updatedMember.id ? updatedMember : tm)),
        };
        updateJob(updatedJob);
      }
    });
  };

  const deleteTeamMember = (memberId: string) => {
    if (!firestore) return;
    const memberRef = doc(firestore, 'teamMembers', memberId);
    deleteDocumentNonBlocking(memberRef);
    
     // Also remove this member from any job they are assigned to
     jobs.forEach(job => {
      if (job.team.some(tm => tm.id === memberId)) {
        const updatedJob = {
          ...job,
          team: job.team.filter(tm => tm.id !== memberId),
        };
        updateJob(updatedJob);
      }
    });
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
