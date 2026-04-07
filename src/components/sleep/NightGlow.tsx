import { useState, useEffect, useRef, useCallback } from "react";
import { Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const THIRTY_MINUTES = 30 * 60 * 1000;

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);

export const NightGlow = () => {
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const deactivate = useCallback(() => {
    setActive(false);
    const root = document.getElementById("root");
    if (root) root.style.filter = "";
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const activate = useCallback(() => {
    setActive(true);
    const root = document.getElementById("root");
    if (root) root.style.filter = "brightness(0.4) saturate(0.2)";

    // iOS hint — show once
    if (isIOS() && !localStorage.getItem("nightglow_ios_shown")) {
      localStorage.setItem("nightglow_ios_shown", "1");
      toast("For an even gentler glow, go to Settings › Accessibility › Display › Color Filters › Color Tint › Red.", {
        duration: 8000,
      });
    }

    timerRef.current = setTimeout(deactivate, THIRTY_MINUTES);
  }, [deactivate]);

  const toggle = () => {
    if (active) deactivate();
    else activate();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const root = document.getElementById("root");
      if (root) root.style.filter = "";
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      {/* Button */}
      <motion.button
        onClick={toggle}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-heading font-semibold transition-all duration-300 ${
          active
            ? "bg-coral/25 text-coral shadow-[0_0_20px_rgba(255,107,107,0.3)]"
            : "bg-coral/10 text-coral/70 hover:bg-coral/15"
        }`}
      >
        <Flame className="w-4 h-4" />
        {active ? "Night Glow On" : "Night Glow"}
      </motion.button>

      {/* Full-screen red overlay */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="fixed inset-0 pointer-events-none"
            style={{ backgroundColor: "#ff0000", zIndex: 999 }}
          />
        )}
      </AnimatePresence>

      {/* Corner Zzz animation */}
      <AnimatePresence>
        {active && (
          <div className="fixed bottom-20 right-4 pointer-events-none" style={{ zIndex: 1000 }}>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  y: [-10 * i, -40 - 15 * i],
                  x: [-5 * i, -15 - 5 * i],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 1,
                  ease: "easeOut",
                }}
                className="absolute text-coral/50 font-heading font-bold"
                style={{ fontSize: 14 + i * 4 }}
              >
                z
              </motion.span>
            ))}
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
