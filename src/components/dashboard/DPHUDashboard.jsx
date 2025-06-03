import React, { useEffect, useState } from 'react';
import { useGoogleSheetsAPI } from '../../hooks/useGoogleSheetsAPI';
import LoadingSpinner from '../common/LoadingSpinner';
import ModelSearch from '../common/ModelSearch';
import PivotTreeView from '../pivot/PivotTreeView';
import { Download, RefreshCw, Filter as FilterIcon, X } from 'lucide-react';

const DPHUDashboard = () => {
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

  // Mostrar loading hasta que termine de cargar
  if (loading) {
    return (
      <LoadingSpinner 
        progress={loadingProgress}
        message={`Cargando datos desde Google Sheets...`}
      />
    );
  }

  // Mostrar error con opción de reintentar
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-2xl mb-4">❌ Error de conexión</div>
          <div className="text-gray-300 mb-6">{error}</div>
          <button 
            onClick={fetchAllData}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center mx-auto"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Reintentar carga
          </button>
        </div>
      </div>
    );
  }

  // Dashboard principal (solo se muestra cuando los datos están listos)
  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="bg-gray-800 p-4 shadow-lg flex-shrink-0 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">DPHU</h1>
          <div className="text-sm bg-green-600 px-3 py-1 rounded font-semibold">
            36.36% DPHU (Provisional)
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <FilterIcon className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Filtros</h2>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {allData.length.toLocaleString()}
              </div>
              <div className="text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {filteredData.length.toLocaleString()}
              </div>
              <div className="text-gray-400">Filtrados</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Desde:
            </label>
            <input 
              type="date" 
              value={filters.fecha_desde}
              onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Hasta:
            </label>
            <input 
              type="date" 
              value={filters.fecha_hasta}
              onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Modelo:
            </label>
            <ModelSearch 
              value={filters.modelo}
              onChange={(value) => handleFilterChange('modelo', value)}
              data={allData}
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={() => applyFilters(filters)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              Aplicar
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-grow overflow-hidden">
        <PivotTreeView data={filteredData} />
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 p-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Total de registros con NS válido después de filtros: {filteredData.length}
          </div>
          
          <button 
            onClick={exportToCSV}
            disabled={filteredData.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
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