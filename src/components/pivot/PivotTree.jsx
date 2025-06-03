import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const PivotNode = ({ node, expandedNodes, toggleNode }) => {
  const isExpanded = expandedNodes[node.id] || false;
  
  return (
    <div className="text-sm">
      <div 
        className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
        onClick={() => toggleNode(node.id)}
        style={{ paddingLeft: `${node.level * 1.5 + 0.5}rem` }}
      >
        {node.children && node.children.length > 0 && (
          isExpanded ? 
          <ChevronDown size={18} className="mr-2 text-blue-500" /> : 
          <ChevronRight size={18} className="mr-2 text-blue-500" />
        )}
        <span className="font-medium text-gray-700 dark:text-gray-300">{node.field}: </span>
        <span className="mx-1 text-gray-900 dark:text-white">{node.name}</span>
        <span className="ml-auto px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 text-xs font-semibold rounded-full">
          Cant: {node.count}
        </span>
      </div>
      {isExpanded && node.children && node.children.length > 0 && (
        <div className="border-l border-gray-200 dark:border-gray-600">
          {node.children.map(childNode => (
            <PivotNode key={childNode.id} node={childNode} expandedNodes={expandedNodes} toggleNode={toggleNode} />
          ))}
        </div>
      )}
    </div>
  );
};

const PivotTree = () => {
  const { pivotTree = [], expandedNodes = {}, toggleNode = () => {} } = useAppContext() || {};

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-2 sm:p-4 mb-6">
      {pivotTree.length > 0 ? (
        pivotTree.map(node => (
          <PivotNode key={node.id} node={node} expandedNodes={expandedNodes} toggleNode={toggleNode} />
        ))
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-10">
          No hay datos para mostrar con los filtros actuales o no hay datos cargados.
        </p>
      )}
    </div>
  );
};

export default PivotTree;