// app/api/sports/route.ts
import { NextResponse } from 'next/server';

const API_KEY = process.env.SPORTS_DB_API_KEY;
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

// Helper to fetch and normalize data
const fetchLast5Events = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || data.events || [];
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const teams = searchParams.get('teams')?.split(',') || [];
    const players = searchParams.get('players')?.split(',') || [];

    if (!API_KEY) {
      return NextResponse.json({ error: 'Sports API key is not configured' }, { status: 500 });
    }

    try {
        const teamPromises = teams.map(team => fetchLast5Events(`${BASE_URL}/eventslast.php?id=${team}`));
        
        // For players, we first need to find their team, then get team events.
        // This is a simplification; a full implementation might need more complex logic.
        const playerPromises = players.map(async (player) => {
            const playerDetailsRes = await fetch(`${BASE_URL}/searchplayers.php?p=${player}`);
            const playerData = await playerDetailsRes.json();
            const playerInfo = playerData.player?.[0];
            if (!playerInfo) return { playerName: player, events: [] };
            
            const events = await fetchLast5Events(`${BASE_URL}/eventslast.php?id=${playerInfo.idTeam}`);
            return { playerName: player, events, teamName: playerInfo.strTeam };
        });

        const [teamResults, playerResults] = await Promise.all([
            Promise.all(teamPromises),
            Promise.all(playerPromises)
        ]);

        return NextResponse.json({ teams: teamResults.flat(), players: playerResults });

    } catch (error) {
        console.error('Sports API error:', error);
        return NextResponse.json({ error: 'Failed to fetch sports data' }, { status: 500 });
    }
}