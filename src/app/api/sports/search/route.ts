// app/api/sports/search/route.ts
import { NextResponse } from 'next/server';

const API_KEY = process.env.SPORTS_DB_API_KEY;
// The base URL for searching teams
const SEARCH_BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/searchteams.php`;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!API_KEY) {
        return NextResponse.json({ error: 'Sports API key is not configured' }, { status: 500 });
    }

    if (!query) {
        return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    try {
        // --- FIX IS HERE ---
        // Changed from &t= to ?t= to correctly start the query string
        const response = await fetch(`${SEARCH_BASE_URL}?t=${encodeURIComponent(query)}`); 
        
        if (!response.ok) {
            // This error will no longer be triggered by a 404 from the external API
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const data = await response.json();
        const teams = data.teams || [];

        return NextResponse.json(teams);

    } catch (error) {
        console.error('Team search API error:', error);
        return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 });
    }
}