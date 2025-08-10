import React, { useState } from 'react';
import { Search, Filter, Download, RefreshCw, MoreVertical } from 'lucide-react';

interface AdsTabProps {
  adsData: any[];
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

const AdsTab: React.FC<AdsTabProps> = ({
  adsData,
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
  const [showFilters, setShowFilters] = useState(false);

  const filteredData = adsData.filter(ad =>
    ad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.adSet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.impressions.toString().includes(searchTerm) ||
    ad.clicks.toString().includes(searchTerm) ||
    ad.ctr.toString().includes(searchTerm) ||
    ad.cpc.toString().includes(searchTerm) ||
    ad.spend.toString().includes(searchTerm) ||
    ad.performance.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a];
    const bValue = b[sortField as keyof typeof b];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

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

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'Excellent':
        return 'bg-green-100 text-green-800';
      case 'Good':
        return 'bg-blue-100 text-blue-800';
      case 'Poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ads</h2>
          <p className="text-gray-600">Manage and analyze your individual ads performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleBulkAction('pause')}
            disabled={selectedItems.length === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pause Selected
          </button>
          <button
            onClick={() => handleBulkAction('activate')}
            disabled={selectedItems.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Activate Selected
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
           <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-black border border-gray-700 rounded-md hover:bg-gray-900">
            <Download className="w-4 h-4 text-white" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-black border border-gray-700 rounded-md hover:bg-gray-900">
            <RefreshCw className="w-4 h-4 text-white" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleSelectItem(-1); // Select all
                      } else {
                        handleSelectItem(-2); // Deselect all
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Ad Name</span>
                    {sortField === 'name' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Status</span>
                    {sortField === 'status' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('adSet')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Ad Set</span>
                    {sortField === 'adSet' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('impressions')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Impressions</span>
                    {sortField === 'impressions' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('clicks')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Clicks</span>
                    {sortField === 'clicks' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('ctr')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>CTR</span>
                    {sortField === 'ctr' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('cpc')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>CPC</span>
                    {sortField === 'cpc' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('spend')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Spend</span>
                    {sortField === 'spend' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('performance')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Performance</span>
                    {sortField === 'performance' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center text-gray-500">
                    Loading ads...
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center text-gray-500">
                    No ads found
                  </td>
                </tr>
              ) : (
                sortedData.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(ad.id)}
                        onChange={() => handleSelectItem(ad.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ad.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ad.status)}`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ad.adSet}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(ad.impressions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(ad.clicks)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ad.ctr}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(ad.cpc)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(ad.spend)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(ad.performance)}`}>
                        {ad.performance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdsTab; 