import { NextResponse } from 'next/server';

// Revalidate data every 15 minutes
export const revalidate = 900;

export interface GdeltArticle {
  url: string;
  title: string;
  domain: string;
  seendate: string;
}

export async function GET() {
  const GDELT_API_BASE_URL = 'https://api.gdeltproject.org/api/v2/doc/doc';

  const reputableDomains = [
    'reuters.com',
    'apnews.com',
    'bbc.co.uk',
    'cnn.com',
    'npr.org',
    'wsj.com',
    'nytimes.com',
    'washingtonpost.com',
    'theguardian.com',
    'ft.com'
  ];

  const domainWeights: Record<string, number> = {
    'nytimes.com': 10,
    'washingtonpost.com': 9,
    'reuters.com': 8,
    'bbc.co.uk': 8,
    'apnews.com': 7,
    'cnn.com': 6,
    'npr.org': 5,
    'wsj.com': 4,
    'theguardian.com': 3,
    'ft.com': 2
  };

  // Build query with domain filters
  const domainFilters = reputableDomains.map(domain => `domain:${domain}`).join(' OR ');
  const query = `(${domainFilters}) sourcelang:english`;

  const params = new URLSearchParams({
    mode: 'artlist',
    format: 'json',
    maxrecords: '30', // Fetch more for filtering
    sort: 'DateDesc'
  });

  const finalUrl = `${GDELT_API_BASE_URL}?query=${encodeURIComponent(query)}&${params.toString()}`;

  try {
    const response = await fetch(finalUrl, {
      next: { revalidate: 900 }
    });

    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType || !contentType.includes("application/json")) {
      const errorText = await response.text();
      console.error('GDELT API Error - Status:', response.status, 'Body:', errorText);
      throw new Error(`Invalid response from GDELT API: ${errorText}`);
    }

    const data = await response.json();
    const articles: GdeltArticle[] = data.articles || [];

    // Score and sort articles by domain importance
    const topArticles = articles
      .map(article => ({
        ...article,
        score: domainWeights[article.domain] || 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Return top 5

    return NextResponse.json(topArticles);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('[GDELT API ROUTE ERROR]', errorMessage);

    return NextResponse.json(
      { message: "Failed to fetch data from GDELT", error: errorMessage },
      { status: 500 }
    );
  }
}
