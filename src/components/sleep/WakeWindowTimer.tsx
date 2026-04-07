import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const WAKE_WINDOWS: { maxWeeks: number; minMinutes: number; maxMinutes: number }[] = [
  { maxWeeks: 8, minMinutes: 45, maxMinutes: 75 },
  { maxWeeks: 12, minMinutes: 60, maxMinutes: 90 },
  { maxWeeks: 16, minMinutes: 75, maxMinutes: 120 },
  { maxWeeks: 24, minMinutes: 90, maxMinutes: 150 },
  { maxWeeks: 36, minMinutes: 120, maxMinutes: 180 },
  { maxWeeks: 52, minMinutes: 150, maxMinutes: 240 },
  { maxWeeks: 78, minMinutes: 180, maxMinutes: 300 },
  { maxWeeks: 999, minMinutes: 240, maxMinutes: 360 },
];

function getAgeWeeks(dob: string) {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (7 * 24 * 60 * 60 * 1000));
}

function getWakeWindow(dob: string) {
  const weeks = getAgeWeeks(dob);
  return WAKE_WINDOWS.find((w) => weeks < w.maxWeeks) || WAKE_WINDOWS[WAKE_WINDOWS.length - 1];
}

interface WakeWindowTimerProps {
  lastWakeTime: string;
  dob: string;
}

export const WakeWindowTimer = ({ lastWakeTime, dob }: WakeWindowTimerProps) => {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const wakeWindow = getWakeWindow(dob);

  useEffect(() => {
    const update = () => {
      setElapsedMinutes((Date.now() - new Date(lastWakeTime).getTime()) / 60000);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [lastWakeTime]);

  const progress = Math.min(elapsedMinutes / wakeWindow.maxMinutes, 1);
  const hours = Math.floor(elapsedMinutes / 60);
  const mins = Math.floor(elapsedMinutes % 60);

  const getBarColor = () => {
    if (elapsedMinutes > wakeWindow.maxMinutes) return "bg-coral";
    if (elapsedMinutes > wakeWindow.minMinutes) return "bg-warning";
    return "bg-success";
  };

  const getTextColor = () => {
    if (elapsedMinutes > wakeWindow.maxMinutes) return "text-coral";
    if (elapsedMinutes > wakeWindow.minMinutes) return "text-warning";
    return "text-success";
  };

  return (
    <div className="w-full max-w-xs mb-4 card-dreamy p-4 rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">Awake for</span>
        </div>
        <span className={`font-mono font-semibold text-sm ${getTextColor()}`}>
          {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
        </span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-muted-foreground">{wakeWindow.minMinutes}m sweet spot</span>
        <span className="text-[10px] text-muted-foreground">{wakeWindow.maxMinutes}m max</span>
      </div>
    </div>
  );
};
