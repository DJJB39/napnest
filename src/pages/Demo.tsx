import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, AlertCircle, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SleepButton } from "@/components/sleep/SleepButton";
import { WakeWindowTimer } from "@/components/sleep/WakeWindowTimer";
import { TodaySummary } from "@/components/sleep/TodaySummary";
import { WeeklySummary } from "@/components/reports/WeeklySummary";
import { SleepTimeline } from "@/components/reports/SleepTimeline";
import { MoonStars } from "@/components/decorative/MoonStars";
import { BarChart, Bar, XAxis as RXAxis, YAxis as RYAxis, ResponsiveContainer, ReferenceLine, Tooltip, Area, AreaChart } from "recharts";
import {
  demoTodayEntries, demoThisWeek, demoLastWeek, demoNhsRange,
  demoLastWakeTime, demoHistoryEntries, demoWakingCounts, demoEntries,
  DEMO_DOB, DEMO_CHILD_NAME,
} from "@/lib/demoData";

const Demo = () => {
  const navigate = useNavigate();
  const [showAi, setShowAi] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "reports" | "history">("dashboard");

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "In progress";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const nhsChartData = demoThisWeek.map((d) => ({ ...d, nhsMin: demoNhsRange.min, nhsMax: demoNhsRange.max }));
  const timelineEntries = demoEntries.filter((e) => {
    const d = new Date(e.sleep_start);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  });

  return (
    <div className="min-h-[100dvh] pb-24 gradient-page">
      {/* Demo banner */}
      <div className="bg-primary/10 border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="font-heading font-semibold text-foreground">Demo Mode</span> — Sample data for {DEMO_CHILD_NAME}
        </p>
        <Button size="sm" className="rounded-2xl text-xs h-7 btn-hover font-heading font-semibold" onClick={() => navigate("/auth")}>
          Sign Up Free
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border/50">
        {(["dashboard", "reports", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-heading font-semibold capitalize transition-colors ${
              activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 pt-6 space-y-6">
        {activeTab === "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-4 relative">
            <MoonStars className="absolute top-0 right-0 w-16 h-16 opacity-20" />
            <div className="text-center mb-2">
              <p className="text-muted-foreground text-sm">Tracking</p>
              <h1 className="text-xl font-heading font-bold">{DEMO_CHILD_NAME} 🌙</h1>
            </div>
            <WakeWindowTimer lastWakeTime={demoLastWakeTime} dob={DEMO_DOB} />
            <div className="pointer-events-none opacity-90">
              <SleepButton isSleeping={false} onToggle={() => {}} />
            </div>
            <TodaySummary entries={demoTodayEntries} />
          </motion.div>
        )}

        {activeTab === "reports" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h1 className="text-xl font-heading font-bold">Sleep Reports 📊</h1>
            <WeeklySummary thisWeek={demoThisWeek} lastWeek={demoLastWeek} />

            <Card className="card-dreamy border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading">Daily Sleep</CardTitle>
              </CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demoThisWeek}>
                    <RXAxis dataKey="day" tick={{ fill: "hsl(215 16% 47%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <RYAxis tick={{ fill: "hsl(215 16% 47%)", fontSize: 11 }} axisLine={false} tickLine={false} unit="h" width={30} />
                    <Tooltip contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(214 32% 91%)", borderRadius: "12px", boxShadow: "0 2px 16px hsl(0 0% 0% / 0.08)" }} />
                    <ReferenceLine y={demoNhsRange.max} stroke="hsl(160 60% 45%)" strokeDasharray="4 4" />
                    <ReferenceLine y={demoNhsRange.min} stroke="hsl(160 60% 45%)" strokeDasharray="4 4" label={{ value: "NHS", fill: "hsl(160 60% 45%)", fontSize: 10, position: "right" }} />
                    <Bar dataKey="night" stackId="a" fill="hsl(239 84% 67%)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="nap" stackId="a" fill="hsl(263 70% 70%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-dreamy border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading">Sleep vs NHS Range</CardTitle>
              </CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={nhsChartData}>
                    <RXAxis dataKey="day" tick={{ fill: "hsl(215 16% 47%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <RYAxis tick={{ fill: "hsl(215 16% 47%)", fontSize: 11 }} axisLine={false} tickLine={false} unit="h" width={30} domain={[0, "auto"]} />
                    <Tooltip contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(214 32% 91%)", borderRadius: "12px", boxShadow: "0 2px 16px hsl(0 0% 0% / 0.08)" }} />
                    <Area type="monotone" dataKey="nhsMax" stackId="nhs" stroke="none" fill="hsl(160 60% 45% / 0.1)" />
                    <Area type="monotone" dataKey="nhsMin" stackId="nhs" stroke="none" fill="hsl(0 0% 100%)" />
                    <Area type="monotone" dataKey="total" stroke="hsl(168 40% 54%)" fill="hsl(168 40% 54% / 0.15)" strokeWidth={2} dot={{ fill: "hsl(168 40% 54%)", r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
              <div className="px-6 pb-4">
                <p className="text-[10px] text-muted-foreground">Green band = NHS recommended range ({demoNhsRange.min}–{demoNhsRange.max}h)</p>
              </div>
            </Card>

            <SleepTimeline entries={timelineEntries} days={7} />
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <h1 className="text-xl font-heading font-bold mb-4">Sleep History 📝</h1>
            {demoHistoryEntries.map((entry, i) => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <div className={`card-dreamy rounded-2xl p-4 flex items-center gap-3 card-hover border-l-4 ${
                  entry.sleep_type === "night" ? "border-l-night" : "border-l-nap"
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    entry.sleep_type === "night" ? "bg-night/15" : "bg-nap/15"
                  }`}>
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
                    {demoWakingCounts[entry.id] > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-warning mt-0.5">
                        <AlertCircle className="w-3 h-3" />
                        {demoWakingCounts[entry.id]} waking{demoWakingCounts[entry.id] > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-sm font-semibold text-primary shrink-0">
                    {formatDuration(entry.sleep_start, entry.sleep_end)}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Ask AI floating button */}
      <button
        onClick={() => setShowAi(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-dreamy-lg glow-primary z-50 btn-hover"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* AI popup */}
      <AnimatePresence>
        {showAi && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-4 left-4 sm:left-auto sm:w-80 z-50"
          >
            <Card className="card-dreamy border-0">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> AI Sleep Tip
                </CardTitle>
                <button onClick={() => setShowAi(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  Your little one averaged 11 hours sleep last week — great job! Try shifting bedtime 15 mins earlier for deeper nights. Pro tip: Brown noise masks street sounds best.
                </p>
                <p className="text-[10px] text-muted-foreground mt-3 italic">
                  ⚠️ This is informational, not medical advice.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Demo;
