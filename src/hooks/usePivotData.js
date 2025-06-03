import { useState, useMemo } from 'react';

export const usePivotData = (data = []) => {
  const [expandedNodes, setExpandedNodes] = useState([]);

  // Transforma los datos en estructura de árbol
  const pivotTree = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Ejemplo de estructura: Modelo -> Línea -> Defecto
    const tree = [];
    const modelMap = new Map();

    try {
      data.forEach(item => {
        // Crea nodo del modelo si no existe
        if (!modelMap.has(item.model)) {
          const modelNode = {
            id: `model-${item.model}`,
            name: item.model,
            value: 0,
            children: []
          };
          modelMap.set(item.model, modelNode);
          tree.push(modelNode);
        }

        const modelNode = modelMap.get(item.model);
        if (modelNode) {
          modelNode.value = (modelNode.value || 0) + item.dphu;

          // Agrega los detalles como hijos
          if (item.details) {
            modelNode.children.push({
              id: `detail-${item.model}-${item.details}`,
              name: item.details,
              value: item.dphu
            });
          }
        }
      });

      // Calcula promedios para los nodos padre
      tree.forEach(modelNode => {
        if (modelNode.children && modelNode.children.length > 0) {
          modelNode.value = modelNode.children.reduce((sum, child) => sum + child.value, 0) 
            / modelNode.children.length;
        }
      });
    } catch (error) {
      console.error("Error al procesar los datos para el árbol pivot:", error);
      return [];
    }

    return tree;
  }, [data]);

  // Maneja la expansión/contracción de nodos
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  return {
    pivotTree,
    expandedNodes,
    toggleNode
  };
};