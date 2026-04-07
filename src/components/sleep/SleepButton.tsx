import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { FloatingZzz } from "@/components/decorative/MoonStars";

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
    <div className="flex flex-col items-center my-8 relative">
      {isSleeping && (
        <div className="absolute -top-6 right-4">
          <FloatingZzz />
        </div>
      )}

      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.93 }}
        className={`relative w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 btn-hover ${
          isSleeping
            ? "bg-gradient-to-br from-night to-nap glow-night"
            : "bg-gradient-to-br from-primary to-primary/70 glow-primary"
        }`}
      >
        {isSleeping ? (
          <>
            <Moon className="w-10 h-10 text-white mb-1" />
            <span className="text-xs font-heading font-semibold text-white/90">Sleeping</span>
          </>
        ) : (
          <>
            <Sun className="w-10 h-10 text-white mb-1" />
            <span className="text-xs font-heading font-semibold text-white/90">Awake</span>
          </>
        )}
      </motion.button>

      {isSleeping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <p className="text-3xl font-mono font-semibold text-night">{elapsed}</p>
          <p className="text-xs text-muted-foreground mt-1">Tap to wake</p>
        </motion.div>
      )}

      {!isSleeping && (
        <p className="mt-4 text-xs text-muted-foreground">Tap to start sleep</p>
      )}
    </div>
  );
};
