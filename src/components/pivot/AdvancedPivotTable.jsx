import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, Filter } from 'lucide-react';

const AdvancedPivotTable = ({ data }) => {
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'count', direction: 'desc' });
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState({});

  // Procesar datos para la tabla dinámica
  const pivotData = useMemo(() => {
    // Estructura de los campos en el orden deseado
    const fields = [
      'MODELO',
      'FUNCION',
      'CODIGO_DE_FALLA_REPARACION',
      'CAUSA_DE_REPARACION',
      'ACCION_CORRECTIVA',
      'ORIGEN',
      'POSICION',
      'COMENTARIO'
    ];

    // Crear diccionario para agrupar
    const result = {};

    // Función para obtener valor seguro (manejar nulos)
    const safeValue = (item, field) => {
      const value = item[field];
      return value !== undefined && value !== null ? String(value).trim() : '(Sin valor)';
    };

    // Procesar cada fila
    data.forEach(item => {
      // Generar clave compuesta para este grupo
      const key = fields.map(field => safeValue(item, field)).join('|');
      
      // Inicializar grupo si no existe
      if (!result[key]) {
        const group = {};
        fields.forEach(field => {
          group[field] = safeValue(item, field);
        });
        
        group.count = 0;
        group.items = [];
        result[key] = group;
      }
      
      // Contar y acumular ítems
      result[key].count++;
      result[key].items.push(item);
    });

    return Object.values(result);
  }, [data]);
  
  // Aplicar filtros
  const filteredData = useMemo(() => {
    return pivotData.filter(row => {
      for (const [field, value] of Object.entries(filters)) {
        if (value && !row[field].toLowerCase().includes(value.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [pivotData, filters]);
  
  // Ordenar datos
  const sortedData = useMemo(() => {
    const { key, direction } = sortConfig;
    return [...filteredData].sort((a, b) => {
      if (key === 'count') {
        return direction === 'asc' ? a.count - b.count : b.count - a.count;
      }
      
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);
  
  // Toggle ordenamiento
  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  // Toggle expandir/contraer grupo
  const toggleGroup = (key) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };
  
  // Toggle filtro
  const toggleFilter = (field) => {
    setShowFilters(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Manejar cambio de filtro
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generar cabeceras
  const headers = [
    { field: 'MODELO', label: 'Modelo' },
    { field: 'FUNCION', label: 'Función' },
    { field: 'CODIGO_DE_FALLA_REPARACION', label: 'Código Falla' },
    { field: 'CAUSA_DE_REPARACION', label: 'Causa' },
    { field: 'ACCION_CORRECTIVA', label: 'Acción' },
    { field: 'ORIGEN', label: 'Origen' },
    { field: 'POSICION', label: 'Posición' },
    { field: 'COMENTARIO', label: 'Comentario' },
    { field: 'count', label: 'NS Count', numeric: true }
  ];

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold">Tabla Dinámica DPHU</h2>
        <div className="text-sm text-gray-400">
          {sortedData.length} grupos encontrados
        </div>
      </div>

      <div className="overflow-x-auto flex-grow">
        <table className="min-w-full divide-y divide-gray-700 table-fixed">
          <thead className="bg-gray-700">
            <tr>
              <th className="w-10"></th>
              {headers.map(header => (
                <th 
                  key={header.field}
                  className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => requestSort(header.field)}
                      className="flex items-center hover:text-blue-400"
                    >
                      {header.label}
                      {sortConfig.key === header.field && (
                        sortConfig.direction === 'asc' ? 
                          <ArrowUp className="h-4 w-4 ml-1" /> : 
                          <ArrowDown className="h-4 w-4 ml-1" />
                      )}
                    </button>
                    
                    {header.field !== 'count' && (
                      <button 
                        onClick={() => toggleFilter(header.field)}
                        className="ml-1 hover:text-blue-400"
                      >
                        <Filter className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {showFilters[header.field] && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={filters[header.field] || ''}
                        onChange={(e) => handleFilterChange(header.field, e.target.value)}
                        placeholder={`Filtrar ${header.label}`}
                        className="w-full p-1 text-sm bg-gray-600 border border-gray-500 rounded"
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-700 bg-gray-800">
            {sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => {
                const rowKey = `row-${rowIndex}`;
                const isExpanded = expandedGroups.has(rowKey);
                
                return (
                  <React.Fragment key={rowKey}>
                    <tr 
                      className={`${rowIndex % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'} hover:bg-gray-700 cursor-pointer`}
                      onClick={() => toggleGroup(rowKey)}
                    >
                      <td className="pl-3 py-2">
                        {row.items.length > 1 ? (
                          isExpanded ? 
                            <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        ) : (
                          <span className="h-5 w-5" />
                        )}
                      </td>
                      
                      {headers.map(header => (
                        <td 
                          key={`${rowKey}-${header.field}`}
                          className="px-3 py-2 text-sm whitespace-normal"
                        >
                          {header.field === 'count' ? 
                            <span className="font-semibold text-blue-400">{row[header.field]}</span> : 
                            row[header.field]}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Detalles expandidos */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={headers.length + 1} className="p-0">
                          <div className="bg-gray-900 p-4 border-t border-b border-gray-700">
                            <h4 className="text-sm font-semibold mb-2">
                              Detalles - {row.count} NS {row.count > 1 ? 'encontrados' : 'encontrado'}
                            </h4>
                            
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-800">
                                <thead className="bg-gray-800">
                                  <tr>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-400">NS</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-400">Fecha</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-400">Modelo</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-400">Función</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {row.items.map((item, i) => (
                                    <tr key={`detail-${rowKey}-${i}`} className="hover:bg-gray-800">
                                      <td className="px-2 py-1 text-xs">{item.NS}</td>
                                      <td className="px-2 py-1 text-xs">{item.FECHA_REPARACION}</td>
                                      <td className="px-2 py-1 text-xs">{item.MODELO}</td>
                                      <td className="px-2 py-1 text-xs">{item.FUNCION}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={headers.length + 1} className="px-3 py-4 text-center text-gray-400">
                  No se encontraron datos para esta combinación de filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdvancedPivotTable;