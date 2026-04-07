import { Moon, Sun, Clock } from "lucide-react";
import type { SleepEntry } from "@/pages/Index";

interface TodaySummaryProps {
  entries: SleepEntry[];
}

export const TodaySummary = ({ entries }: TodaySummaryProps) => {
  const completed = entries.filter((e) => e.sleep_end);
  const totalMs = completed.reduce((sum, e) => sum + (new Date(e.sleep_end!).getTime() - new Date(e.sleep_start).getTime()), 0);
  const totalHours = Math.floor(totalMs / 3600000);
  const totalMins = Math.floor((totalMs % 3600000) / 60000);
  const napCount = completed.filter((e) => e.sleep_type === "nap").length;
  const nightCount = completed.filter((e) => e.sleep_type === "night").length;

  if (completed.length === 0) {
    return (
      <div className="w-full max-w-xs mt-6 text-center">
        <p className="text-sm text-muted-foreground italic">
          No sleep logged yet — your little one's story starts here 💤
        </p>
      </div>
    );
  }

  const stats = [
    { icon: Clock, label: "Total", value: `${totalHours}h ${totalMins}m`, color: "bg-primary/15 text-primary" },
    { icon: Moon, label: "Night", value: `${nightCount}`, color: "bg-night/15 text-night" },
    { icon: Sun, label: "Naps", value: `${napCount}`, color: "bg-nap/15 text-nap" },
  ];

  return (
    <div className="w-full max-w-xs mt-6 space-y-3">
      <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">Today</h3>
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card-dreamy p-3 rounded-2xl flex flex-col items-center gap-2 card-hover">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="font-mono text-lg font-bold">{value}</span>
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
