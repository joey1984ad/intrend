'use client'

import React, { useState, useMemo } from 'react';
import { DataTable } from './DataTable';
import { CreativeData, ColumnDefinition } from './types';
import CreativeGallery from './CreativeGallery';
import CreativeComparisonModal from './CreativeComparisonModal';
import CreativeFilters from './CreativeFilters';
import CreativeDetailModal from './CreativeDetailModal';
import FacebookImage from './FacebookImage';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';

interface CreativesTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCampaigns: number[];
  handleBulkAction: (action: string) => void;
  setShowExportModal: (show: boolean) => void;
  isLoadingCreatives: boolean;
  creativeData: CreativeData[];
  facebookAccessToken: string;
  dateRange: string;
  adAccountId: string; // Add adAccountId prop
}

type ViewMode = 'gallery' | 'table';

const CreativesTab: React.FC<CreativesTabProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCampaigns,
  handleBulkAction,
  setShowExportModal,
  isLoadingCreatives,
  creativeData,
  facebookAccessToken,
  dateRange,
  adAccountId
}) => {
  const { theme } = useDashboardTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [selectedCreatives, setSelectedCreatives] = useState<number[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState<CreativeData | null>(null);
  const [filters, setFilters] = useState({
    campaign: '',
    adset: '',
    creativeType: '',
    performance: '',
    fatigueLevel: ''
  });

  // Enhanced column definitions with modern styling and better metrics
  const columns: ColumnDefinition<CreativeData>[] = [
    {
      key: 'name',
      header: 'Creative Asset',
      sortable: true,
      searchable: true,
      render: (value, creative) => (
        <div className="flex items-center space-x-4">
          <div className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border transition-colors duration-300 ${
            theme === 'white'
              ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
              : 'bg-gradient-to-br from-slate-700 to-slate-600 border-slate-600'
          }`}>
            <FacebookImage
              src={creative.thumbnailUrl}
              accessToken={facebookAccessToken}
              alt={creative.name}
              className="w-full h-full object-cover"
              contentType={creative.creativeType === 'video' ? 'video' : creative.creativeType === 'carousel' || creative.creativeType === 'dynamic' ? 'carousel' : 'image'}
              fallbackSrc="https://via.placeholder.com/80x80/6B7280/FFFFFF?text=No+Image"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-sm font-semibold truncate cursor-pointer hover:text-indigo-600 transition-colors duration-200 ${
              theme === 'white' ? 'text-gray-900' : 'text-gray-100'
            }`} 
                 onClick={() => handleCreativeClick(creative)}>
              {creative.name}
            </div>
            <div className={`text-xs truncate font-medium transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-300'
            }`}>{creative.adsetName}</div>
            <div className={`text-xs truncate transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-500' : 'text-gray-400'
            }`}>{creative.campaignName}</div>
          </div>
        </div>
      )
    },
    {
      key: 'creativeType',
      header: 'Type',
      sortable: true,
      searchable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
          value === 'image' ? 'bg-gradient-to-r from-blue-50 to-indigo-100 text-indigo-700 border border-indigo-200' :
          value === 'video' ? 'bg-gradient-to-r from-emerald-50 to-teal-100 text-emerald-700 border border-emerald-200' :
          value === 'carousel' ? 'bg-gradient-to-r from-amber-50 to-orange-100 text-amber-700 border border-amber-200' :
          'bg-gradient-to-r from-violet-50 to-purple-100 text-violet-700 border border-violet-200'
        }`}>
          {value === 'image' && '🖼️'}
          {value === 'video' && '🎥'}
          {value === 'carousel' && '🖼️🔄'}
          {value === 'dynamic' && '⚡'}
          <span className="ml-1">{value.charAt(0).toUpperCase() + value.slice(1)}</span>
        </span>
      )
    },
    {
      key: 'spend',
      header: 'Spend',
      sortable: true,
      searchable: true,
      align: 'right',
             render: (value) => (
         <div className="text-right">
           <div className={`text-sm font-bold transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-900' : 'text-gray-100'
           }`}>${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
           <div className={`text-xs transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-500' : 'text-gray-400'
           }`}>Total</div>
         </div>
       )
    },
    {
      key: 'impressions',
      header: 'Impressions',
      sortable: true,
      searchable: true,
      align: 'right',
             render: (value) => (
         <div className="text-right">
           <div className={`text-sm font-bold transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-900' : 'text-gray-100'
           }`}>{value.toLocaleString()}</div>
           <div className={`text-xs transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-500' : 'text-gray-400'
           }`}>Views</div>
         </div>
       )
    },
    {
      key: 'clicks',
      header: 'Clicks',
      sortable: true,
      searchable: true,
      align: 'right',
             render: (value) => (
         <div className="text-right">
           <div className={`text-sm font-bold transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-900' : 'text-gray-100'
           }`}>{value.toLocaleString()}</div>
           <div className={`text-xs transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-500' : 'text-gray-400'
           }`}>Engagement</div>
         </div>
       )
    },
    {
      key: 'ctr',
      header: 'CTR',
      sortable: true,
      searchable: true,
      align: 'right',
             render: (value) => (
         <div className="text-right">
           <div className={`text-sm font-bold ${value >= 2 ? 'text-emerald-600' : value >= 1 ? 'text-blue-600' : value >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>
             {value.toFixed(2)}%
           </div>
           <div className={`text-xs transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-500' : 'text-gray-400'
           }`}>Click Rate</div>
         </div>
       )
    },
    {
      key: 'cpc',
      header: 'CPC',
      sortable: true,
      searchable: true,
      align: 'right',
             render: (value) => (
         <div className="text-right">
           <div className={`text-sm font-bold ${value <= 1 ? 'text-emerald-600' : value <= 2 ? 'text-blue-600' : value <= 3 ? 'text-amber-600' : 'text-red-600'}`}>
             ${value.toFixed(2)}
           </div>
           <div className={`text-xs transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-500' : 'text-gray-400'
           }`}>Per Click</div>
         </div>
       )
    },
    {
      key: 'cpm',
      header: 'CPM',
      sortable: true,
      searchable: true,
      align: 'right',
             render: (value) => (
         <div className="text-right">
           <div className={`text-sm font-bold ${value <= 5 ? 'text-emerald-600' : value <= 10 ? 'text-blue-600' : value <= 15 ? 'text-amber-600' : 'text-red-600'}`}>
             ${value.toFixed(2)}
           </div>
           <div className={`text-xs transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-500' : 'text-gray-400'
           }`}>Per 1K</div>
         </div>
       )
    },
    {
      key: 'reach',
      header: 'Reach',
      sortable: true,
      searchable: true,
      align: 'right',
             render: (value) => (
         <div className="text-right">
           <div className={`text-sm font-bold transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-900' : 'text-gray-100'
           }`}>{value.toLocaleString()}</div>
           <div className={`text-xs transition-colors duration-300 ${
             theme === 'white' ? 'text-gray-500' : 'text-gray-400'
           }`}>Unique Users</div>
         </div>
       )
    },
    {
      key: 'frequency',
      header: 'Frequency',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => (
        <div className="text-right">
          <div className={`text-sm font-bold ${value <= 2 ? 'text-emerald-600' : value <= 3 ? 'text-blue-600' : value <= 4 ? 'text-amber-600' : 'text-red-600'}`}>
            {value.toFixed(1)}
          </div>
          <div className={`text-xs transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-500' : 'text-gray-400'
          }`}>Avg Views</div>
        </div>
      )
    },
    {
      key: 'roas',
      header: 'ROAS',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => (
        <div className="text-right">
          <div className={`text-sm font-bold ${value >= 4 ? 'text-emerald-600' : value >= 2 ? 'text-blue-600' : value >= 1 ? 'text-amber-600' : 'text-red-600'}`}>
            {value ? `${value.toFixed(2)}x` : 'N/A'}
          </div>
          <div className={`text-xs transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-500' : 'text-gray-400'
          }`}>Return</div>
        </div>
      )
    },
    {
      key: 'performance',
      header: 'Performance',
      sortable: true,
      searchable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
          value === 'excellent' ? 'bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 border border-emerald-200' :
          value === 'good' ? 'bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-700 border border-blue-200' :
          value === 'average' ? 'bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-700 border border-amber-200' :
          'bg-gradient-to-r from-red-50 to-pink-100 text-red-700 border border-red-200'
        }`}>
          {value === 'excellent' && '⭐'}
          {value === 'good' && '👍'}
          {value === 'average' && '➖'}
          {value === 'poor' && '⚠️'}
          <span className="ml-1">{value.charAt(0).toUpperCase() + value.slice(1)}</span>
        </span>
      )
    },
    {
      key: 'fatigueLevel',
      header: 'Fatigue',
      sortable: true,
      searchable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
          value === 'low' ? 'bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 border border-emerald-200' :
          value === 'medium' ? 'bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-700 border border-amber-200' :
          'bg-gradient-to-r from-red-50 to-pink-100 text-red-700 border border-red-200'
        }`}>
          {value === 'low' && '🟢'}
          {value === 'medium' && '🟡'}
          {value === 'high' && '🔴'}
          <span className="ml-1">{value.charAt(0).toUpperCase() + value.slice(1)}</span>
        </span>
      )
    }
  ];

  // Filter and process data
  const filteredData = useMemo(() => {
    let filtered = creativeData;

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(creative =>
        (typeof creative.name === 'string' ? creative.name.toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
        (typeof creative.campaignName === 'string' ? creative.campaignName.toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
        (typeof creative.adsetName === 'string' ? creative.adsetName.toLowerCase() : '').includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.campaign) {
      filtered = filtered.filter(creative => 
        (typeof creative.campaignName === 'string' ? creative.campaignName.toLowerCase() : '').includes(filters.campaign.toLowerCase())
      );
    }

    if (filters.adset) {
      filtered = filtered.filter(creative => 
        (typeof creative.adsetName === 'string' ? creative.adsetName.toLowerCase() : '').includes(filters.adset.toLowerCase())
      );
    }

    if (filters.creativeType) {
      filtered = filtered.filter(creative => creative.creativeType === filters.creativeType);
    }

    if (filters.performance) {
      filtered = filtered.filter(creative => creative.performance === filters.performance);
    }

    if (filters.fatigueLevel) {
      filtered = filtered.filter(creative => creative.fatigueLevel === filters.fatigueLevel);
    }

    return filtered;
  }, [creativeData, searchTerm, filters]);

  // Calculate top performers
  const topPerformers = useMemo(() => {
    const sortedByROAS = [...filteredData].sort((a, b) => {
      const roasA = a.roas || 0;
      const roasB = b.roas || 0;
      return roasB - roasA;
    });
    return sortedByROAS.slice(0, Math.ceil(sortedByROAS.length * 0.1)); // Top 10%
  }, [filteredData]);

  const handleCreativeSelect = (creativeId: number) => {
    setSelectedCreatives(prev => 
      prev.includes(creativeId) 
        ? prev.filter(id => id !== creativeId)
        : [...prev, creativeId]
    );
  };

  const handleCreativeClick = (creative: CreativeData) => {
    setSelectedCreative(creative);
    setShowDetailModal(true);
  };

  const handleCompareSelected = () => {
    if (selectedCreatives.length >= 2) {
      setShowComparisonModal(true);
    }
  };

  const selectedCreativeData = selectedCreatives.map(id => 
    filteredData.find(creative => creative.id === id)
  ).filter(Boolean) as CreativeData[];

  return (
    <div className="space-y-6">
      {/* Header with view toggle and actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-900' : 'text-gray-100'
          }`}>Creatives</h2>
          <p className={`text-sm transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            {filteredData.length} creative assets • {topPerformers.length} top performers
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
           <div className={`flex rounded-lg p-1 transition-colors duration-300 ${
             theme === 'white' ? 'bg-gray-100' : 'bg-slate-700'
           }`}>
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'gallery'
                  ? theme === 'white'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'bg-slate-600 text-gray-100 shadow-sm'
                  : theme === 'white'
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-gray-300 hover:text-gray-100'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? theme === 'white'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'bg-slate-600 text-gray-100 shadow-sm'
                  : theme === 'white'
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-gray-300 hover:text-gray-100'
              }`}
            >
              Table
            </button>
          </div>

          {/* Comparison Button */}
          {selectedCreatives.length >= 2 && (
            <button
              onClick={handleCompareSelected}
              className="btn"
            >
              Compare ({selectedCreatives.length})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <CreativeFilters
        filters={filters}
        onFiltersChange={setFilters}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Content */}
      {viewMode === 'gallery' ? (
        <CreativeGallery
          creatives={filteredData}
          selectedCreatives={selectedCreatives}
          onCreativeSelect={handleCreativeSelect}
          onCreativeClick={handleCreativeClick}
          isLoading={isLoadingCreatives}
          topPerformers={topPerformers}
          accessToken={facebookAccessToken}
        />
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedItems={selectedCreatives}
          onItemSelect={handleCreativeSelect}
          onBulkAction={handleBulkAction}
          isLoading={isLoadingCreatives}
          title="Creatives"
          subtitle={`${filteredData.length} creative assets`}
          showExport={true}
          onExport={() => setShowExportModal(true)}
          bulkActions={[
            { label: 'Compare Selected', action: 'compare', variant: 'primary' },
            { label: '🤖 AI Analysis', action: 'ai-analysis', variant: 'secondary' },
            { label: 'Pause Selected', action: 'pause', variant: 'secondary' },
            { label: 'Delete Selected', action: 'delete', variant: 'danger' }
          ]}
          emptyState={{
            title: 'No creatives found',
            description: searchTerm 
              ? 'No creatives match your search criteria.' 
              : facebookAccessToken 
                ? 'No creatives found for this ad account.' 
                : 'Connect Facebook to see your creatives.',
            action: !facebookAccessToken ? {
              label: 'Connect Facebook',
              onClick: () => {/* Handle connect action */}
            } : undefined
          }}
        />
      )}

      {/* Comparison Modal */}
      {showComparisonModal && (
        <CreativeComparisonModal
          creatives={selectedCreativeData}
          onClose={() => setShowComparisonModal(false)}
          facebookAccessToken={facebookAccessToken}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <CreativeDetailModal
          creative={selectedCreative}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCreative(null);
          }}
          dateRange={dateRange}
          facebookAccessToken={facebookAccessToken}
          adAccountId={adAccountId}
        />
      )}
    </div>
  );
};

export default CreativesTab; 