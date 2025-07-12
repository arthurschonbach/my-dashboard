// components/dashboard/YouTubeWidget.tsx
"use client";
import { useState, ReactNode } from "react";
import useSWR from "swr";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Film } from "lucide-react";
import Image from "next/image";

const decodeHtmlEntities = (text: string) => { if (typeof window === 'undefined') return text; const textarea = document.createElement("textarea"); textarea.innerHTML = text; return textarea.value; };
const fetcher = (url: string) => fetch(url).then((res) => res.json());
const DEFAULT_CHANNELS = "UCsBjURrPoezykLs9EqgamOA,UCIJZA6SJ3JjvuOZgYPYOHnA,UCZ7phf3m2AcPre5ZRpgF5uw,UCflHaa_47QnIfFlKrGG6TIg";
interface YouTubeVideo { id: { videoId: string; }; snippet: { title: string; channelTitle: string; thumbnails: { medium: { url: string; }; }; }; }
interface YouTubeWidgetProps { icon?: ReactNode; }

export function YouTubeWidget({ icon }: YouTubeWidgetProps) {
  const [channels, setChannels] = useLocalStorage("youtube-channels", DEFAULT_CHANNELS);
  const [tempChannels, setTempChannels] = useState(channels);
  const { data: videos, error, isLoading } = useSWR<YouTubeVideo[]>(channels ? `/api/youtube?channels=${channels}` : null, fetcher);
  const handleSave = () => setChannels(tempChannels);

  return (
    <Card className="rounded-xl border-b-4 border-purple-400 bg-white shadow-lg transition-transform hover:-translate-y-1">
      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2 text-purple-600">{icon}<h3 className="text-base font-bold tracking-tight">Latest Videos</h3></div>
        <Dialog><DialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-purple-600"><Settings className="h-4 w-4" /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>YouTube Channels</DialogTitle></DialogHeader><div className="grid gap-4 py-4"><Label htmlFor="channels">Channel IDs</Label><Input id="channels" value={tempChannels} onChange={(e) => setTempChannels(e.target.value)} /><p className="text-xs text-muted-foreground">Find a channel's ID in its page source.</p></div><DialogFooter><DialogClose asChild><Button onClick={handleSave}>Save</Button></DialogClose></DialogFooter></DialogContent></Dialog>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {isLoading && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="flex items-center gap-3"><Skeleton className="h-16 w-24 rounded-lg" /><div className="space-y-2 flex-grow"><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-1/3" /></div></div>)}</div>}
        {error && <Alert variant="destructive" className="text-xs"><AlertTitle>Error</AlertTitle><AlertDescription>Could not load videos.</AlertDescription></Alert>}
        
        <div className="space-y-1 -mx-1">
            {!isLoading && !error && Array.isArray(videos) && videos.length > 0 && videos.slice(0, 3).map(video => (
              <a href={`https://www.youtube.com/watch?v=${video.id.videoId}`} key={video.id.videoId} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group p-1.5 rounded-lg hover:bg-purple-50">
                <Image src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} width={100} height={56} className="rounded-md object-cover w-24 flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow"/>
                <div>
                  <h4 className="text-sm font-semibold leading-tight text-gray-800 group-hover:text-purple-700">{decodeHtmlEntities(video.snippet.title)}</h4>
                  <p className="text-xs text-purple-500">{video.snippet.channelTitle}</p>
                </div>
              </a>
            ))}
        </div>

        {!isLoading && !error && (!Array.isArray(videos) || videos.length === 0) && (<div className="text-center py-12 text-gray-400"><Film className="mx-auto h-8 w-8 mb-2" /><p className="text-sm font-medium">No videos found.</p></div>)}
      </CardContent>
    </Card>
  );
}