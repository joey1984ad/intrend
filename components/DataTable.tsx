'use client'

import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, MoreHorizontal, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { DataTableProps, ColumnDefinition } from './types';
import { useTableFilterSort } from './hooks/useTableFilterSort';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';

// Generic constraint that requires an id property of any type
type WithId = { id: any };

export function DataTable<T extends WithId>({
  data,
  columns,
  searchTerm,
  onSearchChange,
  selectedItems,
  onItemSelect,
  onBulkAction,
  sortField,
  sortDirection,
  onSort,
  isLoading = false,
  title,
  subtitle,
  showBulkActions = true,
  bulkActions = [
    { label: 'Pause Selected', action: 'pause', variant: 'secondary' },
    { label: 'Delete Selected', action: 'delete', variant: 'danger' }
  ],
  showExport = true,
  onExport,
  showFilters = false,
  filters = [],
  onFiltersChange,
  pagination,
  emptyState
}: DataTableProps<T>) {
  const { theme } = useDashboardTheme();

  // Get searchable fields from columns
  const searchableFields = useMemo(() => {
    return columns
      .filter(col => col.searchable !== false)
      .map(col => col.key);
  }, [columns]);

  // Use the custom hook for filtering and sorting
  const { sortedData, totalCount, filteredCount } = useTableFilterSort({
    data,
    searchTerm,
    searchableFields,
    filters,
    sortConfig: sortField && sortDirection ? { field: sortField, direction: sortDirection } : undefined
  });

  // Helper function to get nested property value
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  };

  // Helper function to render cell value
  const renderCell = (item: T, column: ColumnDefinition<T>) => {
    const value = getNestedValue(item, column.key as string);
    
    if (column.render) {
      return column.render(value, item);
    }
    
    return value;
  };

  // Helper function to get status color
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

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Helper function to format numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Handle select all/none
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      sortedData.forEach(item => onItemSelect(Number(item.id)));
    } else {
      selectedItems.forEach(id => onItemSelect(id));
    }
  };

  // Check if all items are selected
  const allSelected = sortedData.length > 0 && selectedItems.length === sortedData.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < sortedData.length;

  if (isLoading) {
    return (
      <div className={`rounded-lg shadow-sm p-6 transition-colors duration-300 ${
        theme === 'white' ? 'bg-white' : 'bg-slate-800'
      }`}>
        <div className="animate-pulse">
          <div className={`h-4 rounded w-1/4 mb-4 transition-colors duration-300 ${
            theme === 'white' ? 'bg-gray-200' : 'bg-slate-600'
          }`}></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-12 rounded transition-colors duration-300 ${
                theme === 'white' ? 'bg-gray-200' : 'bg-slate-600'
              }`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      {(title || subtitle) && (
        <div className={`p-6 border-b transition-colors duration-300 ${
          theme === 'white' ? 'border-gray-200' : 'border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              {title && <h2 className={`text-xl font-semibold transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-900' : 'text-gray-100'
              }`}>{title}</h2>}
              {subtitle && <p className={`text-sm transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-600' : 'text-gray-300'
              }`}>{subtitle}</p>}
            </div>
            <div className="flex items-center space-x-3">
              {showExport && onExport && (
                <button
                  onClick={onExport}
                  className="btn"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className={`p-6 border-b transition-colors duration-300 ${
        theme === 'white' ? 'border-gray-200' : 'border-slate-700'
      }`}>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${
                  theme === 'white'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-slate-600 bg-slate-700 text-gray-100'
                }`}
              />
            </div>
          </div>
          {showFilters && (
            <button className={`flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors duration-300 ${
              theme === 'white'
                ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                : 'text-gray-200 bg-slate-700 border-slate-600 hover:bg-slate-600'
            }`}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          )}
        </div>
        {searchTerm && (
          <div className={`mt-2 text-sm transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            Showing {filteredCount} of {totalCount} results
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y transition-colors duration-300 ${
          theme === 'white' ? 'divide-gray-200' : 'divide-slate-700'
        }`}>
          <thead className={`transition-colors duration-300 ${
            theme === 'white' ? 'bg-gray-50' : 'bg-slate-700'
          }`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-500' : 'text-gray-300'
              }`}>
                <input
                  type="checkbox"
                  className={`rounded text-blue-600 focus:ring-blue-500 transition-colors duration-300 ${
                    theme === 'white' ? 'border-gray-300' : 'border-slate-500'
                  }`}
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    theme === 'white' ? 'text-gray-500' : 'text-gray-300'
                  } ${
                    column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                  } ${column.width ? `w-${column.width}` : ''} ${column.className || ''}`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => onSort?.(column.key)}
                      className={`flex items-center space-x-1 group transition-colors duration-300 ${
                        theme === 'white' ? 'hover:text-gray-700' : 'hover:text-gray-200'
                      }`}
                    >
                      <span>{column.header}</span>
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={`w-3 h-3 -mb-1 ${
                            sortField === column.key && sortDirection === 'asc' 
                              ? 'text-blue-600' 
                              : theme === 'white' ? 'text-gray-400 group-hover:text-gray-600' : 'text-gray-500 group-hover:text-gray-300'
                          }`} 
                        />
                        <ChevronDown 
                          className={`w-3 h-3 -mt-1 ${
                            sortField === column.key && sortDirection === 'desc' 
                              ? 'text-blue-600' 
                              : theme === 'white' ? 'text-gray-400 group-hover:text-gray-600' : 'text-gray-500 group-hover:text-gray-300'
                          }`} 
                        />
                      </div>
                    </button>
                  ) : (
                    <span>{column.header}</span>
                  )}
                </th>
              ))}
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-500' : 'text-gray-300'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y transition-colors duration-300 ${
            theme === 'white' ? 'bg-white divide-gray-200' : 'bg-slate-800 divide-slate-700'
          }`}>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className={`px-6 py-8 text-center transition-colors duration-300 ${
                  theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {emptyState ? (
                    <div className="text-center">
                      <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                        theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                      }`}>{emptyState.title}</h3>
                      <p className={`mb-4 transition-colors duration-300 ${
                        theme === 'white' ? 'text-gray-600' : 'text-gray-300'
                      }`}>{emptyState.description}</p>
                      {emptyState.action && (
                        <button
                          onClick={emptyState.action.onClick}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          {emptyState.action.label}
                        </button>
                      )}
                    </div>
                  ) : (
                    searchTerm ? 'No results found matching your search.' : 'No data available.'
                  )}
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <tr key={item.id} className={`transition-colors duration-300 ${
                  theme === 'white' ? 'hover:bg-gray-50' : 'hover:bg-slate-700'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className={`rounded text-blue-600 focus:ring-blue-500 transition-colors duration-300 ${
                        theme === 'white' ? 'border-gray-300' : 'border-slate-500'
                      }`}
                      checked={selectedItems.includes(Number(item.id))}
                      onChange={() => onItemSelect(Number(item.id))}
                    />
                  </td>
                  {columns.map((column) => (
                    <td
                      key={column.key as string}
                      className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                        theme === 'white' ? 'text-gray-900' : 'text-gray-100'
                      } ${
                        column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                      } ${column.className || ''}`}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className={`transition-colors duration-300 ${
                      theme === 'white' ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300'
                    }`}>
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && selectedItems.length > 0 && (
        <div className={`p-6 border-t transition-colors duration-300 ${
          theme === 'white' ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm transition-colors duration-300 ${
              theme === 'white' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-3">
              {bulkActions.map((action) => (
                <button
                  key={action.action}
                  onClick={() => onBulkAction(action.action)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
                    action.variant === 'danger'
                      ? 'text-red-700 bg-red-100 border border-red-300 hover:bg-red-200'
                      : action.variant === 'primary'
                      ? 'text-white bg-blue-600 border border-transparent hover:bg-blue-700'
                      : theme === 'white'
                        ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        : 'text-gray-200 bg-slate-700 border border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <div className={`px-6 py-3 border-t transition-colors duration-300 ${
          theme === 'white' ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`text-sm transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-700' : 'text-gray-300'
              }`}>Show</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                className={`border rounded-md px-2 py-1 text-sm transition-colors duration-300 ${
                  theme === 'white'
                    ? 'border-gray-300 bg-white text-gray-900'
                    : 'border-slate-600 bg-slate-700 text-gray-100'
                }`}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className={`text-sm transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-700' : 'text-gray-300'
              }`}>entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${
                  theme === 'white'
                    ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    : 'border-slate-600 bg-slate-700 text-gray-200 hover:bg-slate-600'
                }`}
              >
                Previous
              </button>
              <span className={`text-sm transition-colors duration-300 ${
                theme === 'white' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${
                  theme === 'white'
                    ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    : 'border-slate-700 bg-slate-700 text-gray-200 hover:bg-slate-600'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 