'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  image?: string;
  provider?: 'google' | 'facebook' | 'email';
  createdAt?: string;
  updatedAt?: string;
  // Subscription/plan information
  currentPlanId?: string;
  currentPlanName?: string;
  currentBillingCycle?: string;
  subscriptionStatus?: string;
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from session on mount
  useEffect(() => {
    const loadUserFromSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const { user: sessionUser, isAuthenticated } = await response.json();
        
        if (isAuthenticated && sessionUser) {
          setUser(sessionUser);
          console.log('User loaded from session:', sessionUser);
        } else {
          console.log('No valid session found');
        }
      } catch (error) {
        console.error('Failed to load user from session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromSession();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    console.log('User logged in:', userData);
  };

  const logout = async () => {
    try {
      // Call logout API to clear session cookie
      await fetch('/api/auth/session', { method: 'DELETE' });
      console.log('Session cleared successfully');
    } catch (error) {
      console.error('Failed to clear session:', error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
      console.log('User logged out');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      console.log('User updated:', updatedUser);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const { user: sessionUser, isAuthenticated } = await response.json();
      if (isAuthenticated && sessionUser) {
        setUser(sessionUser);
        console.log('User refreshed from session:', sessionUser);
      } else {
        setUser(null);
        console.log('Session expired or invalid, user logged out.');
      }
    } catch (error) {
      console.error('Failed to refresh user from session:', error);
      setUser(null);
    }
  };

  const value: UserContextType = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    setUser,
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
