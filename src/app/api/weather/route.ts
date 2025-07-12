// app/api/weather/route.ts
import { NextResponse } from 'next/server';

// ✅ CONTRAT N°1 : Le format final et propre que notre API enverra au Widget.
// C'est notre "contrat" pour éviter tout 'any'.
export interface WeatherData {
  current: {
    temp: number;
    description: string;
    icon: string;
    high: number;
    low: number;
  };
  forecast: {
    day: string;
    high: number;
    low: number;
    icon: string;
  }[];
}

// Interfaces pour typer les réponses brutes de l'API OpenWeatherMap
interface RawApiWeatherDay {
    dt: number;
    temp: { max: number; min: number; };
    weather: { description: string; icon: string; }[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!city) {
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  }
  if (!apiKey) {
    return NextResponse.json({ error: 'Weather API key is not configured' }, { status: 500 });
  }

  try {
    const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
    if (!geoResponse.ok) throw new Error('Failed to fetch geocoding data');
    const geoData = await geoResponse.json();
    if (!geoData || geoData.length === 0) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }
    const { lat, lon } = geoData[0];

    const weatherResponse = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=metric&lang=fr`);
    if (!weatherResponse.ok) throw new Error('Failed to fetch weather data');
    const rawData = await weatherResponse.json();

    // ✅ CONTRAT N°2 : On transforme les données brutes en respectant notre contrat "WeatherData".
    const formattedData: WeatherData = {
      current: {
        temp: Math.round(rawData.current.temp),
        description: rawData.current.weather[0].description,
        icon: rawData.current.weather[0].icon,
        high: Math.round(rawData.daily[0].temp.max),
        low: Math.round(rawData.daily[0].temp.min),
      },
      forecast: rawData.daily.slice(1, 3).map((day: RawApiWeatherDay) => ({ // Pas de 'any' ici !
        day: new Date(day.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'long' }),
        high: Math.round(day.temp.max),
        low: Math.round(day.temp.min),
        icon: day.weather[0].icon,
      }))
    };
    
    return NextResponse.json(formattedData);
  } catch (error) {
    // Affiche l'erreur côté serveur pour le débogage.
    console.error('[WEATHER API ERROR]', error);
    return NextResponse.json({ error: 'Could not fetch weather data.' }, { status: 500 });
  }
}