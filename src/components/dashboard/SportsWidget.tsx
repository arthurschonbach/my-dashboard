// components/dashboard/SportsWidget.tsx
"use client";
import { useState, useEffect, ReactNode } from 'react';
import useSWR from 'swr';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Users, Trophy } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Interfaces remain the same...
interface SportEvent { idEvent: string; strEvent: string; intHomeScore: string; intAwayScore: string; }
interface PlayerData { playerName: string; events: SportEvent[]; }
interface SportsData { teams: SportEvent[]; players: PlayerData[]; }
interface SportsWidgetProps { icon?: ReactNode; }

export function SportsWidget({ icon }: SportsWidgetProps) {
    const [teams, setTeams] = useLocalStorage('sports-teams', '133714');
    const [players, setPlayers] = useLocalStorage('sports-players', 'Wembanyama');
    const [tempTeams, setTempTeams] = useState(teams);
    const [tempPlayers, setTempPlayers] = useState(players);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    // CHANGE: Simplified SWR hook. It will only generate a URL string (and thus fetch)
    // if we are on the client AND either teams or players has a value. Otherwise, the key is `null`.
    const { data, error, isLoading } = useSWR<SportsData>(
        isClient && (teams || players) ? `/api/sports?teams=${teams}&players=${players}` : null,
        fetcher
    );

    const handleSave = () => { setTeams(tempTeams); setPlayers(tempPlayers); };

    // This logic now works correctly because if there are no teams/players, `data` will be undefined
    // and `isLoading` will be false, correctly showing the empty state.
    const hasData = data && (data.teams?.length > 0 || data.players?.some(p => p.events.length > 0));

    return (
        <Card className="rounded-xl border-b-4 border-red-400 bg-white shadow-lg transition-transform hover:-translate-y-1">
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2 text-red-600">{icon}<h3 className="text-base font-bold tracking-tight">Sports Feed</h3></div>
                <Dialog><DialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600"><Settings className="h-4 w-4" /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Sports Preferences</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="teams">Team IDs</Label><Input id="teams" value={tempTeams} onChange={e => setTempTeams(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="players">Player Names</Label><Input id="players" value={tempPlayers} onChange={e => setTempPlayers(e.target.value)} /></div></div><DialogFooter><DialogClose asChild><Button onClick={handleSave}>Save</Button></DialogClose></DialogFooter></DialogContent></Dialog>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                {isLoading && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>}
                {error && <Alert variant="destructive" className="text-xs"><AlertTitle>Error</AlertTitle><AlertDescription>Could not load scores.</AlertDescription></Alert>}
                
                <div className="space-y-3">
                    {isClient && data?.teams && data.teams.length > 0 && (
                        <div>
                            <h4 className="font-bold text-xs flex items-center gap-1.5 text-red-700 uppercase tracking-wider mb-1"><Trophy className="h-4 w-4"/>Team</h4>
                            {data.teams.slice(0, 2).map((event) => (
                                <div key={event.idEvent} className="flex items-center justify-between py-1.5 rounded-md hover:bg-red-50 px-1.5 -mx-1.5">
                                    <p className="text-sm font-semibold text-gray-700">{event.strEvent}</p>
                                    <p className="text-lg font-bold text-gray-800 pl-4">{event.intHomeScore}-{event.intAwayScore}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {isClient && data?.players?.map(p => p.events.length > 0 && (
                        <div key={p.playerName}>
                            <h4 className="font-bold text-xs flex items-center gap-1.5 text-red-700 uppercase tracking-wider mb-1"><Users className="h-4 w-4"/>{p.playerName}</h4>
                            {p.events.slice(0, 2).map((event) => (
                                <div key={event.idEvent} className="flex items-center justify-between py-1.5 rounded-md hover:bg-red-50 px-1.5 -mx-1.5">
                                    <p className="text-sm font-semibold text-gray-700">{event.strEvent}</p>
                                    <p className="text-lg font-bold text-gray-800 pl-4">{event.intHomeScore}-{event.intAwayScore}</p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {isClient && !isLoading && !error && !hasData && (<div className="text-center py-12 text-gray-400"><Trophy className="mx-auto h-8 w-8 mb-2" /><p className="text-sm font-medium">No recent events.</p><p className="text-xs">Add a team or player in settings!</p></div>)}
            </CardContent>
        </Card>
    );
}