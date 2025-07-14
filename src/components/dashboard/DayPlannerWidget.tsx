// components/dashboard/DayPlannerWidget.tsx
"use client";
import { useState, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, CalendarPlus, ArrowUpDown, Plus, Clock } from "lucide-react";

// --- REDESIGNED TIME PICKER MODAL ---
interface TimePickerProps {
  currentSlot: string;
  onTimeSelect: (newTime: string) => void;
  onClose: () => void;
}

function TimePickerModal({
  currentSlot,
  onTimeSelect,
  onClose,
}: TimePickerProps) {
  const [selectedHour, setSelectedHour] = useState<string | null>(
    currentSlot.split(":")[0]
  );

  const handleMinuteSelect = (minute: string) => {
    if (selectedHour) {
      onTimeSelect(`${selectedHour}:${minute}`);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = ["00", "15", "30", "45"];

  return createPortal(
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-xs rounded-xl shadow-lg p-5 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-center text-slate-900 mb-4">
          Select Time
        </h3>
        
        <h4 className="font-semibold text-center text-slate-500 mb-2 text-xs uppercase tracking-wider">
          Hour
        </h4>
        <div className="grid grid-cols-6 gap-1.5 mb-5">
          {hours.map((hour) => (
            <Button
              key={hour}
              size="sm"
              variant={selectedHour === hour ? "default" : "outline"}
              onClick={() => setSelectedHour(hour)}
              className={`rounded-md h-9 w-9 transition-all text-sm font-bold ${
                selectedHour === hour
                  ? "bg-amber-500 text-white hover:bg-amber-600 ring-2 ring-offset-2 ring-offset-white ring-amber-400"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {hour}
            </Button>
          ))}
        </div>
        
        <h4 className="font-semibold text-center text-slate-500 mb-2 text-xs uppercase tracking-wider">
          Minute
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {minutes.map((minute) => (
            <Button
              key={minute}
              size="sm"
              variant="outline"
              className="border-slate-200 hover:bg-amber-500 hover:text-white font-semibold text-slate-800 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              disabled={!selectedHour}
              onClick={() => handleMinuteSelect(minute)}
            >
              :{minute}
            </Button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}


// --- MAIN WIDGET COMPONENT (Unchanged) ---
interface DayPlannerWidgetProps {
  icon?: ReactNode;
}
type Plan = Record<string, string>;
const DEFAULT_HOURS = Array.from(
  { length: 5 },
  (_, i) => `${(i + 9).toString().padStart(2, "0")}:00`
);

export function DayPlannerWidget({ icon }: DayPlannerWidgetProps) {
  const [plan, setPlan] = useLocalStorage<Plan>("day-planner-data", {});
  const [timeSlots, setTimeSlots] = useLocalStorage<string[]>(
    "day-planner-slots",
    DEFAULT_HOURS
  );
  const [isClient, setIsClient] = useState(false);
  const [pickerOpenForSlot, setPickerOpenForSlot] = useState<string | null>(
    null
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePlanChange = (hour: string, task: string) =>
    setPlan((p) => ({ ...p, [hour]: task }));
  const handleSlotUpdate = (oldSlot: string, newSlot: string) => {
    if (timeSlots.includes(newSlot) && newSlot !== oldSlot) {
      setPickerOpenForSlot(null);
      return;
    }
    const newSlots = timeSlots.map((s) => (s === oldSlot ? newSlot : s));
    setTimeSlots(newSlots);
    if (oldSlot !== newSlot) {
      const newPlan = { ...plan };
      if (newPlan[oldSlot]) {
        newPlan[newSlot] = newPlan[oldSlot];
        delete newPlan[oldSlot];
      }
      setPlan(newPlan);
    }
    setPickerOpenForSlot(null);
  };
  const handleAddNewSlot = () => {
    const last = timeSlots[timeSlots.length - 1] || "08:00";
    const [h] = last.split(":").map(Number);
    const newSlot = `${(h + 1).toString().padStart(2, "0")}:00`;
    if (!timeSlots.includes(newSlot)) setTimeSlots([...timeSlots, newSlot]);
  };
  const handleRemoveSlot = (slot: string) => {
    setTimeSlots(timeSlots.filter((s) => s !== slot));
    const newPlan = { ...plan };
    delete newPlan[slot];
    setPlan(newPlan);
  };
  const handleSortSlots = () =>
    setTimeSlots(
      [...timeSlots].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      )
    );

  return (
    <>
      <Card className="rounded-xl bg-white shadow-sm transition-all hover:shadow-md flex flex-col">
        <CardHeader className="p-4 flex flex-row items-center justify-between border-b">
          <div className="flex items-center gap-2.5 text-slate-800">
            {icon}
            <h3 className="text-base font-semibold tracking-tight">
              Day Planner
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full"
            onClick={handleSortSlots}
            aria-label="Sort time slots"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-2 flex-grow flex flex-col">
          <div className="space-y-1 flex-grow max-h-[18rem] overflow-y-auto pr-1">
            {!isClient && (
              <div className="space-y-2 p-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-full rounded-md" />
                  </div>
                ))}
              </div>
            )}

            {isClient &&
              timeSlots.length > 0 &&
              timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="flex items-center gap-1 group rounded-lg hover:bg-amber-50/50"
                >
                  <Button
                    variant="ghost"
                    onClick={() => setPickerOpenForSlot(hour)}
                    className="font-mono text-sm w-24 justify-start gap-1.5 text-amber-800 hover:text-amber-900"
                  >
                    <Clock className="h-4 w-4 text-amber-600/70" /> {hour}
                  </Button>
                  <Input
                    type="text"
                    placeholder="Plan your hour..."
                    value={plan[hour] || ""}
                    onChange={(e) => handlePlanChange(hour, e.target.value)}
                    className="h-8 text-sm font-medium border-none shadow-none bg-transparent focus-visible:ring-1 focus-visible:ring-amber-400 focus:bg-white transition-all rounded-md"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => handleRemoveSlot(hour)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                  </Button>
                </div>
              ))}
            {isClient && timeSlots.length === 0 && (
              <div className="text-center py-10 text-slate-500 flex flex-col items-center justify-center h-full">
                <CalendarPlus className="h-12 w-12 mb-3 text-slate-300" />
                <p className="font-semibold text-slate-700">An empty canvas</p>
                <p className="text-sm">Add a time slot to start planning.</p>
              </div>
            )}
          </div>
          {isClient && (
            <Button
              variant="outline"
              onClick={handleAddNewSlot}
              className="mt-2 w-full border-dashed border-2 hover:border-solid hover:bg-slate-50 hover:text-slate-800 border-slate-300 text-slate-500 font-medium rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Time Slot
            </Button>
          )}
        </CardContent>
      </Card>

      {isClient && pickerOpenForSlot && (
        <TimePickerModal
          currentSlot={pickerOpenForSlot}
          onTimeSelect={(newTime) =>
            handleSlotUpdate(pickerOpenForSlot, newTime)
          }
          onClose={() => setPickerOpenForSlot(null)}
        />
      )}
    </>
  );
}