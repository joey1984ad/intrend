'use client'

import React from 'react';
import { Target, TrendingUp, DollarSign, Users, Eye, MousePointer } from 'lucide-react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';

interface AdsetsMetricsGridProps {
  metrics: any[];
}

const AdsetsMetricsGrid: React.FC<AdsetsMetricsGridProps> = ({ metrics }) => {
  const { theme } = useDashboardTheme();

  // Default ad set metrics if none provided
  const defaultMetricCards = [
    {
      title: 'Total Ad Sets',
      value: '24',
      description: 'Active ad sets across all campaigns',
      gradient: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-100',
      valueColor: 'text-blue-800',
      icon: Target
    },
    {
      title: 'Total Spend',
      value: '$12,450',
      description: 'Combined spend across all ad sets',
      gradient: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-100',
      valueColor: 'text-emerald-800',
      icon: DollarSign
    },
    {
      title: 'Avg. CTR',
      value: '2.4%',
      description: 'Average click-through rate',
      gradient: 'from-purple-500 to-pink-600',
      textColor: 'text-purple-100',
      valueColor: 'text-purple-800',
      icon: MousePointer
    },
    {
      title: 'Total Clicks',
      value: '45,230',
      description: 'Total clicks across all ad sets',
      gradient: 'from-orange-500 to-red-600',
      textColor: 'text-orange-100',
      valueColor: 'text-orange-800',
      icon: TrendingUp
    },
    {
      title: 'Total Impressions',
      value: '1.2M',
      description: 'Total impressions delivered',
      gradient: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-100',
      valueColor: 'text-cyan-800',
      icon: Eye
    },
    {
      title: 'Avg. CPC',
      value: '$0.28',
      description: 'Average cost per click',
      gradient: 'from-violet-500 to-purple-600',
      textColor: 'text-violet-100',
      valueColor: 'text-violet-800',
      icon: DollarSign
    }
  ];

  const metricCards = metrics.length > 0 ? metrics : defaultMetricCards;

  return (
    <div className="mb-8">
      {/* Section Title */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold transition-colors duration-300 ${
          theme === 'white' ? 'text-gray-900' : 'text-white'
        }`}>Ad Sets Overview</h2>
      </div>
      
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div 
              key={index}
              className={`bg-gradient-to-br ${card.gradient} rounded-xl shadow-lg border border-white/20 p-6 text-white relative overflow-hidden`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-medium transition-colors duration-300 ${
                    theme === 'white' ? card.textColor : 'text-white'
                  }`}>
                    {card.title}
                  </h3>
                  <IconComponent className={`w-5 h-5 transition-colors duration-300 ${
                    theme === 'white' ? card.textColor : 'text-white'
                  }`} />
                </div>
                <div className={`text-3xl font-bold transition-colors duration-300 ${
                  theme === 'white' ? card.valueColor : 'text-white'
                } mb-2`}>
                  {card.value}
                </div>
                <p className={`text-sm transition-colors duration-300 ${
                  theme === 'white' ? card.textColor : 'text-white'
                } opacity-90`}>
                  {card.description}
                </p>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/10 rounded-full"></div>
            </div>
          );
        })}
      </div>
      
      {/* Performance Summary */}
      <div className={`mt-8 p-6 rounded-xl shadow-sm border transition-colors duration-300 ${
        theme === 'white' 
          ? 'bg-white border-gray-200' 
          : 'bg-slate-800 border-slate-700'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-900' : 'text-gray-100'
            }`}>Ad Sets Performance Summary</h3>
            <p className={`text-sm transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-500' : 'text-gray-400'
            }`}>Key performance indicators across all ad sets</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`text-center p-4 rounded-lg transition-colors duration-300 ${
            theme === 'white' ? 'bg-gray-50' : 'bg-slate-700'
          }`}>
            <div className={`text-2xl font-bold transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-900' : 'text-white'
            }`}>18</div>
            <div className={`text-sm transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-400'
            }`}>Active</div>
          </div>
          <div className={`text-center p-4 rounded-lg transition-colors duration-300 ${
            theme === 'white' ? 'bg-gray-50' : 'bg-slate-700'
          }`}>
            <div className={`text-2xl font-bold transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-900' : 'text-white'
            }`}>6</div>
            <div className={`text-sm transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-400'
            }`}>Paused</div>
          </div>
          <div className={`text-center p-4 rounded-lg transition-colors duration-300 ${
            theme === 'white' ? 'bg-gray-50' : 'bg-slate-700'
          }`}>
            <div className={`text-2xl font-bold transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-900' : 'text-white'
            }`}>$520</div>
            <div className={`text-sm transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-400'
            }`}>Avg. Spend</div>
          </div>
          <div className={`text-center p-4 rounded-lg transition-colors duration-300 ${
            theme === 'white' ? 'bg-gray-50' : 'bg-slate-700'
          }`}>
            <div className={`text-2xl font-bold transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-900' : 'text-white'
            }`}>2.1%</div>
            <div className={`text-sm transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-400'
            }`}>Avg. CTR</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsetsMetricsGrid;
