'use client'

import React from 'react';
import { DataTable } from './DataTable';
import { Campaign, ColumnDefinition } from './types';

interface CampaignsTabProps {
  campaigns: Campaign[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCampaigns: number[];
  handleSelectCampaign: (campaignId: number) => void;
  handleBulkAction: (action: string) => void;
  setShowExportModal: (show: boolean) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: string) => void;
}

const CampaignsTab: React.FC<CampaignsTabProps> = ({
  campaigns,
  isLoading,
  searchTerm,
  setSearchTerm,
  selectedCampaigns,
  handleSelectCampaign,
  handleBulkAction,
  setShowExportModal,
  sortField,
  sortDirection,
  handleSort
}) => {
  // Count active campaigns
  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'ACTIVE').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
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

  // Column definitions for campaigns
  const columns: ColumnDefinition<Campaign>[] = [
    {
      key: 'name',
      header: 'Campaign Name',
      sortable: true,
      searchable: true,
      render: (value, campaign) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {campaign.name.length > 30 ? campaign.name.substring(0, 30) + '...' : campaign.name}
          </div>
          <div className="text-sm text-gray-500">ID: {campaign.id}</div>
        </div>
      )
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
      key: 'insights.spend',
      header: 'Spend',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => formatCurrency(value || 0)
    },
    {
      key: 'insights.clicks',
      header: 'Clicks',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => formatNumber(value || 0)
    },
    {
      key: 'insights.impressions',
      header: 'Impressions',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => formatNumber(value || 0)
    },
    {
      key: 'insights.ctr',
      header: 'CTR',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => {
        const ctr = parseFloat(value || '0');
        return `${ctr.toFixed(2)}%`;
      }
    },
    {
      key: 'insights.cpc',
      header: 'CPC',
      sortable: true,
      searchable: true,
      align: 'right',
      render: (value) => formatCurrency(value || 0)
    }
  ];

  return (
    <DataTable
      data={campaigns}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      selectedItems={selectedCampaigns}
      onItemSelect={handleSelectCampaign}
      onBulkAction={handleBulkAction}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={handleSort}
      isLoading={isLoading}
      title="Campaigns"
      subtitle={`${activeCampaigns} active campaigns • ${campaigns.length} total campaigns`}
      showExport={true}
      onExport={() => setShowExportModal(true)}
      bulkActions={[
        { label: 'Pause Selected', action: 'pause', variant: 'secondary' },
        { label: 'Delete Selected', action: 'delete', variant: 'danger' }
      ]}
      emptyState={{
        title: 'No campaigns found',
        description: searchTerm 
          ? 'No campaigns match your search criteria.' 
          : 'Connect your Facebook account to see your campaigns.',
        action: searchTerm ? undefined : {
          label: 'Connect Facebook',
          onClick: () => {/* Handle connect action */}
        }
      }}
    />
  );
};

export default CampaignsTab; 