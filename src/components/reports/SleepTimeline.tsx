import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineEntry {
  sleep_start: string;
  sleep_end: string | null;
  sleep_type: string;
}

interface SleepTimelineProps {
  entries: TimelineEntry[];
  days: number;
}

export const SleepTimeline = ({ entries, days }: SleepTimelineProps) => {
  // Group entries by date
  const dayGroups: { label: string; date: Date; entries: TimelineEntry[] }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const dayEntries = entries.filter((e) => {
      const start = new Date(e.sleep_start);
      return start >= d && start < next;
    });

    dayGroups.push({
      label: d.toLocaleDateString([], { weekday: "short", day: "numeric" }),
      date: d,
      entries: dayEntries,
    });
  }

  const hours = Array.from({ length: 25 }, (_, i) => i);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-heading">Sleep Timeline (24h)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 overflow-x-auto">
        {/* Hour labels */}
        <div className="flex items-center">
          <div className="w-16 shrink-0" />
          <div className="flex-1 flex relative h-4">
            {[0, 6, 12, 18, 24].map((h) => (
              <span
                key={h}
                className="absolute text-[9px] text-muted-foreground -translate-x-1/2"
                style={{ left: `${(h / 24) * 100}%` }}
              >
                {h === 24 ? "" : `${h}:00`}
              </span>
            ))}
          </div>
        </div>

        {dayGroups.map((group) => (
          <div key={group.label} className="flex items-center h-6">
            <span className="w-16 shrink-0 text-[10px] text-muted-foreground truncate">
              {group.label}
            </span>
            <div className="flex-1 relative bg-muted/30 rounded-sm h-4">
              {group.entries.map((entry, i) => {
                const start = new Date(entry.sleep_start);
                const end = entry.sleep_end ? new Date(entry.sleep_end) : new Date();
                const startHour = start.getHours() + start.getMinutes() / 60;
                const endHour = end.getHours() + end.getMinutes() / 60;
                const left = (startHour / 24) * 100;
                const width = Math.max(((endHour - startHour) / 24) * 100, 0.5);

                return (
                  <div
                    key={i}
                    className={`absolute top-0 h-full rounded-sm ${
                      entry.sleep_type === "night"
                        ? "bg-primary/70"
                        : "bg-primary/35"
                    }`}
                    style={{
                      left: `${Math.max(0, left)}%`,
                      width: `${Math.min(width, 100 - left)}%`,
                    }}
                    title={`${entry.sleep_type}: ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} → ${entry.sleep_end ? end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "now"}`}
                  />
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3 mt-2 justify-center">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="w-3 h-3 rounded-sm bg-primary/70" /> Night
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="w-3 h-3 rounded-sm bg-primary/35" /> Nap
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
