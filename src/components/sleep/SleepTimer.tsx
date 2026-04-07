import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Timer, Pause, Play, X } from "lucide-react";

const TOTAL_SECONDS = 3 * 60 * 60;

export const SleepTimer = () => {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) { setRunning(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, remaining]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const progress = 1 - remaining / TOTAL_SECONDS;

  const handleStart = () => { setStarted(true); setRunning(true); };
  const handleReset = () => { setStarted(false); setRunning(false); setRemaining(TOTAL_SECONDS); };

  if (!started) {
    return (
      <Button variant="outline" className="rounded-2xl gap-2 btn-hover shadow-dreamy" onClick={handleStart}>
        <Timer className="w-4 h-4" />
        Start Sleep Timer (3h)
      </Button>
    );
  }

  return (
    <div className="card-dreamy w-full max-w-xs p-5 rounded-2xl flex flex-col items-center gap-4">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-lg font-semibold">
            {pad(hours)}:{pad(minutes)}:{pad(seconds)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="rounded-xl btn-hover" onClick={() => setRunning(!running)}>
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button size="sm" variant="ghost" className="rounded-xl btn-hover" onClick={handleReset}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {remaining === 0 && (
        <p className="text-xs text-success font-heading font-semibold">Timer complete! 🎉</p>
      )}
    </div>
  );
};
