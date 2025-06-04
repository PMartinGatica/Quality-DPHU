import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const PivotTreeView = ({ data, isDarkMode = true }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const themeClasses = {
    container: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: {
      primary: isDarkMode ? 'text-white' : 'text-gray-900',
      secondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-500'
    },
    hover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
  };

  const hierarchyData = useMemo(() => {
    const result = {};

    data.forEach(item => {
      const modelo = item.MODELO || '(Sin modelo)';
      const funcion = item.FUNCION || '(Sin función)';
      const codigo = item.CODIGO_DE_FALLA_REPARACION || '(Sin código)';
      const causa = item.CAUSA_DE_REPARACION || '(Sin causa)';
      const accion = item.ACCION_CORRECTIVA || '(Sin acción)';
      const origen = item.ORIGEN || '(Sin origen)';
      const posicion = item.POSICION || '(Sin posición)';
      const comentario = item.COMENTARIO || '';

      if (!result[modelo]) {
        result[modelo] = { count: 0, children: {} };
      }
      result[modelo].count++;

      if (!result[modelo].children[funcion]) {
        result[modelo].children[funcion] = { count: 0, children: {} };
      }
      result[modelo].children[funcion].count++;

      if (!result[modelo].children[funcion].children[codigo]) {
        result[modelo].children[funcion].children[codigo] = { count: 0, children: {} };
      }
      result[modelo].children[funcion].children[codigo].count++;

      if (!result[modelo].children[funcion].children[codigo].children[causa]) {
        result[modelo].children[funcion].children[codigo].children[causa] = { count: 0, children: {} };
      }
      result[modelo].children[funcion].children[codigo].children[causa].count++;

      if (!result[modelo].children[funcion].children[codigo].children[causa].children[accion]) {
        result[modelo].children[funcion].children[codigo].children[causa].children[accion] = { count: 0, children: {} };
      }
      result[modelo].children[funcion].children[codigo].children[causa].children[accion].count++;

      if (!result[modelo].children[funcion].children[codigo].children[causa].children[accion].children[origen]) {
        result[modelo].children[funcion].children[codigo].children[causa].children[accion].children[origen] = { count: 0, children: {} };
      }
      result[modelo].children[funcion].children[codigo].children[causa].children[accion].children[origen].count++;

      if (!result[modelo].children[funcion].children[codigo].children[causa].children[accion].children[origen].children[posicion]) {
        result[modelo].children[funcion].children[codigo].children[causa].children[accion].children[origen].children[posicion] = { count: 0, children: {} };
      }
      result[modelo].children[funcion].children[codigo].children[causa].children[accion].children[origen].children[posicion].count++;

      if (comentario) {
        if (!result[modelo].children[funcion].children[codigo].children[causa].children[accion].children[origen].children[posicion].children[comentario]) {
          result[modelo].children[funcion].children[codigo].children[causa].children[accion].children[origen].children[posicion].children[comentario] = { count: 0, children: {} };
        }
        result[modelo].children[funcion].children[codigo].children[causa].children[accion].children[origen].children[posicion].children[comentario].count++;
      }
    });

    return result;
  }, [data]);

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderNode = (key, node, level = 0, path = '') => {
    const nodeId = `${path}${key}`;
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = Object.keys(node.children || {}).length > 0;
    
    const levelLabels = [
      'MODELO', 'FUNCION', 'CODIGO DE FALLA REPARACION', 
      'CAUSA DE REPARACION', 'ACCION CORRECTIVA', 'ORIGEN', 
      'POSICION', 'COMENTARIO'
    ];

    return (
      <div key={nodeId} className="select-none">
        <div 
          className={`flex items-center py-1 px-2 cursor-pointer transition-colors ${
            level === 0 ? 'font-semibold' : ''
          } ${themeClasses.hover}`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => hasChildren && toggleNode(nodeId)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className={`h-4 w-4 mr-2 ${themeClasses.text.secondary}`} />
            ) : (
              <ChevronRight className={`h-4 w-4 mr-2 ${themeClasses.text.secondary}`} />
            )
          ) : (
            <span className="w-6" />
          )}
          
          <span className={`text-xs mr-2 min-w-[120px] ${themeClasses.text.muted}`}>
            {levelLabels[level] || 'DETALLE'}:
          </span>
          
          <span className={`flex-1 ${themeClasses.text.primary}`}>
            {key}
          </span>
          
          <span className="ml-auto px-2 py-1 bg-blue-600 text-white text-xs rounded">
            Cant: {node.count}
          </span>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {Object.entries(node.children)
              .sort(([,a], [,b]) => b.count - a.count)
              .map(([childKey, childNode]) => 
                renderNode(childKey, childNode, level + 1, `${nodeId}/`)
              )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col ${themeClasses.container}`}>
      <div className="flex-grow overflow-auto p-2">
        {Object.entries(hierarchyData)
          .sort(([,a], [,b]) => b.count - a.count)
          .map(([key, node]) => renderNode(key, node))
        }
      </div>
    </div>
  );
};

export default PivotTreeView;