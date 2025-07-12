// components/dashboard/HackerNewsWidget.tsx
"use client";
import useSWR from 'swr';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowBigUp, MessageSquare, Flame } from 'lucide-react';
import { ReactNode } from 'react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface HackerNewsStory { id: number; url: string; title: string; score: number; descendants: number; }
interface HackerNewsProps { icon?: ReactNode; }

export function HackerNewsWidget({ icon }: HackerNewsProps) {
    const { data, error, isLoading } = useSWR<HackerNewsStory[]>('/api/hackernews', fetcher);

    return (
        <Card className="rounded-xl border-b-4 border-orange-400 bg-white shadow-lg transition-transform hover:-translate-y-1">
            <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2 text-orange-600">
                    {icon}
                    <h3 className="text-base font-bold tracking-tight">Hacker News</h3>
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                {isLoading && (<div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i}><Skeleton className="h-4 w-full mb-1.5" /><Skeleton className="h-3 w-1/2" /></div>)}</div>)}
                {error && <Alert variant="destructive" className="text-xs"><AlertTitle>Error</AlertTitle><AlertDescription>Could not load stories.</AlertDescription></Alert>}

                <div className="space-y-0 -mx-2">
                    {!isLoading && !error && data && data.length > 0 && data.slice(0, 5).map((story) => (
                        <a href={story.url} target="_blank" rel="noopener noreferrer" key={story.id} className="block group p-2 rounded-lg hover:bg-orange-50">
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-700 leading-tight mb-1">{story.title}</p>
                            <div className="text-xs text-gray-500 flex items-center gap-4">
                                <span className="flex items-center gap-1 font-bold text-orange-500"><ArrowBigUp className="h-3.5 w-3.5" /> {story.score}</span>
                                <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {story.descendants || 0}</span>
                            </div>
                        </a>
                    ))}
                </div>
                
                {!isLoading && !error && (!data || data.length === 0) && (<div className="text-center py-12 text-gray-400"><Flame className="mx-auto h-8 w-8 mb-2" /><p className="text-sm font-medium">No stories found.</p></div>)}
            </CardContent>
        </Card>
    );
}