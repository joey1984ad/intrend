import { useMemo } from 'react';
import { UseTableFilterSortProps, UseTableFilterSortReturn, FilterConfig, SortConfig } from '../types';

export function useTableFilterSort<T extends { id: number }>({
  data,
  searchTerm,
  searchableFields,
  filters,
  sortConfig
}: UseTableFilterSortProps<T>): UseTableFilterSortReturn<T> {
  
  // Helper function to get nested property value
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  };

  // Helper function to check if item matches search term
  const matchesSearch = (item: T): boolean => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return searchableFields.some(field => {
      const value = getNestedValue(item, field as string);
      if (value === null || value === undefined) return false;
      
      const stringValue = String(value).toLowerCase();
      return stringValue.includes(searchLower);
    });
  };

  // Helper function to check if item matches filters
  const matchesFilters = (item: T): boolean => {
    if (!filters.length) return true;
    
    return filters.every(filter => {
      const value = getNestedValue(item, filter.field as string);
      
      switch (filter.operator) {
        case 'equals':
          return value === filter.value;
        case 'contains':
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'greater':
          return Number(value) > Number(filter.value);
        case 'less':
          return Number(value) < Number(filter.value);
        case 'between':
          return Number(value) >= Number(filter.value) && 
                 Number(value) <= Number(filter.secondaryValue);
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(value);
        default:
          return true;
      }
    });
  };

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      return matchesSearch(item) && matchesFilters(item);
    });
  }, [data, searchTerm, filters, searchableFields]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.field as string);
      const bValue = getNestedValue(b, sortConfig.field as string);
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string values
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  }, [filteredData, sortConfig]);

  return {
    filteredData,
    sortedData,
    totalCount: data.length,
    filteredCount: filteredData.length
  };
} 