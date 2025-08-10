import React, { useState } from 'react';
import { Search, Filter, Download, RefreshCw, MoreVertical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DemographicsTabProps {
  demographicsData: any[];
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

const DemographicsTab: React.FC<DemographicsTabProps> = ({
  demographicsData,
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

  const filteredData = demographicsData.filter(demo =>
    demo.age.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demo.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demo.impressions.toString().includes(searchTerm) ||
    demo.clicks.toString().includes(searchTerm) ||
    demo.spend.toString().includes(searchTerm) ||
    demo.ctr.toString().includes(searchTerm) ||
    demo.cpc.toString().includes(searchTerm)
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

  // Prepare data for charts
  const ageGroupData = demographicsData.reduce((acc, demo) => {
    const existing = acc.find((item: any) => item.age === demo.age);
    if (existing) {
      existing.impressions += demo.impressions;
      existing.clicks += demo.clicks;
      existing.spend += demo.spend;
    } else {
      acc.push({
        age: demo.age,
        impressions: demo.impressions,
        clicks: demo.clicks,
        spend: demo.spend
      });
    }
    return acc;
  }, [] as any[]);

  const genderData = demographicsData.reduce((acc, demo) => {
    const existing = acc.find((item: any) => item.gender === demo.gender);
    if (existing) {
      existing.impressions += demo.impressions;
      existing.clicks += demo.clicks;
      existing.spend += demo.spend;
    } else {
      acc.push({
        gender: demo.gender,
        impressions: demo.impressions,
        clicks: demo.clicks,
        spend: demo.spend
      });
    }
    return acc;
  }, [] as any[]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Demographics</h2>
          <p className="text-gray-600">Analyze audience demographics and performance by age and gender</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-black border border-gray-700 rounded-md hover:bg-gray-900">
            <Download className="w-4 h-4 text-white" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Group Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Age Group</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageGroupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="impressions" fill="#3B82F6" name="Impressions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ gender, spend }) => `${gender}: $${spend}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="spend"
              >
                {genderData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search demographics..."
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
            <RefreshCw className="w-4 h-4 text-white" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Demographics Table */}
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
                    onClick={() => handleSort('age')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Age Group</span>
                    {sortField === 'age' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('gender')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Gender</span>
                    {sortField === 'gender' && (
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    Loading demographics...
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No demographics data found
                  </td>
                </tr>
              ) : (
                sortedData.map((demo, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(index)}
                        onChange={() => handleSelectItem(index)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{demo.age}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{demo.gender}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(demo.impressions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(demo.clicks)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(demo.spend)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {demo.ctr}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(demo.cpc)}
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

export default DemographicsTab; 