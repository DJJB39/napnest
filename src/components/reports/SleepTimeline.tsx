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
  const dayGroups: { label: string; date: Date; entries: TimelineEntry[] }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const dayEntries = entries.filter((e) => { const start = new Date(e.sleep_start); return start >= d && start < next; });
    dayGroups.push({ label: d.toLocaleDateString([], { weekday: "short", day: "numeric" }), date: d, entries: dayEntries });
  }

  return (
    <div className="card-dreamy rounded-2xl p-4 space-y-3">
      <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">Sleep Timeline (24h)</h3>
      <div className="space-y-1 overflow-x-auto">
        <div className="flex items-center">
          <div className="w-16 shrink-0" />
          <div className="flex-1 flex relative h-4">
            {[0, 6, 12, 18, 24].map((h) => (
              <span key={h} className="absolute text-[9px] text-muted-foreground -translate-x-1/2" style={{ left: `${(h / 24) * 100}%` }}>
                {h === 24 ? "" : `${h}:00`}
              </span>
            ))}
          </div>
        </div>
        {dayGroups.map((group) => (
          <div key={group.label} className="flex items-center h-6">
            <span className="w-16 shrink-0 text-[10px] text-muted-foreground truncate">{group.label}</span>
            <div className="flex-1 relative bg-secondary rounded-full h-4">
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
                    className={`absolute top-0 h-full rounded-full ${entry.sleep_type === "night" ? "bg-night" : "bg-nap"}`}
                    style={{ left: `${Math.max(0, left)}%`, width: `${Math.min(width, 100 - left)}%` }}
                    title={`${entry.sleep_type}: ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} → ${entry.sleep_end ? end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "now"}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-4 mt-2 justify-center">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-3 h-3 rounded-full bg-night" /> Night</span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-3 h-3 rounded-full bg-nap" /> Nap</span>
        </div>
      </div>
    </div>
  );
};
