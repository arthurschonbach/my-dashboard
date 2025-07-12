// components/dashboard/YouTubeWidget.tsx
"use client";
import { useState, ReactNode } from "react";
import useSWR from "swr";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Film } from "lucide-react";
import Image from "next/image";

const decodeHtmlEntities = (text: string) => {
  if (typeof window === 'undefined') {
    return text;
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_CHANNELS = "UCVap-b1wWkKT6g7cr15T9og"; // FRANCE 24

// ✅ DÉFINITION DU MODÈLE POUR UNE VIDÉO YOUTUBE
interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      medium: {
        url: string;
        width: number;
        height: number;
      };
    };
  };
}

interface YouTubeWidgetProps {
  icon?: ReactNode;
}

export function YouTubeWidget({ icon }: YouTubeWidgetProps) {
  const [channels, setChannels] = useLocalStorage("youtube-channels", DEFAULT_CHANNELS);
  const [tempChannels, setTempChannels] = useState(channels);

  const { data: videos, error, isLoading } = useSWR<YouTubeVideo[]>(
    channels ? `/api/youtube?channels=${channels}` : null,
    fetcher,
    { refreshInterval: 3600000 }
  );

  const handleSave = () => setChannels(tempChannels);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }
    if (error) {
      return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Could not load videos.</AlertDescription></Alert>;
    }
    if (!videos || videos.length === 0) {
      return (
        <div className="text-center text-sm text-muted-foreground py-10">
          <Film className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          No recent videos found.
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-3">
        {/* ✅ Utilisation du modèle "YouTubeVideo" au lieu de "any" */}
        {videos.slice(0, 4).map((video: YouTubeVideo) => (
          <a
            href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
            key={video.id.videoId}
            target="_blank"
            rel="noopener noreferrer"
            className="group space-y-2"
          >
            <div className="aspect-video w-full overflow-hidden rounded-lg border shadow-sm">
                <Image
                    src={video.snippet.thumbnails.medium.url}
                    alt={decodeHtmlEntities(video.snippet.title)}
                    width={video.snippet.thumbnails.medium.width}
                    height={video.snippet.thumbnails.medium.height}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <h4 className="font-semibold text-xs text-gray-700 group-hover:text-purple-600">
              {decodeHtmlEntities(video.snippet.title)}
            </h4>
          </a>
        ))}
      </div>
    );
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 md:col-span-2 xl:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
                {icon}
                <CardTitle className="text-lg font-semibold text-gray-700">Latest Videos</CardTitle>
            </div>
            <Dialog>
                <DialogTrigger asChild><Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit YouTube Channels</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="channels">Channel IDs (comma-separated)</Label>
                        <Input id="channels" value={tempChannels} onChange={(e) => setTempChannels(e.target.value)} />
                        {/* ✅ Correction des caractères spéciaux */}
                        <p className="text-xs text-muted-foreground">Find a channel&apos;s ID in its page source (search for &quot;channelId&quot;).</p>
                    </div>
                    <DialogFooter><DialogClose asChild><Button onClick={handleSave}>Save</Button></DialogClose></DialogFooter>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}