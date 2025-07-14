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
import { Settings, Video } from "lucide-react";
import Image from "next/image";

const decodeHtmlEntities = (text: string) => { if (typeof window === 'undefined') return text; const textarea = document.createElement("textarea"); textarea.innerHTML = text; return textarea.value; };
const fetcher = (url: string) => fetch(url).then((res) => res.json());
const DEFAULT_CHANNELS = "UCsBjURrPoezykLs9EqgamOA,UCZ7phf3m2AcPre5ZRpgF5uw,UCflHaa_47QnIfFlKrGG6TIg";
interface YouTubeVideo { id: { videoId: string; }; snippet: { title: string; channelTitle: string; thumbnails: { medium: { url: string; }; }; }; }
interface YouTubeWidgetProps { icon?: ReactNode; }

export function YouTubeWidget({ icon }: YouTubeWidgetProps) {
  const [channels, setChannels] = useLocalStorage("youtube-channels", DEFAULT_CHANNELS);
  const [tempChannels, setTempChannels] = useState(channels);
  const { data: videos, error, isLoading } = useSWR<YouTubeVideo[]>(channels ? `/api/youtube?channels=${channels}` : null, fetcher);
  const handleSave = () => setChannels(tempChannels);

  return (
    <Card className="rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
        <CardHeader className="p-4 flex flex-row items-center justify-between border-b">
            <div className="flex items-center gap-2.5 text-slate-800">{icon}<h3 className="text-base font-semibold tracking-tight">Latest Videos</h3></div>
            <Dialog>
                <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full"><Settings className="h-4 w-4" /></Button></DialogTrigger>
                <DialogContent className="rounded-xl bg-slate-50">
                    <DialogHeader><DialogTitle className="text-lg font-semibold text-slate-800">YouTube Preferences</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="channels" className="text-slate-700">Channel IDs (comma-separated)</Label>
                        <Input id="channels" value={tempChannels} onChange={(e) => setTempChannels(e.target.value)} className="rounded-md border-slate-300 focus:border-red-500 focus:ring-red-500" />
                        <p className="text-xs text-slate-500">Find a channel's ID in its page URL (it starts with 'UC...').</p>
                    </div>
                    <DialogFooter><DialogClose asChild><Button onClick={handleSave} className="rounded-md bg-red-600 text-white hover:bg-red-700">Save Changes</Button></DialogClose></DialogFooter>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent className="p-2">
            {isLoading && <div className="space-y-3 p-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="flex items-center gap-3"><Skeleton className="h-16 w-24 rounded-md flex-shrink-0" /><div className="space-y-2 flex-grow"><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-1/3" /></div></div>)}</div>}
            {error && <div className="p-2"><Alert variant="destructive" className="text-sm rounded-lg"><AlertTitle className="font-semibold">Error</AlertTitle><AlertDescription>Could not load videos. Check channel IDs.</AlertDescription></Alert></div>}
            
            <div className="space-y-1">
                {!isLoading && !error && Array.isArray(videos) && videos.length > 0 && videos.slice(0, 3).map(video => (
                <a href={`https://www.youtube.com/watch?v=${video.id.videoId}`} key={video.id.videoId} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <Image src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} width={120} height={68} className="rounded-md object-cover w-28 flex-shrink-0 shadow-sm transition-transform"/>
                    <div>
                    <h4 className="text-sm font-semibold leading-snug text-slate-800 group-hover:text-red-600">{decodeHtmlEntities(video.snippet.title)}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">{video.snippet.channelTitle}</p>
                    </div>
                </a>
                ))}
            </div>

            {!isLoading && !error && (!Array.isArray(videos) || videos.length === 0) && (<div className="text-center py-10 text-slate-500"><Video className="mx-auto h-12 w-12 mb-3 text-slate-300" /><p className="font-semibold text-slate-700">No new videos</p><p className="text-sm">Channels are quiet right now.</p></div>)}
        </CardContent>
    </Card>
  );
}