export interface CityLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const POPULAR_CITIES: CityLocation[] = [
  {
    name: 'Buenos Aires',
    country: 'Argentina',
    latitude: -34.6037,
    longitude: -58.3816,
    timezone: 'America/Argentina/Buenos_Aires',
  },
  {
    name: 'Córdoba',
    country: 'Argentina',
    latitude: -31.4201,
    longitude: -64.1888,
    timezone: 'America/Argentina/Cordoba',
  },
  {
    name: 'Rosario',
    country: 'Argentina',
    latitude: -32.9468,
    longitude: -60.6393,
    timezone: 'America/Argentina/Cordoba',
  },
  {
    name: 'Madrid',
    country: 'España',
    latitude: 40.4168,
    longitude: -3.7038,
    timezone: 'Europe/Madrid',
  },
  {
    name: 'Barcelona',
    country: 'España',
    latitude: 41.3879,
    longitude: 2.1699,
    timezone: 'Europe/Madrid',
  },
  {
    name: 'Ciudad de México',
    country: 'México',
    latitude: 19.4326,
    longitude: -99.1332,
    timezone: 'America/Mexico_City',
  },
  {
    name: 'Bogotá',
    country: 'Colombia',
    latitude: 4.711,
    longitude: -74.0721,
    timezone: 'America/Bogota',
  },
  {
    name: 'Santiago',
    country: 'Chile',
    latitude: -33.4489,
    longitude: -70.6693,
    timezone: 'America/Santiago',
  },
  {
    name: 'Lima',
    country: 'Perú',
    latitude: -12.0464,
    longitude: -77.0428,
    timezone: 'America/Lima',
  },
  {
    name: 'Montevideo',
    country: 'Uruguay',
    latitude: -34.9011,
    longitude: -56.1645,
    timezone: 'America/Montevideo',
  },
  {
    name: 'Miami',
    country: 'Estados Unidos',
    latitude: 25.7617,
    longitude: -80.1918,
    timezone: 'America/New_York',
  },
  {
    name: 'New York',
    country: 'Estados Unidos',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
  },
  {
    name: 'Londres',
    country: 'Reino Unido',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
  },
  {
    name: 'París',
    country: 'Francia',
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 'Europe/Paris',
  },
  {
    name: 'São Paulo',
    country: 'Brasil',
    latitude: -23.5505,
    longitude: -46.6333,
    timezone: 'America/Sao_Paulo',
  },
];

export function searchCities(query: string): CityLocation[] {
  if (!query || query.trim().length === 0) return POPULAR_CITIES.slice(0, 6);
  const q = query.toLowerCase().trim();
  return POPULAR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
  );
}
