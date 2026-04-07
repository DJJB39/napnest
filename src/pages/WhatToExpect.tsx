import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Baby, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface MilestoneItem {
  key: string;
  label: string;
  emoji: string;
}

interface AgeRange {
  label: string;
  minMonths: number;
  maxMonths: number;
  description: string;
  milestones: MilestoneItem[];
}

const NHS_RANGES: AgeRange[] = [
  {
    label: "0–3 months",
    minMonths: 0,
    maxMonths: 3,
    description: "Your little one is discovering the world!",
    milestones: [
      { key: "head_lift", label: "Lifts head on tummy (chin up by 3mo)", emoji: "💪" },
      { key: "smile", label: "Smiles at carers (from 6–8 weeks)", emoji: "😊" },
      { key: "dribble_early", label: "Lots of dribbling — salivary glands active, normal!", emoji: "🤤" },
    ],
  },
  {
    label: "3–6 months",
    minMonths: 3,
    maxMonths: 6,
    description: "Getting stronger and more curious every day.",
    milestones: [
      { key: "roll", label: "Rolls both ways (front-to-back by 7mo)", emoji: "🔄" },
      { key: "grasp_feet", label: "Grasps own feet", emoji: "🦶" },
      { key: "weight_legs", label: "Supports weight on legs when held", emoji: "🦵" },
    ],
  },
  {
    label: "6–9 months",
    minMonths: 6,
    maxMonths: 9,
    description: "On the move — watch out!",
    milestones: [
      { key: "sit", label: "Sits unsupported (by 8–9mo)", emoji: "🪑" },
      { key: "pivot", label: "Pivots on tummy", emoji: "🔃" },
      { key: "crawl", label: "Commando crawl or bottom shuffle (7–10mo)", emoji: "🐛" },
    ],
  },
  {
    label: "9–12 months",
    minMonths: 9,
    maxMonths: 12,
    description: "Standing tall and getting ready to walk!",
    milestones: [
      { key: "pull_stand", label: "Pulls to stand", emoji: "🧗" },
      { key: "cruise", label: "Cruises along furniture", emoji: "🚶" },
      { key: "first_steps", label: "First independent steps possible (12–18mo)", emoji: "👣" },
    ],
  },
  {
    label: "12–18 months",
    minMonths: 12,
    maxMonths: 18,
    description: "A proper little explorer now!",
    milestones: [
      { key: "walk", label: "Walks alone (wobbly, wide stance)", emoji: "🚶‍♂️" },
      { key: "climb", label: "Climbs stairs with help", emoji: "🪜" },
    ],
  },
  {
    label: "18–24 months",
    minMonths: 18,
    maxMonths: 24,
    description: "Full-speed mayhem — and it's wonderful!",
    milestones: [
      { key: "run", label: "Runs!", emoji: "🏃" },
      { key: "kick", label: "Kicks a ball", emoji: "⚽" },
      { key: "climb_furniture", label: "Climbs furniture — watch out!", emoji: "🛋️" },
    ],
  },
];

