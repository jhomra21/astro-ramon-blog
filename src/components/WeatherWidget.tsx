import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import WeatherIcon from './WeatherIcon';

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

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
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
      
      setWeather({
        temp: Math.round(weatherData.main.temp),
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        city: weatherData.name,
      });
      setError(null);
    } catch (err) {
      console.error('Weather widget error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const getWeatherForLocation = async () => {
      try {
        const location = await fetchLocationByIP();
        if (mounted) {
          await fetchWeatherData(location.latitude, location.longitude);
        }
      } catch (err) {
        console.error('Failed to get weather:', err);
        if (mounted) {
          await fetchWeatherData(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude);
        }
      }
    };

    getWeatherForLocation();

    // Refresh every 5 minutes
    const interval = setInterval(getWeatherForLocation, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading && !weather) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-24" />
      </div>
    );
  }

  if (!weather) {
    return null;
  }

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

export default WeatherWidget; 