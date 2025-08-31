'use client'

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Target } from 'lucide-react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';

interface AdsetsChartsSectionProps {
  adsetPerformanceData: any[];
  adsetClicks: any[];
  adsetSpendData: any[];
  sampleAdsetPerformanceData: any[];
  sampleAdsetClicks: any[];
  sampleAdsetSpendData: any[];
}

const AdsetsChartsSection: React.FC<AdsetsChartsSectionProps> = ({
  adsetPerformanceData,
  adsetClicks,
  adsetSpendData,
  sampleAdsetPerformanceData,
  sampleAdsetClicks,
  sampleAdsetSpendData
}) => {
  const { theme } = useDashboardTheme();
  const displayAdsetPerformanceData = adsetPerformanceData.length > 0 ? adsetPerformanceData : sampleAdsetPerformanceData;
  const displayAdsetClicks = adsetClicks.length > 0 ? adsetClicks : sampleAdsetClicks;
  const displayAdsetSpendData = adsetSpendData.length > 0 ? adsetSpendData : sampleAdsetSpendData;

  const totalClicks = displayAdsetClicks.reduce((sum, item) => sum + item.clicks, 0);
  const totalSpend = displayAdsetSpendData.reduce((sum, item) => sum + item.spend, 0);

  // Modern color palette for ad set clicks
  const modernAdsetColors = [
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#F97316', // Orange
    '#EC4899', // Pink
    '#14B8A6'  // Teal
  ];

  // Modern color palette for ad set spend
  const modernSpendColors = [
    '#7C3AED', // Modern Violet
    '#EC4899', // Modern Pink
    '#06B6D4', // Modern Cyan
    '#10B981', // Modern Emerald
    '#F59E0B', // Modern Amber
    '#F97316'  // Modern Orange
  ];

  return (
    <div className="mb-8">
      {/* Section Title */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold transition-colors duration-300 ${
          theme === 'white' ? 'text-gray-900' : 'text-white'
        }`}>Ad Sets Performance</h2>
      </div>

      {/* Performance Overview Chart */}
      <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-300 ${
        theme === 'white' 
          ? 'bg-white border-gray-200' 
          : 'bg-slate-800 border-slate-700'
      }`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-900' : 'text-gray-100'
            }`}>Ad Set Performance Overview</h3>
            <p className={`text-sm transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-500' : 'text-gray-400'
            }`}>Performance metrics by ad set</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Performance Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayAdsetPerformanceData}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: theme === 'white' ? '#6B7280' : '#9CA3AF' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: theme === 'white' ? '#6B7280' : '#9CA3AF' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'white' ? '#ffffff' : '#1f2937',
                    border: theme === 'white' ? '1px solid #e5e7eb' : '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#6366F1" 
                  fillOpacity={1} 
                  fill="url(#colorClicks)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="spend" 
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#colorSpend)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ad Set Clicks Distribution */}
      <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-300 ${
        theme === 'white' 
          ? 'bg-white border-gray-200' 
          : 'bg-slate-800 border-slate-700'
      }`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-900' : 'text-gray-100'
            }`}>Ad Set Clicks Distribution</h3>
            <p className={`text-sm transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-500' : 'text-gray-400'
            }`}>Clicks by ad set</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Bar Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayAdsetClicks}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: theme === 'white' ? '#6B7280' : '#9CA3AF' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: theme === 'white' ? '#6B7280' : '#9CA3AF' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'white' ? '#ffffff' : '#1f2937',
                    border: theme === 'white' ? '1px solid #e5e7eb' : '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="clicks" 
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Ad Set Legend */}
        <div className="space-y-3">
          {displayAdsetClicks.map((item, index) => (
            <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 border ${
              theme === 'white'
                ? 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-100'
                : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-slate-600'
            }`}>
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3 shadow-sm" 
                  style={{ backgroundColor: modernAdsetColors[index % modernAdsetColors.length] }}
                ></div>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                }`}>{item.name}</span>
              </div>
              <span className={`text-sm font-bold transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-900' : 'text-gray-100'
              }`}>{item.clicks}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ad Set Spend Analysis */}
      <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-300 ${
        theme === 'white' 
          ? 'bg-white border-gray-200' 
          : 'bg-slate-800 border-slate-700'
      }`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-lg flex items-center justify-center">
            <PieChartIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-900' : 'text-gray-100'
            }`}>Ad Set Spend Distribution</h3>
            <p className={`text-sm transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-500' : 'text-gray-400'
            }`}>Spend allocation by ad set</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayAdsetSpendData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, spend }) => `${name}: $${spend}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="spend"
                >
                  {displayAdsetSpendData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={modernSpendColors[index % modernSpendColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'white' ? '#ffffff' : '#1f2937',
                    border: theme === 'white' ? '1px solid #e5e7eb' : '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Spend Legend */}
          <div className="space-y-3">
            {displayAdsetSpendData.map((item, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 border ${
                theme === 'white'
                  ? 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-100'
                  : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-slate-600'
              }`}>
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3 shadow-sm" 
                    style={{ backgroundColor: modernSpendColors[index % modernSpendColors.length] }}
                  ></div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                  }`}>{item.name}</span>
                </div>
                <span className={`text-sm font-bold transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                }`}>${item.spend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsetsChartsSection;
