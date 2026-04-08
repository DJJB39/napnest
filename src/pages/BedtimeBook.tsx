import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Lock, Volume2, VolumeX, ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface MateriaInfo {
  key: string;
  name: string;
  color: string;
}

const MATERIA_MAP: Record<number, MateriaInfo> = {
  2: { key: "smile", name: "Smile Materia", color: "#FFD700" },
  3: { key: "head_lift", name: "Strength Materia", color: "#C0C0C0" },
  5: { key: "roll", name: "Roll Materia", color: "#FF69B4" },
  7: { key: "sit", name: "Balance Materia", color: "#2DD4BF" },
  9: { key: "crawl", name: "Crawl Materia", color: "#22C55E" },
  10: { key: "pull_stand", name: "Rise Materia", color: "#A78BFA" },
  12: { key: "walk", name: "Walk Materia", color: "#3B82F6" },
  15: { key: "climb", name: "Climb Materia", color: "#F97316" },
  18: { key: "run", name: "Run Materia", color: "#EF4444" },
  20: { key: "kick", name: "Power Materia", color: "#DC2626" },
};

interface ChapterData {
  chapter_number: number;
  title: string;
  story_text: string;
  illustration_url: string | null;
  materia_name: string | null;
  materia_color: string | null;
}

const BedtimeBook = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [childId, setChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState("");
  const [ageMonths, setAgeMonths] = useState(0);
  const [achievedKeys, setAchievedKeys] = useState<Set<string>>(new Set());
  const [cachedChapters, setCachedChapters] = useState<Map<number, ChapterData>>(new Map());
  const [activeChapter, setActiveChapter] = useState<ChapterData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [narrating, setNarrating] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const { data: fm } = await supabase
      .from("family_members").select("child_id").eq("user_id", user.id).limit(1);
    if (!fm?.length) { setLoading(false); return; }

    const cid = fm[0].child_id;
    setChildId(cid);

    const [childRes, milestoneRes, chaptersRes] = await Promise.all([
      supabase.from("children").select("name, date_of_birth").eq("id", cid).single(),
      supabase.from("milestones").select("milestone_key").eq("child_id", cid),
      supabase.from("bedtime_chapters").select("*").eq("child_id", cid),
    ]);

    if (childRes.data) {
      setChildName(childRes.data.name);
      const dob = new Date(childRes.data.date_of_birth);
      setAgeMonths(Math.floor((Date.now() - dob.getTime()) / (30.44 * 24 * 60 * 60 * 1000)));
    }

    if (milestoneRes.data) {
      setAchievedKeys(new Set(milestoneRes.data.map((m) => m.milestone_key)));
    }

    if (chaptersRes.data) {
      const map = new Map<number, ChapterData>();
      chaptersRes.data.forEach((c) => map.set(c.chapter_number, c as ChapterData));
      setCachedChapters(map);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isUnlocked = (chapterNum: number) => {
    if (chapterNum > ageMonths) return false;
    const materia = MATERIA_MAP[chapterNum];
    if (materia && !achievedKeys.has(materia.key)) return false;
    return true;
  };

  const openChapter = async (chapterNum: number) => {
    // Check cache
    const cached = cachedChapters.get(chapterNum);
    if (cached) { setActiveChapter(cached); return; }

    // Generate
    setGenerating(true);
    try {
      const resp = await supabase.functions.invoke("generate-chapter", {
        body: {
          childId,
          childName,
          chapterNumber: chapterNum,
          ageMonths,
          milestonesAchieved: Array.from(achievedKeys),
        },
      });

      if (resp.error) throw new Error(resp.error.message || "Generation failed");
      const data = resp.data as ChapterData;
      setCachedChapters((prev) => new Map(prev).set(chapterNum, data));
      setActiveChapter(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not generate chapter", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const toggleNarration = () => {
    if (narrating) {
      window.speechSynthesis.cancel();
      setNarrating(false);
      return;
    }
    if (!activeChapter || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(activeChapter.story_text);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.onend = () => setNarrating(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setNarrating(true);
  };

  const closeChapter = () => {
    window.speechSynthesis.cancel();
    setNarrating(false);
    setActiveChapter(null);
  };

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  // Chapter reader view
  if (activeChapter) {
    const bgClass = activeChapter.chapter_number < 6
      ? "bg-gradient-to-b from-[hsl(220,40%,15%)] to-card"
      : activeChapter.chapter_number < 12
      ? "bg-gradient-to-b from-[hsl(260,30%,18%)] to-card"
      : "bg-gradient-to-b from-[hsl(280,35%,12%)] to-card";

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`min-h-[80dvh] px-4 pt-6 pb-24 ${bgClass}`}
      >
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={closeChapter}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {"speechSynthesis" in window && (
            <Button variant="ghost" size="sm" onClick={toggleNarration}>
              {narrating ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="ml-1 text-xs">{narrating ? "Stop" : "Read aloud"}</span>
            </Button>
          )}
        </div>

        {/* Materia orb animation */}
        {activeChapter.materia_color && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 1.2 }}
            className="flex flex-col items-center mb-4"
          >
            <div
              className="w-16 h-16 rounded-full animate-pulse"
              style={{
                background: `radial-gradient(circle, ${activeChapter.materia_color}, transparent)`,
                boxShadow: `0 0 30px ${activeChapter.materia_color}60, 0 0 60px ${activeChapter.materia_color}30`,
              }}
            />
            <span className="text-xs mt-2 font-heading font-semibold text-muted-foreground">
              {activeChapter.materia_name}
            </span>
          </motion.div>
        )}

        {activeChapter.illustration_url && (
          <motion.img
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            src={activeChapter.illustration_url}
            alt="Chapter illustration"
            className="w-full max-w-xs mx-auto rounded-2xl mb-4 shadow-lg"
          />
        )}

        <h2 className="text-lg font-heading font-bold text-center mb-4">{activeChapter.title}</h2>
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line text-center max-w-sm mx-auto">
          {activeChapter.story_text}
        </p>

        <p className="text-center text-xs text-primary/60 mt-6 italic">
          Sweet dreams — tomorrow&apos;s adventure awaits! 🌙✨
        </p>
      </motion.div>
    );
  }

  // Chapter list
  const chapters = Array.from({ length: 24 }, (_, i) => i); // 0-23

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-5 mb-6 text-center"
        style={{
          background: "linear-gradient(135deg, hsl(260 50% 20% / 0.5), hsl(280 40% 15% / 0.5))",
        }}
      >
        <BookOpen className="w-10 h-10 mx-auto mb-2 text-primary" />
        <h1 className="text-xl font-heading font-bold">The Materia Saga</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {childName}&apos;s bedtime adventure — 24 chapters, Months 0–23 ✨
        </p>
      </motion.div>

      {generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-3"
        >
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <div>
            <p className="text-sm font-heading font-semibold">Generating story…</p>
            <p className="text-xs text-muted-foreground">This may take 10–20 seconds</p>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {chapters.map((chapterNum) => {
          const unlocked = isUnlocked(chapterNum);
          const materia = MATERIA_MAP[chapterNum];
          const cached = cachedChapters.get(chapterNum);
          const isEarly = chapterNum < 6;
          const isMid = chapterNum >= 6 && chapterNum < 12;

          return (
            <motion.button
              key={chapterNum}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: chapterNum * 0.03 }}
              disabled={!unlocked || generating}
              onClick={() => openChapter(chapterNum)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                unlocked
                  ? "bg-card border border-border/30 hover:border-primary/30 hover:shadow-md"
                  : "bg-muted/20 border border-transparent opacity-50"
              } ${isEarly ? "" : isMid ? "border-l-2 border-l-primary/20" : "border-l-2 border-l-primary/40"}`}
            >
              {/* Materia orb or lock */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                {unlocked ? (
                  materia ? (
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${MATERIA_MAP[chapterNum]?.color || "hsl(var(--primary))"}, transparent)`,
                        boxShadow: unlocked ? `0 0 12px ${MATERIA_MAP[chapterNum]?.color || "transparent"}40` : "none",
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                  )
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-heading font-semibold truncate ${unlocked ? "text-foreground" : "text-muted-foreground/50"}`}>
                  {cached ? cached.title : `Chapter ${chapterNum} — Month ${chapterNum}`}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {materia ? materia.name : "Dream chapter"}
                  {cached && " ✓"}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BedtimeBook;
