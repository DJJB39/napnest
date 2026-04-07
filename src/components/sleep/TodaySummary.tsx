import { Card, CardContent } from "@/components/ui/card";
import { Moon, Sun, Clock } from "lucide-react";
import type { SleepEntry } from "@/pages/Index";

interface TodaySummaryProps {
  entries: SleepEntry[];
}

export const TodaySummary = ({ entries }: TodaySummaryProps) => {
  const completed = entries.filter((e) => e.sleep_end);

  const totalSleepMs = completed.reduce((sum, e) => {
    return sum + (new Date(e.sleep_end!).getTime() - new Date(e.sleep_start).getTime());
  }, 0);

  const totalHours = Math.floor(totalSleepMs / 3600000);
  const totalMins = Math.floor((totalSleepMs % 3600000) / 60000);
  const napCount = completed.filter((e) => e.sleep_type === "nap").length;
  const nightCount = completed.filter((e) => e.sleep_type === "night").length;

  return (
    <div className="w-full grid grid-cols-3 gap-3 mt-4">
      <Card>
        <CardContent className="p-3 flex flex-col items-center">
          <Clock className="w-4 h-4 text-primary mb-1" />
          <p className="font-mono font-semibold text-lg">{totalHours}h {totalMins}m</p>
          <p className="text-[10px] text-muted-foreground">Total sleep</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 flex flex-col items-center">
          <Sun className="w-4 h-4 text-warning mb-1" />
          <p className="font-mono font-semibold text-lg">{napCount}</p>
          <p className="text-[10px] text-muted-foreground">Naps</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 flex flex-col items-center">
          <Moon className="w-4 h-4 text-primary mb-1" />
          <p className="font-mono font-semibold text-lg">{nightCount}</p>
          <p className="text-[10px] text-muted-foreground">Night sleeps</p>
        </CardContent>
      </Card>
    </div>
  );
};
