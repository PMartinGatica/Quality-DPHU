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
        <div className="flex flex-col gap-6 h-full">
          <FilterSection />
          <div className="flex-1 flex flex-col gap-6 min-h-0">
            <div className="flex-1 min-h-0">
              <PivotTree />
            </div>
            <div className="flex-1 min-h-0">
              <DPHUChart 
                chartData={[]} 
                chartTitle="Análisis de Errores"
              />
            </div>
          </div>
        </div>
      </Layout>
    </AppProvider>
  );
}

export default App;
