// app/api/sports/route.ts
import { NextResponse } from 'next/server';

const API_KEY = process.env.SPORTS_DB_API_KEY;
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

interface SportEvent {
    idEvent: string;
    dateEvent: string;
    strTime: string;
    // Add other event properties you might need
    [key: string]: any;
}

// Helper to fetch events from a given API endpoint
const fetchEvents = async (url: string): Promise<SportEvent[]> => {
    try {
        const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
        if (!response.ok) return [];
        const data = await response.json();
        // The API returns results under different keys, so we check for common ones.
        return data.results || data.events || [];
    } catch (error) {
        console.error(`Failed to fetch from ${url}`, error);
        return [];
    }
};

// Helper to remove duplicate events based on their ID
const removeDuplicates = (events: SportEvent[]): SportEvent[] => {
    const uniqueEvents = new Map<string, SportEvent>();
    events.forEach(event => {
        if (!uniqueEvents.has(event.idEvent)) {
            uniqueEvents.set(event.idEvent, event);
        }
    });
    return Array.from(uniqueEvents.values());
};

const getEventDate = (event: SportEvent): Date => {
    // Append 'Z' to the timestamp to specify it's in UTC
    return new Date(`${event.dateEvent}T${event.strTime || '00:00:00'}Z`);
};

// ... (The rest of the file remains the same)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const teams = searchParams.get('teams')?.split(',') || [];

    if (!API_KEY) {
        return NextResponse.json({ error: 'Sports API key is not configured' }, { status: 500 });
    }
    
    if (teams.length === 0) {
        return NextResponse.json({ results: [], upcoming: [] });
    }

    try {
        // Create promises for both past and future events for all teams
        const pastEventPromises = teams.map(teamId => fetchEvents(`${BASE_URL}/eventslast.php?id=${teamId}`));
        const upcomingEventPromises = teams.map(teamId => fetchEvents(`${BASE_URL}/eventsnext.php?id=${teamId}`));

        // Await all promises concurrently
        const [pastResults, upcomingResults] = await Promise.all([
            Promise.all(pastEventPromises),
            Promise.all(upcomingEventPromises),
        ]);

        // Flatten the arrays of arrays and remove duplicates
        const uniquePastEvents = removeDuplicates(pastResults.flat());
        const uniqueUpcomingEvents = removeDuplicates(upcomingResults.flat());

        // Filter past events to only include those from the last 10 days
        const xDaysAgo = new Date();
        xDaysAgo.setDate(xDaysAgo.getDate() - 5);
        
        const recentPastEvents = uniquePastEvents.filter(event => {
            const eventDate = getEventDate(event);
            return eventDate >= xDaysAgo;
        });

        // Sort events by date
        const sortedPastEvents = recentPastEvents.sort((a, b) => getEventDate(b).getTime() - getEventDate(a).getTime());
        const sortedUpcomingEvents = uniqueUpcomingEvents.sort((a, b) => getEventDate(a).getTime() - getEventDate(b).getTime());

        // Return data in the new format
        return NextResponse.json({
            results: sortedPastEvents,
            upcoming: sortedUpcomingEvents
        });

    } catch (error) {
        console.error('Sports API route error:', error);
        return NextResponse.json({ error: 'Failed to fetch sports data' }, { status: 500 });
    }
}