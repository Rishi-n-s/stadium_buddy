import React, { useState, useEffect } from 'react';

export default function WeatherWidget({ city = 'London' }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) {
        setError(true);
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
        setError(false);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(true);
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
      <div className="glass-overlay rounded-xl mechanical-border p-4 flex items-center justify-center h-24 animate-pulse">
        <span className="text-on-surface-variant font-mono text-xs">LOADING METRICS...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="glass-overlay rounded-xl mechanical-border p-4 flex items-center justify-center h-24">
        <span className="text-error font-mono text-xs">WEATHER UNAVAILABLE</span>
      </div>
    );
  }

  return (
    <div className="glass-overlay rounded-xl mechanical-border p-4 flex items-center justify-between group overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />
      <div className="flex items-center gap-4 relative z-10">
        <img 
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
          alt={weather.condition}
          className="w-12 h-12 drop-shadow-md"
        />
        <div>
          <div className="flex items-end gap-1">
            <span className="text-headline-md font-bold text-on-surface leading-none">{weather.temp}°</span>
            <span className="text-label-caps text-on-surface-variant mb-1">C</span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-primary font-bold">{weather.condition}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 relative z-10 text-right border-l border-outline-variant/30 pl-4">
        <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-on-surface-variant">
          <span className="material-symbols-outlined text-[14px]">water_drop</span>
          {weather.humidity}%
        </div>
        <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-on-surface-variant">
          <span className="material-symbols-outlined text-[14px]">air</span>
          {weather.windSpeed} KM/H
        </div>
      </div>
    </div>
  );
}
