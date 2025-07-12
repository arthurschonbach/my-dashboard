// components/dashboard/SportsWidget.tsx
"use client";
import { useState, ReactNode } from 'react';
import useSWR from 'swr';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Users, Trophy } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// ✅ DÉFINITION DES MODÈLES POUR LES DONNÉES SPORTIVES
interface SportEvent {
    idEvent: string;
    dateEvent: string;
    strLeague: string;
    strEvent: string;
    intHomeScore: string;
    intAwayScore: string;
}

interface PlayerData {
    playerName: string;
    teamName: string;
    events: SportEvent[];
}

interface SportsData {
    teams: SportEvent[];
    players: PlayerData[];
}

interface SportsWidgetProps {
  icon?: ReactNode;
}

export function SportsWidget({ icon }: SportsWidgetProps) {
    const [teams, setTeams] = useLocalStorage('sports-teams', '133714');
    const [players, setPlayers] = useLocalStorage('sports-players', 'Wembanyama');
    
    const [tempTeams, setTempTeams] = useState(teams);
    const [tempPlayers, setTempPlayers] = useState(players);

    const { data, error, isLoading } = useSWR<SportsData>(`/api/sports?teams=${teams}&players=${players}`, fetcher, {
        isPaused: () => !teams && !players
    });

    const handleSave = () => {
        setTeams(tempTeams);
        setPlayers(tempPlayers);
    };

    // ✅ Utilisation du modèle "SportEvent" au lieu de "any"
    const renderLatestEvent = (event: SportEvent) => (
        <div key={event.idEvent} className="p-3 bg-gray-100/80 rounded-lg text-center">
            <div className="text-xs font-medium text-red-600">{event.strLeague}</div>
            <div className="text-sm font-semibold my-1">{event.strEvent}</div>
            <div className="text-2xl font-bold text-gray-800">{event.intHomeScore} - {event.intAwayScore}</div>
            <div className="text-xs text-gray-500">{new Date(event.dateEvent).toLocaleDateString()}</div>
        </div>
    );
    
    // ✅ Utilisation du modèle "SportEvent" au lieu de "any"
    const renderPastEvent = (event: SportEvent) => (
       <div key={event.idEvent} className="flex items-center justify-between p-2 border-t">
            <div className="flex-grow">
                <div className="text-sm font-medium text-gray-700">{event.strEvent}</div>
                <div className="text-xs text-gray-500">{event.strLeague}</div>
            </div>
            <div className="text-sm font-bold text-gray-800 pl-4">{event.intHomeScore} - {event.intAwayScore}</div>
       </div>
    );

    const hasData = data && (data.teams?.length > 0 || data.players?.some((p: PlayerData) => p.events.length > 0));

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    {icon}
                    <CardTitle className="text-lg font-semibold text-gray-700">Sports Feed</CardTitle>
                </div>
                <Dialog>
                    <DialogTrigger asChild><Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Edit Sports Preferences</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="teams" className="text-right">Team IDs</Label>
                                <Input id="teams" value={tempTeams} onChange={(e) => setTempTeams(e.target.value)} className="col-span-3" placeholder="e.g. 133604,133612" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="players" className="text-right">Players</Label>
                                <Input id="players" value={tempPlayers} onChange={(e) => setTempPlayers(e.target.value)} className="col-span-3" placeholder="e.g. Wembanyama,Mbappe" />
                            </div>
                        </div>
                        <DialogFooter><DialogClose asChild><Button type="button" onClick={handleSave}>Save changes</Button></DialogClose></DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-3">
                {isLoading && <Skeleton className="h-36 w-full" />}
                {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Could not load scores.</AlertDescription></Alert>}
                
                {data?.teams && data.teams.length > 0 && (
                    <>
                        {renderLatestEvent(data.teams[0])}
                        {data.teams.slice(1, 3).map(renderPastEvent)}
                    </>
                )}

                {/* ✅ Utilisation du modèle "PlayerData" au lieu de "any" */}
                {data?.players?.map((playerData: PlayerData) => (
                    playerData.events.length > 0 && (
                        <div key={playerData.playerName} className="pt-2">
                            <h4 className="font-semibold text-sm mb-2 p-2 bg-muted rounded-md flex items-center gap-2"><Users className="h-4 w-4"/>{playerData.playerName}</h4>
                            {renderLatestEvent(playerData.events[0])}
                            {playerData.events.slice(1, 2).map(renderPastEvent)}
                        </div>
                    )
                ))}

                {!isLoading && !error && !hasData && (
                    <div className="text-center py-10 text-gray-500">
                        <Trophy className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm">No recent events found.</p>
                        <p className="text-xs">Update your preferences!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}