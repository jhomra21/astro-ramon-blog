import { useRef } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PUBLIC_OPENWEATHER_API_KEY } from 'astro:env/client';
import { Skeleton } from '@/components/ui/skeleton';
import WeatherIcon from './WeatherIcon';

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

const DEFAULT_COORDS = {
  latitude: 40.7829,
  longitude: -73.9654,
  city: 'New York'
};

const fetchWeatherData = async (): Promise<WeatherData> => {
  const url = 'https://api.openweathermap.org/data/2.5/weather?' +
    'lat=' + DEFAULT_COORDS.latitude +
    '&lon=' + DEFAULT_COORDS.longitude +
    '&appid=' + PUBLIC_OPENWEATHER_API_KEY +
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
  const weatherQuery = useQuery({
    queryKey: ['weather', DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude],
    queryFn: fetchWeatherData,
    enabled: Boolean(PUBLIC_OPENWEATHER_API_KEY),
    staleTime: 5 * 60 * 1000, // Weather data stays fresh for 5 minutes
    gcTime: Infinity,
    retry: false,
  });

  if (!PUBLIC_OPENWEATHER_API_KEY || weatherQuery.isError) {
    return null;
  }

  if (weatherQuery.isLoading) {
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
  const queryClientRef = useRef<QueryClient>(getQueryClient());

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <WeatherWidgetContent />
    </QueryClientProvider>
  );
};

export default WeatherWidget;