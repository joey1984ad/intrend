'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

type DashboardTheme = 'white' | 'dark';

interface DashboardThemeContextType {
  theme: DashboardTheme;
  toggleTheme: () => void;
  setTheme: (theme: DashboardTheme) => void;
}

const DashboardThemeContext = createContext<DashboardThemeContextType | undefined>(undefined);

export const useDashboardTheme = () => {
  const context = useContext(DashboardThemeContext);
  if (context === undefined) {
    throw new Error('useDashboardTheme must be used within a DashboardThemeProvider');
  }
  return context;
};

interface DashboardThemeProviderProps {
  children: React.ReactNode;
}

export const DashboardThemeProvider: React.FC<DashboardThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<DashboardTheme>('white');

  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme') as DashboardTheme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme classes to document element for CSS selectors
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme === 'white' ? 'light' : 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'white' ? 'dark' : 'white';
    setTheme(newTheme);
    localStorage.setItem('dashboard-theme', newTheme);
  };

  const value = { theme, toggleTheme, setTheme };

  return (
    <DashboardThemeContext.Provider value={value}>
      {children}
    </DashboardThemeContext.Provider>
  );
};
