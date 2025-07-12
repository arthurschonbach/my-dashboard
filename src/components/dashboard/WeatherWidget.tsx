// components/dashboard/WeatherWidget.tsx
"use client";
import { useState, useEffect, ReactNode } from 'react';
import useSWR from 'swr';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, MapPin } from 'lucide-react';
import Image from 'next/image';
import type { WeatherData } from '@/app/api/weather/route';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function WeatherWidget({ icon }: { icon?: ReactNode }) {
    const [city, setCity] = useLocalStorage('weather-city', 'Paris');
    const [tempCity, setTempCity] = useState(city);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const { data, error, isLoading } = useSWR<WeatherData>(isClient && city ? `/api/weather?city=${city}` : null, fetcher, { refreshInterval: 600000 });
    const handleSave = () => setCity(tempCity);

    return (
        <Card className="rounded-xl border-b-4 border-sky-400 bg-white shadow-lg transition-transform hover:-translate-y-1">
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2 text-sky-600">
                    {icon}
                    <h3 className="text-base font-bold tracking-tight">Weather</h3>
                </div>
                <Dialog><DialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-sky-600"><Settings className="h-4 w-4" /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Choose a city</DialogTitle></DialogHeader><div className="grid gap-4 py-4"><Label htmlFor="city">City name</Label><Input id="city" value={tempCity} onChange={(e) => setTempCity(e.target.value)} placeholder="e.g. London" /></div><DialogFooter><DialogClose asChild><Button onClick={handleSave}>Save</Button></DialogClose></DialogFooter></DialogContent></Dialog>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                {(!isClient || isLoading) && <div className="space-y-3"><div className="flex justify-between items-center"><Skeleton className="h-8 w-2/4" /><Skeleton className="h-14 w-24" /></div><Skeleton className="h-16 w-full" /></div>}
                {error && <Alert variant="destructive" className="text-xs"><AlertTitle>Error</AlertTitle><AlertDescription>Could not fetch weather.</AlertDescription></Alert>}
                {isClient && !isLoading && !error && !data && <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400"><MapPin className="h-10 w-10 mb-2" /><p className="text-base font-medium">Set a city</p></div>}
                {data && !error && (
                    <div className="flex flex-col space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="text-lg font-bold text-gray-800">{data.current.description}</h4>
                                <p className="text-sm font-semibold text-sky-600 -mt-1">{city}</p>
                            </div>
                            <div className="flex items-center">
                                <Image src={data.current.iconURL} alt={data.current.description} width={60} height={60} />
                                <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-sky-500 to-sky-700 ml-1">{data.current.temp}°</span>
                            </div>
                        </div>
                        <div className="flex justify-around pt-2 border-t border-gray-100">
                            {data.forecast.map((day, index) => (
                                <div key={index} className="flex flex-col items-center space-y-1 text-xs">
                                    <span className="font-bold text-gray-600">{day.day.substring(0, 3)}</span>
                                    <Image src={day.iconURL} alt="weather icon" width={32} height={32} />
                                    <span className="font-semibold text-gray-800">{day.high}°</span>
                                    <span className="text-gray-400">{day.low}°</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}