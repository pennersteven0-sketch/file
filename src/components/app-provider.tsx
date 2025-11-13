'use client';

import React, { createContext, useState } from 'react';
import { Quote } from '@/lib/types';
import { quotes as initialQuotes } from '@/lib/data';

type AppContextType = {
  isSidebarOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  quotes: Quote[];
  addQuote: (quote: Quote) => void;
  updateQuoteStatus: (quoteId: string, status: Quote['status']) => void;
  deleteQuote: (quoteId: string) => void;
};

export const AppContext = createContext<AppContextType>({
  isSidebarOpen: false,
  setOpen: () => {},
  quotes: [],
  addQuote: () => {},
  updateQuoteStatus: () => {},
  deleteQuote: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setOpen] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);

  const addQuote = (quote: Quote) => {
    setQuotes(prevQuotes => [quote, ...prevQuotes]);
  };

  const updateQuoteStatus = (quoteId: string, status: Quote['status']) => {
    setQuotes(prevQuotes =>
      prevQuotes.map(q => (q.id === quoteId ? { ...q, status } : q))
    );
  };

  const deleteQuote = (quoteId: string) => {
    setQuotes(prevQuotes => prevQuotes.filter(q => q.id !== quoteId));
  };


  return (
    <AppContext.Provider value={{ isSidebarOpen, setOpen, quotes, addQuote, updateQuoteStatus, deleteQuote }}>
      {children}
    </AppContext.Provider>
  );
};
