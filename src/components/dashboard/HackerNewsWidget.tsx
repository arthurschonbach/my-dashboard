// components/dashboard/HackerNewsWidget.tsx
"use client";
import useSWR from 'swr';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowUp, MessageSquare, Flame, X } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// --- Interfaces ---
interface HackerNewsStory { id: number; url: string; title: string; score: number; descendants: number; }
interface HackerNewsProps { icon?: ReactNode; }
interface Comment { id: number; by: string; text: string; time: number; kids: Comment[]; }

// --- Helper Functions ---
function timeAgo(time: number) {
    const seconds = Math.floor(new Date().getTime() / 1000 - time);
    let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60; if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
}

// --- Recursive Comment Component ---
function CommentItem({ comment }: { comment: Comment }) {
    const [isOpen, setIsOpen] = useState(true);
    if (!comment.text) return null;

    return (
        <div className="ml-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 py-1 first:pt-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-semibold text-slate-600 dark:text-slate-300">{comment.by}</span>
                <span className="mx-1">·</span>
                <span>{timeAgo(comment.time)} ago</span>
                {comment.kids.length > 0 && (
                     <button onClick={() => setIsOpen(!isOpen)} className="ml-2 font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                        [{isOpen ? '−' : `+${comment.kids.length}`}]
                    </button>
                )}
            </div>
            <div className="prose prose-sm text-slate-800 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: comment.text }} />
            {isOpen && comment.kids.length > 0 && (
                <div className="mt-2 space-y-2">{comment.kids.map(kid => <CommentItem key={kid.id} comment={kid} />)}</div>
            )}
        </div>
    );
}

// --- Comments Modal Component ---
function CommentsModal({ story, onClose }: { story: HackerNewsStory; onClose: () => void; }) {
    const { data: comments, error, isLoading } = useSWR<Comment[]>(`/api/hackernews/comments?id=${story.id}`, fetcher);

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl my-8 border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-t-xl z-10">
                    <button onClick={onClose} className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
                        <X className="h-5 w-5 text-slate-600 dark:text-slate-300"/>
                    </button>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 pr-8 leading-tight">{story.title}</h3>
                </div>
                <div className="p-5 max-h-[70vh] overflow-y-auto">
                    {isLoading && <div className="space-y-4">{Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md bg-slate-200 dark:bg-slate-700" />)}</div>}
                    {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Could not load comments.</AlertDescription></Alert>}
                    {comments && comments.length > 0 && <div className="space-y-4">{comments.map(comment => <CommentItem key={comment.id} comment={comment} />)}</div>}
                    {comments && comments.length === 0 && (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                            <MessageSquare className="mx-auto h-12 w-12 mb-3 text-slate-300 dark:text-slate-600" />
                            <p className="font-semibold text-slate-700 dark:text-slate-300">No comments yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

// --- Main HackerNews Widget Component ---
export function HackerNewsWidget({ icon }: HackerNewsProps) {
    const { data, error, isLoading } = useSWR<HackerNewsStory[]>('/api/hackernews', fetcher);
    const [selectedStory, setSelectedStory] = useState<HackerNewsStory | null>(null);

    return (
        <>
            <Card className="rounded-xl bg-white dark:bg-slate-800/50 shadow-sm transition-all hover:shadow-md border-slate-200 dark:border-slate-700">
                <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-100">
                        {icon}
                        <h3 className="text-base font-semibold tracking-tight">Hacker News</h3>
                    </div>
                </CardHeader>
                <CardContent className="p-2">
                    {isLoading && <div className="space-y-2 p-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="py-2"><Skeleton className="h-4 w-full mb-2 rounded bg-slate-200 dark:bg-slate-700" /><Skeleton className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" /></div>)}</div>}
                    {error && <div className="p-2"><Alert variant="destructive" className="text-sm rounded-lg"><AlertTitle className="font-semibold">Error</AlertTitle><AlertDescription>Could not load stories.</AlertDescription></Alert></div>}
                    
                    <div className="space-y-1">
                        {!isLoading && !error && data?.slice(0, 5).map((story) => (
                           <div key={story.id} className="group p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <a href={story.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 leading-snug">{story.title}</a>
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4 mt-1.5">
                                    <span className="flex items-center gap-1 font-semibold text-orange-600 dark:text-orange-400"><ArrowUp className="h-3.5 w-3.5" /> {story.score || 0}</span>
                                    <button onClick={() => setSelectedStory(story)} className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:font-semibold transition-all">
                                        <MessageSquare className="h-3.5 w-3.5" /> {story.descendants || 0}
                                    </button>
                                </div>
                           </div>
                        ))}
                    </div>
                    
                    {!isLoading && !error && !data?.length && <div className="text-center py-10 text-slate-500 dark:text-slate-400"><Flame className="mx-auto h-12 w-12 mb-3 text-slate-300 dark:text-slate-600" /><p className="font-semibold text-slate-700 dark:text-slate-300">No trending stories</p></div>}
                </CardContent>
            </Card>

            {selectedStory && <CommentsModal story={selectedStory} onClose={() => setSelectedStory(null)} />}
        </>
    );
}