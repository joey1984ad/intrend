'use client'

import React from 'react';

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
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search creatives, campaigns, adsets..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Campaign Filter */}
        <div>
          <label htmlFor="campaign" className="block text-xs font-medium text-gray-700 mb-1">
            Campaign
          </label>
          <input
            type="text"
            id="campaign"
            value={filters.campaign}
            onChange={(e) => handleFilterChange('campaign', e.target.value)}
            placeholder="Filter by campaign..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Adset Filter */}
        <div>
          <label htmlFor="adset" className="block text-xs font-medium text-gray-700 mb-1">
            Ad Set
          </label>
          <input
            type="text"
            id="adset"
            value={filters.adset}
            onChange={(e) => handleFilterChange('adset', e.target.value)}
            placeholder="Filter by ad set..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Creative Type Filter */}
        <div>
          <label htmlFor="creativeType" className="block text-xs font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="creativeType"
            value={filters.creativeType}
            onChange={(e) => handleFilterChange('creativeType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <label htmlFor="performance" className="block text-xs font-medium text-gray-700 mb-1">
            Performance
          </label>
          <select
            id="performance"
            value={filters.performance}
            onChange={(e) => handleFilterChange('performance', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <label htmlFor="fatigueLevel" className="block text-xs font-medium text-gray-700 mb-1">
            Fatigue
          </label>
          <select
            id="fatigueLevel"
            value={filters.fatigueLevel}
            onChange={(e) => handleFilterChange('fatigueLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: &quot;{searchTerm}&quot;
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.campaign && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Campaign: {filters.campaign}
              <button
                onClick={() => handleFilterChange('campaign', '')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.adset && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Ad Set: {filters.adset}
              <button
                onClick={() => handleFilterChange('adset', '')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.creativeType && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Type: {filters.creativeType}
              <button
                onClick={() => handleFilterChange('creativeType', '')}
                className="ml-1 text-yellow-600 hover:text-yellow-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.performance && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Performance: {filters.performance}
              <button
                onClick={() => handleFilterChange('performance', '')}
                className="ml-1 text-indigo-600 hover:text-indigo-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.fatigueLevel && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Fatigue: {filters.fatigueLevel}
              <button
                onClick={() => handleFilterChange('fatigueLevel', '')}
                className="ml-1 text-red-600 hover:text-red-800"
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