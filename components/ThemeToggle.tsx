'use client'

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-20 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <span
        className={`inline-block h-8 w-8 transform rounded-full bg-white dark:bg-gray-800 shadow-lg transition-transform duration-200 ease-in-out ${
          theme === 'dark' ? 'translate-x-10' : 'translate-x-1'
        }`}
      >
        {theme === 'light' ? (
          <Sun className="h-6 w-6 text-yellow-500 mx-auto mt-1" />
        ) : (
          <Moon className="h-6 w-6 text-blue-400 mx-auto mt-1" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
