import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

const ModelSearch = ({ value, onChange, data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  const allModels = React.useMemo(() => {
    const models = [...new Set(data.map(item => item.MODELO))].filter(Boolean);
    return models.sort();
  }, [data]);

  useEffect(() => {
    if (value && value !== 'Todos los Modelos') {
      setSearchTerm(value);
    } else {
      setSearchTerm('');
    }
  }, [value]);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      const filtered = allModels.filter(model => 
        model.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10);

      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [searchTerm, allModels]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (model) => {
    onChange(model);
    setSearchTerm(model);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('Todos los Modelos');
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={inputRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar modelo (3+ caracteres)"
          className="w-full p-2 pl-10 pr-10 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        {searchTerm && (
          <button 
            onClick={handleClear}
            className="absolute right-3 top-2.5"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-gray-700 border border-gray-600 rounded shadow-lg">
          {suggestions.map((model, index) => (
            <li
              key={index}
              onClick={() => handleSelect(model)}
              className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-white border-b border-gray-600 last:border-b-0"
            >
              {model}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ModelSearch;