import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

interface SleepButtonProps {
  isSleeping: boolean;
  sleepStart?: string | null;
  onToggle: () => void;
}

export const SleepButton = ({ isSleeping, sleepStart, onToggle }: SleepButtonProps) => {
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    if (!isSleeping || !sleepStart) return;
    const update = () => {
      const diff = Date.now() - new Date(sleepStart).getTime();
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setElapsed(hours > 0 ? `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : `${mins}:${String(secs).padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isSleeping, sleepStart]);

  return (
    <div className="flex flex-col items-center my-8">
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.95 }}
        className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
          isSleeping
            ? "bg-warning/20 glow-amber animate-glow-pulse"
            : "bg-primary/20 glow-lavender animate-pulse-soft"
        }`}
      >
        <motion.div
          className={`w-24 h-24 rounded-full flex flex-col items-center justify-center ${
            isSleeping ? "bg-warning text-warning-foreground" : "bg-primary text-primary-foreground"
          }`}
          layout
        >
          {isSleeping ? (
            <>
              <Moon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Sleeping</span>
            </>
          ) : (
            <>
              <Sun className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Awake</span>
            </>
          )}
        </motion.div>
      </motion.button>

      {isSleeping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <p className="text-3xl font-mono font-semibold text-warning">{elapsed}</p>
          <p className="text-xs text-muted-foreground mt-1">Tap to wake</p>
        </motion.div>
      )}

      {!isSleeping && (
        <p className="mt-4 text-xs text-muted-foreground">Tap to start sleep</p>
      )}
    </div>
  );
};
