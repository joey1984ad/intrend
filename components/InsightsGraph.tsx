'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Settings, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';

interface InsightsData {
  date: string;
  spend: number;
  revenue: number;
  roas: number;
  clicks: number;
  impressions: number;
  ctr: number;
  cpc: number;
  cpm: number;
}

interface SummaryStats {
  spend: { current: number; previous: number; change: number };
  revenue: { current: number; previous: number; change: number };
  roas: { current: number; previous: number; change: number };
  clicks: { current: number; previous: number; change: number };
  impressions: { current: number; previous: number; change: number };
}

interface InsightsGraphProps {
  accessToken: string;
  adAccountId: string;
  dateRange: string;
  isVisible: boolean;
  compareMode: boolean;
}

interface MetricToggle {
  key: string;
  label: string;
  color: string;
  enabled: boolean;
  yAxis: 'left' | 'right';
}

const InsightsGraph: React.FC<InsightsGraphProps> = ({
  accessToken,
  adAccountId,
  dateRange,
  isVisible,
  compareMode
}) => {
  const { theme } = useDashboardTheme();
  const [data, setData] = useState<{ current: InsightsData[]; previous: InsightsData[] | null }>({ current: [], previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [metrics, setMetrics] = useState<MetricToggle[]>([
    { key: 'spend', label: 'Spend', color: '#EF4444', enabled: true, yAxis: 'left' },
    { key: 'revenue', label: 'Revenue', color: '#10B981', enabled: true, yAxis: 'left' },
    { key: 'roas', label: 'ROAS', color: '#8B5CF6', enabled: false, yAxis: 'right' },
    { key: 'clicks', label: 'Clicks', color: '#3B82F6', enabled: true, yAxis: 'right' },
    { key: 'impressions', label: 'Impressions', color: '#6B7280', enabled: false, yAxis: 'right' },
    { key: 'ctr', label: 'CTR', color: '#F59E0B', enabled: false, yAxis: 'right' },
    { key: 'cpc', label: 'CPC', color: '#EC4899', enabled: false, yAxis: 'right' },
    { key: 'cpm', label: 'CPM', color: '#14B8A6', enabled: false, yAxis: 'right' }
  ]);

  const fetchInsightsData = async () => {
    if (!accessToken || !adAccountId || !isVisible) {
      console.log('🔍 InsightsGraph: Skipping fetch - missing required props:', {
        hasAccessToken: !!accessToken,
        hasAdAccountId: !!adAccountId,
        isVisible
      });
      return;
    }

    console.log('🔍 InsightsGraph: Starting fetch with props:', {
      adAccountId,
      dateRange,
      compareMode,
      accessTokenLength: accessToken.length
    });

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/facebook/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          adAccountId,
          dateRange,
          compare: compareMode
        }),
      });

      console.log('🔍 InsightsGraph: API response status:', response.status);

      const result = await response.json();
      console.log('🔍 InsightsGraph: API response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch insights data');
      }

      if (result.success && result.data) {
        // Format dates for display
        const formatData = (dataArray: InsightsData[]) => 
          dataArray.map((item: InsightsData) => ({
            ...item,
            date: new Date(item.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })
          }));

        const formattedData = {
          current: formatData(result.data.current),
          previous: result.data.previous ? formatData(result.data.previous) : null
        };
        
        console.log('🔍 InsightsGraph: Formatted data:', {
          currentDays: formattedData.current.length,
          hasPrevious: !!formattedData.previous,
          sampleCurrent: formattedData.current.slice(0, 3),
          samplePrevious: formattedData.previous?.slice(0, 3)
        });
        
        setData(formattedData);
        setSummaryStats(result.summaryStats || null);
        console.log(`📊 Insights graph: Loaded ${formattedData.current.length} days of data${compareMode ? ' with comparison' : ''}`);
      } else {
        console.error('❌ InsightsGraph: No data received from API:', result);
        throw new Error('No data received from API');
      }
    } catch (error) {
      console.error('❌ Error fetching insights data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightsData();
  }, [accessToken, adAccountId, dateRange, isVisible, compareMode]);

  const toggleMetric = (key: string) => {
    setMetrics(prev => 
      prev.map(metric => 
        metric.key === key 
          ? { ...metric, enabled: !metric.enabled }
          : metric
      )
    );
  };

  const formatValue = (value: number, metric: string) => {
    if (metric === 'spend' || metric === 'revenue') {
      return `$${value.toFixed(2)}`;
    } else if (metric === 'roas') {
      return `${value.toFixed(2)}x`;
    } else if (metric === 'ctr') {
      return `${value.toFixed(2)}%`;
    } else if (metric === 'cpc') {
      return `$${value.toFixed(2)}`;
    } else if (metric === 'cpm') {
      return `$${value.toFixed(2)}`;
    } else {
      return value.toLocaleString();
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 border rounded-lg shadow-lg transition-colors duration-300 ${
          theme === 'white' 
            ? 'bg-white border-gray-200' 
            : 'bg-slate-800 border-slate-600'
        }`}>
          <p className={`font-medium mb-2 transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-900' : 'text-gray-100'
          }`}>{label}</p>
          {payload.map((entry: any, index: number) => {
            const metric = metrics.find(m => m.key === entry.dataKey?.replace('_current', '').replace('_previous', ''));
            if (!metric?.enabled) return null;
            
            const isCurrent = entry.dataKey?.includes('_current');
            const isPrevious = entry.dataKey?.includes('_previous');
            const periodLabel = isCurrent ? 'Current' : isPrevious ? 'Previous' : '';
            
            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {periodLabel} {metric.label}: {formatValue(entry.value, entry.dataKey?.replace('_current', '').replace('_previous', ''))}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Prepare chart data with both current and previous periods
  const prepareChartData = () => {
    if (!data.current.length) return [];
    
    const chartData = data.current.map((day, index) => {
      const dataPoint: any = { date: day.date };
      
      metrics.forEach(metric => {
        if (metric.enabled) {
          dataPoint[`${metric.key}_current`] = day[metric.key as keyof InsightsData];
          if (data.previous && data.previous[index]) {
            dataPoint[`${metric.key}_previous`] = data.previous[index][metric.key as keyof InsightsData];
          }
        }
      });
      
      return dataPoint;
    });
    
    return chartData;
  };

  if (!isVisible) return null;

  return (
    <div className={`p-6 rounded-lg shadow-sm transition-colors duration-300 ${
      theme === 'white' ? 'bg-white' : 'bg-slate-800'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold transition-colors duration-300 ${
          theme === 'white' ? 'text-gray-900' : 'text-gray-100'
        }`}>Performance Data</h3>
        <div className="flex items-center space-x-2">
          {loading && (
              <div className={`flex items-center text-sm transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                <Loader2 className="w-4 h-4 animate-spin mr-2 loader-light" />
              Loading data...
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600">
              Error: {error}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin loader-light mx-auto mb-4" />
            <p className={`transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-300'
            }`}>Loading performance data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <AlertCircle className="w-8 h-8 mx-auto" />
            </div>
            <p className={`transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-300'
            }`}>Failed to load performance data</p>
            <p className="text-sm text-red-600 mt-2">{error}</p>
          </div>
        </div>
      ) : data.current.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className={`transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-300'
            }`}>No performance data available</p>
            <p className={`text-sm mt-2 transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-500' : 'text-gray-400'
            }`}>Connect your Facebook account to view data</p>
          </div>
        </div>
      ) : (
        <>
          {/* Metric Toggles */}
          <div className="flex flex-wrap gap-2 mb-6">
            {metrics.map((metric) => (
              <button
                key={metric.key}
                onClick={() => toggleMetric(metric.key)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  metric.enabled
                    ? theme === 'white' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-blue-900/20 text-blue-300'
                    : theme === 'white'
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prepareChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: theme === 'white' ? '#6B7280' : '#9CA3AF' }}
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: theme === 'white' ? '#6B7280' : '#9CA3AF' }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: theme === 'white' ? '#6B7280' : '#9CA3AF' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {metrics.filter(m => m.enabled).map((metric) => (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={`${metric.key}_current`}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={false}
                    yAxisId={metric.yAxis}
                  />
                ))}
                
                {compareMode && data.previous && metrics.filter(m => m.enabled).map((metric) => (
                  <Line
                    key={`${metric.key}_previous`}
                    type="monotone"
                    dataKey={`${metric.key}_previous`}
                    stroke={metric.color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    yAxisId={metric.yAxis}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          {summaryStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {Object.entries(summaryStats).map(([key, stats]) => (
                <div key={key} className="text-center">
                  <p className={`text-sm capitalize transition-colors duration-300 ${
                    theme === 'white' ? 'text-gray-600' : 'text-gray-400'
                  }`}>{key}</p>
                  <p className={`text-lg font-semibold transition-colors duration-300 ${
                    theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                  }`}>
                    {formatValue(stats.current, key)}
                  </p>
                  <p className={`text-sm ${stats.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InsightsGraph; 