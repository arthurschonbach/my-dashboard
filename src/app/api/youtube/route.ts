// app/api/youtube/route.ts
import { NextResponse } from 'next/server';

const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const revalidate = 1800; // Mise en cache pendant 30 minutes

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const channelIds = searchParams.get('channels')?.split(',');

    if (!API_KEY) {
        return NextResponse.json({ error: 'YouTube API key is not configured' }, { status: 500 });
    }
    if (!channelIds || channelIds.length === 0) {
        return NextResponse.json({ error: 'Channel IDs are required' }, { status: 400 });
    }

    try {
        // Get date from 7 days ago in ISO 8601 format
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 7);
        const publishedAfter = twoDaysAgo.toISOString();

        // Fetch videos for all channels
        const videoPromises = channelIds.map(async (channelId) => {
            const url = `${BASE_URL}/search?key=${API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10&publishedAfter=${publishedAfter}`;
            const response = await fetch(url);
            if (!response.ok) return []; // Skip failed requests
            const data = await response.json();
            return data.items;
        });

        const results = await Promise.all(videoPromises);
        const allVideos = results.flat().filter(video => video && video.id.videoId); // Flatten and filter out any nulls/non-videos

        // Sort all videos by publish date, descending
        allVideos.sort((a, b) => new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime());

        return NextResponse.json(allVideos);

    } catch (error) {
        console.error('YouTube API error:', error);
        return NextResponse.json({ error: 'Failed to fetch YouTube videos' }, { status: 500 });
    }
}