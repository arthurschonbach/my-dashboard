// app/api/news/route.ts
import { NextResponse } from 'next/server';

const API_KEY = process.env.NEWS_API_KEY;
// This base URL is for GNews, adapt if you use another service
const BASE_URL = 'https://gnews.io/api/v4/top-headlines';

export const revalidate = 900; // Mise en cache pendant 15 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const topic = searchParams.get('topic');

  if (!API_KEY) {
    return NextResponse.json({ error: 'News API key is not configured' }, { status: 500 });
  }

  let url = `${BASE_URL}?apikey=${API_KEY}&lang=en&max=10`;
  if (country) {
    url += `&country=${country}`;
  } else if (topic) {
    url += `&topic=${topic}`;
  } else {
    return NextResponse.json({ error: 'A country or topic is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        console.error('News API Error:', errorData);
        throw new Error('Failed to fetch news from the provider');
    }
    const data = await response.json();
    // The data structure is { articles: [...] } for GNews
    return NextResponse.json(data.articles);
  } catch (error) {
    console.error('Failed to fetch top headlines:', error);
    return NextResponse.json({ error: 'Failed to fetch top headlines' }, { status: 500 });
  }
}