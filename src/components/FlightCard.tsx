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

  return (
    <div className={`${
      darkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white'
    } rounded-lg shadow-md p-6 relative hover:shadow-lg transition-shadow`}>
      <button
        onClick={onToggleFavorite}
        className={`absolute top-4 right-4 p-2 rounded-full ${
          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
        } transition-colors`}
      >
        <Heart
          className={`w-6 h-6 ${
            isFavorite ? 'fill-red-500 text-red-500' : darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        />
      </button>

      <div className="flex items-center mb-4">
        <Plane className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Flight {flight.flight.iata}
        </h3>
      </div>

      <span
        className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${getStatusColor(
          flight.flight_status
        )}`}
      >
        {flight.flight_status || 'Unknown'}
      </span>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Departure</p>
          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {flight.departure.airport}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {flight.departure.iata}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {new Date(flight.departure.scheduled).toLocaleString()}
          </p>
        </div>

        <div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Arrival</p>
          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {flight.arrival.airport}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {flight.arrival.iata}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {new Date(flight.arrival.scheduled).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Operated by {flight.airline.name}
        </p>
      </div>
    </div>
  );
};

export default FlightCard;