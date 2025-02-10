import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  darkMode: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  darkMode,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Cerca volo (es. AA123)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full px-4 py-3 pl-12 pr-24 rounded-lg border ${
            darkMode
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base`}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <Search
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          } w-5 h-5`}
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 sm:px-4 py-1.5 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          Cerca
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
        Inserisci il numero del volo per cercare
      </p>
    </div>
  );
};

export default SearchBar