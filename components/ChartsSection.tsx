'use client'

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';

interface ChartsSectionProps {
  clicksData: any[];
  campaignClicks: any[];
  publisherData: any[];
  sampleClicksData: any[];
  sampleCampaignClicks: any[];
  samplePublisherData: any[];
}

const ChartsSection: React.FC<ChartsSectionProps> = ({
  clicksData,
  campaignClicks,
  publisherData,
  sampleClicksData,
  sampleCampaignClicks,
  samplePublisherData
}) => {
  const { theme } = useDashboardTheme();
  const displayClicksData = clicksData.length > 0 ? clicksData : sampleClicksData;
  const displayCampaignClicks = campaignClicks.length > 0 ? campaignClicks : sampleCampaignClicks;
  const displayPublisherData = publisherData.length > 0 ? publisherData : samplePublisherData;

  const totalClicks = displayClicksData.reduce((sum, item) => sum + item.clicks, 0);
  const totalPublisherClicks = displayPublisherData.reduce((sum, item) => sum + item.value, 0);

  // Modern color palette for campaign clicks
  const modernCampaignColors = [
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#F97316'  // Orange
  ];

  // Modern color palette for publisher platforms
  const modernPublisherColors = [
    '#7C3AED', // Modern Violet
    '#EC4899', // Modern Pink
    '#06B6D4', // Modern Cyan
    '#10B981'  // Modern Emerald
  ];

  return (
    <div className="mb-8">
      {/* Section Title */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold transition-colors duration-300 ${
          theme === 'white' ? 'text-gray-900' : 'text-gray-100'
        }`}>Performance Analytics</h2>
        <p className={`mt-2 transition-colors duration-300 ${
          theme === 'white' ? 'text-gray-600' : 'text-gray-300'
        }`}>Track your campaign performance across different metrics and platforms</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clicks Trend Chart */}
        <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-300 ${
          theme === 'white' 
            ? 'bg-white border-gray-200' 
            : 'bg-slate-800 border-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                }`}>Clicks Trend</h3>
                <p className={`text-sm transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                }`}>Performance over time</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-900' : 'text-gray-100'
              }`}>
                {totalClicks.toLocaleString()}
              </div>
              <div className={`text-sm transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-500' : 'text-gray-400'
              }`}>Total Clicks</div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={displayClicksData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="clicks" 
                stroke="#6366F1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorClicks)" 
              />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: theme === 'white' ? '#6B7280' : '#9CA3AF' }}
                tickMargin={8}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: theme === 'white' ? '#6B7280' : '#9CA3AF' }}
                tickMargin={8}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: theme === 'white' ? 'white' : '#1F2937',
                  border: theme === 'white' ? '1px solid #E5E7EB' : '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: theme === 'white' ? '#111827' : '#F9FAFB'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign Performance */}
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
              }`}>Campaign Performance</h3>
              <p className={`text-sm transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-500' : 'text-gray-400'
              }`}>Clicks by campaign</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {displayCampaignClicks.map((item, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 border ${
                theme === 'white'
                  ? 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-100'
                  : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-slate-600'
              }`}>
                <div className="flex items-center flex-1 min-w-0">
                  <div 
                    className="w-3 h-3 rounded-full mr-3 flex-shrink-0 shadow-sm" 
                    style={{ backgroundColor: modernCampaignColors[index % modernCampaignColors.length] }}
                  ></div>
                  <span className={`text-sm font-medium truncate transition-colors duration-300 ${
                    theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                  }`}>
                    {item.name}
                  </span>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className={`text-lg font-bold transition-colors duration-300 ${
                    theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                  }`}>{item.clicks}</div>
                  <div className={`text-xs transition-colors duration-300 ${
                    theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                  }`}>({item.percentage.toFixed(1)}%)</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publisher Platforms */}
        <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-300 ${
          theme === 'white' 
            ? 'bg-white border-gray-200' 
            : 'bg-slate-800 border-slate-700'
        }`}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <PieChartIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-900' : 'text-gray-100'
              }`}>Platform Breakdown</h3>
              <p className={`text-sm transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-500' : 'text-gray-400'
              }`}>Performance by platform</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center mb-6 relative">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={displayPublisherData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {displayPublisherData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={modernPublisherColors[index % modernPublisherColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Total */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                }`}>
                  {totalPublisherClicks}
                </div>
                <div className={`text-xs font-medium transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                }`}>Total</div>
              </div>
            </div>
          </div>
          
          {/* Platform Legend */}
          <div className="space-y-3">
            {displayPublisherData.map((item, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 border ${
                theme === 'white'
                  ? 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-100'
                  : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-slate-600'
              }`}>
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3 shadow-sm" 
                    style={{ backgroundColor: modernPublisherColors[index % modernPublisherColors.length] }}
                  ></div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                  }`}>{item.name}</span>
                </div>
                <span className={`text-sm font-bold transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                }`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection; 