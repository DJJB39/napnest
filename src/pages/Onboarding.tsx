import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Baby, Sparkles, ArrowRight } from "lucide-react";

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Create child
      const { data: child, error: childError } = await supabase
        .from("children")
        .insert({ name: childName, date_of_birth: dob, created_by: user.id })
        .select()
        .single();
      if (childError) throw childError;

      // Create family member link
      const { error: famError } = await supabase
        .from("family_members")
        .insert({ user_id: user.id, child_id: child.id, role: "parent" });
      if (famError) throw famError;

      // Mark onboarding complete
      await supabase
        .from("profiles")
        .update({ onboarding_complete: true })
        .eq("id", user.id);

      navigate("/");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const screens = [
    // Screen 0: Child info
    <motion.div key="child" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Baby className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-heading font-bold">Tell us about your little one</h2>
        <p className="text-muted-foreground text-sm mt-1">We'll use this to tailor wake windows and sleep guidance</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="childName">Baby's name</Label>
          <Input id="childName" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="e.g. Luna" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dob">Date of birth</Label>
          <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().split("T")[0]} />
        </div>
      </div>
      <Button className="w-full rounded-xl" disabled={!childName || !dob} onClick={() => setStep(1)}>
        Continue <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </motion.div>,

    // Screen 1: Tutorial
    <motion.div key="tutorial" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-warning/20 flex items-center justify-center mb-4">
          <Sparkles className="w-10 h-10 text-warning" />
        </div>
        <h2 className="text-xl font-heading font-bold">One tap is all it takes</h2>
        <p className="text-muted-foreground text-sm mt-2">Tap the big button when baby falls asleep.<br />Tap again when they wake up. That's it!</p>
      </div>
      <div className="flex justify-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-sm">
            Sleep
          </div>
        </motion.div>
      </div>
      <Button className="w-full rounded-xl" onClick={handleComplete} disabled={loading}>
        {loading ? "Setting up..." : "Let's go!"}
      </Button>
    </motion.div>,
  ];

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex gap-2 mb-8 justify-center">
          {[0, 1].map((i) => (
            <div key={i} className={`h-1 rounded-full w-12 transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <AnimatePresence mode="wait">{screens[step]}</AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
