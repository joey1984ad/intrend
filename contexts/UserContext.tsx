'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  provider?: 'google' | 'facebook' | 'email';
  createdAt?: Date;
  lastLogin?: Date;
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
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

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('intrend_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
        localStorage.removeItem('intrend_user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Save user data to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('intrend_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('intrend_user');
    }
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
    console.log('User logged in:', userData);
  };

  const logout = () => {
    setUser(null);
    // Clear any other auth-related data
    localStorage.removeItem('intrend_user');
    localStorage.removeItem('intrend_token');
    localStorage.removeItem('intrend_refresh_token');
    console.log('User logged out');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      console.log('User updated:', updatedUser);
    }
  };

  const value: UserContextType = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
