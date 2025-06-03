import React, { useEffect, useState } from 'react';
import { useGoogleSheetsAPI } from '../../hooks/useGoogleSheetsAPI';
import LoadingSpinner from '../common/LoadingSpinner';
import ModelSearch from '../common/ModelSearch';
import PivotTreeView from '../pivot/PivotTreeView';
import { Download, RefreshCw, Filter as FilterIcon, X, Calendar } from 'lucide-react';

const DPHUDashboard = ({ isDarkMode }) => {
  const { 
    allData, 
    filteredData, 
    loading, 
    error, 
    loadingProgress,
    fetchAllData, 
    applyFilters, 
    getUniqueModels 
  } = useGoogleSheetsAPI();

  const [filters, setFilters] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    modelo: 'Todos los Modelos',
  });

  // Obtener fechas sugeridas (últimos 30 días, últimos 7 días, etc.)
  const getSuggestedDates = () => {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    return {
      today: formatDate(today),
      yesterday: formatDate(new Date(today.getTime() - 24 * 60 * 60 * 1000)),
      lastWeek: formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
      lastMonth: formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
      last3Months: formatDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000))
    };
  };

  const suggestedDates = getSuggestedDates();

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
      case 'lastWeek':
        setFilters(prev => ({
          ...prev,
          fecha_desde: suggestedDates.lastWeek,
          fecha_hasta: suggestedDates.today
        }));
        break;
      case 'lastMonth':
        setFilters(prev => ({
          ...prev,
          fecha_desde: suggestedDates.lastMonth,
          fecha_hasta: suggestedDates.today
        }));
        break;
      case 'last3Months':
        setFilters(prev => ({
          ...prev,
          fecha_desde: suggestedDates.last3Months,
          fecha_hasta: suggestedDates.today
        }));
        break;
    }
  };

  const exportToCSV = () => {
    const headers = [
      'MODELO', 'NS', 'FUNCION', 'CODIGO_DE_FALLA_REPARACION',
      'CAUSA_DE_REPARACION', 'ACCION_CORRECTIVA', 'ORIGEN',
      'POSICION', 'COMENTARIO', 'FECHA_REPARACION'
    ];
    
    const csvRows = [
      headers.join(','),
      ...filteredData.map(item => 
        headers.map(header => `"${item[header] || ''}"`).join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dphu_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      success: isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
    },
    text: {
      primary: isDarkMode ? 'text-white' : 'text-gray-900',
      secondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }
  };

  // Mostrar loading hasta que termine de cargar
  if (loading) {
    return (
      <LoadingSpinner 
        progress={loadingProgress}
        message={`Cargando datos desde Google Sheets...`}
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
            onClick={fetchAllData}
            className={`px-6 py-3 text-white rounded flex items-center mx-auto ${themeClasses.button.primary}`}
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Reintentar carga
          </button>
        </div>
      </div>
    );
  }

  // Dashboard principal
  return (
    <div className={`w-full h-full flex flex-col overflow-hidden ${themeClasses.container}`}>
      {/* Filtros */}
      <div className={`border-b p-4 flex-shrink-0 ${themeClasses.card}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <FilterIcon className="h-5 w-5 text-blue-400" />
            <h2 className={`text-lg font-semibold ${themeClasses.text.primary}`}>Filtros</h2>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {allData.length.toLocaleString()}
              </div>
              <div className={themeClasses.text.muted}>Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {filteredData.length.toLocaleString()}
              </div>
              <div className={themeClasses.text.muted}>Filtrados</div>
            </div>
          </div>
        </div>

        {/* Botones de rango rápido */}
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
            <button
              onClick={() => setQuickDateRange('lastWeek')}
              className={`px-3 py-1 text-xs rounded text-white ${themeClasses.button.secondary}`}
            >
              Última semana
            </button>
            <button
              onClick={() => setQuickDateRange('lastMonth')}
              className={`px-3 py-1 text-xs rounded text-white ${themeClasses.button.secondary}`}
            >
              Último mes
            </button>
            <button
              onClick={() => setQuickDateRange('last3Months')}
              className={`px-3 py-1 text-xs rounded text-white ${themeClasses.button.secondary}`}
            >
              Últimos 3 meses
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

      {/* Footer */}
      <div className={`border-t p-4 flex-shrink-0 ${themeClasses.card}`}>
        <div className="flex justify-between items-center">
          <div className={`text-sm ${themeClasses.text.muted}`}>
            Total de registros con NS válido después de filtros: {filteredData.length}
          </div>
          
          <button 
            onClick={exportToCSV}
            disabled={filteredData.length === 0}
            className={`px-4 py-2 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${themeClasses.button.success}`}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default DPHUDashboard;