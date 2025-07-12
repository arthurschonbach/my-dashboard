// components/dashboard/NewsWidget.tsx
"use client";
import useSWR from "swr";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, Globe } from "lucide-react";
import { ReactNode } from "react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface NewsArticle { url: string; title: string; source: { name: string }; }
interface NewsWidgetProps { title: string; topic?: string; country?: string; icon?: ReactNode; }

export function NewsWidget({ title, topic, country, icon }: NewsWidgetProps) {
  const apiUrl = topic ? `/api/news?topic=${encodeURIComponent(topic)}` : `/api/news?country=${encodeURIComponent(country || "")}`;
  const { data: articles, error, isLoading } = useSWR<NewsArticle[]>(apiUrl, fetcher, { refreshInterval: 900000 });

  return (
    <Card className="rounded-xl border-b-4 border-blue-400 bg-white shadow-lg transition-transform hover:-translate-y-1">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center gap-2 text-blue-600">
          {icon}
          <h3 className="text-base font-bold tracking-tight">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {isLoading && (<div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i}><Skeleton className="h-4 w-full mb-1.5" /><Skeleton className="h-3 w-1/3" /></div>)}</div>)}
        {error && <Alert variant="destructive" className="text-xs"><AlertTitle>Error</AlertTitle><AlertDescription>Could not load news.</AlertDescription></Alert>}
        
        <div className="space-y-0 -mx-2">
          {!isLoading && !error && articles && articles.length > 0 && articles.slice(0, 4).map((article, index) => (
            <a href={article.url} key={article.url || index} target="_blank" rel="noopener noreferrer" className="block group p-2 rounded-lg hover:bg-blue-50">
              <span className="text-sm font-semibold leading-tight text-gray-800 group-hover:text-blue-700">{article.title}</span>
              <div className="flex justify-between items-center"><p className="text-xs text-gray-400 group-hover:text-blue-500">{article.source.name}</p><ExternalLink className="h-3 w-3 text-gray-300 group-hover:text-blue-500" /></div>
            </a>
          ))}
        </div>
        
        {!isLoading && !error && (!articles || articles.length === 0) && (<div className="text-center py-12 text-gray-400"><Globe className="mx-auto h-8 w-8 mb-2" /><p className="text-sm font-medium">No news found.</p></div>)}
      </CardContent>
    </Card>
  );
}