import { useState, useEffect, useMemo } from 'react';
import { Plane, Home, Moon, Sun, Heart, X } from 'lucide-react';
import SearchBar from './components/SearchBar';
import FlightCard from './components/FlightCard';
import type { Flight } from './types/types';

// Modifica l'interfaccia per i preferiti per includere più informazioni
interface FavoriteFlight {
  iata: string;
  departure: string;
  arrival: string;
  departureTime: string;
}

// Aggiungi queste costanti all'inizio del file App.tsx
const CACHE_KEY = 'flightCache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti in millisecondi

// Aggiungi questa funzione di utilità all'inizio del componente App
const isValidFlight = (flight: Flight | null): flight is Flight => {
  return Boolean(
    flight &&
    flight.flight?.iata &&
    flight.departure?.scheduled &&
    flight.arrival?.scheduled
  );
};

// Modifica la funzione isValidFavorite all'inizio del file
const isValidFavorite = (favorite: FavoriteFlight | null | undefined): favorite is FavoriteFlight => {
  return Boolean(
    favorite &&
    typeof favorite.iata === 'string' &&
    typeof favorite.departure === 'string' &&
    typeof favorite.arrival === 'string' &&
    typeof favorite.departureTime === 'string'
  );
};

function App() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Modifica l'inizializzazione dello state dei preferiti
  const [favorites, setFavorites] = useState<FavoriteFlight[]>(() => {
    try {
      const saved = localStorage.getItem('favoriteFlights');
      const parsed = saved ? JSON.parse(saved) : [];
      // Filtra i preferiti non validi durante l'inizializzazione
      return Array.isArray(parsed) ? parsed.filter(isValidFavorite) : [];
    } catch (error) {
      console.error('Errore nel caricamento dei preferiti:', error);
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showFavorites, setShowFavorites] = useState(false);

  const API_KEY = 'bf8b143ef1afb98b4679201b017fc64a';
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

  // Modifica la funzione fetchFlights per gestire meglio i dati nulli
  const fetchFlights = async (query?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isValid = Date.now() - timestamp < CACHE_DURATION;
        
        if (isValid) {
          // Aggiungi controlli di validità prima del filtraggio
          const validFlights = data.filter((f: Flight | null) => 
            f && f.flight && f.flight.iata && 
            (!query || f.flight.iata.includes(query.toUpperCase()))
          );
          
          setFlights(validFlights);
          setLoading(false);
          return;
        }
      }
  
      const endpoint = query
        ? `/flights?access_key=${API_KEY}&flight_iata=${query}`
        : `/flights?access_key=${API_KEY}`;
      
      const response = await fetch(`${BASE_URL}${endpoint}`);
      
      if (response.status === 429) {
        throw new Error('Hai raggiunto il limite di richieste API. Riprova più tardi.');
      }
      
      if (!response.ok) {
        throw new Error('Errore nel caricamento dei voli.');
      }
      
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error.message || 'Errore nel recupero dei dati dei voli');
      }
  
      // Filtra i duplicati e i voli non validi
      const uniqueFlights = (result.data || [])
        .filter((flight: Flight | null) => isValidFlight(flight))
        .reduce((acc: Flight[], flight: Flight) => {
          const key = `${flight.flight.iata}-${flight.departure.scheduled}`;
          if (!acc.find(f => `${f.flight.iata}-${f.departure.scheduled}` === key)) {
            acc.push(flight);
          }
          return acc;
        }, []);
  
      // Salva in cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: uniqueFlights,
        timestamp: Date.now()
      }));
  
      setFlights(uniqueFlights);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento dei voli';
      setError(errorMessage);
      console.error('Error fetching flights:', err);
      
      // In caso di errore, prova a usare i dati in cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data } = JSON.parse(cached);
        // Filtra i voli non validi dalla cache
        const validFlights = data.filter((f: Flight | null) => isValidFlight(f));
        setFlights(validFlights);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchFlights(searchQuery.trim());
    }
  };

  // Modifica anche toggleFavorite
  const toggleFavorite = (flight: Flight | null) => {
    try {
      if (!isValidFlight(flight)) {
        console.warn('Dati volo non validi per i preferiti');
        return;
      }
  
      setFavorites(prev => {
        const flightKey: FavoriteFlight = {
          iata: flight.flight.iata,
          departure: flight.departure.iata,
          arrival: flight.arrival.iata,
          departureTime: flight.departure.scheduled
        };
  
        // Verifica se il volo è già nei preferiti usando isValidFavorite
        const existingIndex = prev
          .filter(isValidFavorite)
          .findIndex(f => 
            f.iata === flightKey.iata && 
            f.departureTime === flightKey.departureTime
          );
  
        if (existingIndex >= 0) {
          // Rimuovi dai preferiti
          return prev.filter((_, index) => index !== existingIndex);
        }
        
        // Aggiungi ai preferiti
        return [...prev, flightKey];
      });
    } catch (error) {
      console.error('Errore in toggleFavorite:', error);
    }
  };

  // Modifica la funzione isFlightFavorite
  const isFlightFavorite = (flight: Flight | null): boolean => {
    try {
      if (!isValidFlight(flight)) {
        return false;
      }
  
      return favorites.filter(isValidFavorite).some(favorite => 
        favorite.iata === flight.flight.iata && 
        favorite.departureTime === flight.departure.scheduled
      );
    } catch (error) {
      console.error('Errore in isFlightFavorite:', error);
      return false;
    }
  };

  // Modifica la funzione resetToHome
  const resetToHome = async () => {
    try {
      setLoading(true);
      setError(null);
      setSearchQuery('');
      setShowFavorites(false);
      
      // Rimuovi i dati dalla cache per forzare un nuovo caricamento
      localStorage.removeItem(CACHE_KEY);
      
      // Fetcha nuovi dati
      await fetchFlights();
    } catch (error) {
      console.error('Errore nel reset:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modifica la funzione displayedFlights
  const displayedFlights = useMemo(() => {
    const validFlights = flights.filter(isValidFlight);
    
    if (showFavorites) {
      return validFlights.filter((flight) => {
        if (!flight?.flight?.iata || !flight?.departure?.scheduled) {
          return false;
        }
  
        return favorites.some(favorite => 
          favorite?.iata === flight.flight.iata && 
          favorite?.departureTime === flight.departure.scheduled
        );
      });
    }
    
    return validFlights;
  }, [flights, favorites, showFavorites]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            {/* Logo e Home */}
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={resetToHome}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Home"
              >
                <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </button>
              <div className="flex items-center">
                <Plane className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h1 className="ml-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Flight Tracker
                </h1>
              </div>
            </div>

            {/* Pulsanti */}
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-center sm:justify-end">
              <button
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  setSearchQuery('');
                  if (!showFavorites) {
                    const cached = localStorage.getItem(CACHE_KEY);
                    if (cached) {
                      const { data } = JSON.parse(cached);
                      const validFlights = data.filter((f: Flight | null) => isValidFlight(f));
                      setFlights(validFlights);
                    }
                  }
                }}
                className={`flex items-center px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                  showFavorites
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Heart className={`h-5 w-5 ${showFavorites ? 'fill-current' : ''} sm:mr-2`} />
                <span className="hidden sm:inline">Preferiti</span>
                <span className="ml-1">({favorites.length})</span>
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={darkMode ? 'Modalità chiara' : 'Modalità scura'}
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
                {favorites.filter(isValidFavorite).map(favorite => (
                  <div
                    key={`${favorite.iata}-${favorite.departureTime}`}
                    className={`flex items-center px-3 py-2 rounded-full ${
                      darkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <Plane className="h-4 w-4 mr-2" />
                    <span>{favorite.iata}</span>
                    <span className="mx-2 text-xs">
                      ({favorite.departure} → {favorite.arrival})
                    </span>
                    <button
                      onClick={() => {
                        const correspondingFlight = flights.find(f => 
                          isValidFlight(f) && 
                          f.flight.iata === favorite.iata && 
                          f.departure.scheduled === favorite.departureTime
                        );
                        
                        if (correspondingFlight) {
                          toggleFavorite(correspondingFlight);
                        }
                      }}
                      className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Rimuovi dai preferiti"
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
            {displayedFlights.map((flight) => {
              if (!isValidFlight(flight)) return null;
              
              return (
                <FlightCard
                  key={`${flight.flight.iata}-${flight.departure.scheduled}`}
                  flight={flight}
                  isFavorite={isFlightFavorite(flight)}
                  onToggleFavorite={() => toggleFavorite(flight)}
                  darkMode={darkMode}
                />
              );
            })}
            
            {displayedFlights.length === 0 && showFavorites && (
              <div className={`col-span-full text-center py-12 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <p className="text-lg mb-2">Nessun volo preferito trovato</p>
                <p className="text-sm">I tuoi voli preferiti appariranno qui quando saranno attivi</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;