import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Hash } from 'lucide-react';

const PivotTreeView = ({ data, isDarkMode = true }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // Colores degradados por nivel (de más fuerte a más tenue)
  const getLevelColors = (level, count) => {
    const colorSchemes = {
      light: [
        // Nivel 0 - MODELO (más fuerte)
        {
          bg: 'bg-gradient-to-r from-blue-600 to-blue-700',
          text: 'text-white',
          label: 'text-blue-100',
          hover: 'hover:from-blue-700 hover:to-blue-800',
          count: 'bg-white/20 text-white'
        },
        // Nivel 1 - FUNCION
        {
          bg: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
          text: 'text-white',
          label: 'text-indigo-100',
          hover: 'hover:from-indigo-600 hover:to-indigo-700',
          count: 'bg-white/20 text-white'
        },
        // Nivel 2 - CODIGO DE FALLA
        {
          bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
          text: 'text-white',
          label: 'text-purple-100',
          hover: 'hover:from-purple-600 hover:to-purple-700',
          count: 'bg-white/20 text-white'
        },
        // Nivel 3 - CAUSA
        {
          bg: 'bg-gradient-to-r from-pink-400 to-pink-500',
          text: 'text-white',
          label: 'text-pink-100',
          hover: 'hover:from-pink-500 hover:to-pink-600',
          count: 'bg-white/20 text-white'
        },
        // Nivel 4 - ACCION CORRECTIVA
        {
          bg: 'bg-gradient-to-r from-red-400 to-red-500',
          text: 'text-white',
          label: 'text-red-100',
          hover: 'hover:from-red-500 hover:to-red-600',
          count: 'bg-white/20 text-white'
        },
        // Nivel 5 - ORIGEN
        {
          bg: 'bg-gradient-to-r from-orange-300 to-orange-400',
          text: 'text-gray-800',
          label: 'text-orange-700',
          hover: 'hover:from-orange-400 hover:to-orange-500',
          count: 'bg-gray-800/10 text-gray-800'
        },
        // Nivel 6 - POSICION
        {
          bg: 'bg-gradient-to-r from-yellow-200 to-yellow-300',
          text: 'text-gray-800',
          label: 'text-yellow-700',
          hover: 'hover:from-yellow-300 hover:to-yellow-400',
          count: 'bg-gray-800/10 text-gray-800'
        },
        // Nivel 7 - COMENTARIO
        {
          bg: 'bg-gradient-to-r from-green-200 to-green-300',
          text: 'text-gray-800',
          label: 'text-green-700',
          hover: 'hover:from-green-300 hover:to-green-400',
          count: 'bg-gray-800/10 text-gray-800'
        }
      ],
      dark: [
        // Nivel 0 - MODELO (más fuerte)
        {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          text: 'text-white',
          label: 'text-blue-200',
          hover: 'hover:from-blue-600 hover:to-blue-700',
          count: 'bg-white/20 text-white'
        },
        // Nivel 1 - FUNCION
        {
          bg: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
          text: 'text-white',
          label: 'text-indigo-200',
          hover: 'hover:from-indigo-600 hover:to-indigo-700',
          count: 'bg-white/20 text-white'
        },
        // Nivel 2 - CODIGO DE FALLA
        {
          bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
          text: 'text-white',
          label: 'text-purple-200',
          hover: 'hover:from-purple-600 hover:to-purple-700',
          count: 'bg-white/20 text-white'
        },
        // Nivel 3 - CAUSA
        {
          bg: 'bg-gradient-to-r from-pink-500 to-pink-600',
          text: 'text-white',
          label: 'text-pink-200',
          hover: 'hover:from-pink-600 hover:to-pink-700',
          count: 'bg-white/20 text-white'
        },
        // Nivel 4 - ACCION CORRECTIVA
        {
          bg: 'bg-gradient-to-r from-red-500 to-red-600',
          text: 'text-white',
          label: 'text-red-200',
          hover: 'hover:from-red-600 hover:to-red-700',
          count: 'bg-white/20 text-white'
        },
        // Nivel 5 - ORIGEN
        {
          bg: 'bg-gradient-to-r from-orange-600 to-orange-700',
          text: 'text-white',
          label: 'text-orange-200',
          hover: 'hover:from-orange-700 hover:to-orange-800',
          count: 'bg-white/20 text-white'
        },
        // Nivel 6 - POSICION
        {
          bg: 'bg-gradient-to-r from-yellow-600 to-yellow-700',
          text: 'text-white',
          label: 'text-yellow-200',
          hover: 'hover:from-yellow-700 hover:to-yellow-800',
          count: 'bg-white/20 text-white'
        },
        // Nivel 7 - COMENTARIO
        {
          bg: 'bg-gradient-to-r from-green-600 to-green-700',
          text: 'text-white',
          label: 'text-green-200',
          hover: 'hover:from-green-700 hover:to-green-800',
          count: 'bg-white/20 text-white'
        }
      ]
    };

    const scheme = isDarkMode ? colorSchemes.dark : colorSchemes.light;
    return scheme[level] || scheme[scheme.length - 1];
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
      'MODELO', 'FUNCIÓN', 'CÓDIGO DE FALLA', 
      'CAUSA DE REPARACIÓN', 'ACCIÓN CORRECTIVA', 'ORIGEN', 
      'POSICIÓN', 'COMENTARIO'
    ];

    const colors = getLevelColors(level, node.count);
    const padding = level * 16;

    return (
      <div key={nodeId} className="select-none">
        <div 
          className={`
            flex items-center py-3 px-4 cursor-pointer transition-all duration-200 
            ${colors.bg} ${colors.hover} 
            shadow-sm hover:shadow-md 
            ${level === 0 ? 'mb-1 rounded-lg' : level === 1 ? 'my-0.5 rounded-md' : 'rounded-sm'}
            transform hover:scale-[1.01]
          `}
          style={{ 
            marginLeft: `${padding}px`,
            borderLeft: level > 0 ? `3px solid rgba(255,255,255,0.2)` : 'none'
          }}
          onClick={() => hasChildren && toggleNode(nodeId)}
        >
          {/* Icono de expansión */}
          <div className="flex items-center mr-3">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className={`h-5 w-5 ${colors.text} transition-transform duration-200`} />
              ) : (
                <ChevronRight className={`h-5 w-5 ${colors.text} transition-transform duration-200`} />
              )
            ) : (
              <Hash className={`h-4 w-4 ${colors.text} opacity-50`} />
            )}
          </div>
          
          {/* Etiqueta del nivel */}
          <div className="flex flex-col sm:flex-row sm:items-center flex-1 gap-1 sm:gap-4">
            <span className={`
              text-xs font-bold uppercase tracking-wider min-w-[140px]
              ${colors.label}
              ${level === 0 ? 'text-sm' : level === 1 ? 'text-xs' : 'text-xs'}
            `}>
              {levelLabels[level] || 'DETALLE'}
            </span>
            
            {/* Contenido principal */}
            <span className={`
              flex-1 font-medium leading-tight
              ${colors.text}
              ${level === 0 ? 'text-lg font-bold' : level === 1 ? 'text-base font-semibold' : 'text-sm'}
            `}>
              {key}
            </span>
          </div>
          
          {/* Contador grande y visible */}
          <div className={`
            ml-4 px-4 py-2 rounded-full font-bold shadow-inner
            ${colors.count}
            ${level === 0 ? 'text-xl min-w-[60px]' : level === 1 ? 'text-lg min-w-[50px]' : 'text-base min-w-[40px]'}
            text-center border-2 border-white/10
          `}>
            {node.count.toLocaleString()}
          </div>
        </div>
        
        {/* Nodos hijos */}
        {hasChildren && isExpanded && (
          <div className={`
            ${level === 0 ? 'ml-2 border-l-2 border-white/10' : ''}
            transition-all duration-300 ease-in-out
          `}>
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
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex-grow overflow-auto p-4 space-y-2">
        {Object.entries(hierarchyData).length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Hash className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-medium">No hay datos para mostrar</p>
            <p className="text-sm mt-2">Ajusta los filtros para ver resultados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(hierarchyData)
              .sort(([,a], [,b]) => b.count - a.count)
              .map(([key, node]) => renderNode(key, node))
            }
          </div>
        )}
      </div>
      
      {/* Footer con estadísticas */}
      <div className={`
        border-t p-4 flex-shrink-0 
        ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}
      `}>
        <div className="flex items-center justify-between text-sm">
          <span>
            📊 {Object.entries(hierarchyData).length} modelos principales
          </span>
          <span>
            🔢 {data.length} registros totales
          </span>
        </div>
      </div>
    </div>
  );
};

export default PivotTreeView;