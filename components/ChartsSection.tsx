'use client'

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Clicks Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">Clicks</h3>
          <span className="text-2xl font-bold">
            {clicksData.length > 0 
              ? clicksData.reduce((sum, item) => sum + item.clicks, 0).toLocaleString()
              : sampleClicksData.reduce((sum, item) => sum + item.clicks, 0).toLocaleString()
            }
          </span>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={clicksData.length > 0 ? clicksData : sampleClicksData}>
            <defs>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="clicks" stroke="#3B82F6" fillOpacity={1} fill="url(#colorClicks)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Campaign Clicks */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Clicks by Campaign</h3>
        <div className="space-y-3">
          {(campaignClicks.length > 0 ? campaignClicks : sampleCampaignClicks).map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="w-4 h-2 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm truncate">{item.name}</span>
              </div>
              <div className="text-right ml-4">
                <span className="font-medium">{item.clicks}</span>
                <span className="text-xs text-gray-500 ml-2">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Publisher Platforms */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Publisher Platforms</h3>
        <div className="flex items-center justify-center mb-4 relative">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={publisherData.length > 0 ? publisherData : samplePublisherData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                dataKey="value"
              >
                {(publisherData.length > 0 ? publisherData : samplePublisherData).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {(publisherData.length > 0 ? publisherData : samplePublisherData).reduce((sum, item) => sum + item.value, 0)}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {(publisherData.length > 0 ? publisherData : samplePublisherData).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span>{item.name}</span>
              </div>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartsSection; 