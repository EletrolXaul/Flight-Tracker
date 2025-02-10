import React from 'react';
import { Heart, Plane } from 'lucide-react';
import { Flight } from '../types/types';

interface FlightCardProps {
  flight: Flight;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  darkMode: boolean;
}

const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  isFavorite,
  onToggleFavorite,
  darkMode,
}) => {
  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800';

    const baseColors = {
      active: darkMode
        ? 'bg-green-900 text-green-200'
        : 'bg-green-100 text-green-800',
      scheduled: darkMode
        ? 'bg-blue-900 text-blue-200'
        : 'bg-blue-100 text-blue-800',
      delayed: darkMode
        ? 'bg-yellow-900 text-yellow-200'
        : 'bg-yellow-100 text-yellow-800',
      cancelled: darkMode
        ? 'bg-red-900 text-red-200'
        : 'bg-red-100 text-red-800',
      default: darkMode
        ? 'bg-gray-800 text-gray-200'
        : 'bg-gray-100 text-gray-800',
    };

    return baseColors[status.toLowerCase() as keyof typeof baseColors] || baseColors.default;
  };

  // Aggiungi funzione per formattare l'orario
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Aggiungi funzione per calcolare la durata del volo
  const calculateFlightDuration = () => {
    const departure = new Date(flight.departure.scheduled);
    const arrival = new Date(flight.arrival.scheduled);
    const durationMs = arrival.getTime() - departure.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 relative`}>
      {/* Bottone preferiti migliorato */}
      <button
        onClick={onToggleFavorite}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 
          ${isFavorite ? 'bg-red-100 dark:bg-red-900' : ''} 
          hover:scale-110`}
        title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
      >
        <Heart
          className={`w-6 h-6 ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
          } transition-colors`}
        />
      </button>

      {/* Intestazione del volo */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Plane className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {flight.airline.name}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Flight {flight.flight.iata}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status del volo */}
      <div className="mb-6">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(flight.flight_status)}`}>
          {flight.flight_status?.toUpperCase() || 'UNKNOWN'}
        </span>
      </div>

      {/* Informazioni sul volo */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-1">
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Partenza
          </p>
          <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {flight.departure.iata}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {formatTime(flight.departure.scheduled)}
          </p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {flight.departure.airport}
          </p>
        </div>

        <div className="col-span-1 flex flex-col items-center justify-center">
          <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {calculateFlightDuration()}
          </div>
          <div className="w-full h-px bg-gray-300 dark:bg-gray-600 my-2 relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Plane className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </div>
        </div>

        <div className="col-span-1 text-right">
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Arrivo
          </p>
          <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {flight.arrival.iata}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {formatTime(flight.arrival.scheduled)}
          </p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {flight.arrival.airport}
          </p>
        </div>
      </div>

      {/* Time zone info */}
      <div className="text-xs text-center mb-4">
        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Time zones: {flight.departure.timezone} → {flight.arrival.timezone}
        </span>
      </div>
    </div>
  );
};

export default FlightCard;