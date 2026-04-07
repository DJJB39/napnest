import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Invite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "ready" | "accepted" | "error">("loading");
  const [invite, setInvite] = useState<any>(null);

  useEffect(() => {
    const checkInvite = async () => {
      if (!token) { setStatus("error"); return; }
      const { data, error } = await supabase
        .from("invites")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .single();
      if (error || !data) { setStatus("error"); return; }
      setInvite(data);
      setStatus("ready");
    };
    checkInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!user || !invite) return;
    try {
      // Add user as family member
      await supabase.from("family_members").insert({ user_id: user.id, child_id: invite.child_id, role: "partner" });
      // Mark invite accepted
      await supabase.from("invites").update({ status: "accepted" }).eq("id", invite.id);
      setStatus("accepted");
      toast({ title: "Welcome!", description: "You now have access to your baby's sleep data." });
      setTimeout(() => navigate("/"), 1500);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (!user) return <div className="flex items-center justify-center min-h-[100dvh] p-4"><Card className="w-full max-w-sm"><CardContent className="p-6 text-center"><p className="text-sm mb-4">Please sign up or log in first, then come back to this link.</p><Button onClick={() => navigate("/auth")} className="rounded-xl">Go to Login</Button></CardContent></Card></div>;

  return (
    <div className="flex items-center justify-center min-h-[100dvh] p-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle className="font-heading text-center">Partner Invite</CardTitle></CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && <p className="text-sm text-muted-foreground">Checking invite...</p>}
          {status === "error" && <p className="text-sm text-destructive">This invite is invalid or has expired.</p>}
          {status === "ready" && <><p className="text-sm">You've been invited to track your baby's sleep together!</p><Button className="w-full rounded-xl" onClick={handleAccept}>Accept Invite</Button></>}
          {status === "accepted" && <p className="text-sm text-success">Invite accepted! Redirecting...</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default Invite;
