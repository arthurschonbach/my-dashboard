// app/page.tsx
import { NewsWidget } from "@/components/dashboard/NewsWidget";
import { HackerNewsWidget } from "@/components/dashboard/HackerNewsWidget";
import { SportsWidget } from "@/components/dashboard/SportsWidget";
import { YouTubeWidget } from "@/components/dashboard/YouTubeWidget";
import { TodoListWidget } from "@/components/dashboard/TodoListWidget";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { Flame, Globe, Rss, Tv, CheckSquare, CloudSun } from "lucide-react";

export default function DashboardPage() {
  return (
    // A more energetic and fun background color
    <main className="p-3 md:p-4 bg-yellow-50/30 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tighter">
            Playground
          </h1>
        </header>
        {/* The grid remains compact, letting the widgets pop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <TodoListWidget icon={<CheckSquare className="h-5 w-5" />} />
          <WeatherWidget icon={<CloudSun className="h-5 w-5" />} />
          <NewsWidget title="World News" country="us" icon={<Globe className="h-5 w-5" />} />
          <HackerNewsWidget icon={<Flame className="h-5 w-5" />} />
          <SportsWidget icon={<Rss className="h-5 w-5" />} />
          <YouTubeWidget icon={<Tv className="h-5 w-5" />} />
        </div>
      </div>
    </main>
  );
}