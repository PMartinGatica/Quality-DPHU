import { useState, useCallback } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbz0LEHwI0EG3LEXELhZpmu-AGsTnO3kBVq5bDmGPVh1f_hdlz_nL3HoFPa_3HJyHyxd/exec';

export const useGoogleSheetsAPI = () => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [oldestLoadedDate, setOldestLoadedDate] = useState(null);
  const [newestLoadedDate, setNewestLoadedDate] = useState(null);
  const [totalAvailable, setTotalAvailable] = useState(0);

  // Cargar datos iniciales (solo una vez)
  const fetchLatestData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAllData([]);
    setFilteredData([]);
    setCurrentPage(1);
    
    try {
      const url = `${API_URL}?page=1&limit=5000`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      const processedData = result.data || [];
      
      setAllData(processedData);
      setFilteredData(processedData);
      setHasMoreData(result.hasMore || false);
      setTotalAvailable(result.total || 0);
      
      // Calcular rango de fechas cargadas
      if (processedData.length > 0) {
        const validDates = processedData
          .map(item => item.FECHA_RECHAZO) // ✅ CAMBIAR A FECHA_RECHAZO
          .filter(date => date && date !== '' && date !== '1970-01-01')
          .sort();
        
        if (validDates.length > 0) {
          setOldestLoadedDate(validDates[0]);
          setNewestLoadedDate(validDates[validDates.length - 1]);
        }
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar más datos históricos
  const loadMoreHistoricalData = useCallback(async () => {
    if (!hasMoreData || loadingMore) return;
    
    setLoadingMore(true);
    
    try {
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
      
      // Actualizar rango de fechas
      if (newData.length > 0) {
        const validDates = combinedData
          .map(item => item.FECHA_RECHAZO) // ✅ CAMBIAR A FECHA_RECHAZO
          .filter(date => date && date !== '' && date !== '1970-01-01')
          .sort();
        
        if (validDates.length > 0) {
          setOldestLoadedDate(validDates[0]);
          setNewestLoadedDate(validDates[validDates.length - 1]);
        }
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMoreData, loadingMore, currentPage, allData]);

  // Aplicar filtros SOLO localmente (sin recargar datos del servidor)
  const applyFilters = useCallback((filters) => {
    let filtered = [...allData];
    
    // Filtro por fecha desde
    if (filters.fecha_desde) {
      filtered = filtered.filter(item => 
        item.FECHA_REPARACION >= filters.fecha_desde
      );
    }
    
    // Filtro por fecha hasta
    if (filters.fecha_hasta) {
      filtered = filtered.filter(item => 
        item.FECHA_REPARACION <= filters.fecha_hasta
      );
    }
    
    // Filtro por múltiples modelos
    if (filters.modelos && filters.modelos.length > 0) {
      filtered = filtered.filter(item => 
        filters.modelos.includes(item.MODELO)
      );
    }
    
    // Filtro por modelo único (para compatibilidad)
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

  // Reemplaza la función fetchDataSilently por esta versión corregida:
  const fetchDataSilently = useCallback(async () => {
    try {
      const url = `${API_URL}?page=1&limit=5000`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      const processedData = result.data || [];
      
      if (Array.isArray(processedData) && processedData.length > 0) {
        setAllData(processedData);
        setFilteredData(processedData); // También actualizar filteredData
        setHasMoreData(result.hasMore || false);
        setTotalAvailable(result.total || 0);
        
        // Actualizar rango de fechas
        if (processedData.length > 0) {
          const validDates = processedData
            .map(item => item.FECHA_RECHAZO) // ✅ CAMBIAR A FECHA_RECHAZO
            .filter(date => date && date !== '' && date !== '1970-01-01')
            .sort();
          
          if (validDates.length > 0) {
            setOldestLoadedDate(validDates[0]);
            setNewestLoadedDate(validDates[validDates.length - 1]);
          }
        }
        
        return true;
      } else {
        return false;
      }
      
    } catch (error) {
      return false;
    }
  }, []); // ✅ Sin dependencias para evitar cambios durante ejecución

  return {
    allData,
    filteredData,
    loading,
    loadingMore,
    error,
    hasMoreData,
    totalAvailable,
    oldestLoadedDate,
    newestLoadedDate,
    fetchLatestData,
    fetchDataSilently, // ✅ Nueva función para actualización silenciosa
    loadMoreHistoricalData,
    applyFilters,
    getUniqueModels
  };
};