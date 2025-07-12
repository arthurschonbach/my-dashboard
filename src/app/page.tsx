// app/page.tsx
import { NewsWidget } from "@/components/dashboard/NewsWidget";
import { HackerNewsWidget } from "@/components/dashboard/HackerNewsWidget";
import { SportsWidget } from "@/components/dashboard/SportsWidget";
import { YouTubeWidget } from "@/components/dashboard/YouTubeWidget";
import { Flame, Globe, Rss, Tv } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Your Personal Dashboard
          </h1>
          <p className="text-lg text-gray-500 mt-1">
            A quick overview of your world. Welcome back!
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <NewsWidget 
            title="World News" 
            topic="world"
            icon={<Globe className="h-6 w-6 text-blue-500" />} 
          />
          <HackerNewsWidget 
            icon={<Flame className="h-6 w-6 text-orange-500" />} 
          />
          <SportsWidget 
            icon={<Rss className="h-6 w-6 text-red-500" />} 
          />
          <YouTubeWidget 
            icon={<Tv className="h-6 w-6 text-purple-500" />} 
          />
        </div>
      </div>
    </main>
  );
}