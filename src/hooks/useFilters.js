import { useState, useCallback, useMemo } from 'react';

// Mock data - Reemplazar con datos reales de tu API
const mockData = [
  { date: '2025-01-01', model: 'Modelo A', dphu: 2.5, details: 'Defecto 1' },
  { date: '2025-01-02', model: 'Modelo B', dphu: 3.1, details: 'Defecto 1' },
  { date: '2025-01-03', model: 'Modelo A', dphu: 1.8, details: 'Defecto 2' },
  // ... más datos
];

export const useFilters = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    selectedModel: ''
  });

  const [filteredData, setFilteredData] = useState(mockData);

  // Datos para los selectores de filtros
  const filterOptions = useMemo(() => {
    const dates = mockData.map(item => new Date(item.date));
    const uniqueModels = [...new Set(mockData.map(item => item.model))];

    return {
      minDate: new Date(Math.min(...dates)).toISOString().split('T')[0],
      maxDate: new Date(Math.max(...dates)).toISOString().split('T')[0],
      uniqueModels
    };
  }, []);

  // Manejador de cambios en los filtros
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  // Aplicar filtros
  const handleFilterApply = useCallback(() => {
    const filtered = mockData.filter(item => {
      const date = new Date(item.date);
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;
      
      const dateInRange = (!start || date >= start) && (!end || date <= end);
      const modelMatch = !filters.selectedModel || item.model === filters.selectedModel;

      return dateInRange && modelMatch;
    });

    setFilteredData(filtered);
  }, [filters]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      startDate: '',
      endDate: '',
      selectedModel: ''
    });
    setFilteredData(mockData);
  }, []);

  return {
    filters: {
      ...filters,
      ...filterOptions
    },
    handleFilterChange,
    handleFilterApply,
    clearFilters,
    filteredData
  };
};