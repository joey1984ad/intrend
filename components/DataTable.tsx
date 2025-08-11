'use client'

import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, MoreHorizontal, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { DataTableProps, ColumnDefinition } from './types';
import { useTableFilterSort } from './hooks/useTableFilterSort';

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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
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
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && <h2 className="text-xl font-semibold">{title}</h2>}
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
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
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {showFilters && (
            <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Showing {filteredCount} of {totalCount} results
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                  } ${column.width ? `w-${column.width}` : ''} ${column.className || ''}`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => onSort?.(column.key)}
                      className="flex items-center space-x-1 hover:text-gray-700 group"
                    >
                      <span>{column.header}</span>
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={`w-3 h-3 -mb-1 ${
                            sortField === column.key && sortDirection === 'asc' 
                              ? 'text-blue-600' 
                              : 'text-gray-400 group-hover:text-gray-600'
                          }`} 
                        />
                        <ChevronDown 
                          className={`w-3 h-3 -mt-1 ${
                            sortField === column.key && sortDirection === 'desc' 
                              ? 'text-blue-600' 
                              : 'text-gray-400 group-hover:text-gray-600'
                          }`} 
                        />
                      </div>
                    </button>
                  ) : (
                    <span>{column.header}</span>
                  )}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-8 text-center text-gray-500">
                  {emptyState ? (
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.title}</h3>
                      <p className="text-gray-600 mb-4">{emptyState.description}</p>
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
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedItems.includes(Number(item.id))}
                      onChange={() => onItemSelect(Number(item.id))}
                    />
                  </td>
                  {columns.map((column) => (
                    <td
                      key={column.key as string}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                      } ${column.className || ''}`}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">
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
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-3">
              {bulkActions.map((action) => (
                <button
                  key={action.action}
                  onClick={() => onBulkAction(action.action)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    action.variant === 'danger'
                      ? 'text-red-700 bg-red-100 border border-red-300 hover:bg-red-200'
                      : action.variant === 'primary'
                      ? 'text-white bg-blue-600 border border-transparent hover:bg-blue-700'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
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
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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