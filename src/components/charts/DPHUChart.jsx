import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';

const DPHUChart = ({ chartData, chartTitle }) => {
  const { theme } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 sm:p-6 flex-1 flex flex-col overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex-shrink-0">
        {chartTitle}
      </h3>
      <div className="flex-1 min-h-0">
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                interval={0} 
                tick={{ fontSize: 12, fill: theme === 'light' ? '#374151' : '#d1d5db' }} 
                height={80}
              />
              <YAxis tick={{ fontSize: 12, fill: theme === 'light' ? '#374151' : '#d1d5db' }} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: theme === 'light' ? 'white' : '#1f2937', 
                  borderColor: theme === 'light' ? '#e5e7eb' : '#4b5563',
                  borderRadius: '0.375rem' 
                }}
                labelStyle={{ color: theme === 'light' ? '#111827' : '#f3f4f6', fontWeight: 'bold' }}
                itemStyle={{ color: theme === 'light' ? '#374151' : '#9ca3af' }}
              />
              <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
              <Bar dataKey="Cant" fill="#3b82f6" name="Cantidad" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-500 dark:text-gray-400">
              {chartTitle && chartTitle.startsWith("No hay datos") ? chartTitle : "No hay datos suficientes para mostrar el gráfico."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DPHUChart;