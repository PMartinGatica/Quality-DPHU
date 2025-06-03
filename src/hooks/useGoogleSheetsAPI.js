import { useState, useCallback } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbzvVL_MzmX8NGdNOOiCPRYSs-RrG93_EPAPLbZY6MAmxPS3mb-mEqQT0tT2sAcRv5T4/exec';

export const useGoogleSheetsAPI = () => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Cargar TODOS los datos una sola vez
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLoadingProgress(0);
    
    try {
      console.log('🔄 Iniciando carga de datos desde Google Sheets...');
      setLoadingProgress(10);
      
      const response = await fetch(API_URL);
      setLoadingProgress(30);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('📡 Respuesta recibida, procesando datos...');
      setLoadingProgress(50);
      
      const result = await response.json();
      setLoadingProgress(70);
      
      if (result.error) {
        throw new Error(result.error);
      }

      console.log('📊 Datos brutos recibidos:', result.data?.length || 0, 'registros');
      
      // Procesar y limpiar datos
      const processedData = result.data
        .filter(row => row.NS && row.NS.trim() !== '') // Filtrar NS vacíos
        .map(row => ({
          ...row,
          MODELO: row.MODELO?.trim() || '',
          NS: row.NS?.trim() || '',
          POSICION: row.POSICION?.trim() || '',
          FUNCION: row.FUNCION?.trim() || '',
          CODIGO_DE_FALLA_REPARACION: row.CODIGO_DE_FALLA_REPARACION?.trim() || '',
          CAUSA_DE_REPARACION: row.CAUSA_DE_REPARACION?.trim() || '',
          ACCION_CORRECTIVA: row.ACCION_CORRECTIVA?.trim() || '',
          ORIGEN: row.ORIGEN?.trim() || '',
          REPARADOR: row.REPARADOR?.trim() || '',
          COMENTARIO: row.COMENTARIO?.trim() || ''
        }));
      
      setLoadingProgress(90);
      console.log('✅ Datos procesados:', processedData.length, 'registros válidos');
      
      setAllData(processedData);
      setFilteredData(processedData);
      setLoadingProgress(100);
      
      console.log('🎉 Carga completada exitosamente');
      
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError(err.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 500); // Pequeña pausa para mostrar 100%
    }
  }, []);

  // Aplicar filtros localmente
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
    
    // Filtro por modelo
    if (filters.modelo && filters.modelo !== 'Todos los Modelos') {
      filtered = filtered.filter(item => 
        item.MODELO === filters.modelo
      );
    }
    
    console.log('🔍 Filtros aplicados:', filters, '- Resultados:', filtered.length);
    setFilteredData(filtered);
  }, [allData]);

  // Obtener modelos únicos
  const getUniqueModels = useCallback(() => {
    const models = [...new Set(allData.map(item => item.MODELO))].filter(Boolean);
    return models.sort();
  }, [allData]);

  return {
    allData,
    filteredData,
    loading,
    error,
    loadingProgress,
    fetchAllData,
    applyFilters,
    getUniqueModels
  };
};