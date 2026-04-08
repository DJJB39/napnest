import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarHeart, BookOpen, MessageCircle, Settings, ChevronRight, ChevronDown, Volume2, Sparkles, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundMachine } from "@/components/sleep/SoundMachine";
import { NightGlow } from "@/components/sleep/NightGlow";
import { SleepTimer } from "@/components/sleep/SleepTimer";

const navItems = [
  { to: "/expect", icon: CalendarHeart, label: "What to Expect", description: "NHS milestones & development" },
  { to: "/stories", icon: BookOpen, label: "Bedtime Book", description: "Personalised bedtime stories" },
  { to: "/ask-ai", icon: MessageCircle, label: "Ask AI", description: "Sleep advice powered by AI" },
  { to: "/settings", icon: Settings, label: "Settings", description: "Account & preferences" },
];

const expandableItems = [
  { key: "sound", icon: Volume2, label: "Sound Machine", description: "White noise & lullabies", component: SoundMachine },
  { key: "glow", icon: Sparkles, label: "Night Glow", description: "Soft ambient light", component: NightGlow },
  { key: "timer", icon: Timer, label: "Sleep Timer", description: "Countdown timer for routines", component: SleepTimer },
];

const More = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-lg font-heading font-semibold text-foreground mb-4">More</h1>

      {navItems.map(({ to, icon: Icon, label, description }, i) => (
        <motion.button
          key={to}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => navigate(to)}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-sm hover:bg-accent/50 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.button>
      ))}

      <div className="pt-2">
        <p className="text-xs text-muted-foreground font-medium mb-2 px-1">Tools</p>
        {expandableItems.map(({ key, icon: Icon, label, description, component: Component }) => (
          <div key={key} className="mb-2">
            <button
              onClick={() => setExpanded(expanded === key ? null : key)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-sm hover:bg-accent/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expanded === key ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {expanded === key && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-2">
                    <Component />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default More;
