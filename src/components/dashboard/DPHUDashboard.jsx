import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGoogleSheetsAPI } from '../../hooks/useGoogleSheetsAPI';
import PivotTreeView from '../pivot/PivotTreeView';
import { 
  RefreshCw, 
  Download, 
  Calendar, 
  Filter,
  ChevronUp,
  ChevronDown,
  Clock,
  Sun,
  Sunset,
  Moon as MoonIcon,
  Loader
} from 'lucide-react';

const DPHUDashboard = ({ isDarkMode }) => {
  const [filters, setFilters] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    modelos: [],
    turno: 'Todos' // Nuevo filtro de turno
  });
  
  const [currentView, setCurrentView] = useState('pivot'); // Comenzar con pivot ya que existe
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false); // Estado para contraer filtros

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

  // Función para determinar el turno basado en la hora
  const getTurnoFromHora = useCallback((horaRechazo) => {
    if (!horaRechazo) return null;
    
    const hora = horaRechazo.split(':')[0];
    const horaNum = parseInt(hora, 10);
    
    if (horaNum >= 6 && horaNum < 15) return 'TM'; // 06:00:00 - 14:59:59
    if (horaNum >= 15 && horaNum <= 23) return 'TT'; // 15:00:00 - 23:59:59
    if (horaNum >= 0 && horaNum < 6) return 'TN'; // 00:00:00 - 05:59:59
    
    return null;
  }, []);

  // Aplicar filtros incluyendo el nuevo filtro de turno
  const applyAllFilters = useCallback(() => {
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

    // Nuevo filtro por turno
    if (filters.turno && filters.turno !== 'Todos') {
      filtered = filtered.filter(item => {
        const turno = getTurnoFromHora(item.HORA_RECHAZO);
        return turno === filters.turno;
      });
    }

    return filtered;
  }, [allData, filters, getTurnoFromHora]);

  // Datos filtrados con memoization
  const finalFilteredData = useMemo(() => {
    return applyAllFilters();
  }, [applyAllFilters]);

  // Contraer automáticamente después de aplicar filtros
  useEffect(() => {
    if (finalFilteredData.length > 0 && !isFiltersCollapsed) {
      // Contraer filtros automáticamente después de 1 segundo de aplicar filtros
      const timer = setTimeout(() => {
        setIsFiltersCollapsed(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [finalFilteredData.length]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchLatestData();
  }, [fetchLatestData]);

  // Obtener estadísticas de turnos
  const turnoStats = useMemo(() => {
    const stats = { TM: 0, TT: 0, TN: 0, sinTurno: 0 };
    
    finalFilteredData.forEach(item => {
      const turno = getTurnoFromHora(item.HORA_RECHAZO);
      if (turno) {
        stats[turno]++;
      } else {
        stats.sinTurno++;
      }
    });
    
    return stats;
  }, [finalFilteredData, getTurnoFromHora]);

  const themeClasses = {
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    card: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: {
      primary: isDarkMode ? 'text-white' : 'text-gray-900',
      secondary: isDarkMode ? 'text-gray-300' : 'text-gray-600'
    },
    button: {
      primary: isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
      secondary: isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
    }
  };

  const uniqueModels = getUniqueModels();

  // Función para obtener fecha de hoy y ayer
  const getTodayAndYesterday = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return {
      today: today.toISOString().split('T')[0],
      yesterday: yesterday.toISOString().split('T')[0]
    };
  };

  const { today, yesterday } = getTodayAndYesterday();

  // Componente de Loading simple
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center space-x-2">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
        <span className={themeClasses.text.primary}>Cargando datos...</span>
      </div>
    </div>
  );

  // Componente de Error simple
  const ErrorMessage = ({ message }) => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 mb-2">Error al cargar datos</h3>
        <p className={`text-sm ${themeClasses.text.secondary}`}>{message}</p>
        <button
          onClick={fetchLatestData}
          className={`mt-4 px-4 py-2 rounded ${themeClasses.button.primary} text-white`}
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  // Componente de Tabla simple
  const SimpleDataTable = ({ data }) => (
    <div className="p-4 overflow-auto h-full">
      <div className={`rounded-lg border ${themeClasses.card}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Modelo</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Función</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Hora</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Turno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.slice(0, 100).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm">{item.MODELO || '-'}</td>
                  <td className="px-4 py-3 text-sm">{item.FUNCION || '-'}</td>
                  <td className="px-4 py-3 text-sm">{item.FECHA_REPARACION || '-'}</td>
                  <td className="px-4 py-3 text-sm">{item.HORA_RECHAZO || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      getTurnoFromHora(item.HORA_RECHAZO) === 'TM' ? 'bg-yellow-100 text-yellow-800' :
                      getTurnoFromHora(item.HORA_RECHAZO) === 'TT' ? 'bg-orange-100 text-orange-800' :
                      getTurnoFromHora(item.HORA_RECHAZO) === 'TN' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getTurnoFromHora(item.HORA_RECHAZO) || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 100 && (
            <div className="p-4 text-center text-sm text-gray-500">
              Mostrando primeros 100 de {data.length} registros
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`h-full flex flex-col ${themeClasses.background}`}>
      {/* Panel de filtros contraíble */}
      <div className={`transition-all duration-500 ease-in-out ${
        isFiltersCollapsed ? 'max-h-16' : 'max-h-96'
      } overflow-hidden`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Header del panel de filtros */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <h2 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
                Filtros de Búsqueda
              </h2>
              {finalFilteredData.length !== allData.length && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {finalFilteredData.length} de {allData.length}
                </span>
              )}
            </div>
            
            {/* Botón para contraer/expandir */}
            <button
              onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
              className={`p-2 rounded-lg transition-colors ${themeClasses.button.secondary}`}
              title={isFiltersCollapsed ? 'Expandir filtros' : 'Contraer filtros'}
            >
              {isFiltersCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Contenido de filtros (se oculta cuando está contraído) */}
          {!isFiltersCollapsed && (
            <>
              {/* Filtros de fecha integrados */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Botones de fecha rápida */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${themeClasses.text.secondary}`}>
                    Acceso Rápido
                  </label>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        fecha_desde: today, 
                        fecha_hasta: today 
                      }))}
                      className={`px-3 py-2 text-sm rounded border ${themeClasses.button.secondary} ${themeClasses.text.primary}`}
                    >
                      📅 Hoy
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        fecha_desde: yesterday, 
                        fecha_hasta: yesterday 
                      }))}
                      className={`px-3 py-2 text-sm rounded border ${themeClasses.button.secondary} ${themeClasses.text.primary}`}
                    >
                      📅 Ayer
                    </button>
                  </div>
                </div>

                {/* Fecha desde */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                    Fecha desde
                  </label>
                  <input
                    type="date"
                    value={filters.fecha_desde}
                    onChange={(e) => setFilters(prev => ({ ...prev, fecha_desde: e.target.value }))
                    }
                    className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                {/* Fecha hasta */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                    Fecha hasta
                  </label>
                  <input
                    type="date"
                    value={filters.fecha_hasta}
                    onChange={(e) => setFilters(prev => ({ ...prev, fecha_hasta: e.target.value }))
                    }
                    className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                {/* Selector de modelos */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                    Modelos
                  </label>
                  <select
                    multiple
                    value={filters.modelos}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, modelos: selectedOptions }));
                    }}
                    className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    size="3"
                  >
                    {uniqueModels.map(model => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nuevo filtro de turnos */}
              <div className="mt-4 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                    Filtro por Turno
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Todos los turnos */}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, turno: 'Todos' }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      filters.turno === 'Todos'
                        ? 'border-amber-500 bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                        : 'border-gray-300 dark:border-gray-600 hover:border-amber-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-semibold">Todos</div>
                      <div className="text-xs text-gray-500">
                        {finalFilteredData.length} registros
                      </div>
                    </div>
                  </button>

                  {/* Turno Mañana */}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, turno: 'TM' }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      filters.turno === 'TM'
                        ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                        : 'border-gray-300 dark:border-gray-600 hover:border-yellow-400'
                    }`}
                  >
                    <div className="text-center">
                      <Sun className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                      <div className="text-sm font-semibold">TM</div>
                      <div className="text-xs text-gray-500">06:00 - 15:00</div>
                      <div className="text-xs font-medium">{turnoStats.TM} registros</div>
                    </div>
                  </button>

                  {/* Turno Tarde */}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, turno: 'TT' }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      filters.turno === 'TT'
                        ? 'border-orange-500 bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200'
                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
                    }`}
                  >
                    <div className="text-center">
                      <Sunset className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                      <div className="text-sm font-semibold">TT</div>
                      <div className="text-xs text-gray-500">15:00 - 23:59</div>
                      <div className="text-xs font-medium">{turnoStats.TT} registros</div>
                    </div>
                  </button>

                  {/* Turno Noche */}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, turno: 'TN' }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      filters.turno === 'TN'
                        ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200'
                        : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                    }`}
                  >
                    <div className="text-center">
                      <MoonIcon className="h-5 w-5 mx-auto mb-1 text-indigo-500" />
                      <div className="text-sm font-semibold">TN</div>
                      <div className="text-xs text-gray-500">00:00 - 05:59</div>
                      <div className="text-xs font-medium">{turnoStats.TN} registros</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Información de datos cargados */}
              {oldestLoadedDate && newestLoadedDate && (
                <div className={`mt-4 p-3 rounded ${isDarkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-100'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <span className={`text-sm ${themeClasses.text.secondary}`}>
                        Datos cargados: <strong>{oldestLoadedDate}</strong> hasta <strong>{newestLoadedDate}</strong>
                      </span>
                    </div>
                    {hasMoreData && (
                      <button
                        onClick={loadMoreHistoricalData}
                        disabled={loadingMore}
                        className={`text-sm px-3 py-1 rounded ${themeClasses.button.primary} text-white`}
                      >
                        {loadingMore ? 'Cargando...' : 'Cargar más históricos'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navegación de vistas */}
      <div className={`flex space-x-1 p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {/*
          { id: 'table', label: 'Tabla', icon: '📋' },
          { id: 'pivot', label: 'Análisis', icon: '🔍' }
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setCurrentView(view.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === view.id
                ? `${themeClasses.button.primary} text-white`
                : `${themeClasses.button.secondary} ${themeClasses.text.primary}`
            }`
          >
            {view.icon} {view.label}
          </button>
        ))
        */}
      </div>

      {/* Contenido principal */}
      <div className="flex-grow overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            {currentView === 'table' && (
              <SimpleDataTable data={finalFilteredData} />
            )}
            {currentView === 'pivot' && (
              <PivotTreeView 
                data={finalFilteredData} 
                isDarkMode={isDarkMode} 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DPHUDashboard;