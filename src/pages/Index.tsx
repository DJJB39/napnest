import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SleepButton } from "@/components/sleep/SleepButton";
import { TodaySummary } from "@/components/sleep/TodaySummary";
import { NightWakingToggle } from "@/components/sleep/NightWakingToggle";
import { EditStartTime } from "@/components/sleep/EditStartTime";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

export interface SleepEntry {
  id: string;
  child_id: string;
  sleep_start: string;
  sleep_end: string | null;
  sleep_type: string;
  is_deleted: boolean;
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 6) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const getAgeWeeks = (dob: string) =>
  Math.floor((Date.now() - new Date(dob).getTime()) / (7 * 24 * 60 * 60 * 1000));

const getWakeWindowMinutes = (ageWeeks: number): { min: number; max: number } => {
  if (ageWeeks < 4) return { min: 35, max: 60 };
  if (ageWeeks < 8) return { min: 60, max: 90 };
  if (ageWeeks < 12) return { min: 75, max: 120 };
  if (ageWeeks < 20) return { min: 90, max: 150 };
  if (ageWeeks < 36) return { min: 120, max: 210 };
  if (ageWeeks < 52) return { min: 150, max: 240 };
  if (ageWeeks < 78) return { min: 180, max: 300 };
  return { min: 240, max: 360 };
};

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [child, setChild] = useState<Child | null>(null);
  const [activeSleep, setActiveSleep] = useState<SleepEntry | null>(null);
  const [todayEntries, setTodayEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const { data: familyMembers } = await supabase
      .from("family_members").select("child_id").eq("user_id", user.id).limit(1);
    if (!familyMembers?.length) { setLoading(false); return; }

    const childId = familyMembers[0].child_id;
    const { data: childData } = await supabase
      .from("children").select("*").eq("id", childId).single();
    if (childData) setChild(childData);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: entries } = await supabase
      .from("sleep_entries").select("*").eq("child_id", childId)
      .eq("is_deleted", false).gte("sleep_start", todayStart.toISOString())
      .order("sleep_start", { ascending: false });
    if (entries) {
      setTodayEntries(entries);
      setActiveSleep(entries.find((e) => !e.sleep_end) || null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!child) return;
    const channel = supabase
      .channel("sleep-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "sleep_entries", filter: `child_id=eq.${child.id}` }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [child, fetchData]);

  const autoClassifySleepType = () => {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6 ? "night" : "nap";
  };

  const handleToggleSleep = async () => {
    if (!child) return;
    if (activeSleep) {
      const { error } = await supabase.from("sleep_entries").update({ sleep_end: new Date().toISOString() }).eq("id", activeSleep.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else { setActiveSleep(null); fetchData(); }
    } else {
      const { data, error } = await supabase.from("sleep_entries")
        .insert({ child_id: child.id, sleep_start: new Date().toISOString(), sleep_type: autoClassifySleepType() })
        .select().single();
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else if (data) { setActiveSleep(data); fetchData(); }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80dvh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80dvh] p-6 text-center">
        <div className="text-5xl mb-4">🌙</div>
        <h2 className="text-xl font-heading font-bold mb-2">No child profile yet</h2>
        <p className="text-muted-foreground text-sm">Please complete onboarding to get started.</p>
      </div>
    );
  }

  const completedEntries = todayEntries.filter((e) => e.sleep_end);
  const lastWakeTime = completedEntries.length > 0 ? completedEntries[0].sleep_end : null;

  const ageWeeks = getAgeWeeks(child.date_of_birth);
  const wakeWindow = getWakeWindowMinutes(ageWeeks);

  // Inline wake window info
  let awakeMinutes = 0;
  if (lastWakeTime && !activeSleep) {
    awakeMinutes = Math.floor((Date.now() - new Date(lastWakeTime).getTime()) / 60000);
  }

  // Nap prediction
  let napPrediction: { minutes: number; color: string; bgColor: string } | null = null;
  if (lastWakeTime && !activeSleep) {
    const avgWakeWindow = Math.round((wakeWindow.min + wakeWindow.max) / 2);
    const minsUntilNap = Math.max(0, avgWakeWindow - awakeMinutes);
    const color = minsUntilNap > 30 ? "text-success" : minsUntilNap > 15 ? "text-warning" : "text-coral";
    const bgColor = minsUntilNap > 30 ? "bg-success/10" : minsUntilNap > 15 ? "bg-warning/10" : "bg-coral/10";
    napPrediction = { minutes: minsUntilNap, color, bgColor };
  }

  return (
    <div className="flex flex-col items-center px-4 pt-6 pb-4">
      {/* Zone 1 — Compact header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-1"
      >
        <p className="text-muted-foreground text-sm">{getGreeting()} 💫</p>
        <h1 className="text-2xl font-heading font-bold">{child.name}</h1>
      </motion.div>

      {/* Inline wake window status */}
      {!activeSleep && lastWakeTime && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-xs mb-3 ${awakeMinutes > wakeWindow.max ? "text-coral" : awakeMinutes > wakeWindow.min ? "text-warning" : "text-success"}`}
        >
          Awake {awakeMinutes}m · window {wakeWindow.min}–{wakeWindow.max}m
        </motion.p>
      )}

      {/* Zone 2 — Hero sleep button */}
      <div className="flex flex-col items-center w-full max-w-sm">
        {napPrediction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`${napPrediction.bgColor} rounded-2xl px-4 py-2 flex items-center gap-2 mb-3`}
          >
            <Clock className={`w-4 h-4 ${napPrediction.color}`} />
            <span className={`text-sm font-heading font-semibold ${napPrediction.color}`}>
              {napPrediction.minutes === 0 ? "Nap time now!" : `Next nap in ~${napPrediction.minutes} mins`}
            </span>
          </motion.div>
        )}

        <SleepButton isSleeping={!!activeSleep} sleepStart={activeSleep?.sleep_start} onToggle={handleToggleSleep} />

        {activeSleep && (
          <EditStartTime
            sleepEntryId={activeSleep.id}
            currentStart={activeSleep.sleep_start}
            onUpdated={fetchData}
          />
        )}

        {activeSleep && activeSleep.sleep_type === "night" && (
          <NightWakingToggle sleepEntryId={activeSleep.id} />
        )}

        {/* Zone 3 — Below the fold */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full mt-6"
        >
          <TodaySummary entries={todayEntries} />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
