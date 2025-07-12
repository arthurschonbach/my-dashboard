// app/api/hackernews/route.ts
import { NextResponse } from 'next/server';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!response.ok) throw new Error('Failed to fetch top stories');

    const storyIds = await response.json();
    const top10Ids = storyIds.slice(0, 10);

    const storyPromises = top10Ids.map((id: number) => 
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
    );

    const stories = await Promise.all(storyPromises);
    return NextResponse.json(stories);
  } catch (error) {
    console.error('Hacker News API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Hacker News stories' }, { status: 500 });
  }
}