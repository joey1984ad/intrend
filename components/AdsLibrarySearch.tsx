'use client'

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface AdsLibrarySearchProps {
  searchTerm: string;
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const AdsLibrarySearch: React.FC<AdsLibrarySearchProps> = ({
  searchTerm,
  onSearch,
  isLoading
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchTerm.trim()) {
      onSearch(localSearchTerm.trim());
    }
  };

  const handleClear = () => {
    setLocalSearchTerm('');
    onSearch('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for ads, brands, or keywords..."
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            disabled={isLoading}
          />
          {localSearchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-16 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <button
            type="submit"
            disabled={!localSearchTerm.trim() || isLoading}
            className="absolute inset-y-0 right-0 flex items-center px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Search Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-sm text-gray-500">Popular searches:</span>
        {['Nike', 'Apple', 'McDonald\'s', 'Coca-Cola', 'Tesla'].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => {
              setLocalSearchTerm(suggestion);
              onSearch(suggestion);
            }}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Search Tips */}
      <div className="mt-3 text-sm text-gray-600">
        <p>
          💡 <strong>Search tips:</strong> Use quotes for exact phrases, add "political" for political ads, 
          or specify regions like "US" or "EU" for targeted results.
        </p>
      </div>
    </div>
  );
};

export default AdsLibrarySearch;
