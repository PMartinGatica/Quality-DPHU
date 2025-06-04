import { useState, useCallback } from 'react';

// ACTUALIZA ESTA URL con la nueva URL de tu implementación
const API_URL = 'https://script.google.com/macros/s/AKfycbzIfpX-OlwsEdbh9_YdEkF8NLPzJlWdbPD5sDApUIsOCmYcsAliYClJZA8YmmSktEb6/exec';

export const useGoogleSheetsAPI = () => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAvailable, setTotalAvailable] = useState(0);

  const fetchLatestData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAllData([]);
    setFilteredData([]);
    setCurrentPage(1);
    
    try {
      console.log('🔄 Cargando últimos 5000 registros...');
      
      const url = `${API_URL}?page=1&limit=5000`;
      console.log('🌍 URL:', url);
      
      const response = await fetch(url);
      console.log('📊 Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📦 Datos recibidos:', result);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      const processedData = result.data || [];
      
      setAllData(processedData);
      setFilteredData(processedData);
      setHasMoreData(result.hasMore || false);
      setTotalAvailable(result.total || 0);
      
      console.log(`✅ Cargados ${processedData.length} registros`);
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreHistoricalData = useCallback(async () => {
    if (!hasMoreData || loadingMore) return;
    
    setLoadingMore(true);
    
    try {
      console.log(`📊 Cargando página ${currentPage + 1}...`);
      
      const url = `${API_URL}?page=${currentPage + 1}&limit=5000`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      const newData = result.data || [];
      const combinedData = [...allData, ...newData];
      
      setAllData(combinedData);
      setFilteredData(combinedData);
      setHasMoreData(result.hasMore || false);
      setCurrentPage(prev => prev + 1);
      
      console.log(`✅ Cargados ${newData.length} registros adicionales. Total: ${combinedData.length}`);
      
    } catch (err) {
      console.error('❌ Error cargando más datos:', err);
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMoreData, loadingMore, currentPage, allData]);

  const applyFilters = useCallback((filters) => {
    let filtered = [...allData];
    
    if (filters.fecha_desde) {
      filtered = filtered.filter(item => 
        item.FECHA_REPARACION >= filters.fecha_desde
      );
    }
    
    if (filters.fecha_hasta) {
      filtered = filtered.filter(item => 
        item.FECHA_REPARACION <= filters.fecha_hasta
      );
    }
    
    if (filters.modelo && filters.modelo !== 'Todos los Modelos') {
      filtered = filtered.filter(item => 
        item.MODELO === filters.modelo
      );
    }
    
    setFilteredData(filtered);
  }, [allData]);

  const getUniqueModels = useCallback(() => {
    const models = [...new Set(allData.map(item => item.MODELO))].filter(Boolean);
    return models.sort();
  }, [allData]);

  return {
    allData,
    filteredData,
    loading,
    loadingMore,
    error,
    hasMoreData,
    totalAvailable,
    fetchLatestData,
    loadMoreHistoricalData,
    applyFilters,
    getUniqueModels
  };
};