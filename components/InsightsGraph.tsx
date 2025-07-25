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
import { Settings, TrendingUp, TrendingDown } from 'lucide-react';

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
    if (!accessToken || !adAccountId || !isVisible) return;

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

      const result = await response.json();

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
        
        setData(formattedData);
        setSummaryStats(result.summaryStats || null);
        console.log(`📊 Insights graph: Loaded ${formattedData.current.length} days of data${compareMode ? ' with comparison' : ''}`);
      } else {
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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
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
      const dataPoint: any = { day: `Day ${index + 1}` };
      
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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
          <p className="text-sm text-gray-600">
            Daily performance metrics with {compareMode ? 'period comparison' : 'revenue and ROAS tracking'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {loading && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {compareMode && summaryStats && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Period Comparison Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(summaryStats).map(([metric, stats]) => (
              <div key={metric} className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">{metric}</div>
                <div className="text-lg font-semibold text-gray-900">
                  {metric === 'spend' || metric === 'revenue' 
                    ? `$${stats.current.toFixed(2)}`
                    : metric === 'roas'
                    ? `${stats.current.toFixed(2)}x`
                    : stats.current.toLocaleString()
                  }
                </div>
                <div className="flex items-center justify-center text-xs">
                  {stats.change > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span className={stats.change > 0 ? 'text-green-600' : 'text-red-600'}>
                    {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Toggles */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Settings className="w-4 h-4 mr-2 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Toggle Metrics</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                metric.enabled
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
              style={{ borderLeftColor: metric.color, borderLeftWidth: '3px' }}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {data.current.length > 0 && (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={prepareChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {metrics.map((metric) => {
                if (!metric.enabled) return null;
                
                const lines = [];
                
                // Current period line
                lines.push(
                  <Line
                    key={`${metric.key}_current`}
                    type="monotone"
                    dataKey={`${metric.key}_current`}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: metric.color, strokeWidth: 2 }}
                    yAxisId={metric.yAxis}
                    name={`Current ${metric.label}`}
                  />
                );
                
                // Previous period line (if comparison mode is on)
                if (compareMode && data.previous) {
                  lines.push(
                    <Line
                      key={`${metric.key}_previous`}
                      type="monotone"
                      dataKey={`${metric.key}_previous`}
                      stroke={metric.color}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: metric.color, strokeWidth: 2, r: 4, strokeDasharray: "5 5" }}
                      activeDot={{ r: 6, stroke: metric.color, strokeWidth: 2 }}
                      yAxisId={metric.yAxis}
                      name={`Previous ${metric.label}`}
                    />
                  );
                }
                
                return lines;
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && !error && data.current.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No data available for the selected date range</p>
        </div>
      )}
    </div>
  );
};

export default InsightsGraph; 