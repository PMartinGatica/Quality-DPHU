import { useState, useCallback } from 'react';

const API_URL = 'TU_URL_DEL_GOOGLE_SCRIPT';
const ITEMS_PER_PAGE = 1000;

export const useOptimizedData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const buildUrl = (page, filters = {}) => {
    const params = new URLSearchParams({
      offset: 60116 + ((page - 1) * ITEMS_PER_PAGE),
      limit: ITEMS_PER_PAGE,
      ns_not_empty: 'true'
    });

    if (filters.fecha_desde) {
      params.append('fecha_reparacion_gte', filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      params.append('fecha_reparacion_lte', filters.fecha_hasta);
    }

    return `${API_URL}?${params.toString()}`;
  };

  const loadPage = useCallback(async (page, filters = {}) => {
    try {
      const response = await fetch(buildUrl(page, filters));
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      
      if (result.error) throw new Error(result.error);
      
      // Filtrar NS nulos/vacíos (doble validación)
      const validData = result.data.filter(item => item.NS && item.NS.trim() !== '');
      
      setData(prev => [...prev, ...validData]);
      setHasMore(result.hasMore);
      setCurrentPage(page);
      setProgress((page * ITEMS_PER_PAGE / result.total) * 100);
      
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const loadData = useCallback(async (filters = {}) => {
    setLoading(true);
    setData([]);
    setError(null);
    setProgress(0);
    setCurrentPage(1);
    setHasMore(true);
    
    try {
      await loadPage(1, filters);
    } finally {
      setLoading(false);
    }
  }, [loadPage]);

  return {
    data,
    loading,
    error,
    progress,
    hasMore,
    loadData,
    loadMore: (filters) => loadPage(currentPage + 1, filters)
  };
};