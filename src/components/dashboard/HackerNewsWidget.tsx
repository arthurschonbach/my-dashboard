// components/dashboard/HackerNewsWidget.tsx
"use client";
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowBigUp, MessageSquare, Flame } from 'lucide-react';
import { ReactNode } from 'react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface HackerNewsProps {
  icon?: ReactNode;
}

export function HackerNewsWidget({ icon }: HackerNewsProps) {
    const { data, error, isLoading } = useSWR('/api/hackernews', fetcher);

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center gap-3">
                {icon}
                <CardTitle className="text-lg font-semibold text-gray-700">Hacker News</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Could not load stories.</AlertDescription></Alert>}
                {data?.slice(0, 4).map((story: any, index: number) => (
                    <div key={story.id} className="p-2 rounded-lg hover:bg-gray-100">
                       <a href={story.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-800 hover:text-orange-600">
                            {story.title}
                        </a>
                        <div className="text-xs text-gray-500 flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1.5 font-medium"><ArrowBigUp className="h-4 w-4 text-orange-500" /> {story.score}</span>
                            <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-gray-400" /> {story.descendants || 0}</span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}