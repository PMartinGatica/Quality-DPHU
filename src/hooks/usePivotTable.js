import { useMemo } from 'react';

export const usePivotTable = (data) => {
  return useMemo(() => {
    if (!data || data.length === 0) return [];

    // Jerarquía de campos
    const hierarchy = [
      'MODELO',
      'FUNCION', 
      'CODIGO_DE_FALLA_REPARACION',
      'CAUSA_DE_REPARACION',
      'ACCION_CORRECTIVA',
      'ORIGEN',
      'POSICION',
      'COMENTARIO'
    ];

    // Función recursiva para construir el árbol
    const buildTree = (items, level = 0, path = []) => {
      if (level >= hierarchy.length) return [];

      const field = hierarchy[level];
      const groups = {};

      // Agrupar por el campo actual
      items.forEach(item => {
        const key = item[field] || `(Sin ${field})`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(item);
      });

      // Convertir grupos en nodos del árbol
      return Object.entries(groups).map(([key, groupItems]) => {
        const currentPath = [...path, key];
        const nsCount = groupItems.length;
        const uniqueNS = new Set(groupItems.map(item => item.NS)).size;

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
          rawData: groupItems
        };

        // Construir hijos si no es el último nivel
        if (level < hierarchy.length - 1) {
          node.children = buildTree(groupItems, level + 1, currentPath);
        }

        return node;
      }).sort((a, b) => b.count - a.count); // Ordenar por cantidad descendente
    };

    return buildTree(data);
  }, [data]);
};