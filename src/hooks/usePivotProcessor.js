import { useMemo } from 'react';

export const usePivotProcessor = (rawData) => {
  const pivotData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    // Agrupar datos y contar NS
    const grouped = rawData.reduce((acc, row) => {
      const key = [
        row.MODELO || '(Sin Modelo)',
        row.FUNCION || '(Sin Función)',
        row.CODIGO_DE_FALLA_REPARACION || '(Sin Código)',
        row.CAUSA_DE_REPARACION || '(Sin Causa)',
        row.ACCION_CORRECTIVA || '(Sin Acción)',
        row.ORIGEN || '(Sin Origen)',
        row.POSICION || '(Sin Posición)',
        row.COMENTARIO || '(Sin Comentario)'
      ].join('|||');

      if (!acc[key]) {
        acc[key] = {
          MODELO: row.MODELO || '(Sin Modelo)',
          FUNCION: row.FUNCION || '(Sin Función)',
          CODIGO_DE_FALLA_REPARACION: row.CODIGO_DE_FALLA_REPARACION || '(Sin Código)',
          CAUSA_DE_REPARACION: row.CAUSA_DE_REPARACION || '(Sin Causa)',
          ACCION_CORRECTIVA: row.ACCION_CORRECTIVA || '(Sin Acción)',
          ORIGEN: row.ORIGEN || '(Sin Origen)',
          POSICION: row.POSICION || '(Sin Posición)',
          COMENTARIO: row.COMENTARIO || '(Sin Comentario)',
          NS_COUNT: 0,
          NS_LIST: new Set()
        };
      }

      acc[key].NS_COUNT++;
      acc[key].NS_LIST.add(row.NS);

      return acc;
    }, {});

    // Convertir a array y agregar información adicional
    return Object.values(grouped).map(item => ({
      ...item,
      NS_UNIQUE_COUNT: item.NS_LIST.size,
      NS_LIST: Array.from(item.NS_LIST)
    }));
  }, [rawData]);

  return pivotData;
};