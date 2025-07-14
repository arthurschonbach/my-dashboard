// app/api/weather/route.ts
import { NextResponse } from 'next/server';

// ✅ CONTRAT MIS À JOUR : Ajout du vent, de l'humidité et du risque de pluie pour le jour actuel.
export interface WeatherData {
  current: {
    temp: number;
    description: string;
    iconURL: string;
    high: number;
    low: number;
    wind: number;
    humidity: number;
    chanceOfRain: number;
  };
  forecast: {
    day: string;
    high: number;
    low: number;
    iconURL: string;
  }[];
}

// Interface pour typer la réponse brute de WeatherAPI
interface RawForecastDay {
    date: string;
    day: {
        maxtemp_c: number;
        mintemp_c: number;
        daily_chance_of_rain: number; // On récupère le risque de pluie
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
  const apiKey = process.env.WEATHERAPI_KEY;

  if (!city) {
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  }
  if (!apiKey) {
    return NextResponse.json({ error: 'Weather API key is not configured' }, { status: 500 });
  }

  try {
    // ✅ NOUVELLE URL : On demande 'days=4' pour avoir le jour J + 3 jours de prévisions.
    const weatherResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=4&aqi=no&alerts=no&lang=en`);
    
    if (!weatherResponse.ok) {
        const errorData = await weatherResponse.json();
        throw new Error(errorData.error.message || 'Failed to fetch weather data');
    }
    const rawData = await weatherResponse.json();

    // ✅ NOUVELLE TRANSFORMATION : On mappe les nouvelles données (vent, etc.) et on prend 3 jours de prévisions.
    const formattedData: WeatherData = {
      current: {
        temp: Math.round(rawData.current.temp_c),
        description: rawData.current.condition.text,
        iconURL: `https:${rawData.current.condition.icon}`,
        high: Math.round(rawData.forecast.forecastday[0].day.maxtemp_c),
        low: Math.round(rawData.forecast.forecastday[0].day.mintemp_c),
        wind: Math.round(rawData.current.wind_kph), // Ajout de la vitesse du vent
        humidity: rawData.current.humidity,         // Ajout de l'humidité
        chanceOfRain: rawData.forecast.forecastday[0].day.daily_chance_of_rain, // Ajout du risque de pluie pour aujourd'hui
      },
      // On prend les 3 prochains jours avec slice(1, 4)
      forecast: rawData.forecast.forecastday.slice(1, 4).map((day: RawForecastDay) => ({
        day: new Date(day.date).toLocaleDateString('en-EN', { weekday: 'long' }),
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