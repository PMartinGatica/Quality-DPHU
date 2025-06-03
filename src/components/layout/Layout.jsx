import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useTheme } from '../../hooks/useTheme';

const Layout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-auto">
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-1 flex flex-col overflow-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;