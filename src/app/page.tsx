// app/page.tsx
import { NewsWidget } from "@/components/dashboard/NewsWidget";
import { HackerNewsWidget } from "@/components/dashboard/HackerNewsWidget";
import { SportsWidget } from "@/components/dashboard/SportsWidget";
import { YouTubeWidget } from "@/components/dashboard/YouTubeWidget";
import { TodoListWidget } from "@/components/dashboard/TodoListWidget";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { DayPlannerWidget } from "@/components/dashboard/DayPlannerWidget";
import { ThemeToggleButton } from "@/components/dashboard/ThemeToggleButton";
import { CurrentDate } from "@/components/dashboard/CurrentDate";
import {
  Flame,
  Globe,
  Rss,
  Tv,
  CheckSquare,
  CloudSun,
  CalendarClock,
} from "lucide-react";

export default function DashboardPage() {
  return (
    // Add dark mode background for the main element
    <main className="bg-slate-100 dark:bg-slate-900 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header
          className="p-6 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-lg sticky top-0 z-10 
               border-b border-slate-200 dark:border-slate-800 
               flex justify-between items-center"
        >
          <CurrentDate />
          <ThemeToggleButton />
        </header>

        {/* Masonry/Auto-fit Layout */}
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min">
            <DayPlannerWidget icon={<CalendarClock className="h-5 w-5" />} />
            <TodoListWidget icon={<CheckSquare className="h-5 w-5" />} />
            <WeatherWidget icon={<CloudSun className="h-5 w-5" />} />
            <SportsWidget icon={<Rss className="h-5 w-5" />} />
            <HackerNewsWidget icon={<Flame className="h-5 w-5" />} />
            <NewsWidget icon={<Globe className="h-5 w-5" />} />
            <YouTubeWidget icon={<Tv className="h-5 w-5" />} />
          </div>
        </div>
      </div>
    </main>
  );
}