'use client'

import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';

// Debug utility function
const debugLog = (component: string, functionName: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `🔍 [${timestamp}] ${component}.${functionName}: ${message}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

interface AdsLibraryFiltersProps {
  filters: {
    region: string;
    mediaType: string;
    adType: string;
    dateRange: string;
    minSpend: string;
    maxSpend: string;
    publisherPlatforms: string[];
  };
  onFiltersChange: (filters: any) => void;
}

const AdsLibraryFilters: React.FC<AdsLibraryFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  debugLog('AdsLibraryFilters', 'constructor', 'Component initialized with props', {
    filters,
    filtersKeys: Object.keys(filters)
  });

  const { theme } = useDashboardTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Debug filters changes
  React.useEffect(() => {
    debugLog('AdsLibraryFilters', 'useEffect', 'Filters prop changed', {
      oldFilters: filters,
      newFilters: filters
    });
  }, [filters]);

  const regions = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'AU', label: 'Australia' },
    { value: 'BR', label: 'Brazil' },
    { value: 'IN', label: 'India' },
    { value: 'JP', label: 'Japan' },
    { value: 'MX', label: 'Mexico' }
  ];

  const mediaTypes = [
    { value: 'all', label: 'All Media Types' },
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'carousel', label: 'Carousel' },
    { value: 'dynamic', label: 'Dynamic' }
  ];

  const adTypes = [
    { value: 'all', label: 'All Ad Types' },
    { value: 'political', label: 'Political' },
    { value: 'issue', label: 'Issue Advocacy' },
    { value: 'election', label: 'Election' },
    { value: 'commercial', label: 'Commercial' }
  ];

  const dateRanges = [
    { value: 'last_7d', label: 'Last 7 Days' },
    { value: 'last_30d', label: 'Last 30 Days' },
    { value: 'last_90d', label: 'Last 90 Days' },
    { value: 'last_12m', label: 'Last 12 Months' },
    { value: 'all', label: 'All Time' }
  ];

  const publisherPlatforms = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'messenger', label: 'Messenger' },
    { value: 'audience_network', label: 'Audience Network' }
  ];

  const handleFilterChange = (key: string, value: any) => {
    debugLog('AdsLibraryFilters', 'handleFilterChange', 'Filter value changed', {
      key,
      oldValue: filters[key as keyof typeof filters],
      newValue: value,
      allFilters: filters
    });
    
    const newFilters = { ...filters, [key]: value };
    debugLog('AdsLibraryFilters', 'handleFilterChange', 'Calling onFiltersChange', newFilters);
    onFiltersChange(newFilters);
  };

  const handlePlatformToggle = (platform: string) => {
    debugLog('AdsLibraryFilters', 'handlePlatformToggle', 'Platform toggle clicked', {
      platform,
      currentPlatforms: filters.publisherPlatforms,
      isCurrentlyIncluded: filters.publisherPlatforms.includes(platform)
    });
    
    const newPlatforms = filters.publisherPlatforms.includes(platform)
      ? filters.publisherPlatforms.filter(p => p !== platform)
      : [...filters.publisherPlatforms, platform];
    
    debugLog('AdsLibraryFilters', 'handlePlatformToggle', 'New platforms array', newPlatforms);
    handleFilterChange('publisherPlatforms', newPlatforms);
  };

  const clearFilters = () => {
    debugLog('AdsLibraryFilters', 'clearFilters', 'Clear filters button clicked', {
      currentFilters: filters
    });
    
    const defaultFilters = {
      region: 'US',
      mediaType: 'all',
      adType: 'all',
      dateRange: 'last_30d',
      minSpend: '',
      maxSpend: '',
      publisherPlatforms: []
    };
    
    debugLog('AdsLibraryFilters', 'clearFilters', 'Setting default filters', defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const toggleExpanded = () => {
    debugLog('AdsLibraryFilters', 'toggleExpanded', 'Toggle expanded clicked', {
      currentState: isExpanded,
      newState: !isExpanded
    });
    setIsExpanded(!isExpanded);
  };

  const hasActiveFilters = 
    filters.region !== 'US' ||
    filters.mediaType !== 'all' ||
    filters.adType !== 'all' ||
    filters.dateRange !== 'last_30d' ||
    filters.minSpend !== '' ||
    filters.maxSpend !== '' ||
    filters.publisherPlatforms.length > 0;

  debugLog('AdsLibraryFilters', 'render', 'Rendering filters component', {
    isExpanded,
    hasActiveFilters,
    filters,
    theme
  });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={toggleExpanded}
          className={`flex items-center space-x-2 transition-colors duration-300 ${
            theme === 'white' 
              ? 'text-gray-700 hover:text-gray-900' 
              : 'text-gray-300 hover:text-gray-100'
          }`}
        >
          <Filter className="h-5 w-5" />
          <span className="font-medium">Filters</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={`flex items-center space-x-1 text-sm transition-colors duration-300 ${
              theme === 'white' 
                ? 'text-gray-500 hover:text-gray-700' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className={`mt-4 p-4 rounded-lg border transition-colors duration-300 ${
          theme === 'white' 
            ? 'bg-gray-50 border-gray-200' 
            : 'bg-slate-700 border-slate-600'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Region Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-700' : 'text-gray-200'
              }`}>
                Region
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                  theme === 'white'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-slate-600 bg-slate-700 text-gray-100'
                }`}
              >
                {regions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Media Type Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-700' : 'text-gray-200'
              }`}>
                Media Type
              </label>
              <select
                value={filters.mediaType}
                onChange={(e) => handleFilterChange('mediaType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                  theme === 'white'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-slate-600 bg-slate-700 text-gray-100'
                }`}
              >
                {mediaTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ad Type Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-700' : 'text-gray-200'
              }`}>
                Ad Type
              </label>
              <select
                value={filters.adType}
                onChange={(e) => handleFilterChange('adType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                  theme === 'white'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-slate-600 bg-slate-700 text-gray-100'
                }`}
              >
                {adTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-700' : 'text-gray-200'
              }`}>
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                  theme === 'white'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-slate-600 bg-slate-700 text-gray-100'
                }`}
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Spend Range Filters */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-700' : 'text-gray-200'
              }`}>
                Min Spend ($)
              </label>
              <input
                type="number"
                value={filters.minSpend}
                onChange={(e) => handleFilterChange('minSpend', e.target.value)}
                placeholder="0"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                  theme === 'white'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-slate-600 bg-slate-700 text-gray-100'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-700' : 'text-gray-200'
              }`}>
                Max Spend ($)
              </label>
              <input
                type="number"
                value={filters.maxSpend}
                onChange={(e) => handleFilterChange('maxSpend', e.target.value)}
                placeholder="10000"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                  theme === 'white'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-slate-600 bg-slate-700 text-gray-100'
                }`}
              />
            </div>
          </div>

          {/* Publisher Platforms */}
          <div className="mt-4">
                          <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-700' : 'text-gray-200'
              }`}>
                Publisher Platforms
              </label>
            <div className="flex flex-wrap gap-2">
              {publisherPlatforms.map((platform) => (
                <button
                  key={platform.value}
                  onClick={() => handlePlatformToggle(platform.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${
                    filters.publisherPlatforms.includes(platform.value)
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : theme === 'white'
                        ? 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        : 'bg-slate-600 text-gray-200 border border-slate-500 hover:bg-slate-500'
                  }`}
                >
                  {platform.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className={`mt-4 pt-4 border-t transition-colors duration-300 ${
              theme === 'white' ? 'border-gray-200' : 'border-slate-600'
            }`}>
              <div className="flex flex-wrap gap-2">
                <span className={`text-sm transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-600' : 'text-gray-400'
                }`}>Active filters:</span>
                {filters.region !== 'US' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Region: {regions.find(r => r.value === filters.region)?.label}
                  </span>
                )}
                {filters.mediaType !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Media: {mediaTypes.find(t => t.value === filters.mediaType)?.label}
                  </span>
                )}
                {filters.adType !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Type: {adTypes.find(t => t.value === filters.adType)?.label}
                  </span>
                )}
                {filters.minSpend && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Min: ${filters.minSpend}
                  </span>
                )}
                {filters.maxSpend && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Max: ${filters.maxSpend}
                  </span>
                )}
                {filters.publisherPlatforms.length > 0 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Platforms: {filters.publisherPlatforms.length}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdsLibraryFilters;
