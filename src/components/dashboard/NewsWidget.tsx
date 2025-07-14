// components/dashboard/NewstWidget.tsx
"use client";
import useSWR from "swr";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, Zap } from "lucide-react";
import { ReactNode } from "react";
import type { GdeltArticle } from "@/app/api/news/route";

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface GdeltWidgetProps {
  icon?: ReactNode;
}

export function NewsWidget({ icon }: GdeltWidgetProps) {
  const { data: articles, error, isLoading } = useSWR<GdeltArticle[]>('/api/news', fetcher, {
    refreshInterval: 900000 // 15 minutes
  });

  return (
    <Card className="rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
      <CardHeader className="p-4 flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-2.5 text-slate-800">
          {icon}
          <h3 className="text-base font-semibold tracking-tight">Global Events Monitor</h3>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        {isLoading && (
          <div className="space-y-4 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-full mb-1.5 rounded" />
                <Skeleton className="h-3 w-1/4 rounded" />
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="p-2">
            <Alert variant="destructive" className="text-sm rounded-lg">
              <AlertTitle className="font-semibold">Fetch Error</AlertTitle>
              <AlertDescription>Could not load the GDELT feed.</AlertDescription>
            </Alert>
          </div>
        )}
        
        <div className="space-y-1">
          {!isLoading && !error && articles && articles.length > 0 && articles.slice(0, 4).map((article) => (
            <a
              href={article.url}
              key={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-medium leading-snug text-slate-800 group-hover:text-indigo-600">
                {article.title}
              </span>
              <div className="flex justify-between items-center mt-1.5">
                <p className="text-xs text-slate-500 font-semibold uppercase">
                  {article.domain}
                </p>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
            </a>
          ))}
        </div>
        
        {!isLoading && !error && (!articles || articles.length === 0) && (
          <div className="text-center py-10 text-slate-500">
            <Zap className="mx-auto h-12 w-12 mb-3 text-slate-300" />
            <p className="font-semibold text-slate-700">All quiet</p>
            <p className="text-sm">No major global events detected right now.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}