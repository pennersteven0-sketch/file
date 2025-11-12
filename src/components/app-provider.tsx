'use client';

import React, { createContext, useState } from 'react';

type AppContextType = {
  isSidebarOpen: boolean;
  setOpen: (isOpen: boolean) => void;
};

export const AppContext = createContext<AppContextType>({
  isSidebarOpen: false,
  setOpen: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setOpen] = useState(false);

  return (
    <AppContext.Provider value={{ isSidebarOpen, setOpen }}>
      {children}
    </AppContext.Provider>
  );
};
