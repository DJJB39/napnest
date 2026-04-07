import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SleepButton } from "@/components/sleep/SleepButton";
import { WakeWindowTimer } from "@/components/sleep/WakeWindowTimer";
import { TodaySummary } from "@/components/sleep/TodaySummary";
import { NightWakingToggle } from "@/components/sleep/NightWakingToggle";
import { SleepTimer } from "@/components/sleep/SleepTimer";
import { SoundMachine } from "@/components/sleep/SoundMachine";
import { useToast } from "@/hooks/use-toast";
import { MoonStars } from "@/components/decorative/MoonStars";

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
        <MoonStars className="w-24 h-24 mb-4 opacity-50" />
        <h2 className="text-lg font-heading font-semibold mb-2">No child profile yet</h2>
        <p className="text-muted-foreground text-sm">Please complete onboarding to get started.</p>
      </div>
    );
  }

  const completedEntries = todayEntries.filter((e) => e.sleep_end);
  const lastWakeTime = completedEntries.length > 0 ? completedEntries[0].sleep_end : null;

  return (
    <div className="flex flex-col items-center px-4 pt-8 relative">
      {/* Decorative */}
      <MoonStars className="absolute top-2 right-2 w-16 h-16 opacity-20" />

      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-muted-foreground text-sm">Tracking</p>
        <h1 className="text-xl font-heading font-bold">{child.name} 🌙</h1>
      </div>

      {!activeSleep && lastWakeTime && (
        <WakeWindowTimer lastWakeTime={lastWakeTime} dob={child.date_of_birth} />
      )}

      <SleepButton isSleeping={!!activeSleep} sleepStart={activeSleep?.sleep_start} onToggle={handleToggleSleep} />

      {activeSleep && activeSleep.sleep_type === "night" && (
        <NightWakingToggle sleepEntryId={activeSleep.id} />
      )}

      <div className="mt-6">
        <SleepTimer />
      </div>

      <div className="mt-4">
        <SoundMachine />
      </div>

      <TodaySummary entries={todayEntries} />
    </div>
  );
};

export default Index;
