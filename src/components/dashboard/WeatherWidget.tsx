// components/dashboard/WeatherWidget.tsx
"use client";
import { useState, ReactNode } from 'react';
import useSWR from 'swr';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Cloud, CloudDrizzle, CloudRain, CloudSnow, Sun, Wind, Zap, CloudSun } from 'lucide-react';

// ✅ CONTRAT N°3 : On importe le "contrat" (WeatherData) depuis notre route API
// pour que le Widget sache exactement quelles données il va recevoir.
import type { WeatherData } from '@/app/api/weather/route';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const WeatherIcon = ({ iconCode, className }: { iconCode: string, className?: string }) => {
    const iconMap: { [key: string]: ReactNode } = {
        '01d': <Sun className={className} />, '01n': <Sun className={className} />,
        '02d': <CloudSun className={className} />, '02n': <CloudSun className={className} />,
        '03d': <Cloud className={className} />, '03n': <Cloud className={className} />,
        '04d': <Cloud className={className} />, '04n': <Cloud className={className} />,
        '09d': <CloudDrizzle className={className} />, '09n': <CloudDrizzle className={className} />,
        '10d': <CloudRain className={className} />, '10n': <CloudRain className={className} />,
        '11d': <Zap className={className} />, '11n': <Zap className={className} />,
        '13d': <CloudSnow className={className} />, '13n': <CloudSnow className={className} />,
        '50d': <Wind className={className} />, '50n': <Wind className={className} />,
    };
    return iconMap[iconCode] || <Sun className={className} />;
};

export function WeatherWidget({ icon }: { icon?: ReactNode }) {
    const [city, setCity] = useLocalStorage('weather-city', 'Paris');
    const [tempCity, setTempCity] = useState(city);

    // ✅ CONTRAT N°4 : On dit à SWR d'utiliser notre contrat WeatherData. Fini les 'any' !
    const { data, error, isLoading } = useSWR<WeatherData>(city ? `/api/weather?city=${city}` : null, fetcher, {
      refreshInterval: 600000 
    });

    const handleSave = () => setCity(tempCity);

    const renderContent = () => {
        if (isLoading) return <Skeleton className="h-40 w-full" />;
        // `data` peut aussi contenir une propriété `error` si notre API la renvoie.
        if (error || (data && 'error' in data)) return <Alert variant="destructive"><AlertTitle>Erreur</AlertTitle><AlertDescription>{(data as unknown as { error: string })?.error || "Impossible de charger la météo."}</AlertDescription></Alert>;
        if (!data) return <div className="text-center text-sm text-gray-500 py-10">Choisissez une ville.</div>;
        
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-5xl font-bold">{data.current.temp}°C</span>
                        <span className="text-sm text-muted-foreground capitalize">{data.current.description}</span>
                    </div>
                    <WeatherIcon iconCode={data.current.icon} className="w-16 h-16 text-yellow-500" />
                </div>

                <div className="flex justify-around text-center text-sm border-t pt-2">
                    <div><div className="font-bold">{data.current.low}°</div><div className="text-xs text-muted-foreground">Min</div></div>
                    <div><div className="font-bold">{data.current.high}°</div><div className="text-xs text-muted-foreground">Max</div></div>
                </div>

                <div className="space-y-2 pt-2">
                    {/* ✅ Pas de 'any' ici, TypeScript connaît le type de 'day' ! */}
                    {data.forecast.map((day: { day: string; icon: string; high: number; low: number }) => (
                        <div key={day.day} className="flex items-center justify-between text-sm">
                            <span className="font-medium w-1/3">{day.day}</span>
                            <WeatherIcon iconCode={day.icon} className="w-6 h-6 text-gray-500" />
                            <span className="text-right w-1/3"><span className="font-semibold">{day.high}°</span> / {day.low}°</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">{icon}<CardTitle className="text-lg font-semibold text-gray-700">Météo à {city}</CardTitle></div>
                <Dialog>
                    <DialogTrigger asChild><Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Choisir une ville</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4"><Label htmlFor="city">Nom de la ville</Label><Input id="city" value={tempCity} onChange={(e) => setTempCity(e.target.value)} placeholder="Ex: London, Tokyo..." /></div>
                        <DialogFooter><DialogClose asChild><Button onClick={handleSave}>Enregistrer</Button></DialogClose></DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>{renderContent()}</CardContent>
        </Card>
    );
}