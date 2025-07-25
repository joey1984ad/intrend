'use client'

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Metric } from './types';

interface MetricsGridProps {
  metrics: Metric[];
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const defaultMetrics = [
    { label: 'Total Clicks', value: '0', change: '+0%', trend: 'up' as const },
    { label: 'Total Impressions', value: '0', change: '+0%', trend: 'up' as const },
    { label: 'Total Reach', value: '0', change: '+0%', trend: 'up' as const },
    { label: 'Amount Spent', value: '$0.00', change: '+0%', trend: 'up' as const },
    { label: 'Average CPC', value: '$0.00', change: '+0%', trend: 'up' as const },
    { label: 'Average CPM', value: '$0.00', change: '+0%', trend: 'up' as const },
    { label: 'Average CTR', value: '0.00%', change: '+0%', trend: 'up' as const }
  ];

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {displayMetrics.map((metric, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
          <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</div>
          <div className="flex items-center text-sm">
            {metric.trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
              {metric.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsGrid; 