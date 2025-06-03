self.onmessage = function(e) {
  const { type, data, chunk, totalChunks } = e.data;
  
  if (type === 'PROCESS_CHUNK') {
    try {
      // Procesar chunk de datos
      const processedChunk = data.map(row => ({
        ...row,
        MODELO: row.MODELO?.trim() || '',
        NS: row.NS?.trim() || '',
        POSICION: row.POSICION?.trim() || '',
        FUNCION: row.FUNCION?.trim() || '',
        CODIGO_DE_FALLA_REPARACION: row.CODIGO_DE_FALLA_REPARACION?.trim() || '',
        CAUSA_DE_REPARACION: row.CAUSA_DE_REPARACION?.trim() || '',
        ACCION_CORRECTIVA: row.ACCION_CORRECTIVA?.trim() || '',
        ORIGEN: row.ORIGEN?.trim() || '',
        REPARADOR: row.REPARADOR?.trim() || '',
        COMENTARIO: row.COMENTARIO?.trim() || ''
      }));

      self.postMessage({
        type: 'CHUNK_PROCESSED',
        data: processedChunk,
        chunk,
        totalChunks,
        progress: Math.round((chunk / totalChunks) * 100)
      });
    } catch (error) {
      self.postMessage({
        type: 'ERROR',
        error: error.message
      });
    }
  }
};