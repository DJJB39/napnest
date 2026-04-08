import { useState } from "react";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditStartTimeProps {
  sleepEntryId: string;
  currentStart: string;
  onUpdated: () => void;
}

export const EditStartTime = ({ sleepEntryId, currentStart, onUpdated }: EditStartTimeProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Format to datetime-local value
  const toLocalInput = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [value, setValue] = useState(toLocalInput(currentStart));

  const handleSave = async () => {
    setSaving(true);
    const newStart = new Date(value).toISOString();
    const { error } = await supabase
      .from("sleep_entries")
      .update({ sleep_start: newStart })
      .eq("id", sleepEntryId);

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Backdated! 🕐");
      setOpen(false);
      onUpdated();
    }
  };

  return (
    <>
      <button
        onClick={() => { setValue(toLocalInput(currentStart)); setOpen(true); }}
        className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors mt-1"
      >
        <Clock className="w-3.5 h-3.5" />
        Edit start time
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl max-w-xs mx-auto">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold">Edit Start Time</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Backdate when sleep actually started
            </DialogDescription>
          </DialogHeader>
          <Input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            max={toLocalInput(new Date().toISOString())}
            className="rounded-xl"
          />
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
