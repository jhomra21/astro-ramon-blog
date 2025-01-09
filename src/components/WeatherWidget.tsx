import { useRef } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import WeatherIcon from './WeatherIcon';

// Default query client options
const defaultQueryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Keep data fresh forever unless explicitly invalidated
      cacheTime: Infinity,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
};

// Create a function to get or create the client
function getQueryClient() {
  if (typeof window === 'undefined') return new QueryClient(defaultQueryClientOptions);
  // @ts-ignore - we know window exists here
  window.__queryClient = window.__queryClient || new QueryClient(defaultQueryClientOptions);
  // @ts-ignore
  return window.__queryClient;
}

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
}

// Default coordinates (New York City - Central Park for more accurate weather)
const DEFAULT_COORDS = {
  latitude: 40.7829,
  longitude: -73.9654,
  city: 'New York'
};

const fetchLocationByIP = async (): Promise<LocationData> => {
  try {
    // Get location directly from ipwho.is
    const locationResponse = await fetch('https://ipwho.is/');
    const locationData = await locationResponse.json();
    
    if (!locationData.success) {
      throw new Error('Failed to get location data');
    }

    return {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      city: locationData.city
    };
  } catch (err) {
    console.error('IP Location error:', err);
    return DEFAULT_COORDS;
  }
};

const fetchWeatherData = async (latitude: number, longitude: number): Promise<WeatherData> => {
  const WEATHER_API_KEY = import.meta.env.PUBLIC_OPENWEATHER_API_KEY;
  const url = 'https://api.openweathermap.org/data/2.5/weather?' +
    'lat=' + latitude +
    '&lon=' + longitude +
    '&appid=' + WEATHER_API_KEY +
    '&units=metric';

  const weatherResponse = await fetch(url);
  
  if (!weatherResponse.ok) {
    const errorData = await weatherResponse.json();
    throw new Error(errorData.message || 'Failed to fetch weather data');
  }
  
  const weatherData = await weatherResponse.json();
  
  return {
    temp: Math.round(weatherData.main.temp),
    description: weatherData.weather[0].description,
    icon: weatherData.weather[0].icon,
    city: weatherData.name,
  };
};

const WeatherWidgetContent = () => {
  const locationQuery = useQuery({
    queryKey: ['location'],
    queryFn: fetchLocationByIP,
    staleTime: 24 * 60 * 60 * 1000, // Location data stays fresh for 24 hours
    gcTime: Infinity,
  });

  const weatherQuery = useQuery({
    queryKey: ['weather', locationQuery.data?.latitude, locationQuery.data?.longitude],
    queryFn: () => fetchWeatherData(
      locationQuery.data?.latitude || DEFAULT_COORDS.latitude,
      locationQuery.data?.longitude || DEFAULT_COORDS.longitude
    ),
    enabled: !!locationQuery.data || locationQuery.isError,
    staleTime: 5 * 60 * 1000, // Weather data stays fresh for 5 minutes
    gcTime: Infinity,
    retry: false,
  });

  if (weatherQuery.isLoading || locationQuery.isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-24" />
      </div>
    );
  }

  if (!weatherQuery.data) {
    return null;
  }

  const weather = weatherQuery.data;

  return (
    <div className="flex items-center gap-2.5 font-mono">
      <div className="flex items-center gap-2 bg-neutral-100/50 hover:bg-neutral-100 px-2 sm:px-3 py-1.5 rounded-md border border-neutral-200/50">
        <WeatherIcon icon={weather.icon} description={weather.description} />
        <span className="tabular-nums tracking-tight font-medium text-[13px] text-neutral-600">
          {weather.temp}°C
        </span>
        <span className="text-[13px] text-neutral-400 hidden md:inline tracking-tight">
          {weather.city}
        </span>
      </div>
    </div>
  );
};

const WeatherWidget = () => {
  // Use ref to ensure consistent reference and initialize with a client
  const queryClientRef = useRef<QueryClient>(getQueryClient());

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <WeatherWidgetContent />
    </QueryClientProvider>
  );
};

export default WeatherWidget;