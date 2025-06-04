import React, { useState, useEffect } from 'react';
import DPHUDashboard from './components/dashboard/DPHUDashboard';
import { Sun, Moon } from 'lucide-react';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Cargar tema desde localStorage al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Guardar tema en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      {/* Header con toggle de tema */}
      <header className={`p-4 shadow-lg flex-shrink-0 border-b transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quality Control - DPHU</h1>
          
          <div className="flex items-center space-x-4">
            {/* <div className="text-sm bg-green-600 px-3 py-1 rounded font-semibold text-white">
              36.36% DPHU (Provisional)
            </div> */}
            
            {/* Toggle de tema */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow overflow-hidden">
        <DPHUDashboard isDarkMode={isDarkMode} />
      </main>
    </div>
  );
}

export default App;
