import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Trash2, Edit2, Filter, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { SleepEntry } from "@/pages/Index";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const History = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editEntry, setEditEntry] = useState<SleepEntry | null>(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editType, setEditType] = useState("nap");
  const [childId, setChildId] = useState<string | null>(null);
  const [wakingCounts, setWakingCounts] = useState<Record<string, number>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [addStart, setAddStart] = useState("");
  const [addEnd, setAddEnd] = useState("");
  const [filterDays, setFilterDays] = useState<number>(7);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    const { data: fam } = await supabase.from("family_members").select("child_id").eq("user_id", user.id).limit(1);
    if (!fam?.length) { setLoading(false); return; }
    setChildId(fam[0].child_id);
    const since = new Date();
    since.setDate(since.getDate() - filterDays);
    const { data } = await supabase.from("sleep_entries").select("*").eq("child_id", fam[0].child_id).eq("is_deleted", false).gte("sleep_start", since.toISOString()).order("sleep_start", { ascending: false }).limit(100);
    const entryList = data || [];
    setEntries(entryList);
    if (entryList.length > 0) {
      const entryIds = entryList.map((e) => e.id);
      const { data: wakings } = await supabase.from("night_wakings").select("sleep_entry_id").in("sleep_entry_id", entryIds);
      const counts: Record<string, number> = {};
      (wakings || []).forEach((w) => { counts[w.sleep_entry_id] = (counts[w.sleep_entry_id] || 0) + 1; });
      setWakingCounts(counts);
    }
    setLoading(false);
  }, [user, filterDays]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("sleep_entries").update({ is_deleted: true }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchEntries();
  };

  const handleEdit = async () => {
    if (!editEntry) return;
    const { error } = await supabase.from("sleep_entries").update({
      sleep_start: new Date(editStart).toISOString(),
      sleep_end: editEnd ? new Date(editEnd).toISOString() : null,
      sleep_type: editType,
    }).eq("id", editEntry.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setEditEntry(null); fetchEntries(); }
  };

  const handleQuickAdd = async () => {
    if (!childId || !addStart || !addEnd) return;
    const start = new Date(addStart);
    const hour = start.getHours();
    const sleepType = hour >= 18 || hour < 6 ? "night" : "nap";
    const { error } = await supabase.from("sleep_entries").insert({ child_id: childId, sleep_start: start.toISOString(), sleep_end: new Date(addEnd).toISOString(), sleep_type: sleepType });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setShowAdd(false); setAddStart(""); setAddEnd(""); fetchEntries(); }
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "In progress";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  if (loading) return <div className="flex items-center justify-center min-h-[80dvh]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-heading font-bold">Sleep History 📝</h1>
        <Button size="sm" variant="outline" className="rounded-2xl text-xs btn-hover" onClick={() => setShowAdd(true)}>+ Add Past Sleep</Button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-1">
          {[7, 14, 30].map((d) => (
            <Button key={d} size="sm" variant={filterDays === d ? "default" : "ghost"} className="rounded-2xl text-xs h-7 px-3 btn-hover" onClick={() => setFilterDays(d)}>
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Moon className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm italic">No sleep logged yet — your little one's story starts here 💤</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <div className={`card-dreamy rounded-2xl p-4 flex items-center gap-3 card-hover border-l-4 ${entry.sleep_type === "night" ? "border-l-night" : "border-l-nap"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${entry.sleep_type === "night" ? "bg-night/15" : "bg-nap/15"}`}>
                  {entry.sleep_type === "night" ? <Moon className="w-5 h-5 text-night" /> : <Sun className="w-5 h-5 text-nap" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold capitalize">{entry.sleep_type}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(entry.sleep_start)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(entry.sleep_start)} → {entry.sleep_end ? formatTime(entry.sleep_end) : "now"}
                  </p>
                  {wakingCounts[entry.id] > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-warning mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      {wakingCounts[entry.id]} waking{wakingCounts[entry.id] > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <span className="font-mono text-sm font-semibold text-primary shrink-0">{formatDuration(entry.sleep_start, entry.sleep_end)}</span>
                <button onClick={() => { setEditEntry(entry); setEditStart(entry.sleep_start.slice(0, 16)); setEditEnd(entry.sleep_end?.slice(0, 16) || ""); setEditType(entry.sleep_type); }} className="p-2 text-muted-foreground hover:text-foreground transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(entry.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!editEntry} onOpenChange={() => setEditEntry(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">Edit Sleep Entry</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Start</Label><Input type="datetime-local" value={editStart} onChange={(e) => setEditStart(e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-2"><Label>End</Label><Input type="datetime-local" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="nap">Nap</SelectItem><SelectItem value="night">Night</SelectItem></SelectContent>
              </Select>
            </div>
            <Button className="w-full rounded-2xl btn-hover font-heading font-semibold" onClick={handleEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">Add Past Sleep</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Start</Label><Input type="datetime-local" value={addStart} onChange={(e) => setAddStart(e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-2"><Label>End</Label><Input type="datetime-local" value={addEnd} onChange={(e) => setAddEnd(e.target.value)} className="rounded-xl" /></div>
            <Button className="w-full rounded-2xl btn-hover font-heading font-semibold" onClick={handleQuickAdd} disabled={!addStart || !addEnd}>Add Sleep</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
