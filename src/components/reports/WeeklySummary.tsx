import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Star, AlertTriangle } from "lucide-react";

interface DayData { day: string; nap: number; night: number; total: number; }

interface WeeklySummaryProps {
  thisWeek: DayData[];
  lastWeek: DayData[];
}

const ProgressRing = ({ value, max, label, unit = "h", size = 72, strokeWidth = 6 }: {
  value: number; max: number; label: string; unit?: string; size?: number; strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="hsl(var(--secondary))" strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="hsl(var(--primary))" strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-sm font-semibold">{value.toFixed(1)}</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
};

export const WeeklySummary = ({ thisWeek, lastWeek }: WeeklySummaryProps) => {
  const thisTotal = thisWeek.reduce((s, d) => s + d.total, 0);
  const lastTotal = lastWeek.reduce((s, d) => s + d.total, 0);
  const daysWithData = thisWeek.filter((d) => d.total > 0).length;
  const dailyAvg = daysWithData > 0 ? thisTotal / daysWithData : 0;
  const diff = lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal) * 100 : 0;
  const bestDay = thisWeek.reduce((best, d) => (d.total > best.total ? d : best), thisWeek[0]);
  const worstDay = thisWeek.filter((d) => d.total > 0).reduce((worst, d) => (d.total < worst.total ? d : worst), thisWeek.find((d) => d.total > 0) || thisWeek[0]);

  return (
    <div className="space-y-3">
      {/* Progress rings row */}
      <Card className="card-dreamy border-0">
        <CardContent className="p-5 flex items-center justify-around">
          <ProgressRing value={thisTotal} max={100} label="7-day total" />
          <ProgressRing value={dailyAvg} max={16} label="Daily avg" />
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              {diff > 1 ? <TrendingUp className="w-5 h-5 text-success" /> : diff < -1 ? <TrendingDown className="w-5 h-5 text-coral" /> : <Minus className="w-5 h-5 text-muted-foreground" />}
            </div>
            <span className={`font-mono text-sm font-semibold ${diff > 1 ? "text-success" : diff < -1 ? "text-coral" : "text-muted-foreground"}`}>
              {Math.abs(diff).toFixed(0)}%
            </span>
            <span className="text-[10px] text-muted-foreground">vs last week</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {bestDay && bestDay.total > 0 && (
          <Card className="card-dreamy border-0 card-hover">
            <CardContent className="p-4 flex flex-col">
              <span className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><Star className="w-3 h-3 text-warning" /> Best day</span>
              <span className="font-mono font-semibold text-sm">{bestDay.day}</span>
              <span className="text-[10px] text-muted-foreground">{bestDay.total.toFixed(1)}h total</span>
            </CardContent>
          </Card>
        )}
        {worstDay && worstDay.total > 0 && worstDay.day !== bestDay?.day && (
          <Card className="card-dreamy border-0 card-hover">
            <CardContent className="p-4 flex flex-col">
              <span className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-warning" /> Least sleep</span>
              <span className="font-mono font-semibold text-sm">{worstDay.day}</span>
              <span className="text-[10px] text-muted-foreground">{worstDay.total.toFixed(1)}h total</span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
