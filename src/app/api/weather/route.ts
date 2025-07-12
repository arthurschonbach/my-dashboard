// app/api/weather/route.ts
import { NextResponse } from 'next/server';

// ✅ CONTRAT MIS À JOUR : L'icône est maintenant une URL complète, ce qui est plus simple.
export interface WeatherData {
  current: {
    temp: number;
    description: string;
    iconURL: string; // Changement de 'icon' en 'iconURL'
    high: number;
    low: number;
  };
  forecast: {
    day: string;
    high: number;
    low: number;
    iconURL: string; // Changement de 'icon' en 'iconURL'
  }[];
}

// Interface pour typer la réponse brute de WeatherAPI
interface RawForecastDay {
    date: string;
    day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
            text: string;
            icon: string;
        };
    };
}

export const revalidate = 600; // Mise en cache pendant 10 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  // ✅ On utilise la nouvelle variable d'environnement
  const apiKey = process.env.WEATHERAPI_KEY;

  if (!city) {
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  }
  if (!apiKey) {
    return NextResponse.json({ error: 'Weather API key is not configured' }, { status: 500 });
  }

  try {
    // ✅ NOUVELLE URL : On appelle l'API de WeatherAPI avec le bon format.
    // 'days=3' nous donne le jour actuel et les 2 prochains.
    const weatherResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=no&alerts=no&lang=en`);
    
    if (!weatherResponse.ok) {
        const errorData = await weatherResponse.json();
        throw new Error(errorData.error.message || 'Failed to fetch weather data');
    }
    const rawData = await weatherResponse.json();

    // ✅ NOUVELLE TRANSFORMATION : On mappe la réponse de WeatherAPI à notre contrat WeatherData.
    const formattedData: WeatherData = {
      current: {
        temp: Math.round(rawData.current.temp_c),
        description: rawData.current.condition.text,
        iconURL: `https:${rawData.current.condition.icon}`, // On ajoute 'https:' car l'API renvoie une URL sans protocole
        high: Math.round(rawData.forecast.forecastday[0].day.maxtemp_c),
        low: Math.round(rawData.forecast.forecastday[0].day.mintemp_c),
      },
      forecast: rawData.forecast.forecastday.slice(1, 3).map((day: RawForecastDay) => ({
        day: new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long' }),
        high: Math.round(day.day.maxtemp_c),
        low: Math.round(day.day.mintemp_c),
        iconURL: `https:${day.day.condition.icon}`,
      }))
    };
    
    return NextResponse.json(formattedData);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('[WEATHER API ERROR]', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}