import { useState, useEffect } from "react";

// NHS-aligned wake windows by age in weeks
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
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
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
      const diff = Date.now() - new Date(lastWakeTime).getTime();
      setElapsedMinutes(diff / 60000);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [lastWakeTime]);

  const progress = Math.min(elapsedMinutes / wakeWindow.maxMinutes, 1);
  const hours = Math.floor(elapsedMinutes / 60);
  const mins = Math.floor(elapsedMinutes % 60);

  // Color: green → amber → red
  let colorClass = "text-success";
  let barColor = "bg-success";
  if (elapsedMinutes > wakeWindow.maxMinutes) {
    colorClass = "text-destructive";
    barColor = "bg-destructive";
  } else if (elapsedMinutes > wakeWindow.minMinutes) {
    colorClass = "text-warning";
    barColor = "bg-warning";
  }

  return (
    <div className="w-full max-w-xs mb-4">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs text-muted-foreground">Awake for</span>
        <span className={`font-mono font-semibold text-sm ${colorClass}`}>
          {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground">{wakeWindow.minMinutes}m</span>
        <span className="text-[10px] text-muted-foreground">{wakeWindow.maxMinutes}m</span>
      </div>
    </div>
  );
};
