// components/dashboard/WeatherWidget.tsx
"use client";
import { useState, useEffect, ReactNode } from "react";
import useSWR from "swr";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Compass, Wind, Droplets, Umbrella } from "lucide-react";
import Image from "next/image";
import type { WeatherData } from "@/app/api/weather/route";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function WeatherWidget({ icon }: { icon?: ReactNode }) {
  const [city, setCity] = useLocalStorage("weather-city", "Paris");
  const [tempCity, setTempCity] = useState(city);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, error, isLoading } = useSWR<WeatherData>(
    isClient && city ? `/api/weather?city=${city}` : null,
    fetcher,
    { refreshInterval: 600000 }
  );
  const handleSave = () => setCity(tempCity);

  return (
    <Card className="rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
      <CardHeader className="p-4 flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-2.5 text-slate-800">
          {icon}
          <h3 className="text-base font-semibold tracking-tight">Weather</h3>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-xl bg-slate-50">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-800">
                Weather Settings
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="city" className="text-slate-700">
                City Name
              </Label>
              <Input
                id="city"
                value={tempCity}
                onChange={(e) => setTempCity(e.target.value)}
                placeholder="e.g. London"
                className="rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  onClick={handleSave}
                  className="rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save Changes
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-4">
        {/* Skeleton, Error, and Empty states remain unchanged */}
        {(!isClient || isLoading) && <div className="space-y-4">{/*...*/}</div>}
        {error && <Alert variant="destructive">{/*...*/}</Alert>}
        {isClient && !isLoading && !error && !data && <div className="flex flex-col items-center">{/*...*/}</div>}

        {data && !error && (
          <div className="flex flex-col space-y-4">
            {/* === REVISED: MAIN WEATHER DISPLAY === */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <p className="text-2xl font-bold text-slate-800 capitalize tracking-tight">
                  {city}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-500">{data.current.description}</span>
                  <span className="mx-2">|</span>
                  <span className="font-semibold">{data.current.high}°</span>
                  <span className="text-slate-400 ml-2">{data.current.low}°</span>
                </p>
              </div>
              <div className="flex items-center -mt-2">
                <Image
                  src={data.current.iconURL}
                  alt={data.current.description}
                  width={64}
                  height={64}
                  className="drop-shadow-lg"
                  priority
                />
                <span className="text-5xl font-bold text-slate-800 tracking-tighter">
                  {data.current.temp}°
                </span>
              </div>
            </div>

            {/* === REVISED: UNIFIED OUTLOOK SECTION === */}
            <div className="space-y-4 pt-4 border-t border-slate-200/80">
              {/* Today's Details */}
              <div className="flex justify-between items-center text-center">
                <div className="flex items-center gap-2 text-sm text-slate-600" title="Chance of Rain">
                  <Umbrella className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">
                    {data.current.chanceOfRain}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600" title="Wind Speed">
                  <Wind className="h-5 w-5 text-slate-500" />
                  <span className="font-semibold">{data.current.wind} kph</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600" title="Humidity">
                  <Droplets className="h-5 w-5 text-sky-500" />
                  <span className="font-semibold">{data.current.humidity}%</span>
                </div>
              </div>

              {/* Forecast */}
              <div className="flex justify-around">
                {data.forecast.map((day, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center space-y-1.5 text-xs p-1 w-16"
                  >
                    <span className="font-bold text-slate-600">
                      {day.day.substring(0, 3)}
                    </span>
                    <Image
                      src={day.iconURL}
                      alt="weather icon"
                      width={40}
                      height={40}
                      className="drop-shadow-sm"
                    />
                    <div className="font-semibold">
                      <span className="text-slate-800">{day.high}°</span>{" "}
                      <span className="text-slate-400">{day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
