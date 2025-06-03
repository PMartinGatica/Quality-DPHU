import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, BarChart3, Users, Hash } from 'lucide-react';

const PivotTable = ({ data, loading }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const toggleExpand = useCallback((nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        // Contraer: también contraer todos los hijos
        const toRemove = Array.from(newSet).filter(id => id.startsWith(nodeId + '|'));
        toRemove.forEach(id => newSet.delete(id));
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const renderNode = useCallback((node, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    
    const paddingLeft = `${depth * 20 + 12}px`;
    
    // Íconos por nivel
    const getIcon = (field) => {
      switch (field) {
        case 'MODELO': return <BarChart3 size={16} className="text-blue-500" />;
        case 'FUNCION': return <Users size={16} className="text-green-500" />;
        default: return <Hash size={16} className="text-gray-500" />;
      }
    };

    const getBackgroundColor = (level) => {
      const colors = [
        'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500',
        'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500',
        'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500',
        'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500',
        'bg-pink-50 dark:bg-pink-900/20 border-l-4 border-pink-500',
        'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500',
        'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500',
        'bg-gray-50 dark:bg-gray-900/20 border-l-4 border-gray-500'
      ];
      return colors[level] || 'bg-gray-50 dark:bg-gray-900/20';
    };

    return (
      <div key={node.id}>
        {/* Nodo actual */}
        <div 
          className={`
            flex items-center justify-between py-2 px-3 mb-1 rounded-md transition-all duration-200 
            ${getBackgroundColor(node.level)}
            ${hasChildren ? 'cursor-pointer hover:shadow-md' : ''}
          `}
          style={{ paddingLeft }}
          onClick={hasChildren ? () => toggleExpand(node.id) : undefined}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Ícono de expansión/contracción */}
            <div className="flex-shrink-0">
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
                )
              ) : (
                <div className="w-4" />
              )}
            </div>

            {/* Ícono del campo */}
            <div className="flex-shrink-0">
              {getIcon(node.field)}
            </div>

            {/* Etiqueta del campo y valor */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {node.field.replace(/_/g, ' ')}:
                </span>
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {node.label}
                </span>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {node.count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total NS
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {node.uniqueCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                NS Únicos
              </div>
            </div>
          </div>
        </div>

        {/* Hijos (si están expandidos) */}
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedNodes, toggleExpand]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 flex-1">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600 dark:text-gray-400">Cargando datos...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 flex-1">
        <div className="text-center text-gray-500 dark:text-gray-400">
          No hay datos para mostrar
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tabla Dinámica DPHU
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Haz clic para expandir/contraer niveles</span>
          </div>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-auto p-4 space-y-1">
        {data.map(node => renderNode(node))}
      </div>

      {/* Footer con controles */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              onClick={() => setExpandedNodes(new Set())}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Contraer Todo
            </button>
            <button
              onClick={() => {
                const allIds = new Set();
                const collectIds = (nodes) => {
                  nodes.forEach(node => {
                    if (node.children && node.children.length > 0) {
                      allIds.add(node.id);
                      collectIds(node.children);
                    }
                  });
                };
                collectIds(data);
                setExpandedNodes(allIds);
              }}
              className="px-3 py-1 text-sm bg-blue-200 dark:bg-blue-600 rounded hover:bg-blue-300 dark:hover:bg-blue-500"
            >
              Expandir Todo
            </button>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {data.length} grupos principales
          </div>
        </div>
      </div>
    </div>
  );
};

export default PivotTable;