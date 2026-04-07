import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { LogOut, UserPlus, Baby, Download, ExternalLink, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [child, setChild] = useState<any>(null);
  const [childName, setChildName] = useState("");
  const [childDob, setChildDob] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [nightStartHour, setNightStartHour] = useState("18");

  const fetchChild = useCallback(async () => {
    if (!user) return;
    const { data: fam } = await supabase.from("family_members").select("child_id").eq("user_id", user.id).limit(1);
    if (!fam?.length) return;
    const { data } = await supabase.from("children").select("*").eq("id", fam[0].child_id).single();
    if (data) { setChild(data); setChildName(data.name); setChildDob(data.date_of_birth); }
  }, [user]);

  useEffect(() => { fetchChild(); }, [fetchChild]);

  useEffect(() => {
    // Load saved night start from localStorage
    const saved = localStorage.getItem("dreamlog_night_start");
    if (saved) setNightStartHour(saved);
  }, []);

  useEffect(() => {
    if (isDark) document.documentElement.classList.remove("light");
    else document.documentElement.classList.add("light");
  }, [isDark]);

  const saveChild = async () => {
    if (!child) return;
    const { error } = await supabase.from("children").update({ name: childName, date_of_birth: childDob }).eq("id", child.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Saved!" });
  };

  const saveNightStart = (value: string) => {
    setNightStartHour(value);
    localStorage.setItem("dreamlog_night_start", value);
    toast({ title: "Night start updated", description: `Sleep starting from ${value}:00 will be classified as night.` });
  };

  const handleInvite = async () => {
    if (!child || !inviteEmail) return;
    setInviteLoading(true);
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase.from("invites").insert({
        child_id: child.id,
        invited_by: user!.id,
        email: inviteEmail,
        token,
        expires_at: expiresAt.toISOString(),
      });
      if (error) throw error;
      toast({ title: "Invite created!", description: `Share this link: ${window.location.origin}/invite?token=${token}` });
      setShowInvite(false);
      setInviteEmail("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setInviteLoading(false);
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
    const a = document.createElement("a");
    a.href = url;
    a.download = `dreamlog-${child.name}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 pt-8 pb-4 space-y-4">
      <h1 className="text-xl font-heading font-bold">Settings</h1>

      {/* Child Profile */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-heading flex items-center gap-2"><Baby className="w-4 h-4" /> Child Profile</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2"><Label>Name</Label><Input value={childName} onChange={(e) => setChildName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={childDob} onChange={(e) => setChildDob(e.target.value)} /></div>
          <Button size="sm" className="rounded-xl" onClick={saveChild}>Save</Button>
        </CardContent>
      </Card>

      {/* Night Start Time */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-heading flex items-center gap-2"><Clock className="w-4 h-4" /> Night Start Time</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">Sleep logged after this time will be auto-classified as "night".</p>
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

      {/* Theme */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <span className="text-sm font-medium">Dark Mode</span>
          <Switch checked={isDark} onCheckedChange={setIsDark} />
        </CardContent>
      </Card>

      {/* Partner Invite */}
      <Card>
        <CardContent className="p-4">
          <Button variant="outline" className="w-full rounded-xl" onClick={() => setShowInvite(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Invite Partner
          </Button>
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardContent className="p-4">
          <Button variant="outline" className="w-full rounded-xl" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-2" /> Export Data as CSV
          </Button>
        </CardContent>
      </Card>

      {/* NHS Link */}
      <Card>
        <CardContent className="p-4">
          <a
            href="https://www.nhs.uk/conditions/baby/caring-for-a-newborn/helping-your-baby-to-sleep/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            NHS Baby Sleep Guidance
          </a>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button variant="ghost" className="w-full text-destructive rounded-xl" onClick={signOut}>
        <LogOut className="w-4 h-4 mr-2" /> Sign Out
      </Button>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">Invite Partner</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Partner's Email</Label><Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="partner@example.com" /></div>
            <Button className="w-full rounded-xl" onClick={handleInvite} disabled={inviteLoading || !inviteEmail}>{inviteLoading ? "Sending..." : "Send Invite"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
