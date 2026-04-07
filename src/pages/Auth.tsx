import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, Clock, AlertCircle, Home, BarChart3, Settings, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { SleepButton } from "@/components/sleep/SleepButton";
import { WakeWindowTimer } from "@/components/sleep/WakeWindowTimer";
import { TodaySummary } from "@/components/sleep/TodaySummary";
import { WeeklySummary } from "@/components/reports/WeeklySummary";
import { SleepTimeline } from "@/components/reports/SleepTimeline";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, Area, AreaChart } from "recharts";
import {
  demoTodayEntries,
  demoThisWeek,
  demoLastWeek,
  demoNhsRange,
  demoLastWakeTime,
  demoHistoryEntries,
  demoWakingCounts,
  demoEntries,
  DEMO_DOB,
  DEMO_CHILD_NAME,
} from "@/lib/demoData";

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { toast } = useToast();
  const authRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "We've sent you a password reset link." });
        setIsForgot(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "Account created!", description: "Check your email to confirm your account." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const scrollToAuth = () => {
    setShowAuth(true);
    setTimeout(() => authRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "In progress";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const nhsChartData = demoThisWeek.map((d) => ({
    ...d,
    nhsMin: demoNhsRange.min,
    nhsMax: demoNhsRange.max,
  }));

  // Timeline entries for last 7 days
  const timelineEntries = demoEntries.filter((e) => {
    const d = new Date(e.sleep_start);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  });

  return (
    <div className="min-h-[100dvh] pb-20">
      {/* Hero */}
      <div className="flex flex-col items-center pt-12 pb-8 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <Moon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold">DreamLog</h1>
          <p className="text-muted-foreground text-sm mt-1 mb-2">Baby Sleep Tracker</p>
          <p className="text-muted-foreground text-xs text-center max-w-xs">
            Track sleep, monitor wake windows, get AI-powered insights — all in one calming app.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-col items-center gap-2"
        >
          <Button onClick={scrollToAuth} className="rounded-xl px-8 text-sm">
            Start Tracking — It's Free
          </Button>
          <button onClick={scrollToAuth} className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            Already have an account? Sign in
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8, duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          className="mt-8"
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </div>

      {/* Demo: Dashboard */}
      <div className="px-4 space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Dashboard</p>
          <p className="text-xs text-muted-foreground">See {DEMO_CHILD_NAME}'s sleep at a glance</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="flex flex-col items-center"
        >
          <WakeWindowTimer lastWakeTime={demoLastWakeTime} dob={DEMO_DOB} />
          <div className="pointer-events-none opacity-90">
            <SleepButton isSleeping={false} onToggle={() => {}} />
          </div>
          <TodaySummary entries={demoTodayEntries} />
        </motion.div>

        {/* Demo: Reports */}
        <div className="space-y-1 pt-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Reports</p>
          <p className="text-xs text-muted-foreground">Weekly trends and NHS-aligned insights</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="space-y-4"
        >
          <WeeklySummary thisWeek={demoThisWeek} lastWeek={demoLastWeek} />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">Daily Sleep</CardTitle>
            </CardHeader>
            <CardContent className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demoThisWeek}>
                  <XAxis dataKey="day" tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} axisLine={false} tickLine={false} unit="h" width={30} />
                  <Tooltip contentStyle={{ background: "hsl(217 33% 17%)", border: "1px solid hsl(217 33% 22%)", borderRadius: "8px", color: "hsl(210 40% 96%)" }} />
                  <ReferenceLine y={demoNhsRange.max} stroke="hsl(149 80% 74%)" strokeDasharray="4 4" />
                  <ReferenceLine y={demoNhsRange.min} stroke="hsl(149 80% 74%)" strokeDasharray="4 4" label={{ value: "NHS", fill: "hsl(149 80% 74%)", fontSize: 10, position: "right" }} />
                  <Bar dataKey="night" stackId="a" fill="hsl(263 70% 76%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="nap" stackId="a" fill="hsl(263 70% 76% / 0.4)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">Sleep vs NHS Range</CardTitle>
            </CardHeader>
            <CardContent className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={nhsChartData}>
                  <XAxis dataKey="day" tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} axisLine={false} tickLine={false} unit="h" width={30} domain={[0, "auto"]} />
                  <Tooltip contentStyle={{ background: "hsl(217 33% 17%)", border: "1px solid hsl(217 33% 22%)", borderRadius: "8px", color: "hsl(210 40% 96%)" }} />
                  <Area type="monotone" dataKey="nhsMax" stackId="nhs" stroke="none" fill="hsl(149 80% 74% / 0.1)" />
                  <Area type="monotone" dataKey="nhsMin" stackId="nhs" stroke="none" fill="hsl(217 33% 17%)" />
                  <Area type="monotone" dataKey="total" stroke="hsl(263 70% 76%)" fill="hsl(263 70% 76% / 0.2)" strokeWidth={2} dot={{ fill: "hsl(263 70% 76%)", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
            <div className="px-6 pb-4">
              <p className="text-[10px] text-muted-foreground">Green band = NHS recommended range ({demoNhsRange.min}–{demoNhsRange.max}h)</p>
            </div>
          </Card>

          <SleepTimeline entries={timelineEntries} days={7} />
        </motion.div>

        {/* Demo: History */}
        <div className="space-y-1 pt-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">History</p>
          <p className="text-xs text-muted-foreground">Every sleep logged, editable and searchable</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="space-y-3"
        >
          {demoHistoryEntries.slice(0, 5).map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${entry.sleep_type === "night" ? "bg-primary/20" : "bg-warning/20"}`}>
                    {entry.sleep_type === "night" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-warning" />}
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
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-8 flex flex-col items-center gap-3"
        >
          <p className="text-sm text-muted-foreground text-center">
            Join thousands of parents tracking with DreamLog
          </p>
          <Button onClick={scrollToAuth} size="lg" className="rounded-xl px-10">
            Start Tracking — It's Free
          </Button>
        </motion.div>

        {/* Auth Form */}
        <div ref={authRef} className="pt-8 pb-8">
          {showAuth && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-sm mx-auto"
            >
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="font-heading">
                    {isForgot ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
                  </CardTitle>
                  <CardDescription>
                    {isForgot
                      ? "Enter your email to receive a reset link"
                      : isLogin
                      ? "Sign in to track your little one's sleep"
                      : "Start tracking your baby's sleep today"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    {!isForgot && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                      </div>
                    )}
                    <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                      {loading
                        ? "Loading..."
                        : isForgot
                        ? "Send Reset Link"
                        : isLogin
                        ? "Sign In"
                        : "Create Account"}
                    </Button>
                  </form>

                  <div className="mt-4 text-center space-y-2">
                    {!isForgot && (
                      <button
                        onClick={() => setIsForgot(true)}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                    <div>
                      <button
                        onClick={() => { setIsLogin(!isLogin); setIsForgot(false); }}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Demo Bottom Nav (visual only) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
          {[
            { icon: Home, label: "Home", active: true },
            { icon: Clock, label: "History", active: false },
            { icon: BarChart3, label: "Reports", active: false },
            { icon: Settings, label: "Settings", active: false },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              onClick={scrollToAuth}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] rounded-xl transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Auth;
