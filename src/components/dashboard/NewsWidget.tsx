// components/dashboard/NewsWidget.tsx
"use client";
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, AlertCircle } from 'lucide-react';
import { ReactNode } from 'react';

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('An error occurred while fetching the data.');
    return res.json();
});

// ✅ DÉFINITION DU MODÈLE POUR UN ARTICLE
interface NewsArticle {
    url: string;
    title: string;
    source: {
        name: string;
    };
}

interface NewsWidgetProps {
    title: string;
    topic?: string;
    country?: string;
    icon?: ReactNode;
}

export function NewsWidget({ title, topic, country, icon }: NewsWidgetProps) {
    const apiUrl = topic 
        ? `/api/news?topic=${encodeURIComponent(topic)}`
        : `/api/news?country=${encodeURIComponent(country || '')}`;

    const { data: articles, error, isLoading } = useSWR<NewsArticle[]>(apiUrl, fetcher, {
        refreshInterval: 900000,
    });

    const renderContent = () => {
        if (isLoading) {
            return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
        }

        if (error) {
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Could not load feed.</AlertDescription>
                </Alert>
            );
        }

        if (!articles || articles.length === 0) {
            return <div className="text-center text-sm text-muted-foreground py-10">No news items found.</div>;
        }
        
        // ✅ Utilisation du modèle "NewsArticle" au lieu de "any"
        return articles.slice(0, 4).map((article: NewsArticle, index: number) => (
            <a href={article.url} key={article.url || index} target="_blank" rel="noopener noreferrer" className="group block p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-start gap-3">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600">{article.title}</span>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-1 transition-colors" />
                </div>
                <p className="text-xs text-gray-500 mt-1">{article.source.name}</p>
            </a>
        ));
    };

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    {icon}
                    <CardTitle className="text-lg font-semibold text-gray-700">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {renderContent()}
            </CardContent>
        </Card>
    );
}