const WhatToExpect = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [childId, setChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState("");
  const [ageMonths, setAgeMonths] = useState(0);
  const [ageWeeks, setAgeWeeks] = useState(0);
  const [achievedKeys, setAchievedKeys] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    if (!user) return;
    const { data: fm } = await supabase
      .from("family_members").select("child_id").eq("user_id", user.id).limit(1);
    if (!fm?.length) { setLoading(false); return; }

    const cid = fm[0].child_id;
    setChildId(cid);

    const [childRes, milestoneRes] = await Promise.all([
      supabase.from("children").select("name, date_of_birth").eq("id", cid).single(),
      supabase.from("milestones").select("milestone_key").eq("child_id", cid),
    ]);

    if (childRes.data) {
      setChildName(childRes.data.name);
      const dob = new Date(childRes.data.date_of_birth);
      const diffMs = Date.now() - dob.getTime();
      setAgeWeeks(Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)));
      setAgeMonths(Math.floor(diffMs / (30.44 * 24 * 60 * 60 * 1000)));
    }

    if (milestoneRes.data) {
      setAchievedKeys(new Set(milestoneRes.data.map((m) => m.milestone_key)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleMilestone = async (key: string) => {
    if (!childId) return;
    if (achievedKeys.has(key)) {
      await supabase.from("milestones").delete().eq("child_id", childId).eq("milestone_key", key);
      setAchievedKeys((prev) => { const n = new Set(prev); n.delete(key); return n; });
    } else {
      const { error } = await supabase.from("milestones").insert({ child_id: childId, milestone_key: key });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      setAchievedKeys((prev) => new Set(prev).add(key));
      toast({ title: "🎉 Milestone achieved!", description: `${key.replace(/_/g, " ")} — well done!` });
    }
  };

  const getCurrentRangeIndex = () => {
    for (let i = NHS_RANGES.length - 1; i >= 0; i--) {
      if (ageMonths >= NHS_RANGES[i].minMonths) return i;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const currentIdx = getCurrentRangeIndex();
  const sortedRanges = [
    NHS_RANGES[currentIdx],
    ...NHS_RANGES.filter((_, i) => i !== currentIdx),
  ];

  const ageDisplay = ageMonths < 1
    ? `${ageWeeks} week${ageWeeks !== 1 ? "s" : ""}`
    : `${ageMonths} month${ageMonths !== 1 ? "s" : ""}`;

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-5 mb-6 text-center"
        style={{
          background: "linear-gradient(135deg, hsl(220 60% 85% / 0.3), hsl(330 60% 85% / 0.3))",
        }}
      >
        <Baby className="w-10 h-10 mx-auto mb-2 text-primary" />
        <h1 className="text-xl font-display font-bold">At {ageDisplay}, here&apos;s what to expect</h1>
        <p className="text-muted-foreground text-sm mt-1">Straight from NHS UK! 🏥</p>
      </motion.div>

      {/* Age range cards */}
      <div className="space-y-4">
        {sortedRanges.map((range, idx) => {
          const isCurrent = idx === 0;
          const isPast = range.maxMonths <= ageMonths;
          return (
            <motion.div
              key={range.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`rounded-2xl border p-4 ${
                isCurrent
                  ? "border-primary/30 bg-card shadow-lg"
                  : "border-border/30 bg-card/60"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-heading font-bold ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                  {range.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{range.description}</p>

              <div className="space-y-2">
                {range.milestones.map((m) => {
                  const achieved = achievedKeys.has(m.key);
                  const overdue = isPast && !achieved;
                  return (
                    <button
                      key={m.key}
                      onClick={() => toggleMilestone(m.key)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                        achieved
                          ? "bg-success/10 border border-success/20"
                          : "bg-muted/30 border border-transparent hover:border-primary/20"
                      }`}
                    >
                      <span className="text-lg">{m.emoji}</span>
                      <span className={`text-xs flex-1 ${achieved ? "text-success line-through" : "text-foreground"}`}>
                        {m.label}
                      </span>
                      {achieved ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : overdue ? (
                        <AlertCircle className="w-4 h-4 text-warning/60" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {isPast && range.milestones.some((m) => !achievedKeys.has(m.key)) && (
                <p className="text-[10px] text-muted-foreground mt-2 italic flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Every baby is different — chat to your health visitor if worried
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Teething notes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 rounded-2xl border border-border/30 bg-card/60 p-4"
      >
        <h3 className="text-sm font-heading font-bold mb-2">🦷 Teething Notes</h3>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li>• Usually starts around 6 months (some babies 3–4mo or 12mo!)</li>
          <li>• Signs: sore gums, red cheeks, more dribbling</li>
          <li>• Relief: teething gel, cold teething rings, lots of cuddles</li>
          <li>• Dribbling ≠ teething before 6mo — it&apos;s just salivary glands waking up!</li>
        </ul>
      </motion.div>

      {/* Footer */}
      <p className="text-center text-[10px] text-muted-foreground/50 mt-6">
        Source: NHS.uk — All normal! Track it all in NapNest 💜
      </p>
    </div>
  );
};

export default WhatToExpect;
