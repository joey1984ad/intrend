'use client'

import React from 'react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';

interface Filters {
  campaign: string;
  adset: string;
  creativeType: string;
  performance: string;
  fatigueLevel: string;
}

interface CreativeFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const CreativeFilters: React.FC<CreativeFiltersProps> = ({
  filters,
  onFiltersChange,
  searchTerm,
  onSearchChange
}) => {
  const { theme } = useDashboardTheme();
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      campaign: '',
      adset: '',
      creativeType: '',
      performance: '',
      fatigueLevel: ''
    });
    onSearchChange('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchTerm !== '';

  return (
    <div className={`rounded-lg border p-4 space-y-4 transition-colors duration-300 ${
      theme === 'white' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'
    }`}>
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-medium transition-colors duration-300 ${
          theme === 'white' ? 'text-gray-900' : 'text-gray-100'
        }`}>Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className={`text-sm transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className={`block text-xs font-medium mb-1 transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-700' : 'text-gray-200'
          }`}>
            Search
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search creatives, campaigns, adsets..."
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
              theme === 'white'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-700 text-gray-100'
            }`}
          />
        </div>

        {/* Campaign Filter */}
        <div>
          <label htmlFor="campaign" className={`block text-xs font-medium mb-1 transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-700' : 'text-gray-200'
          }`}>
            Campaign
          </label>
          <input
            type="text"
            id="campaign"
            value={filters.campaign}
            onChange={(e) => handleFilterChange('campaign', e.target.value)}
            placeholder="Filter by campaign..."
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
              theme === 'white'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-700 text-gray-100'
            }`}
          />
        </div>

        {/* Adset Filter */}
        <div>
          <label htmlFor="adset" className={`block text-xs font-medium mb-1 transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-700' : 'text-gray-200'
          }`}>
            Ad Set
          </label>
          <input
            type="text"
            id="adset"
            value={filters.adset}
            onChange={(e) => handleFilterChange('adset', e.target.value)}
            placeholder="Filter by ad set..."
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
              theme === 'white'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-700 text-gray-100'
            }`}
          />
        </div>

                 {/* Creative Type Filter */}
         <div>
           <label htmlFor="creativeType" className={`block text-xs font-medium mb-1 transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-700' : 'text-gray-200'
           }`}>
             Type
           </label>
           <select
             id="creativeType"
             value={filters.creativeType}
             onChange={(e) => handleFilterChange('creativeType', e.target.value)}
             className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
               theme === 'white'
                 ? 'border-gray-300 bg-white text-gray-900'
                 : 'border-slate-600 bg-slate-700 text-gray-100'
             }`}
           >
             <option value="">All Types</option>
             <option value="image">Image</option>
             <option value="video">Video</option>
             <option value="carousel">Carousel</option>
             <option value="dynamic">Dynamic</option>
           </select>
         </div>

                 {/* Performance Filter */}
         <div>
           <label htmlFor="performance" className={`block text-xs font-medium mb-1 transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-700' : 'text-gray-200'
           }`}>
             Performance
           </label>
           <select
             id="performance"
             value={filters.performance}
             onChange={(e) => handleFilterChange('performance', e.target.value)}
             className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
               theme === 'white'
                 ? 'border-gray-300 bg-white text-gray-900'
                 : 'border-slate-600 bg-slate-700 text-gray-100'
             }`}
           >
             <option value="">All Performance</option>
             <option value="excellent">Excellent</option>
             <option value="good">Good</option>
             <option value="average">Average</option>
             <option value="poor">Poor</option>
           </select>
         </div>

                 {/* Fatigue Level Filter */}
         <div>
           <label htmlFor="fatigueLevel" className={`block text-xs font-medium mb-1 transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-700' : 'text-gray-200'
           }`}>
             Fatigue
           </label>
           <select
             id="fatigueLevel"
             value={filters.fatigueLevel}
             onChange={(e) => handleFilterChange('fatigueLevel', e.target.value)}
             className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
               theme === 'white'
                 ? 'border-gray-300 bg-white text-gray-900'
                 : 'border-slate-600 bg-slate-700 text-gray-100'
             }`}
           >
             <option value="">All Levels</option>
             <option value="low">Low</option>
             <option value="medium">Medium</option>
             <option value="high">High</option>
           </select>
         </div>
      </div>

             {/* Active Filters Display */}
       {hasActiveFilters && (
         <div className={`flex flex-wrap gap-2 pt-2 border-t transition-colors duration-300 ${
           theme === 'white' ? 'border-gray-200' : 'border-slate-700'
         }`}>
                     {searchTerm && (
             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
               theme === 'white' ? 'bg-blue-100 text-blue-800' : 'bg-blue-900/20 text-blue-300'
             }`}>
               Search: "{searchTerm}"
               <button
                 onClick={() => onSearchChange('')}
                 className={`ml-1 transition-colors duration-300 ${
                   theme === 'white' ? 'text-blue-600 hover:text-blue-800' : 'text-blue-400 hover:text-blue-300'
                 }`}
               >
                 ×
               </button>
             </span>
           )}
           {filters.campaign && (
             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
               theme === 'white' ? 'bg-green-100 text-green-800' : 'bg-green-900/20 text-green-300'
             }`}>
               Campaign: {filters.campaign}
               <button
                 onClick={() => handleFilterChange('campaign', '')}
                 className={`ml-1 transition-colors duration-300 ${
                   theme === 'white' ? 'text-green-600 hover:text-green-800' : 'text-green-400 hover:text-green-300'
                 }`}
               >
                 ×
               </button>
             </span>
           )}
           {filters.adset && (
             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
               theme === 'white' ? 'bg-purple-100 text-purple-800' : 'bg-purple-900/20 text-purple-300'
             }`}>
               Ad Set: {filters.adset}
               <button
                 onClick={() => handleFilterChange('adset', '')}
                 className={`ml-1 transition-colors duration-300 ${
                   theme === 'white' ? 'text-purple-600 hover:text-purple-800' : 'text-purple-400 hover:text-purple-300'
                 }`}
               >
                 ×
               </button>
             </span>
           )}
           {filters.creativeType && (
             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
               theme === 'white' ? 'bg-yellow-100 text-yellow-800' : 'bg-yellow-900/20 text-yellow-300'
             }`}>
               Type: {filters.creativeType}
               <button
                 onClick={() => handleFilterChange('creativeType', '')}
                 className={`ml-1 transition-colors duration-300 ${
                   theme === 'white' ? 'text-yellow-600 hover:text-yellow-800' : 'text-yellow-400 hover:text-yellow-300'
                 }`}
               >
                 ×
               </button>
             </span>
           )}
           {filters.performance && (
             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
               theme === 'white' ? 'bg-indigo-100 text-indigo-800' : 'bg-indigo-900/20 text-indigo-300'
             }`}>
               Performance: {filters.performance}
               <button
                 onClick={() => handleFilterChange('performance', '')}
                 className={`ml-1 transition-colors duration-300 ${
                   theme === 'white' ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'
                 }`}
               >
                 ×
               </button>
             </span>
           )}
           {filters.fatigueLevel && (
             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
               theme === 'white' ? 'bg-red-100 text-red-800' : 'bg-red-900/20 text-red-300'
             }`}>
               Fatigue: {filters.fatigueLevel}
               <button
                 onClick={() => handleFilterChange('fatigueLevel', '')}
                 className={`ml-1 transition-colors duration-300 ${
                   theme === 'white' ? 'text-red-600 hover:text-red-800' : 'text-red-400 hover:text-red-300'
                 }`}
               >
                 ×
               </button>
             </span>
           )}
        </div>
      )}
    </div>
  );
};

export default CreativeFilters; 