import type { SleepEntry } from "@/pages/Index";

// Seed-based simple random for deterministic data
let seed = 42;
function rand() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

// Baby DOB: ~4 months ago
const now = new Date();
const demoDob = new Date(now);
demoDob.setMonth(demoDob.getMonth() - 4);
export const DEMO_DOB = demoDob.toISOString().split("T")[0];
export const DEMO_CHILD_NAME = "Baby";

interface DemoWaking {
  wake_time: string;
  back_to_sleep_time: string;
}

export interface DemoEntry extends SleepEntry {
  wakings?: DemoWaking[];
}

function generateDay(dayOffset: number): DemoEntry[] {
  const entries: DemoEntry[] = [];
  const day = new Date(now);
  day.setDate(day.getDate() - dayOffset);
  day.setHours(0, 0, 0, 0);

  // Night sleep: previous evening ~19:00-20:30 → this morning ~5:30-7:00
  const nightStart = new Date(day);
  nightStart.setDate(nightStart.getDate() - 1);
  nightStart.setHours(19 + (rand() > 0.5 ? 1 : 0), randInt(0, 30), 0, 0);

  const nightEnd = new Date(day);
  nightEnd.setHours(5 + randInt(0, 2), randInt(0, 59), 0, 0);

  const wakings: DemoWaking[] = [];
  const numWakings = rand() > 0.6 ? randInt(1, 2) : 0;
  for (let w = 0; w < numWakings; w++) {
    const wakeHour = randInt(0, 4);
    const wt = new Date(day);
    wt.setHours(wakeHour, randInt(0, 59), 0, 0);
    const bt = new Date(wt);
    bt.setMinutes(bt.getMinutes() + randInt(5, 25));
    wakings.push({ wake_time: wt.toISOString(), back_to_sleep_time: bt.toISOString() });
  }

  entries.push({
    id: `demo-night-${dayOffset}`,
    child_id: "demo-child",
    sleep_start: nightStart.toISOString(),
    sleep_end: nightEnd.toISOString(),
    sleep_type: "night",
    is_deleted: false,
    wakings,
  });

  // Naps: 2-3 per day
  const napCount = randInt(2, 3);
  const napStarts = [9, 12.5, 15.5];
  for (let n = 0; n < napCount; n++) {
    const napStart = new Date(day);
    const baseHour = napStarts[n] || 15;
    napStart.setHours(Math.floor(baseHour), (baseHour % 1) * 60 + randInt(-15, 15), 0, 0);

    const durationMin = randInt(30, 90);
    const napEnd = new Date(napStart);
    napEnd.setMinutes(napEnd.getMinutes() + durationMin);

    entries.push({
      id: `demo-nap-${dayOffset}-${n}`,
      child_id: "demo-child",
      sleep_start: napStart.toISOString(),
      sleep_end: napEnd.toISOString(),
      sleep_type: "nap",
      is_deleted: false,
    });
  }

  return entries;
}

// Generate 30 days of data
export const demoEntries: DemoEntry[] = [];
for (let d = 0; d < 30; d++) {
  demoEntries.push(...generateDay(d));
}

// Sort newest first
demoEntries.sort((a, b) => new Date(b.sleep_start).getTime() - new Date(a.sleep_start).getTime());

// Today's entries
const todayStr = now.toISOString().split("T")[0];
const yesterdayDate = new Date(now);
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

export const demoTodayEntries: SleepEntry[] = demoEntries.filter((e) => {
  const startDate = e.sleep_start.split("T")[0];
  const endDate = e.sleep_end?.split("T")[0];
  return startDate === todayStr || startDate === yesterdayStr && endDate === todayStr;
});

// Weekly chart data
export interface DayData {
  day: string;
  nap: number;
  night: number;
  total: number;
}

function computeWeekData(startOffset: number, count: number): DayData[] {
  const days: DayData[] = [];
  for (let i = startOffset + count - 1; i >= startOffset; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dStart = d.getTime();
    const dEnd = next.getTime();

    const dayEntries = demoEntries.filter((e) => {
      const s = new Date(e.sleep_start).getTime();
      return s >= dStart && s < dEnd && e.sleep_end;
    });

    const napMs = dayEntries.filter((e) => e.sleep_type === "nap").reduce((s, e) => s + (new Date(e.sleep_end!).getTime() - new Date(e.sleep_start).getTime()), 0);
    const nightMs = dayEntries.filter((e) => e.sleep_type === "night").reduce((s, e) => s + (new Date(e.sleep_end!).getTime() - new Date(e.sleep_start).getTime()), 0);

    days.push({
      day: d.toLocaleDateString([], { weekday: "short" }),
      nap: +(napMs / 3600000).toFixed(1),
      night: +(nightMs / 3600000).toFixed(1),
      total: +((napMs + nightMs) / 3600000).toFixed(1),
    });
  }
  return days;
}

export const demoThisWeek = computeWeekData(0, 7);
export const demoLastWeek = computeWeekData(7, 7);

// NHS range for 4-month-old
export const demoNhsRange = { min: 12, max: 16 };

// Last wake time: ~45 min ago for wake window demo
const lastWake = new Date(now);
lastWake.setMinutes(lastWake.getMinutes() - 45);
export const demoLastWakeTime = lastWake.toISOString();

// History entries (most recent 10)
export const demoHistoryEntries = demoEntries.slice(0, 10);

// Waking counts for history
export const demoWakingCounts: Record<string, number> = {};
demoEntries.forEach((e) => {
  if (e.wakings?.length) {
    demoWakingCounts[e.id] = e.wakings.length;
  }
});
