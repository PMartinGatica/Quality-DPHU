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
    turno: [] // Cambiar de 'Todos' a array vacío
  });
  
  const [currentView, setCurrentView] = useState('pivot'); // Comenzar con pivot ya que existe
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false); // Estado para contraer filtros MANUAL
  const [showResults, setShowResults] = useState(false); // Estado para mostrar resultados solo cuando hay filtros aplicados
  
  // Estados para el selector de modelos
  const [modelSearchTerm, setModelSearchTerm] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Nuevos estados para el modal de selección de modelos
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [modelModalSearch, setModelModalSearch] = useState('');

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
    if (horaNum >= 0 && horaNum < 6) return 'TN' ; // 00:00:00 - 05:59:59
    
    return null;
  }, []);

  // Función para extraer el nombre base del modelo automáticamente
  const extractBaseModelName = useCallback((modeloOriginal) => {
    if (!modeloOriginal) return null;
    
    // Patrón: L## - ########AR - NOMBRE_MODELO - Color
    // Extraer el tercer segmento (nombre del modelo)
    const segments = modeloOriginal.split(' - ');
    if (segments.length < 3) return modeloOriginal; // Fallback si no tiene el formato esperado
    
    let modeloNombre = segments[2].trim().toUpperCase(); // ✅ CORREGIDO: usar índice 2, no 3
    
    // Limpiar sufijos y variantes comunes
    modeloNombre = modeloNombre
      .replace(/_256/g, '')           // Quitar _256
      .replace(/_128/g, '')           // Quitar _128
      .replace(/_512/g, '')           // Quitar _512
      .replace(/\s+LITE\s+GO/g, ' LITE GO')  // Normalizar LITE GO
      .replace(/\s+PLUS/g, ' PLUS')   // Normalizar PLUS
      .trim();
    
    return modeloNombre;
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
    
    // Filtro por múltiples modelos usando nombre base
    if (filters.modelos && filters.modelos.length > 0) {
      filtered = filtered.filter(item => {
        const baseModel = extractBaseModelName(item.MODELO);
        return filters.modelos.includes(baseModel);
      });
    }

    // Filtro por múltiples turnos - MODIFICADO
    if (filters.turno && filters.turno.length > 0) {
      filtered = filtered.filter(item => {
        const turno = getTurnoFromHora(item.HORA_RECHAZO);
        return filters.turno.includes(turno);
      });
    }

    return filtered;
  }, [allData, filters, getTurnoFromHora, extractBaseModelName]);

  // Datos filtrados con memoization
  const finalFilteredData = useMemo(() => {
    return applyAllFilters();
  }, [applyAllFilters]);

  // Detectar cuando hay filtros aplicados para mostrar resultados
  useEffect(() => {
    const hasFilters = filters.fecha_desde || 
                      filters.fecha_hasta || 
                      filters.modelos.length > 0 || 
                      filters.turno.length > 0; // Cambiar condición
    
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

  // Reemplaza esta línea (alrededor de la línea 139):
  // const uniqueModels = getUniqueModels();

  // Por esta nueva implementación que usa extractBaseModelName:
  const uniqueModels = useMemo(() => {
    if (!allData || allData.length === 0) return [];
    
    const baseModels = [...new Set(allData
      .map(item => extractBaseModelName(item.MODELO))
      .filter(Boolean)
      .sort()
    )];
    
    return baseModels;
  }, [allData, extractBaseModelName]);

  // // Debug para verificar que funciona la normalización
  useEffect(() => {
    if (allData.length > 0) {
      console.log('🔍 Modelos base extraídos:', uniqueModels);
      console.log('📊 Muestra de conversiones:');
      allData.slice(0, 10).forEach(item => {
        console.log(`${item.MODELO} → ${extractBaseModelName(item.MODELO)}`);
      });
    }
  }, [allData, uniqueModels, extractBaseModelName]);

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

  // Función para manejar selección múltiple de turnos
  const toggleTurno = (turno) => {
    setFilters(prev => ({
      ...prev,
      turno: prev.turno.includes(turno)
        ? prev.turno.filter(t => t !== turno)
        : [...prev.turno, turno]
    }));
  };

  // Filtrar modelos basado en búsqueda inteligente - CORREGIDO
  const filteredModels = useMemo(() => {
    if (!modelSearchTerm || modelSearchTerm.length < 3) {
      return uniqueModels;
    }
    
    const searchLower = modelSearchTerm.toLowerCase();
    return uniqueModels.filter(model => 
      model.toLowerCase().includes(searchLower)
    );
  }, [uniqueModels, modelSearchTerm]);

  // Filtrado para el modal (si no ingresas nada muestra todos)
  const filteredModalModels = useMemo(() => {
    if (!modelModalSearch) return uniqueModels;
    const searchLower = modelModalSearch.toLowerCase();
    return uniqueModels.filter(model =>
      model.toLowerCase().includes(searchLower)
    );
  }, [uniqueModels, modelModalSearch]);

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
      {/* Panel de filtros contraíble MANUAL - Z-INDEX MUY ALTO */}
      <div className={`relative z-50 transition-all duration-500 ease-in-out ${
        isFiltersCollapsed ? 'max-h-20' : 'max-h-none'
      } overflow-visible shadow-xl bg-white dark:bg-gray-800`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
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
                  {filters.turno.length > 0 && (
                    <span className="bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">
                      ⏰ {filters.turno.length} turno{filters.turno.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Botón para contraer/expandir MANUAL */}
            <button
              onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
              className={`p-2 rounded-lg transition-colors ${themeClasses.button.secondary} hover:scale-105`}
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
                    onChange={(e) => setFilters(prev => ({ ...prev, fecha_desde: e.target.value }))}
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
                    onChange={(e) => setFilters(prev => ({ ...prev, fecha_hasta: e.target.value }))}
                    className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                {/* MODELOS - SECCIÓN CON BÚSQUEDA QUE DESPLIEGA AL ESCRIBIR */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${themeClasses.text.secondary}`}>
                    🏭 Modelos ({filters.modelos.length})
                  </label>
                  
                  {/* Input de búsqueda */}
                  <input
                    type="text"
                    placeholder="Escribe para buscar modelos..."
                    value={modelSearchTerm}
                    onChange={(e) => setModelSearchTerm(e.target.value)}
                    className="w-full pl-3 pr-3 py-2 border-2 border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                  
                  {/* Lista de modelos con checkboxes - SE MUESTRA SOLO AL ESCRIBIR */}
                  {modelSearchTerm && modelSearchTerm.length >= 2 && (
                    <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg">
                      {uniqueModels
                        .filter(model => model.toLowerCase().includes(modelSearchTerm.toLowerCase()))
                        .map(model => {
                          const isSelected = filters.modelos.includes(model);
                          return (
                            <label 
                              key={model} 
                              className={`flex items-center px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                                isSelected ? 'bg-blue-50' : 'bg-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleModel(model)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className={`text-sm ${isSelected ? 'font-semibold text-blue-900' : 'text-gray-800'}`}>
                                {model}
                              </span>
                              {isSelected && (
                                <span className="ml-auto text-blue-600">
                                  <Check className="h-4 w-4" />
                                </span>
                              )}
                            </label>
                          );
                        })
                      }
                      
                      {/* Mensaje cuando no hay resultados */}
                      {modelSearchTerm.length >= 2 && 
                        uniqueModels.filter(model => model.toLowerCase().includes(modelSearchTerm.toLowerCase())).length === 0 && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          ❌ No se encontraron modelos con "{modelSearchTerm}"
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Mensaje de ayuda cuando no hay búsqueda */}
                  {!modelSearchTerm && (
                    <div className="text-xs text-gray-500 italic">
                      💡 Escribe al menos 2 letras para ver los modelos disponibles
                    </div>
                  )}
                  
                  {/* Botón para limpiar selecciones */}
                  {filters.modelos.length > 0 && (
                    <div className="flex justify-end">
                      <button
                        onClick={clearAllModels}
                        className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        🗑️ Limpiar selecciones ({filters.modelos.length})
                      </button>
                    </div>
                  )}
                  
                  {/* Mostrar modelos seleccionados */}
                  {filters.modelos.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <strong>Seleccionados:</strong> {filters.modelos.slice(0, 3).join(', ')}
                      {filters.modelos.length > 3 && ` y ${filters.modelos.length - 3} más...`}
                    </div>
                  )}
                </div>
              </div>

              {/* Filtro de turnos - COMPACTO Y VISIBLE */}
              <div className="relative z-40 mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Filtro por Turno
                  </h3>
                </div>
                
                {/* Grid de turnos - SELECCIÓN MÚLTIPLE */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Turno Mañana */}
                  <button
                    onClick={() => toggleTurno('TM')}
                    className={`p-3 rounded-lg border-2 transition-all text-xs ${
                      filters.turno.includes('TM')
                        ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                        : 'border-gray-300 dark:border-gray-600 hover:border-yellow-400'
                    }`}
                  >
                    <div className="text-center">
                      <Sun className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                      <div className="text-xs font-semibold">TM</div>
                      <div className="text-xs text-gray-500">06-15h</div>
                      <div className="text-xs font-medium">{showResults ? turnoStats.TM : 0}</div>
                      {filters.turno.includes('TM') && (
                        <Check className="h-3 w-3 mx-auto mt-1 text-yellow-600" />
                      )}
                    </div>
                  </button>

                  {/* Turno Tarde */}
                  <button
                    onClick={() => toggleTurno('TT')}
                    className={`p-3 rounded-lg border-2 transition-all text-xs ${
                      filters.turno.includes('TT')
                        ? 'border-orange-500 bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200'
                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
                    }`}
                  >
                    <div className="text-center">
                      <Sunset className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                      <div className="text-xs font-semibold">TT</div>
                      <div className="text-xs text-gray-500">15-23h</div>
                      <div className="text-xs font-medium">{showResults ? turnoStats.TT : 0}</div>
                      {filters.turno.includes('TT') && (
                        <Check className="h-3 w-3 mx-auto mt-1 text-orange-600" />
                      )}
                    </div>
                  </button>

                  {/* Turno Noche */}
                  <button
                    onClick={() => toggleTurno('TN')}
                    className={`p-3 rounded-lg border-2 transition-all text-xs ${
                      filters.turno.includes('TN')
                        ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200'
                        : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                    }`}
                  >
                    <div className="text-center">
                      <MoonIcon className="h-4 w-4 mx-auto mb-1 text-indigo-500" />
                      <div className="text-xs font-semibold">TN</div>
                      <div className="text-xs text-gray-500">00-05h</div>
                      <div className="text-xs font-medium">{showResults ? turnoStats.TN : 0}</div>
                      {filters.turno.includes('TN') && (
                        <Check className="h-3 w-3 mx-auto mt-1 text-indigo-600" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Botón para limpiar turnos seleccionados */}
                {filters.turno.length > 0 && (
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, turno: [] }))}
                      className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      🗑️ Limpiar turnos ({filters.turno.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Información de datos cargados */}
              {oldestLoadedDate && newestLoadedDate && (
                <div className={`mt-4 p-3 rounded ${isDarkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-100'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <span className={`text-sm ${themeClasses.text.secondary}`}>
                        Datos: <strong>{oldestLoadedDate}</strong> - <strong>{newestLoadedDate}</strong>
                      </span>
                    </div>
                    {hasMoreData && (
                      <button
                        onClick={loadMoreHistoricalData}
                        disabled={loadingMore}
                        className={`text-sm px-3 py-1 rounded ${themeClasses.button.primary} text-white`}
                      >
                        {loadingMore ? 'Cargando...' : 'Cargar más'}
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
      {showResults && (
        <div className={`relative z-30 flex space-x-1 p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm`}>
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

      {/* Contenido principal - Z-INDEX BAJO */}
      <div className={`relative z-0 flex-grow overflow-hidden`}>
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

      {/* Cerrar dropdown al hacer click fuera */}
      {isModelDropdownOpen && (
        <div 
          className="fixed inset-0 z-[90]" 
          onClick={() => setIsModelDropdownOpen(false)}
        />
      )}

      {/* Modal para selección de modelos */}
      {isModelModalOpen && (
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setIsModelModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-96 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Seleccionar modelos</h3>
              <button 
                onClick={() => setIsModelModalOpen(false)} 
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <input 
              type="text"
              placeholder="Buscar modelo..."
              value={modelModalSearch}
              onChange={(e) => setModelModalSearch(e.target.value)}
              className="w-full mb-3 p-2 border rounded-lg text-sm bg-gray-50 text-gray-900"
            />
            <div className="max-h-60 overflow-y-auto border-t border-b border-gray-200">
              {filteredModalModels.map(model => {
                const isSelected = filters.modelos.includes(model);
                return (
                  <label 
                    key={model} 
                    className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleModel(model)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-800">{model}</span>
                  </label>
                );
              })}
              {filteredModalModels.length === 0 && (
                <div className="p-3 text-center text-gray-500 text-sm">
                  No se encontraron modelos.
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsModelModalOpen(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DPHUDashboard;