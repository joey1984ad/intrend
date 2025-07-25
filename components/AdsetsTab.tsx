'use client'

import React from 'react';
import { DataTable } from './DataTable';
import { Adset, ColumnDefinition } from './types';

interface AdsetsTabProps {
  adsetsData: Adset[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: string) => void;
  selectedItems: number[];
  handleSelectItem: (id: number) => void;
  handleBulkAction: (action: string) => void;
}

const AdsetsTab: React.FC<AdsetsTabProps> = ({
  adsetsData,
  isLoading,
  searchTerm,
  setSearchTerm,
  sortField,
  sortDirection,
  handleSort,
  selectedItems,
  handleSelectItem,
  handleBulkAction
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Column definitions for ad sets
  const columns: ColumnDefinition<Adset>[] = [
    {
      key: 'name',
      header: 'Ad Set Name',
      sortable: true,
      searchable: true
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      searchable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'budget',
      header: 'Budget',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => formatCurrency(value)
    },
    {
      key: 'spend',
      header: 'Spend',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => formatCurrency(value)
    },
    {
      key: 'impressions',
      header: 'Impressions',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => formatNumber(value)
    },
    {
      key: 'clicks',
      header: 'Clicks',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => formatNumber(value)
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
      render: (value) => formatCurrency(value)
    },
    {
      key: 'reach',
      header: 'Reach',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => formatNumber(value)
    },
    {
      key: 'frequency',
      header: 'Frequency',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => value.toFixed(2)
    },
    {
      key: 'campaignName',
      header: 'Campaign',
      sortable: true,
      searchable: true
    }
  ];

  return (
    <DataTable
      data={adsetsData}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      selectedItems={selectedItems}
      onItemSelect={handleSelectItem}
      onBulkAction={handleBulkAction}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={handleSort}
      isLoading={isLoading}
      title="Ad Sets"
      subtitle={`${adsetsData.length} ad sets`}
      showExport={true}
      onExport={() => {/* Handle export */}}
      bulkActions={[
        { label: 'Pause Selected', action: 'pause', variant: 'secondary' },
        { label: 'Activate Selected', action: 'activate', variant: 'primary' },
        { label: 'Delete Selected', action: 'delete', variant: 'danger' }
      ]}
      emptyState={{
        title: 'No ad sets found',
        description: searchTerm 
          ? 'No ad sets match your search criteria.' 
          : 'No ad sets available for this account.',
        action: searchTerm ? undefined : {
          label: 'Create Ad Set',
          onClick: () => {/* Handle create action */}
        }
      }}
    />
  );
};

export default AdsetsTab; 