import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Star, AlertTriangle } from "lucide-react";

interface DayData { day: string; nap: number; night: number; total: number; }

interface WeeklySummaryProps {
  thisWeek: DayData[];
  lastWeek: DayData[];
}

export const WeeklySummary = ({ thisWeek, lastWeek }: WeeklySummaryProps) => {
  const thisTotal = thisWeek.reduce((s, d) => s + d.total, 0);
  const lastTotal = lastWeek.reduce((s, d) => s + d.total, 0);
  const daysWithData = thisWeek.filter((d) => d.total > 0).length;
  const dailyAvg = daysWithData > 0 ? thisTotal / daysWithData : 0;
  const diff = lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal) * 100 : 0;
  const bestDay = thisWeek.reduce((best, d) => (d.total > best.total ? d : best), thisWeek[0]);
  const worstDay = thisWeek.filter((d) => d.total > 0).reduce((worst, d) => (d.total < worst.total ? d : worst), thisWeek.find((d) => d.total > 0) || thisWeek[0]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="card-dreamy border-0">
        <CardContent className="p-4 flex flex-col">
          <span className="text-[10px] text-muted-foreground mb-1">7-day total</span>
          <span className="font-mono font-semibold text-lg">{thisTotal.toFixed(1)}h</span>
          <div className="flex items-center gap-1 mt-1">
            {diff > 1 ? <TrendingUp className="w-3 h-3 text-success" /> : diff < -1 ? <TrendingDown className="w-3 h-3 text-coral" /> : <Minus className="w-3 h-3 text-muted-foreground" />}
            <span className={`text-[10px] ${diff > 1 ? "text-success" : diff < -1 ? "text-coral" : "text-muted-foreground"}`}>
              {Math.abs(diff).toFixed(0)}% vs last week
            </span>
          </div>
        </CardContent>
      </Card>
      <Card className="card-dreamy border-0">
        <CardContent className="p-4 flex flex-col">
          <span className="text-[10px] text-muted-foreground mb-1">Daily average</span>
          <span className="font-mono font-semibold text-lg">{dailyAvg.toFixed(1)}h</span>
          <span className="text-[10px] text-muted-foreground mt-1">{daysWithData} days with data</span>
        </CardContent>
      </Card>
      {bestDay && bestDay.total > 0 && (
        <Card className="card-dreamy border-0">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><Star className="w-3 h-3 text-warning" /> Best day</span>
            <span className="font-mono font-semibold text-sm">{bestDay.day}</span>
            <span className="text-[10px] text-muted-foreground">{bestDay.total.toFixed(1)}h total</span>
          </CardContent>
        </Card>
      )}
      {worstDay && worstDay.total > 0 && worstDay.day !== bestDay?.day && (
        <Card className="card-dreamy border-0">
          <CardContent className="p-4 flex flex-col">
            <span className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-warning" /> Least sleep</span>
            <span className="font-mono font-semibold text-sm">{worstDay.day}</span>
            <span className="text-[10px] text-muted-foreground">{worstDay.total.toFixed(1)}h total</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
