import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertCircle, BedDouble } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface NightWakingToggleProps {
  sleepEntryId: string;
}

interface NightWaking {
  id: string;
  wake_time: string;
  back_to_sleep_time: string | null;
}

export const NightWakingToggle = ({ sleepEntryId }: NightWakingToggleProps) => {
  const { toast } = useToast();
  const [wakings, setWakings] = useState<NightWaking[]>([]);
  const [activeWaking, setActiveWaking] = useState<NightWaking | null>(null);

  const fetchWakings = useCallback(async () => {
    const { data } = await supabase
      .from("night_wakings").select("*").eq("sleep_entry_id", sleepEntryId)
      .order("wake_time", { ascending: true });
    if (data) {
      setWakings(data);
      setActiveWaking(data.find((w) => !w.back_to_sleep_time) || null);
    }
  }, [sleepEntryId]);

  useEffect(() => { fetchWakings(); }, [fetchWakings]);

  const handleWokeUp = async () => {
    const { error } = await supabase.from("night_wakings").insert({
      sleep_entry_id: sleepEntryId, wake_time: new Date().toISOString(),
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchWakings();
  };

  const handleBackToSleep = async () => {
    if (!activeWaking) return;
    const { error } = await supabase.from("night_wakings")
      .update({ back_to_sleep_time: new Date().toISOString() }).eq("id", activeWaking.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchWakings();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs space-y-3 mt-2"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-heading">Night wakings: {wakings.length}</span>
        </div>

        {activeWaking ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-2xl border-success/40 text-success hover:bg-success/10 btn-hover"
            onClick={handleBackToSleep}
          >
            <BedDouble className="w-4 h-4 mr-2" />
            Back to sleep
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-2xl border-warning/40 text-warning hover:bg-warning/10 btn-hover"
            onClick={handleWokeUp}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Woke up
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
