import { useMemo } from 'react';

export const useOptimizedPivotTable = (data, maxDepth = 3) => {
  return useMemo(() => {
    if (!data || data.length === 0) return [];

    const startTime = performance.now();
    
    // Jerarquía limitada para performance
    const hierarchy = [
      'MODELO',
      'FUNCION', 
      'CODIGO_DE_FALLA_REPARACION'
    ].slice(0, maxDepth);

    // Función optimizada para construir el árbol
    const buildTreeOptimized = (items, level = 0, path = []) => {
      if (level >= hierarchy.length) return [];

      const field = hierarchy[level];
      const groups = new Map(); // Usar Map para mejor performance

      // Agrupar de forma más eficiente
      for (const item of items) {
        const key = item[field] || `(Sin ${field})`;
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key).push(item);
      }

      // Convertir a array y procesar
      const result = Array.from(groups.entries()).map(([key, groupItems]) => {
        const currentPath = [...path, key];
        const nsCount = groupItems.length;
        
        // Optimizar cálculo de NS únicos solo cuando sea necesario
        const uniqueNS = level < 2 ? new Set(groupItems.map(item => item.NS)).size : nsCount;

        const node = {
          id: currentPath.join('|'),
          level,
          field,
          label: key,
          path: currentPath,
          count: nsCount,
          uniqueCount: uniqueNS,
          isExpandable: level < hierarchy.length - 1,
          isExpanded: false,
          children: null,
          rawData: level === hierarchy.length - 1 ? groupItems : null // Solo guardar datos en el último nivel
        };

        // Construir hijos solo si no es el último nivel
        if (level < hierarchy.length - 1 && groupItems.length > 0) {
          node.children = buildTreeOptimized(groupItems, level + 1, currentPath);
        }

        return node;
      });

      // Ordenar solo los primeros niveles para performance
      if (level < 2) {
        result.sort((a, b) => b.count - a.count);
      }

      return result;
    };

    const result = buildTreeOptimized(data);
    
    const endTime = performance.now();
    console.log(`Pivot table construida en ${Math.round(endTime - startTime)}ms`);
    
    return result;
  }, [data, maxDepth]);
};