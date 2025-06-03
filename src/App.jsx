import React from 'react';
import Layout from './components/layout/Layout';
import FilterSection from './components/filters/FilterSection';
import PivotTree from './components/pivot/PivotTree';
import DPHUChart from './components/charts/DPHUChart';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Layout>
        <FilterSection />
        <PivotTree />
        <DPHUChart 
          chartData={[]} // Los datos vendrán del contexto
          chartTitle="Análisis de Errores"
        />
      </Layout>
    </AppProvider>
  );
}

export default App;
