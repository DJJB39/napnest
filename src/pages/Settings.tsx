import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { LogOut, UserPlus, Baby, Download, ExternalLink, Clock, Moon, Bell, Users, Copy, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [child, setChild] = useState<any>(null);
  const [childName, setChildName] = useState("");
  const [childDob, setChildDob] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [nightStartHour, setNightStartHour] = useState("18");
  const [handoverMode, setHandoverMode] = useState(false);
  const [bedtimeReminder, setBedtimeReminder] = useState("");
  const [napReminder, setNapReminder] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);

  const fetchChild = useCallback(async () => {
    if (!user) return;
    const { data: fam } = await supabase.from("family_members").select("child_id").eq("user_id", user.id).limit(1);
    if (!fam?.length) return;
    const { data } = await supabase.from("children").select("*").eq("id", fam[0].child_id).single();
    if (data) {
      setChild(data);
      setChildName(data.name);
      setChildDob(data.date_of_birth);
      setNightStartHour(String(data.night_start_hour ?? 18));
      setHandoverMode(data.handover_mode ?? false);
    }
  }, [user]);

  useEffect(() => { fetchChild(); }, [fetchChild]);
  useEffect(() => {
    const bed = localStorage.getItem("napnest_bedtime_reminder");
    if (bed) setBedtimeReminder(bed);
    const nap = localStorage.getItem("napnest_nap_reminder");
    if (nap) setNapReminder(nap);
  }, []);

  const saveChild = async () => {
    if (!child) return;
    const { error } = await supabase.from("children").update({ name: childName, date_of_birth: childDob }).eq("id", child.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Saved!" });
  };

  const saveNightStart = async (value: string) => {
    setNightStartHour(value);
    if (child) {
      await supabase.from("children").update({ night_start_hour: parseInt(value) }).eq("id", child.id);
    }
    toast({ title: "Night start updated", description: `Sleep from ${value}:00 classified as night.` });
  };

  const toggleHandover = async (checked: boolean) => {
    setHandoverMode(checked);
    if (child) {
      await supabase.from("children").update({ handover_mode: checked }).eq("id", child.id);
    }
    toast({ title: checked ? "Handover mode on" : "Handover mode off" });
  };

  const saveReminder = (type: "bedtime" | "nap", time: string) => {
    if (type === "bedtime") {
      setBedtimeReminder(time);
      localStorage.setItem("napnest_bedtime_reminder", time);
    } else {
      setNapReminder(time);
      localStorage.setItem("napnest_nap_reminder", time);
    }
    if (time && "Notification" in window) {
      Notification.requestPermission().then(perm => {
        if (perm === "granted") {
          toast({ title: `${type === "bedtime" ? "Bedtime" : "Nap"} reminder set`, description: `Daily at ${time}` });
        } else {
          toast({ title: "Notifications blocked", description: "Please enable notifications in your browser settings.", variant: "destructive" });
        }
      });
    }
  };

  const handleInvite = async () => {
    if (!child || !inviteEmail) return;
    setInviteLoading(true);
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 7);
      const { error } = await supabase.from("invites").insert({ child_id: child.id, invited_by: user!.id, email: inviteEmail, token, expires_at: expiresAt.toISOString() });
      if (error) throw error;
      const url = `${window.location.origin}/invite?token=${token}`;
      setInviteUrl(url);
      setShowInvite(false);
      setInviteEmail("");
      setShowInviteSuccess(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setInviteLoading(false); }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    toast({ title: "Link copied!" });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join NapNest", text: `Track ${child?.name}'s sleep together`, url: inviteUrl });
      } catch { /* user cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  const exportCsv = async () => {
    if (!child) return;
    const { data } = await supabase.from("sleep_entries").select("*").eq("child_id", child.id).eq("is_deleted", false).order("sleep_start");
    if (!data?.length) { toast({ title: "No data to export" }); return; }
    const csv = "Start,End,Type,Duration (min)\n" + data.map(e => {
      const dur = e.sleep_end ? Math.round((new Date(e.sleep_end).getTime() - new Date(e.sleep_start).getTime()) / 60000) : "";
      return `${e.sleep_start},${e.sleep_end || ""},${e.sleep_type},${dur}`;
    }).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `napnest-${child.name}-export.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 pt-8 pb-4 space-y-4">
      <h1 className="text-xl font-heading font-bold">Settings ⚙️</h1>

      {/* Shared Settings */}
      <p className="text-xs text-muted-foreground font-medium px-1">Shared Settings</p>

      <Card className="card-dreamy border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><Baby className="w-4 h-4 text-primary" /></div>
            Child Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2"><Label>Name</Label><Input value={childName} onChange={(e) => setChildName(e.target.value)} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={childDob} onChange={(e) => setChildDob(e.target.value)} className="rounded-xl" /></div>
          <Button size="sm" className="rounded-2xl btn-hover font-heading font-semibold" onClick={saveChild}>Save</Button>
        </CardContent>
      </Card>

      <Card className="card-dreamy border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="w-4 h-4 text-primary" /></div>
            Night Start Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">Sleep after this time = "night".</p>
          <Select value={nightStartHour} onValueChange={saveNightStart}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 7 }, (_, i) => i + 16).map((h) => (
                <SelectItem key={h} value={String(h)}>{`${h}:00`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="card-dreamy border-0">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-nap/10 flex items-center justify-center"><Users className="w-4 h-4 text-nap" /></div>
            <div>
              <span className="text-sm font-medium">Handover Mode</span>
              <p className="text-[10px] text-muted-foreground">Show "Partner tracking" banner</p>
            </div>
          </div>
          <Switch checked={handoverMode} onCheckedChange={toggleHandover} />
        </CardContent>
      </Card>

      {/* This Device */}
      <p className="text-xs text-muted-foreground font-medium px-1 pt-2">This Device</p>

      <Card className="card-dreamy border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center"><Bell className="w-4 h-4 text-warning" /></div>
            Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Bedtime reminder</Label>
            <Input type="time" value={bedtimeReminder} onChange={(e) => saveReminder("bedtime", e.target.value)} className="rounded-xl w-32 text-xs" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Nap reminder</Label>
            <Input type="time" value={napReminder} onChange={(e) => saveReminder("nap", e.target.value)} className="rounded-xl w-32 text-xs" />
          </div>
          <p className="text-[10px] text-muted-foreground">Browser notifications — keep the tab open for reminders.</p>
        </CardContent>
      </Card>

      <Card className="card-dreamy border-0">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><Moon className="w-4 h-4 text-primary" /></div>
            <span className="text-sm font-medium">Dark Mode</span>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
        </CardContent>
      </Card>

      {/* Actions */}
      <p className="text-xs text-muted-foreground font-medium px-1 pt-2">Account</p>

      <Card className="card-dreamy border-0">
        <CardContent className="p-4">
          <Button variant="outline" className="w-full rounded-2xl btn-hover" onClick={() => setShowInvite(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Invite Partner
          </Button>
        </CardContent>
      </Card>

      <Card className="card-dreamy border-0">
        <CardContent className="p-4">
          <Button variant="outline" className="w-full rounded-2xl btn-hover" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-2" /> Export Data as CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="card-dreamy border-0">
        <CardContent className="p-4">
          <a href="https://www.nhs.uk/conditions/baby/caring-for-a-newborn/helping-your-baby-to-sleep/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
            <ExternalLink className="w-4 h-4" /> NHS Baby Sleep Guidance
          </a>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full rounded-2xl btn-hover text-destructive border-destructive/30 hover:bg-destructive/10" onClick={signOut}>
        <LogOut className="w-4 h-4 mr-2" /> Sign Out
      </Button>

      {/* Invite Email Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">Invite Partner</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Partner's Email</Label><Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="partner@example.com" className="rounded-xl" /></div>
            <Button className="w-full rounded-2xl btn-hover font-heading font-semibold" onClick={handleInvite} disabled={inviteLoading || !inviteEmail}>{inviteLoading ? "Sending…" : "Send Invite"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Success Dialog */}
      <Dialog open={showInviteSuccess} onOpenChange={setShowInviteSuccess}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">Invite Created! 🎉</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send this link to your partner. They'll create their own account and be connected to {child?.name}'s sleep data.
            </p>
            <div className="bg-secondary rounded-xl p-3 text-xs break-all font-mono text-foreground">{inviteUrl}</div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-2xl btn-hover" onClick={handleCopyLink}>
                <Copy className="w-4 h-4 mr-2" /> Copy Link
              </Button>
              <Button className="flex-1 rounded-2xl btn-hover font-heading font-semibold" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
