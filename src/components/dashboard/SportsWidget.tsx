// components/dashboard/SportsWidget.tsx
"use client";
import { useState, useEffect, ReactNode } from "react";
import useSWR from "swr";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Trophy, CalendarClock } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SportEvent {
  idEvent: string;
  strEvent: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime: string; // <-- Add this property
  strLeague: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
}

interface SportsData {
  results: SportEvent[];
  upcoming: SportEvent[];
}

interface SportsWidgetProps {
  icon?: ReactNode;
}

export function SportsWidget({ icon }: SportsWidgetProps) {
  const [teams, setTeams] = useLocalStorage("sports-teams", "133714,134879");
  const [tempTeams, setTempTeams] = useState(teams);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, error, isLoading } = useSWR<SportsData>(
    isClient && teams ? `/api/sports?teams=${teams}` : null,
    fetcher
  );
  const handleSave = () => {
    setTeams(tempTeams);
  };

  const hasResults = data?.results && data.results.length > 0;
  const nextGame = data?.upcoming?.[0];
  const hasData = hasResults || !!nextGame;

  const getTeamDisplayName = (event: SportEvent) =>
    event.strHomeTeam && event.strAwayTeam
      ? `${event.strHomeTeam} vs ${event.strAwayTeam}`
      : event.strEvent.replace(/\s+vs\s+/, " vs ");

  // Helper to create a UTC-aware Date object from event data
  const getEventDateTime = (event: SportEvent): Date => {
    // Append 'Z' to indicate the time from the API is in UTC
    return new Date(`${event.dateEvent}T${event.strTime || '00:00:00'}Z`);
  };

  return (
    <Card className="rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
      <CardHeader className="p-4 flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-2.5 text-slate-800">
          {icon}
          <h3 className="text-base font-semibold tracking-tight">
            Sports Feed
          </h3>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-xl bg-slate-50">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-800">
                Sports Preferences
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="teams"
                  className="text-sm font-medium text-slate-700"
                >
                  Team IDs (comma-separated)
                </Label>
                <Input
                  id="teams"
                  value={tempTeams}
                  onChange={(e) => setTempTeams(e.target.value)}
                  className="rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  onClick={handleSave}
                  className="rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save Changes
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-2">
        {isLoading && (
          <div className="space-y-3 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        )}
        {error && (
          <div className="p-2">
            <Alert variant="destructive" className="text-sm rounded-lg">
              <AlertTitle className="font-semibold">Error</AlertTitle>
              <AlertDescription>
                Could not load scores. Check team IDs.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {isClient && !isLoading && !error && hasData && (
          <>
            <div className="space-y-2">
              {hasResults &&
                data.results.slice(0, 3).map((event) => (
                  <div
                    key={event.idEvent}
                    className="group flex flex-col gap-1 py-2 px-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800 truncate flex-1 group-hover:text-blue-600">
                        {getTeamDisplayName(event)}
                      </p>
                      <span className="text-base font-bold text-slate-700 ml-2">
                        {event.intHomeScore ?? "0"} -{" "}
                        {event.intAwayScore ?? "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">
                        {new Date(getEventDateTime(event)).toLocaleString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                      <span className="font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                        {event.strLeague}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {nextGame && (
              <div className="p-3 mb-2 rounded-lg bg-slate-50 border border-slate-200/80">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Upcoming Game
                </p>
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {getTeamDisplayName(nextGame)}
                </p>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="font-medium text-slate-500">
                    {new Date(getEventDateTime(nextGame)).toLocaleString(
                      undefined,
                      {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                  <span className="font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                    {nextGame.strLeague}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {isClient && !isLoading && !error && !hasData && (
          <div className="text-center py-10 text-slate-500">
            <Trophy className="mx-auto h-12 w-12 mb-3 text-slate-300" />
            <p className="font-semibold text-slate-700">Ready for Action!</p>
            <p className="text-sm">Add your favorite teams to begin.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}