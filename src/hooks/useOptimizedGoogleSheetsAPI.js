import { useState, useCallback, useRef, useEffect } from 'react';

const CHUNK_SIZE = 5000; // Procesar de 5k en 5k
const API_URL = 'https://script.google.com/macros/s/AKfycbwacUJ33TUWT9x9rpLs81_4APH9RW6MeHaSEEtbtK4AIal9bm6nAcRmvv_DG6ZD5nVR/exec';

export const useOptimizedGoogleSheetsAPI = () => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const workerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Inicializar worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/dataProcessor.worker.js', import.meta.url));
    
    workerRef.current.onmessage = (e) => {
      const { type, data, progress: chunkProgress } = e.data;
      
      if (type === 'CHUNK_PROCESSED') {
        setAllData(prev => [...prev, ...data]);
        setProgress(chunkProgress);
        setLoadingMessage(`Procesando... ${chunkProgress}%`);
      } else if (type === 'ERROR') {
        setError(e.data.error);
        setLoading(false);
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const fetchAllDataOptimized = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    setProgress(0);
    setAllData([]);
    setLoadingMessage('Iniciando carga...');
    
    try {
      // Obtener información inicial (cantidad de filas)
      setLoadingMessage('Consultando cantidad de datos...');
      const infoResponse = await fetch(`${API_URL}?action=info`, {
        signal: abortControllerRef.current.signal
      });
      
      if (!infoResponse.ok) {
        throw new Error(`Error obteniendo información: ${infoResponse.status}`);
      }
      
      const { totalRows } = await infoResponse.json();
      const totalChunks = Math.ceil(totalRows / CHUNK_SIZE);
      
      setLoadingMessage(`Cargando ${totalRows.toLocaleString()} registros en ${totalChunks} lotes...`);
      
      // Cargar datos en chunks
      for (let chunk = 0; chunk < totalChunks; chunk++) {
        if (abortControllerRef.current.signal.aborted) {
          throw new Error('Carga cancelada');
        }
        
        const startRow = 60116 + (chunk * CHUNK_SIZE);
        setLoadingMessage(`Cargando lote ${chunk + 1} de ${totalChunks}...`);
        
        const response = await fetch(`${API_URL}?startRow=${startRow}&limit=${CHUNK_SIZE}`, {
          signal: abortControllerRef.current.signal
        });
        
        if (!response.ok) {
          throw new Error(`Error en lote ${chunk + 1}: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        if (result.data && result.data.length > 0) {
          // Enviar chunk al worker para procesamiento
          workerRef.current.postMessage({
            type: 'PROCESS_CHUNK',
            data: result.data,
            chunk: chunk + 1,
            totalChunks
          });
        }
        
        // Si no hay más datos, salir del loop
        if (!result.data || result.data.length < CHUNK_SIZE) {
          break;
        }
        
        // Pequeña pausa para no saturar el navegador
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setLoadingMessage('Finalizando carga...');
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        console.error('Error cargando datos:', err);
      }
    } finally {
      setLoading(false);
      setProgress(100);
      setLoadingMessage('');
    }
  }, []);

  // Filtrado optimizado con debounce
  const applyFilters = useCallback((filters) => {
    const startTime = performance.now();
    
    let filtered = allData;

    // Filtros más eficientes
    if (filters.fecha_desde || filters.fecha_hasta) {
      filtered = filtered.filter(row => {
        if (!row.FECHA_REPARACION) return false;
        if (filters.fecha_desde && row.FECHA_REPARACION < filters.fecha_desde) return false;
        if (filters.fecha_hasta && row.FECHA_REPARACION > filters.fecha_hasta) return false;
        return true;
      });
    }

    if (filters.modelo && filters.modelo !== 'Todos los Modelos') {
      filtered = filtered.filter(row => row.MODELO === filters.modelo);
    }

    setFilteredData(filtered);
    
    const endTime = performance.now();
    console.log(`Filtrado completado en ${Math.round(endTime - startTime)}ms`);
    console.log(`${filtered.length} registros de ${allData.length} totales`);
  }, [allData]);

  const getUniqueModels = useCallback(() => {
    if (allData.length === 0) return ['Todos los Modelos'];
    
    const modelsSet = new Set();
    allData.forEach(row => {
      if (row.MODELO) modelsSet.add(row.MODELO);
    });
    
    return ['Todos los Modelos', ...Array.from(modelsSet).sort()];
  }, [allData]);

  const cancelLoad = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    allData,
    filteredData,
    loading,
    error,
    progress,
    loadingMessage,
    fetchAllData: fetchAllDataOptimized,
    applyFilters,
    getUniqueModels,
    cancelLoad
  };
};