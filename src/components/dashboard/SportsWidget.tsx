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
import { Settings, Trophy, CalendarClock, X } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --- 1. Lean Team Interface for Storage ---
// This is the clean, minimal object structure we'll store in localStorage.
interface StoredTeam {
  idTeam: string;
  strTeam: string;
}

// --- 2. Full Interface for the API Search Result ---
// This represents the complete object fetched from the search API.
interface APITeam {
  idTeam: string;
  strTeam: string;
  // The API returns many other fields, but we only need to define the ones we use.
  // Using a flexible index signature is a good practice for this.
  [key: string]: unknown;
}

interface SportEvent {
  idEvent: string;
  strEvent: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime: string;
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

// --- 3. Default Team Using the Lean StoredTeam Interface ---
const DEFAULT_TEAMS: StoredTeam[] = [
  {
    idTeam: "134879", // The correct, current ID for San Antonio Spurs
    strTeam: "San Antonio Spurs",
  },
];

export function SportsWidget({ icon }: SportsWidgetProps) {
  // --- 4. useLocalStorage with Lean Type and New Key ---
  // Using "v3" prevents conflicts with any old data structures in the user's browser.
  const [teams, setTeams] = useLocalStorage<StoredTeam[]>(
    "sports-teams",
    DEFAULT_TEAMS
  );

  const [tempTeams, setTempTeams] = useState<StoredTeam[]>(teams);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // This effect ensures that if the 'teams' data changes (e.g., in another browser tab),
  // the temporary state for the settings dialog is updated accordingly.
  useEffect(() => {
    setTempTeams(teams);
  }, [teams]);

  const teamIds = teams.map((t) => t.idTeam).join(",");

  // Fetches game data for the stored teams
  const { data, error, isLoading } = useSWR<SportsData>(
    isClient && teamIds ? `/api/sports?teams=${teamIds}` : null,
    fetcher
  );

  // Fetches team search results from the API
  const { data: searchResults, isLoading: isSearching } = useSWR<APITeam[]>(
    searchQuery.length > 2 ? `/api/sports/search?q=${searchQuery}` : null,
    fetcher
  );

  // --- 5. Maps Full API Object to Lean Storage Object ---
  const handleAddTeam = (team: APITeam) => {
    if (!tempTeams.some((t) => t.idTeam === team.idTeam)) {
      // Create a new, clean object with only the fields we want to store.
      const newTeam: StoredTeam = {
        idTeam: team.idTeam,
        strTeam: team.strTeam,
      };
      setTempTeams([...tempTeams, newTeam]);
    }
    setSearchQuery(""); // Clear search input after adding
  };

  const handleRemoveTeam = (teamId: string) => {
    setTempTeams(tempTeams.filter((t) => t.idTeam !== teamId));
  };

  const handleSave = () => {
    setTeams(tempTeams);
  };

  const handleCancel = () => {
    setTempTeams(teams); // Revert any changes to match the saved state
    setSearchQuery("");
  };

  const hasResults = data?.results && data.results.length > 0;
  const nextGame = data?.upcoming?.[0];
  const hasData = hasResults || !!nextGame;

  const getTeamDisplayName = (event: SportEvent) =>
    event.strHomeTeam && event.strAwayTeam
      ? `${event.strHomeTeam} vs ${event.strAwayTeam}`
      : event.strEvent.replace(/\s+vs\s+/, " vs ");

  const getEventDateTime = (event: SportEvent): Date => {
    // Appending 'Z' ensures the date is parsed as UTC, matching the API's behavior
    return new Date(`${event.dateEvent}T${event.strTime || "00:00:00"}Z`);
  };

  return (
    <Card className="rounded-xl bg-white dark:bg-slate-800/50 shadow-sm transition-all hover:shadow-md border-slate-200 dark:border-slate-700">
      <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-100">
          {icon}
          <h3 className="text-base font-semibold tracking-tight">
            Sports Feed
          </h3>
        </div>
        <Dialog onOpenChange={(isOpen) => !isOpen && handleCancel()}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Sports Preferences
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
          <Label htmlFor="team-search" className="text-slate-700 dark:text-slate-300">
            Search for a Team
          </Label>
          <Input
            id="team-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-slate-100 mt-2"
            placeholder="e.g., Real Madrid, Lakers..."
          />
              </div>

              {isSearching && (
          <p className="text-sm text-slate-500 dark:text-slate-400 px-1">
            Searching...
          </p>
              )}

              {searchResults && searchResults.length > 0 && (
          <div className="max-h-32 min-h-[40px] overflow-y-auto space-y-1">
            {searchResults.map((team) => (
              <div
                key={team.idTeam}
                onClick={() => handleAddTeam(team)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {team.strTeam}
                </span>
              </div>
            ))}
          </div>
              )}

              {tempTeams.length > 0 && (
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">
              Followed Teams
            </Label>
            <div className="flex flex-wrap gap-2">
              {tempTeams.map((team) => (
                <div
            key={team.idTeam}
            className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full px-3 py-1 text-sm"
                >
            <span>{team.strTeam}</span>
            <button
              onClick={() => handleRemoveTeam(team.idTeam)}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <X size={14} />
            </button>
                </div>
              ))}
            </div>
          </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
              </DialogClose>
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
              <Skeleton
                key={i}
                className="h-12 w-full rounded-lg bg-slate-200 dark:bg-slate-700"
              />
            ))}
          </div>
        )}
        {error && (
          <div className="p-2">
            <Alert variant="destructive" className="text-sm rounded-lg">
              <AlertTitle className="font-semibold">Error</AlertTitle>
              <AlertDescription>
                Could not load scores. Check your connection or team selections.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {isClient && !isLoading && !error && !hasData && (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            <Trophy className="mx-auto h-12 w-12 mb-3 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Ready for Action!
            </p>
            <p className="text-sm">
              Search for and add your favorite teams to begin.
            </p>
          </div>
        )}

        {isClient && !isLoading && !error && hasData && (
          <>
            <div className="space-y-2">
              {hasResults &&
                data.results.slice(0, 3).map((event) => (
                  <div
                    key={event.idEvent}
                    className="group flex flex-col gap-1 py-2 px-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {getTeamDisplayName(event)}
                      </p>
                      <span className="text-base font-bold text-slate-700 dark:text-slate-300 ml-2">
                        {event.intHomeScore ?? "–"} -{" "}
                        {event.intAwayScore ?? "–"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500 dark:text-slate-400">
                        {new Date(getEventDateTime(event)).toLocaleString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <span className="font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full">
                        {event.strLeague}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {nextGame && (
              <div className="p-3 my-2 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200/80 dark:border-slate-700">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Upcoming Game
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {getTeamDisplayName(nextGame)}
                </p>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="font-medium text-slate-500 dark:text-slate-400">
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
                  <span className="font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full">
                    {nextGame.strLeague}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}