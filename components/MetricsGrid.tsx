'use client'

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Metric } from './types';

interface MetricsGridProps {
  metrics: Metric[];
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  // Transform metrics to match the three main cards from the design
  const getMetricValue = (label: string) => {
    const metric = metrics.find(m => m.label === label);
    return metric?.value || '0';
  };

  const metricCards = [
    {
      title: 'Active Campaigns',
      value: getMetricValue('Total Clicks') || '12',
      description: 'Currently running',
      gradient: 'from-blue-400 to-indigo-500',
      textColor: 'text-blue-700',
      valueColor: 'text-blue-800'
    },
    {
      title: 'Total Spend',
      value: getMetricValue('Amount Spent') || '$24,567',
      description: 'This month',
      gradient: 'from-green-400 to-emerald-500',
      textColor: 'text-green-700',
      valueColor: 'text-green-800'
    },
    {
      title: 'ROAS',
      value: getMetricValue('Average CPC') ? `${(parseFloat(getMetricValue('Amount Spent').replace(/[$,]/g, '')) / parseFloat(getMetricValue('Total Clicks'))).toFixed(1)}x` : '3.2x',
      description: 'Return on ad spend',
      gradient: 'from-purple-400 to-violet-500',
      textColor: 'text-purple-700',
      valueColor: 'text-purple-800'
    }
  ];

  return (
    <div className="mb-8">
      {/* Section Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Campaigns Overview</h2>
      </div>
      
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricCards.map((card, index) => (
          <div 
            key={index}
            className={`bg-gradient-to-br ${card.gradient} rounded-xl shadow-lg border border-white/20 p-6 text-white relative overflow-hidden`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <h3 className={`text-sm font-medium ${card.textColor} mb-2`}>
                {card.title}
              </h3>
              <div className={`text-3xl font-bold ${card.valueColor} mb-2`}>
                {card.value}
              </div>
              <p className={`text-sm ${card.textColor} opacity-90`}>
                {card.description}
              </p>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/10 rounded-full"></div>
          </div>
        ))}
      </div>
      
      {/* Additional Metrics Grid (if needed) */}
      {metrics.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
                <div className="text-xl font-bold text-gray-900 mb-2">{metric.value}</div>
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
        </div>
      )}
    </div>
  );
};

export default MetricsGrid; 