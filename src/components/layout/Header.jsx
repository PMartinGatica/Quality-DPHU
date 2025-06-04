import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Header = ({ theme, toggleTheme }) => {
  const { filteredData } = useAppContext();
  
  // Calcular DPHU (ejemplo de cálculo)
  const totalInitialValidNSItems = 100; // Esto vendría de tus datos iniciales
  const dphuPercentage = filteredData ? (filteredData.length / totalInitialValidNSItems) * 100 : 0;
  const dphuThreshold = 7;

  return (
    <header className="mb-6 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Quality Control - DPHU</h1>
        <div className={`p-2 rounded-lg shadow text-xl font-semibold ${
          dphuPercentage < dphuThreshold 
            ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200' 
            : 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200'
        }`}>
          {dphuPercentage.toFixed(2)}%
          <p className="text-xs font-normal">DPHU (Provisional)</p>
        </div>
      </div>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors duration-300"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
      </button>
    </header>
  );
};

export default Header;