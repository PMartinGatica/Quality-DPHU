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
  Loader,
  X,
  Check,
  Search
} from 'lucide-react';

const DPHUDashboard = ({ isDarkMode }) => {
  const [filters, setFilters] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    modelos: [],
    turno: 'Todos' // Nuevo filtro de turno
  });
  
  const [currentView, setCurrentView] = useState('pivot'); // Comenzar con pivot ya que existe
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false); // Estado para contraer filtros MANUAL
  const [showResults, setShowResults] = useState(false); // Estado para mostrar resultados solo cuando hay filtros aplicados
  
  // Estados para el selector de modelos
  const [modelSearchTerm, setModelSearchTerm] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

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

  // Detectar cuando hay filtros aplicados para mostrar resultados
  useEffect(() => {
    const hasFilters = filters.fecha_desde || 
                      filters.fecha_hasta || 
                      filters.modelos.length > 0 || 
                      filters.turno !== 'Todos';
    
    setShowResults(hasFilters && !loading && allData.length > 0);
  }, [filters, loading, allData.length]);

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

  // Funciones para manejo de modelos múltiples
  const toggleModel = (model) => {
    setFilters(prev => ({
      ...prev,
      modelos: prev.modelos.includes(model)
        ? prev.modelos.filter(m => m !== model)
        : [...prev.modelos, model]
    }));
  };

  const clearAllModels = () => {
    setFilters(prev => ({ ...prev, modelos: [] }));
  };

  // Filtrar modelos basado en búsqueda inteligente
  const filteredModels = useMemo(() => {
    if (!modelSearchTerm || modelSearchTerm.length < 3) {
      return uniqueModels;
    }
    
    const searchLower = modelSearchTerm.toLowerCase();
    return uniqueModels.filter(model => 
      model.toLowerCase().includes(searchLower)
    );
  }, [uniqueModels, modelSearchTerm]);

  // Componente de Carga Inicial con GIF
  const InitialLoadingScreen = () => (
    <div className={`h-screen flex flex-col items-center justify-center ${themeClasses.background}`}>
      <div className="text-center">
        {/* GIF de carga */}
        <div className="mb-8">
          <img 
            src="/logonewsnacarga.gif" 
            alt="Cargando..." 
            className="mx-auto w-32 h-32 object-contain"
          />
        </div>
        
        {/* Texto de carga */}
        <div className="space-y-4">
          <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>
            Cargando Quality Control - DPHU
          </h2>
          
          <div className="flex items-center justify-center space-x-2">
            <Loader className="h-6 w-6 animate-spin text-blue-500" />
            <span className={`text-lg ${themeClasses.text.secondary}`}>
              Preparando datos...
            </span>
          </div>
          
          <p className={`text-sm ${themeClasses.text.secondary} max-w-md`}>
            Estamos cargando los datos de calidad desde Google Sheets. 
            Este proceso puede tardar hasta 30 segundos.
          </p>
          
          {/* Barra de progreso simple */}
          <div className="w-64 mx-auto">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
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

  // Pantalla de bienvenida cuando no hay filtros aplicados
  const WelcomeScreen = () => (
    <div className="flex-grow flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="text-8xl mb-6">🔍</div>
        <h2 className={`text-3xl font-bold mb-4 ${themeClasses.text.primary}`}>
          Bienvenido a Quality Control - DPHU
        </h2>
        <p className={`text-lg mb-6 ${themeClasses.text.secondary}`}>
          Selecciona los filtros arriba para comenzar a analizar los datos de calidad.
        </p>
        <div className={`text-sm ${themeClasses.text.secondary} space-y-2`}>
          <p>• Usa las fechas para filtrar por período</p>
          <p>• Selecciona modelos específicos</p>
          <p>• Filtra por turno de trabajo</p>
          <p>• Los resultados aparecerán automáticamente</p>
        </div>
      </div>
    </div>
  );

  // Mostrar pantalla de carga inicial si los datos aún no están listos
  if (loading && allData.length === 0) {
    return <InitialLoadingScreen />;
  }

  return (
    <div className={`h-full flex flex-col ${themeClasses.background}`}>
      {/* Panel de filtros contraíble MANUAL */}
      <div className={`transition-all duration-500 ease-in-out ${
        isFiltersCollapsed ? 'max-h-20' : 'max-h-none'
      } overflow-hidden`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Header del panel de filtros */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <h2 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
                Filtros de Búsqueda
              </h2>
              {showResults && finalFilteredData.length !== allData.length && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {finalFilteredData.length} de {allData.length}
                </span>
              )}
              {/* Mostrar filtros activos cuando está contraído */}
              {isFiltersCollapsed && (
                <div className="flex items-center space-x-2 text-xs">
                  {filters.fecha_desde && (
                    <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                      📅 {filters.fecha_desde}
                    </span>
                  )}
                  {filters.modelos.length > 0 && (
                    <span className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                      🏭 {filters.modelos.length} modelo{filters.modelos.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {filters.turno !== 'Todos' && (
                    <span className="bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">
                      ⏰ {filters.turno}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Botón para contraer/expandir MANUAL */}
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
              {/* NUEVO LAYOUT: Filtros en una sola fila */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Botones de fecha rápida - MÁS COMPACTOS */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${themeClasses.text.secondary}`}>
                    Acceso Rápido
                  </label>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        fecha_desde: today, 
                        fecha_hasta: today 
                      }))}
                      className={`flex-1 px-2 py-1 text-xs rounded border ${themeClasses.button.secondary} ${themeClasses.text.primary}`}
                    >
                      📅 Hoy
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        fecha_desde: yesterday, 
                        fecha_hasta: yesterday 
                      }))}
                      className={`flex-1 px-2 py-1 text-xs rounded border ${themeClasses.button.secondary} ${themeClasses.text.primary}`}
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

                {/* MODELOS MOVIDO AQUÍ - AL LADO DE FECHA HASTA */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                    🏭 Modelos ({filters.modelos.length})
                  </label>
                  
                  {/* Input de búsqueda con dropdown */}
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar modelo..."
                        value={modelSearchTerm}
                        onChange={(e) => setModelSearchTerm(e.target.value)}
                        onFocus={() => setIsModelDropdownOpen(true)}
                        className={`w-full pl-10 pr-8 py-2 border rounded-lg text-sm ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'
                        }`}
                      />
                      <button
                        onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Dropdown de modelos */}
                    {isModelDropdownOpen && (
                      <div className={`absolute z-50 w-full mt-1 ${themeClasses.card} border rounded-lg shadow-lg max-h-64 overflow-y-auto`}>
                        {/* BOTONES ELIMINADOS - Solo botón Limpiar */}
                        <div className="p-2 border-b flex justify-end">
                          <button
                            onClick={clearAllModels}
                            className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            🗑️ Limpiar
                          </button>
                        </div>

                        {modelSearchTerm.length > 0 && modelSearchTerm.length < 3 && (
                          <div className="p-3 text-sm text-gray-500">
                            Escribe al menos 3 caracteres para buscar...
                          </div>
                        )}
                        
                        {filteredModels.length === 0 && modelSearchTerm.length >= 3 && (
                          <div className="p-3 text-sm text-gray-500">
                            No se encontraron modelos con "{modelSearchTerm}"
                          </div>
                        )}
                        
                        {filteredModels.map(model => (
                          <button
                            key={model}
                            onClick={() => toggleModel(model)}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                              filters.modelos.includes(model) ? 'bg-purple-100 dark:bg-purple-800' : ''
                            }`}
                          >
                            <span>{model}</span>
                            {filters.modelos.includes(model) && (
                              <Check className="h-4 w-4 text-purple-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mostrar modelos seleccionados - MÁS COMPACTO */}
                  {filters.modelos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {filters.modelos.slice(0, 2).map(model => (
                        <span
                          key={model}
                          className="inline-flex items-center px-1 py-0.5 text-xs bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200 rounded"
                        >
                          {model.substring(0, 8)}...
                          <button
                            onClick={() => toggleModel(model)}
                            className="ml-1 hover:text-purple-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {filters.modelos.length > 2 && (
                        <span className="text-xs text-purple-600 dark:text-purple-400">
                          +{filters.modelos.length - 2} más
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Filtro de turnos */}
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
                        {showResults ? finalFilteredData.length : 0} registros
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
                      <div className="text-xs font-medium">{showResults ? turnoStats.TM : 0} registros</div>
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
                      <div className="text-xs font-medium">{showResults ? turnoStats.TT : 0} registros</div>
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
                      <div className="text-xs font-medium">{showResults ? turnoStats.TN : 0} registros</div>
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

      {/* Navegación de vistas - Solo se muestra cuando hay resultados */}
      {showResults && (
        <div className={`flex space-x-1 p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {[
            {
              id: 'table',
              label: 'Tabla',
              icon: '📋'
            },
            {
              id: 'pivot',
              label: 'Análisis',
              icon: '🔍'
            }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === view.id
                  ? `${themeClasses.button.primary} text-white`
                  : `${themeClasses.button.secondary} ${themeClasses.text.primary}`
              }`}
            >
              {view.icon} {view.label}
            </button>
          ))}
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-grow overflow-hidden">
        {error ? (
          <ErrorMessage message={error} />
        ) : !showResults ? (
          <WelcomeScreen />
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