'use client'

import React, { useState, useMemo } from 'react';
import { DataTable } from './DataTable';
import { CreativeData, ColumnDefinition } from './types';
import CreativeGallery from './CreativeGallery';
import CreativeComparisonModal from './CreativeComparisonModal';
import CreativeFilters from './CreativeFilters';
import CreativeDetailModal from './CreativeDetailModal';
import FacebookImage from './FacebookImage';

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
  dateRange
}) => {
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

  // Enhanced column definitions with more metrics
  const columns: ColumnDefinition<CreativeData>[] = [
    {
      key: 'name',
      header: 'Ad Name',
      sortable: true,
      searchable: true,
      render: (value, creative) => (
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <FacebookImage
              src={creative.thumbnailUrl}
              accessToken={facebookAccessToken}
              alt={creative.name}
              className="w-full h-full object-cover"
              fallbackSrc="https://via.placeholder.com/64x64/6B7280/FFFFFF?text=No+Image"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600" 
                 onClick={() => handleCreativeClick(creative)}>
              {creative.name}
            </div>
            <div className="text-xs text-gray-500 truncate">{creative.adsetName}</div>
            <div className="text-xs text-gray-400 truncate">{creative.campaignName}</div>
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
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'image' ? 'bg-blue-100 text-blue-800' :
          value === 'video' ? 'bg-green-100 text-green-800' :
          value === 'carousel' ? 'bg-yellow-100 text-yellow-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'spend',
      header: 'Spend',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      key: 'impressions',
      header: 'Impressions',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => value.toLocaleString()
    },
    {
      key: 'clicks',
      header: 'Clicks',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => value.toLocaleString()
    },
    {
      key: 'ctr',
      header: 'CTR',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => `${value.toFixed(2)}%`
    },
    {
      key: 'cpc',
      header: 'CPC',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      key: 'cpm',
      header: 'CPM',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      key: 'reach',
      header: 'Reach',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => value.toLocaleString()
    },
    {
      key: 'frequency',
      header: 'Frequency',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => value.toFixed(1)
    },
    {
      key: 'roas',
      header: 'ROAS',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => value ? `${value.toFixed(2)}x` : 'N/A'
    },
    {
      key: 'performance',
      header: 'Performance',
      sortable: true,
      searchable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'excellent' ? 'bg-green-100 text-green-800' :
          value === 'good' ? 'bg-blue-100 text-blue-800' :
          value === 'average' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'fatigueLevel',
      header: 'Fatigue',
      sortable: true,
      searchable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'low' ? 'bg-green-100 text-green-800' :
          value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
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
        creative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creative.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creative.adsetName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.campaign) {
      filtered = filtered.filter(creative => 
        creative.campaignName.toLowerCase().includes(filters.campaign.toLowerCase())
      );
    }

    if (filters.adset) {
      filtered = filtered.filter(creative => 
        creative.adsetName.toLowerCase().includes(filters.adset.toLowerCase())
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
          <h2 className="text-2xl font-bold text-gray-900">Creatives</h2>
          <p className="text-sm text-gray-600">
            {filteredData.length} creative assets • {topPerformers.length} top performers
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'gallery'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Table
            </button>
          </div>

          {/* Comparison Button */}
          {selectedCreatives.length >= 2 && (
            <button
              onClick={handleCompareSelected}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
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
        />
      )}
    </div>
  );
};

export default CreativesTab; 