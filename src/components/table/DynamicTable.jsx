import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Search, RotateCcw } from 'lucide-react';

const DynamicTable = ({ data, loading, onLoadMore, hasMore }) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });

  const columns = useMemo(() => [
    {
      accessorKey: 'MODELO',
      header: 'Modelo',
      cell: ({ getValue }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'FUNCION',
      header: 'Función',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'CODIGO_DE_FALLA_REPARACION',
      header: 'Código Falla',
      cell: ({ getValue }) => (
        <div className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'CAUSA_DE_REPARACION',
      header: 'Causa',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'ACCION_CORRECTIVA',
      header: 'Acción Correctiva',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'ORIGEN',
      header: 'Origen',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'POSICION',
      header: 'Posición',
      cell: ({ getValue }) => (
        <div className="text-sm text-center font-medium">
          {getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'NS_COUNT',
      header: 'Total NS',
      cell: ({ getValue }) => (
        <div className="text-sm font-bold text-center text-blue-600 dark:text-blue-400">
          {getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'NS_UNIQUE_COUNT',
      header: 'NS Únicos',
      cell: ({ getValue }) => (
        <div className="text-sm font-bold text-center text-green-600 dark:text-green-400">
          {getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'COMENTARIO',
      header: 'Comentario',
      cell: ({ getValue }) => {
        const comment = getValue();
        return (
          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={comment}>
            {comment}
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden flex-1 flex flex-col">
      {/* Header con filtro */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tabla Dinámica DPHU ({data.length} registros)
          </h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar en la tabla..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(String(e.target.value))}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setGlobalFilter('')}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-1">
                      <span>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      {header.column.getIsSorted() && (
                        header.column.getIsSorted() === 'desc' ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronUp size={14} />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando datos...</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron datos
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Primera
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Última
          </button>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </div>
        
        {hasMore && (
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Cargar Más Datos
          </button>
        )}
      </div>
    </div>
  );
};

export default DynamicTable;