import React from 'react';
import { useAppContext } from '../../context/AppContext';

const Footer = () => {
  const { filteredData } = useAppContext();

  return (
    <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>Total de registros (con NS válido) después de filtros: {filteredData?.length || 0}</p>
      <p>Para integrar con Google Sheets, reemplace los datos mock con una llamada fetch a su API de Apps Script y ajuste el cálculo de DPHU.</p>
    </footer>
  );
};

export default Footer;