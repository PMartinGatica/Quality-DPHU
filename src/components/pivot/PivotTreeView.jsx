import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Hash } from 'lucide-react';

const PivotTreeView = ({ data, isDarkMode = true }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // Colores pasteles con contornos llamativos
  const getLevelColors = (level, count) => {
    const colorSchemes = {
      light: [
        // Nivel 0 - MODELO (pastel azul con borde fuerte)
        {
          bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
          text: 'text-blue-900',
          label: 'text-blue-700',
          hover: 'hover:from-blue-100 hover:to-blue-150',
          count: 'bg-blue-600 text-white',
          border: 'border-l-4 border-blue-500'
        },
        // Nivel 1 - FUNCION
        {
          bg: 'bg-gradient-to-r from-indigo-50 to-indigo-100',
          text: 'text-indigo-900',
          label: 'text-indigo-700',
          hover: 'hover:from-indigo-100 hover:to-indigo-150',
          count: 'bg-indigo-600 text-white',
          border: 'border-l-4 border-indigo-500'
        },
        // Nivel 2 - CODIGO DE FALLA
        {
          bg: 'bg-gradient-to-r from-purple-50 to-purple-100',
          text: 'text-purple-900',
          label: 'text-purple-700',
          hover: 'hover:from-purple-100 hover:to-purple-150',
          count: 'bg-purple-600 text-white',
          border: 'border-l-4 border-purple-500'
        },
        // Nivel 3 - CAUSA
        {
          bg: 'bg-gradient-to-r from-pink-50 to-pink-100',
          text: 'text-pink-900',
          label: 'text-pink-700',
          hover: 'hover:from-pink-100 hover:to-pink-150',
          count: 'bg-pink-600 text-white',
          border: 'border-l-4 border-pink-500'
        },
        // Nivel 4 - ACCION CORRECTIVA
        {
          bg: 'bg-gradient-to-r from-red-50 to-red-100',
          text: 'text-red-900',
          label: 'text-red-700',
          hover: 'hover:from-red-100 hover:to-red-150',
          count: 'bg-red-600 text-white',
          border: 'border-l-4 border-red-500'
        },
        // Nivel 5 - ORIGEN
        {
          bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
          text: 'text-orange-900',
          label: 'text-orange-700',
          hover: 'hover:from-orange-100 hover:to-orange-150',
          count: 'bg-orange-600 text-white',
          border: 'border-l-4 border-orange-500'
        },
        // Nivel 6 - POSICION
        {
          bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
          text: 'text-yellow-900',
          label: 'text-yellow-700',
          hover: 'hover:from-yellow-100 hover:to-yellow-150',
          count: 'bg-yellow-600 text-white',
          border: 'border-l-4 border-yellow-500'
        },
        // Nivel 7 - COMENTARIO
        {
          bg: 'bg-gradient-to-r from-green-50 to-green-100',
          text: 'text-green-900',
          label: 'text-green-700',
          hover: 'hover:from-green-100 hover:to-green-150',
          count: 'bg-green-600 text-white',
          border: 'border-l-4 border-green-500'
        }
      ],
      dark: [
        // Nivel 0 - MODELO (fondo oscuro suave con borde llamativo)
        {
          bg: 'bg-gradient-to-r from-blue-900/30 to-blue-800/30',
          text: 'text-blue-100',
          label: 'text-blue-300',
          hover: 'hover:from-blue-800/40 hover:to-blue-700/40',
          count: 'bg-blue-500 text-white',
          border: 'border-l-4 border-blue-400'
        },
        // Nivel 1 - FUNCION
        {
          bg: 'bg-gradient-to-r from-indigo-900/30 to-indigo-800/30',
          text: 'text-indigo-100',
          label: 'text-indigo-300',
          hover: 'hover:from-indigo-800/40 hover:to-indigo-700/40',
          count: 'bg-indigo-500 text-white',
          border: 'border-l-4 border-indigo-400'
        },
        // Nivel 2 - CODIGO DE FALLA
        {
          bg: 'bg-gradient-to-r from-purple-900/30 to-purple-800/30',
          text: 'text-purple-100',
          label: 'text-purple-300',
          hover: 'hover:from-purple-800/40 hover:to-purple-700/40',
          count: 'bg-purple-500 text-white',
          border: 'border-l-4 border-purple-400'
        },
        // Nivel 3 - CAUSA
        {
          bg: 'bg-gradient-to-r from-pink-900/30 to-pink-800/30',
          text: 'text-pink-100',
          label: 'text-pink-300',
          hover: 'hover:from-pink-800/40 hover:to-pink-700/40',
          count: 'bg-pink-500 text-white',
          border: 'border-l-4 border-pink-400'
        },
        // Nivel 4 - ACCION CORRECTIVA
        {
          bg: 'bg-gradient-to-r from-red-900/30 to-red-800/30',
          text: 'text-red-100',
          label: 'text-red-300',
          hover: 'hover:from-red-800/40 hover:to-red-700/40',
          count: 'bg-red-500 text-white',
          border: 'border-l-4 border-red-400'
        },
        // Nivel 5 - ORIGEN
        {
          bg: 'bg-gradient-to-r from-orange-900/30 to-orange-800/30',
          text: 'text-orange-100',
          label: 'text-orange-300',
          hover: 'hover:from-orange-800/40 hover:to-orange-700/40',
          count: 'bg-orange-500 text-white',
          border: 'border-l-4 border-orange-400'
        },
        // Nivel 6 - POSICION
        {
          bg: 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/30',
          text: 'text-yellow-100',
          label: 'text-yellow-300',
          hover: 'hover:from-yellow-800/40 hover:to-yellow-700/40',
          count: 'bg-yellow-500 text-white',
          border: 'border-l-4 border-yellow-400'
        },
        // Nivel 7 - COMENTARIO
        {
          bg: 'bg-gradient-to-r from-green-900/30 to-green-800/30',
          text: 'text-green-100',
          label: 'text-green-300',
          hover: 'hover:from-green-800/40 hover:to-green-700/40',
          count: 'bg-green-500 text-white',
          border: 'border-l-4 border-green-400'
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
            ${colors.bg} ${colors.hover} ${colors.border}
            shadow-sm hover:shadow-md 
            ${level === 0 ? 'mb-2 rounded-lg border' : level === 1 ? 'my-1 rounded-md border' : 'my-0.5 rounded border'}
            transform hover:scale-[1.01]
            backdrop-blur-sm
          `}
          style={{ 
            marginLeft: `${padding}px`
          }}
          onClick={() => hasChildren && toggleNode(nodeId)}
        >
          {/* Icono de expansión */}
          <div className="flex items-center mr-4">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className={`h-5 w-5 ${colors.text} transition-transform duration-200`} />
              ) : (
                <ChevronRight className={`h-5 w-5 ${colors.text} transition-transform duration-200`} />
              )
            ) : (
              <Hash className={`h-4 w-4 ${colors.text} opacity-60`} />
            )}
          </div>
          
          {/* Etiqueta del nivel */}
          <div className="flex flex-col sm:flex-row sm:items-center flex-1 gap-2 sm:gap-4">
            <span className={`
              text-xs font-bold uppercase tracking-wide min-w-[140px]
              ${colors.label}
              ${level === 0 ? 'text-sm' : level === 1 ? 'text-xs' : 'text-xs'}
              px-2 py-1 rounded-md bg-white/50 dark:bg-black/20
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
          
          {/* Contador grande y visible con sombra fuerte */}
          <div className={`
            ml-4 px-4 py-2 rounded-full font-bold 
            ${colors.count}
            ${level === 0 ? 'text-xl min-w-[70px]' : level === 1 ? 'text-lg min-w-[60px]' : 'text-base min-w-[50px]'}
            text-center shadow-lg border-2 border-white/20
            transform transition-transform hover:scale-110
          `}>
            {node.count.toLocaleString()}
          </div>
        </div>
        
        {/* Nodos hijos */}
        {hasChildren && isExpanded && (
          <div className={`
            ${level === 0 ? 'ml-4 pl-2 border-l-2 border-gray-200 dark:border-gray-600' : ''}
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
      <div className="flex-grow overflow-auto p-4 space-y-1">
        {Object.entries(hierarchyData).length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Hash className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-medium">No hay datos para mostrar</p>
            <p className="text-sm mt-2">Ajusta los filtros para ver resultados</p>
          </div>
        ) : (
          <div className="space-y-1">
            {Object.entries(hierarchyData)
              .sort(([,a], [,b]) => b.count - a.count)
              .map(([key, node]) => renderNode(key, node))
            }
          </div>
        )}
      </div>
      
      {/* Footer con estadísticas mejorado */}
      <div className={`
        border-t p-4 flex-shrink-0 backdrop-blur-sm
        ${isDarkMode ? 'bg-gray-800/80 border-gray-700 text-gray-300' : 'bg-white/80 border-gray-200 text-gray-600'}
      `}>
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="flex items-center gap-2">
            📊 <strong>{Object.entries(hierarchyData).length}</strong> modelos principales
          </span>
          <span className="flex items-center gap-2">
            🔢 <strong>{data.length.toLocaleString()}</strong> registros totales
          </span>
        </div>
      </div>
    </div>
  );
};

export default PivotTreeView;