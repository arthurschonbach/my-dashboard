"use client";
import { useState, ReactNode, KeyboardEvent } from "react";
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
import { Settings, Video, X } from "lucide-react";
import Image from "next/image";

const decodeHtmlEntities = (text: string) => {
  if (typeof window === "undefined") return text;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Default handles are more user-friendly
const DEFAULT_HANDLES = ["@MKBHD", "@Fireship", "@AndrejKarpathy", "@HowMoneyWorks", "@Paulygones", "@Underscore_", "@3blue1brown", "@ExploreFR", "@GaspardG", "@Looking4Channel", "@maxbellona", "@Vox"];

interface YouTubeVideo {
  title: string;
  link: string;
  pubDate?: string;
  author?: string;
  enclosure?: { url?: string };
}

interface YouTubeWidgetProps {
  icon?: ReactNode;
}

export function YouTubeWidget({ icon }: YouTubeWidgetProps) {
  const [handles, setHandles] = useLocalStorage<string[]>(
    "youtube-handles",
    DEFAULT_HANDLES
  );
  const [tempHandles, setTempHandles] = useState(handles);
  const [newHandleInput, setNewHandleInput] = useState("");

  // The API endpoint now accepts 'handles'
  const {
    data: videos,
    error,
    isLoading,
  } = useSWR<YouTubeVideo[]>(
    handles.length > 0 ? `/api/youtube?handles=${handles.join(",")}` : null,
    fetcher
  );

  const handleAddHandle = () => {
    let newHandle = newHandleInput.trim();
    // Ensure it starts with @
    if (newHandle && !newHandle.startsWith("@")) {
      newHandle = `@${newHandle}`;
    }

    if (newHandle && !tempHandles.find(h => h.toLowerCase() === newHandle.toLowerCase())) {
      setTempHandles([...tempHandles, newHandle]);
    }
    setNewHandleInput("");
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddHandle();
    }
  };

  const handleRemoveHandle = (handleToRemove: string) => {
    setTempHandles(tempHandles.filter((handle) => handle !== handleToRemove));
  };

  const handleSave = () => {
    setHandles(tempHandles);
  };

  const handleCancel = () => {
    setTempHandles(handles);
  };

  return (
    <Card className="rounded-xl bg-white dark:bg-slate-800/50 shadow-sm transition-all hover:shadow-md border-slate-200 dark:border-slate-700">
      <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-100">
          {icon}
          <h3 className="text-base font-semibold tracking-tight">
            Latest Videos
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
          <DialogContent className="rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                YouTube Preferences
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="handles" className="text-slate-700 dark:text-slate-300">
                  Add Channel Handle
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="handles"
                    value={newHandleInput}
                    onChange={(e) => setNewHandleInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    className="rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:border-red-500 focus:ring-red-500"
                    placeholder="@channelhandle"
                  />
                  <Button onClick={handleAddHandle} className="rounded-md bg-red-600 text-white hover:bg-red-700">Add</Button>
                </div>
              </div>

              {tempHandles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">
                    Followed Channels
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {tempHandles.map(handle => (
                      <div key={handle} className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full px-3 py-1 text-sm">
                        <span>{handle}</span>
                        <button onClick={() => handleRemoveHandle(handle)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
                          <X size={14}/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  onClick={handleSave}
                  className="rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Save Changes
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-2">
        {/* The rest of the component (loading, error, video list) remains identical */}
        {isLoading && (
          <div className="space-y-3 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-16 w-24 rounded-md flex-shrink-0 bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-2">
            <Alert variant="destructive" className="text-sm rounded-lg">
              <AlertTitle className="font-semibold">Error</AlertTitle>
              <AlertDescription>
                Could not load videos. Check the channel handles.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="space-y-1">
          {!isLoading &&
            !error &&
            Array.isArray(videos) &&
            videos.length > 0 &&
            videos.slice(0, 3).map((video) => (
              <a
                href={video.link}
                key={video.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                {video.enclosure?.url && (
                  <Image
                    src={video.enclosure.url}
                    alt={video.title}
                    width={120}
                    height={68}
                    className="rounded-md object-cover w-28 flex-shrink-0 shadow-sm transition-transform"
                  />
                )}
                <div>
                  <h4 className="text-sm font-semibold leading-snug text-slate-800 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400">
                    {decodeHtmlEntities(video.title)}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {video.author}
                  </p>
                </div>
              </a>
            ))}
        </div>

        {!isLoading &&
          !error &&
          (!Array.isArray(videos) || videos.length === 0) && (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              <Video className="mx-auto h-12 w-12 mb-3 text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No new videos</p>
              <p className="text-sm">Channels are quiet right now.</p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}