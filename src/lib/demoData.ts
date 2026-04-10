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

// Baby DOB: ~6 weeks ago (newborn)
const now = new Date();
const demoDob = new Date(now);
demoDob.setDate(demoDob.getDate() - 42); // 6 weeks
export const DEMO_DOB = demoDob.toISOString().split("T")[0];
export const DEMO_CHILD_NAME = "Baby";

interface DemoWaking {
  wake_time: string;
  back_to_sleep_time: string;
}

export interface DemoEntry extends SleepEntry {
  wakings?: DemoWaking[];
}

/**
 * Age-appropriate sleep patterns for newborns by week-of-life.
 * Returns config for night sleep and naps.
 */
function getPatternForAge(weekOfLife: number) {
  if (weekOfLife <= 2) {
    return {
      nightStartHourRange: [19, 21] as [number, number],
      nightStretchMinutes: [120, 180], // 2-3h stretches
      nightWakings: [4, 6],
      napCount: [4, 5],
      napDurationMin: [20, 50],
      totalSleepTarget: 16.5,
    };
  }
  if (weekOfLife <= 4) {
    return {
      nightStartHourRange: [19, 20] as [number, number],
      nightStretchMinutes: [180, 240], // 3-4h stretches
      nightWakings: [3, 4],
      napCount: [4, 4],
      napDurationMin: [25, 60],
      totalSleepTarget: 15.5,
    };
  }
  if (weekOfLife <= 6) {
    return {
      nightStartHourRange: [19, 20] as [number, number],
      nightStretchMinutes: [240, 300], // 4-5h stretches
      nightWakings: [2, 3],
      napCount: [3, 4],
      napDurationMin: [30, 75],
      totalSleepTarget: 15,
    };
  }
  // Weeks 7-8
  return {
    nightStartHourRange: [19, 20] as [number, number],
    nightStretchMinutes: [300, 360], // 5-6h stretches
    nightWakings: [1, 3],
    napCount: [3, 3],
    napDurationMin: [35, 90],
    totalSleepTarget: 14.5,
  };
}

function generateDay(dayOffset: number): DemoEntry[] {
  const entries: DemoEntry[] = [];
  const day = new Date(now);
  day.setDate(day.getDate() - dayOffset);
  day.setHours(0, 0, 0, 0);

  // Figure out which week of life this day was
  const dayDate = new Date(day);
  const ageAtDayMs = dayDate.getTime() - demoDob.getTime();
  const weekOfLife = Math.floor(ageAtDayMs / (7 * 24 * 60 * 60 * 1000));
  const pattern = getPatternForAge(weekOfLife);

  // === NIGHT SLEEP ===
  // Night starts previous evening
  const nightStart = new Date(day);
  nightStart.setDate(nightStart.getDate() - 1);
  const startHour = randInt(pattern.nightStartHourRange[0], pattern.nightStartHourRange[1]);
  nightStart.setHours(startHour, randInt(0, 45), 0, 0);

  // Night ends this morning 5:30-7:00
  const nightEnd = new Date(day);
  nightEnd.setHours(5 + randInt(0, 2), randInt(0, 59), 0, 0);

  // Generate realistic wakings throughout the night
  const wakings: DemoWaking[] = [];
  const numWakings = randInt(pattern.nightWakings[0], pattern.nightWakings[1]);
  
  // Distribute wakings evenly across the night
  const nightDurationMs = nightEnd.getTime() - nightStart.getTime();
  const segmentMs = nightDurationMs / (numWakings + 1);
  
  for (let w = 0; w < numWakings; w++) {
    const baseTime = nightStart.getTime() + segmentMs * (w + 1);
    // Add some randomness (±30 min)
    const jitterMs = (rand() - 0.5) * 60 * 60 * 1000;
    const wakeTimeMs = baseTime + jitterMs;
    
    const wt = new Date(wakeTimeMs);
    // Clamp to night window
    if (wt <= nightStart || wt >= nightEnd) continue;
    
    const feedDuration = randInt(8, 30); // feeding/settling time
    const bt = new Date(wt);
    bt.setMinutes(bt.getMinutes() + feedDuration);
    
    if (bt >= nightEnd) continue;
    
    wakings.push({
      wake_time: wt.toISOString(),
      back_to_sleep_time: bt.toISOString(),
    });
  }

  // Sort wakings chronologically
  wakings.sort((a, b) => new Date(a.wake_time).getTime() - new Date(b.wake_time).getTime());

  entries.push({
    id: `demo-night-${dayOffset}`,
    child_id: "demo-child",
    sleep_start: nightStart.toISOString(),
    sleep_end: nightEnd.toISOString(),
    sleep_type: "night",
    is_deleted: false,
    wakings,
  });

  // === NAPS ===
  const napCount = randInt(pattern.napCount[0], pattern.napCount[1]);
  // Space naps out after morning wake
  const morningWakeHour = nightEnd.getHours() + nightEnd.getMinutes() / 60;
  const eveningCutoff = 17.5; // no naps after 5:30pm
  const availableHours = eveningCutoff - morningWakeHour;
  const napSpacing = availableHours / (napCount + 1);

  for (let n = 0; n < napCount; n++) {
    const napStartHour = morningWakeHour + napSpacing * (n + 1);
    const napStart = new Date(day);
    napStart.setHours(
      Math.floor(napStartHour),
      Math.round((napStartHour % 1) * 60) + randInt(-10, 10),
      0,
      0
    );

    const durationMin = randInt(pattern.napDurationMin[0], pattern.napDurationMin[1]);
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

// Generate 56 days (8 weeks) of data
export const demoEntries: DemoEntry[] = [];
for (let d = 0; d < 56; d++) {
  demoEntries.push(...generateDay(d));
}

// Sort newest first
demoEntries.sort(
  (a, b) => new Date(b.sleep_start).getTime() - new Date(a.sleep_start).getTime()
);

// Today's entries
const todayStr = now.toISOString().split("T")[0];
const yesterdayDate = new Date(now);
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

export const demoTodayEntries: SleepEntry[] = demoEntries.filter((e) => {
  const startDate = e.sleep_start.split("T")[0];
  const endDate = e.sleep_end?.split("T")[0];
  return startDate === todayStr || (startDate === yesterdayStr && endDate === todayStr);
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

    const napMs = dayEntries
      .filter((e) => e.sleep_type === "nap")
      .reduce((s, e) => s + (new Date(e.sleep_end!).getTime() - new Date(e.sleep_start).getTime()), 0);
    const nightMs = dayEntries
      .filter((e) => e.sleep_type === "night")
      .reduce((s, e) => s + (new Date(e.sleep_end!).getTime() - new Date(e.sleep_start).getTime()), 0);

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

// NHS range for newborn (0-3 months)
export const demoNhsRange = { min: 14, max: 17 };

// Last wake time: ~45 min ago for wake window demo
const lastWake = new Date(now);
lastWake.setMinutes(lastWake.getMinutes() - 45);
export const demoLastWakeTime = lastWake.toISOString();

// History entries (most recent 20)
export const demoHistoryEntries = demoEntries.slice(0, 20);

// Waking counts for history
export const demoWakingCounts: Record<string, number> = {};
demoEntries.forEach((e) => {
  if (e.wakings?.length) {
    demoWakingCounts[e.id] = e.wakings.length;
  }
});
