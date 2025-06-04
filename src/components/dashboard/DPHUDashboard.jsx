import React, { useEffect, useState } from 'react';
import { useGoogleSheetsAPI } from '../../hooks/useGoogleSheetsAPI';
import LoadingSpinner from '../common/LoadingSpinner';
import ModelSearch from '../common/ModelSearch';
import PivotTreeView from '../pivot/PivotTreeView';
import { RefreshCw, Filter as FilterIcon, X, Calendar, ChevronDown, Database, Clock } from 'lucide-react';

const DPHUDashboard = ({ isDarkMode }) => {
  const { 
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
    loadMoreHistoricalData,
    applyFilters, 
    getUniqueModels 
  } = useGoogleSheetsAPI();

  const [filters, setFilters] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    modelo: 'Todos los Modelos',
  });

  // Obtener fechas sugeridas (solo hoy y ayer)
  const getSuggestedDates = () => {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    return {
      today: formatDate(today),
      yesterday: formatDate(new Date(today.getTime() - 24 * 60 * 60 * 1000))
    };
  };

  const suggestedDates = getSuggestedDates();

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchLatestData();
  }, [fetchLatestData]);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    if (allData.length > 0) {
      applyFilters(filters);
    }
  }, [filters, allData, applyFilters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      fecha_desde: '',
      fecha_hasta: '',
      modelo: 'Todos los Modelos',
    });
  };

  const setQuickDateRange = (range) => {
    switch (range) {
      case 'today':
        setFilters(prev => ({
          ...prev,
          fecha_desde: suggestedDates.today,
          fecha_hasta: suggestedDates.today
        }));
        break;
      case 'yesterday':
        setFilters(prev => ({
          ...prev,
          fecha_desde: suggestedDates.yesterday,
          fecha_hasta: suggestedDates.yesterday
        }));
        break;
    }
  };

  // Clases dinámicas basadas en el tema
  const themeClasses = {
    container: isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900',
    card: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    input: isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500',
    button: {
      primary: isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
      secondary: isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-400 hover:bg-gray-500',
      success: isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600',
      warning: isDarkMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'
    },
    text: {
      primary: isDarkMode ? 'text-white' : 'text-gray-900',
      secondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }
  };

  // Mostrar loading inicial
  if (loading) {
    return (
      <LoadingSpinner 
        progress={75}
        message="Cargando los últimos registros..."
        isDarkMode={isDarkMode}
      />
    );
  }

  // Mostrar error con opción de reintentar
  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${themeClasses.container}`}>
        <div className={`text-center p-8 rounded-lg shadow-lg max-w-md ${themeClasses.card}`}>
          <div className="text-red-500 text-2xl mb-4">❌ Error de conexión</div>
          <div className={`mb-6 ${themeClasses.text.secondary}`}>{error}</div>
          <button 
            onClick={fetchLatestData}
            className={`px-6 py-3 text-white rounded flex items-center mx-auto ${themeClasses.button.primary}`}
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Reintentar carga
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden ${themeClasses.container}`}>
      {/* Filtros */}
      <div className={`border-b p-4 flex-shrink-0 ${themeClasses.card}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <FilterIcon className="h-5 w-5 text-blue-400" />
            <h2 className={`text-lg font-semibold ${themeClasses.text.primary}`}>Filtros</h2>
          </div>
        </div>

        {/* Información de rango de fechas cargadas */}
        {oldestLoadedDate && newestLoadedDate && (
          <div className={`mb-4 p-3 rounded ${isDarkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className={`text-sm ${themeClasses.text.secondary}`}>
                  Datos cargados desde: <strong>{oldestLoadedDate}</strong> hasta: <strong>{newestLoadedDate}</strong>
                </span>
              </div>
              
              {hasMoreData && (
                <button
                  onClick={loadMoreHistoricalData}
                  disabled={loadingMore}
                  className={`px-3 py-1 text-xs rounded text-white flex items-center ${themeClasses.button.warning} disabled:opacity-50`}
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Cargar más datos
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Botones de rango rápido (solo hoy y ayer) */}
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
            <Calendar className="inline h-4 w-4 mr-1" />
            Rangos rápidos:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setQuickDateRange('today')}
              className={`px-3 py-1 text-xs rounded text-white ${themeClasses.button.secondary}`}
            >
              Hoy
            </button>
            <button
              onClick={() => setQuickDateRange('yesterday')}
              className={`px-3 py-1 text-xs rounded text-white ${themeClasses.button.secondary}`}
            >
              Ayer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text.secondary}`}>
              Desde:
            </label>
            <input 
              type="date" 
              value={filters.fecha_desde}
              onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
              className={`w-full p-2 border rounded focus:ring-2 ${themeClasses.input}`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text.secondary}`}>
              Hasta:
            </label>
            <input 
              type="date" 
              value={filters.fecha_hasta}
              onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
              className={`w-full p-2 border rounded focus:ring-2 ${themeClasses.input}`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text.secondary}`}>
              Modelo:
            </label>
            <ModelSearch 
              value={filters.modelo}
              onChange={(value) => handleFilterChange('modelo', value)}
              data={allData}
              isDarkMode={isDarkMode}
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={() => applyFilters(filters)}
              className={`px-4 py-2 text-white rounded flex items-center ${themeClasses.button.primary}`}
            >
              Aplicar
            </button>
            <button
              onClick={clearFilters}
              className={`px-4 py-2 text-white rounded flex items-center ${themeClasses.button.secondary}`}
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-grow overflow-hidden">
        <PivotTreeView data={filteredData} isDarkMode={isDarkMode} />
      </div>

      {/* Footer simplificado */}
      <div className={`border-t p-4 flex-shrink-0 ${themeClasses.card}`}>
        <div className="flex justify-between items-center">
          <div className={`text-sm ${themeClasses.text.muted}`}>
            {filteredData.length} registros mostrados
            {hasMoreData && ` (más datos disponibles)`}
          </div>
          
          <div className="flex items-center space-x-2">
            {hasMoreData && (
              <button
                onClick={loadMoreHistoricalData}
                disabled={loadingMore}
                className={`px-4 py-2 text-white rounded disabled:opacity-50 flex items-center ${themeClasses.button.warning}`}
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Cargando datos...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Cargar más datos históricos
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DPHUDashboard;