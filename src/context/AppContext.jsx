import React, { createContext, useContext } from 'react';
import { useFilters } from '../hooks/useFilters';
import { usePivotData } from '../hooks/usePivotData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const {
    filters,
    handleFilterChange,
    handleFilterApply,
    clearFilters,
    filteredData
  } = useFilters();

  const {
    pivotTree,
    expandedNodes,
    toggleNode
  } = usePivotData(filteredData);

  const value = {
    filters,
    handleFilterChange,
    handleFilterApply,
    clearFilters,
    filteredData,
    pivotTree,
    expandedNodes,
    toggleNode
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};