export interface Flight {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    scheduled: string;
  };
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    scheduled: string;
  };
  airline: {
    name: string;
  };
  flight: {
    number: string;
    iata: string;
  };
}

export interface ApiResponse {
  data: Flight[];
}