import React, { useState, useEffect } from 'react';
import Card from './Card';
import { Droplets, Wind } from 'lucide-react';

export default function WeatherWidget({ city = 'London' }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) {
        // Fallback to mock data if no API key
        setWeather({
          temp: 22,
          condition: 'Clear',
          icon: '01d',
          humidity: 45,
          windSpeed: 12,
        });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        if (!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();
        setWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].main,
          icon: data.weather[0].icon,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        });
      } catch (err) {
        console.error('Weather fetch error, using mock fallback:', err);
        setWeather({
          temp: 22,
          condition: 'Clear',
          icon: '01d',
          humidity: 45,
          windSpeed: 12,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  if (loading) {
    return (
      <Card className="p-4 flex items-center justify-center h-24 animate-pulse">
        <span className="text-on-surface-variant font-mono text-xs">LOADING METRICS...</span>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="p-4 flex items-center justify-center h-24">
        <span className="text-error font-mono text-xs">WEATHER UNAVAILABLE</span>
      </Card>
    );
  }

  return (
    <Card className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4 group overflow-hidden relative border-none">
      <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />
      <div className="flex items-center gap-2 sm:gap-4 relative z-10 min-w-0">
        <img 
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
          alt={weather.condition}
          className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-end gap-1">
            <span className="text-headline-md sm:text-display-sm font-display-sm font-bold text-on-surface leading-none">{weather.temp}°</span>
            <span className="text-[10px] sm:text-label-caps font-label-caps text-on-surface-variant mb-1">C</span>
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-primary font-bold truncate block">{weather.condition}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 sm:gap-2 relative z-10 text-right border-l border-outline-variant/30 pl-2 sm:pl-4 shrink-0">
        <div className="flex items-center justify-end gap-1 sm:gap-2 text-[9px] sm:text-[10px] font-mono text-on-surface-variant">
          <Droplets className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
          {weather.humidity}%
        </div>
        <div className="flex items-center justify-end gap-1 sm:gap-2 text-[9px] sm:text-[10px] font-mono text-on-surface-variant">
          <Wind className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
          {weather.windSpeed} KM/H
        </div>
      </div>
    </Card>
  );
}
