// components/dashboard/ThemeToggleButton.tsx
"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      // Add dark mode styles here
      className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10
                 bg-white text-slate-700
                 dark:bg-slate-800 dark:text-slate-300
                 hover:bg-slate-100 dark:hover:bg-slate-700"
    >
      {/* Sun icon is visible in light mode */}
      <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      {/* Moon icon is visible in dark mode */}
      <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}