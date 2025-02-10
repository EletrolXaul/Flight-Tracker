import { useState, useEffect } from 'react';
import { Plane, Home, Moon, Sun, Heart, X } from 'lucide-react';
import SearchBar from './components/SearchBar';
import FlightCard from './components/FlightCard';
import type { Flight } from './types/types';

function App() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteFlights');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showFavorites, setShowFavorites] = useState(false);

  const API_KEY = '13a3c773c434fc11884eaac2ebc5fb6d';
  const BASE_URL = 'https://api.aviationstack.com/v1';

  useEffect(() => {
    fetchFlights();
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteFlights', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchFlights = async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = query
        ? `/flights?access_key=${API_KEY}&flight_iata=${query}`
        : `/flights?access_key=${API_KEY}`;
      
      const response = await fetch(`${BASE_URL}${endpoint}`);
      if (!response.ok) throw new Error('Failed to fetch flights');
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch flight data');
      }
      setFlights(data.data || []);
    } catch (err) {
      setError('Failed to fetch flight data. Please try again later.');
      console.error('Error fetching flights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchFlights(searchQuery.trim());
    }
  };

  const toggleFavorite = (flightNumber: string) => {
    setFavorites(prev =>
      prev.includes(flightNumber)
        ? prev.filter(f => f !== flightNumber)
        : [...prev, flightNumber]
    );
  };

  const resetToHome = () => {
    setSearchQuery('');
    setShowFavorites(false);
    fetchFlights();
  };

  const displayedFlights = showFavorites
    ? flights.filter(flight => favorites.includes(flight.flight.iata))
    : flights;

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={resetToHome}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Home"
              >
                <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </button>
              <div className="flex items-center">
                <Plane className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h1 className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
                  Flight Tracker
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showFavorites
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Heart className={`h-5 w-5 mr-2 ${showFavorites ? 'fill-current' : ''}`} />
                Favorites ({favorites.length})
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? (
                  <Sun className="h-6 w-6 text-yellow-500" />
                ) : (
                  <Moon className="h-6 w-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {showFavorites && (
          <div className={`mb-8 p-4 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-md`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Your Favorite Flights
              </h2>
              <button
                onClick={() => setShowFavorites(false)}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                title="Close favorites"
              >
                <X className={`h-5 w-5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </button>
            </div>
            {favorites.length === 0 ? (
              <p className={`text-center py-8 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No favorite flights yet. Click the heart icon on any flight card to add it to your favorites.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {favorites.map(flightNumber => (
                  <div
                    key={flightNumber}
                    className={`flex items-center px-3 py-2 rounded-full ${
                      darkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <Plane className="h-4 w-4 mr-2" />
                    <span>{flightNumber}</span>
                    <button
                      onClick={() => toggleFavorite(flightNumber)}
                      className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          darkMode={darkMode}
        />

        {error && (
          <div className="bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFlights.map((flight) => (
              <FlightCard
                key={`${flight.flight.iata}-${flight.departure.scheduled}`}
                flight={flight}
                isFavorite={favorites.includes(flight.flight.iata)}
                onToggleFavorite={() => toggleFavorite(flight.flight.iata)}
                darkMode={darkMode}
              />
            ))}
            {displayedFlights.length === 0 && showFavorites && (
              <div className={`col-span-full text-center py-12 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <p className="text-lg mb-2">No favorite flights found</p>
                <p className="text-sm">Your favorite flights will appear here when they are active</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;