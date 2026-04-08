import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Clock, Sparkles, Volume2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SleepingBabyNest, SleepingCloud } from "@/components/decorative/MoonStars";

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

  const features = [
    { icon: Clock, emoji: "😴", title: "One-Tap Tracking", desc: "Because 3am you can't handle buttons", gradient: "from-teal-400 to-cyan-500", glow: "hover:ring-teal-400/30" },
    { icon: Sparkles, emoji: "🧠", title: "AI Sleep Coach", desc: "Smarter than your mum's advice (sorry mum)", gradient: "from-violet-400 to-purple-500", glow: "hover:ring-violet-400/30" },
    { icon: Volume2, emoji: "🌊", title: "Sound Machine", desc: "Shhhh machine goes brrr", gradient: "from-pink-400 to-rose-500", glow: "hover:ring-pink-400/30" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-hero grain-overlay overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        backgroundImage: `
          radial-gradient(1.5px 1.5px at 15% 20%, hsl(38 80% 75% / 0.2) 50%, transparent 50%),
          radial-gradient(1px 1px at 45% 8%, hsl(38 80% 75% / 0.15) 50%, transparent 50%),
          radial-gradient(2px 2px at 78% 15%, hsl(38 80% 75% / 0.18) 50%, transparent 50%),
          radial-gradient(1px 1px at 90% 35%, hsl(38 80% 75% / 0.12) 50%, transparent 50%),
          radial-gradient(1.5px 1.5px at 8% 60%, hsl(38 80% 75% / 0.1) 50%, transparent 50%),
          radial-gradient(1px 1px at 65% 45%, hsl(38 80% 75% / 0.12) 50%, transparent 50%)
        `,
      }} />

      <SleepingCloud className="absolute top-8 left-4 w-28 h-18 opacity-20" />
      <SleepingCloud className="absolute top-24 right-6 w-22 h-14 opacity-15" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center text-center max-w-md"
        >
          <SleepingBabyNest className="w-72 h-64 sm:w-80 sm:h-72 mb-6 drop-shadow-lg" />

          <h1 className="text-4xl sm:text-5xl font-heading font-bold leading-tight text-foreground">
            NapNest: Track Your Baby's Sleep Like Magic
          </h1>
          <p className="text-muted-foreground mt-4 text-sm sm:text-base font-sans max-w-sm leading-relaxed">
            Log naps, get AI tips, soothe with noise — free & simple
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 z-10"
        >
          <Button
            size="lg"
            className="rounded-2xl px-8 min-w-[180px] btn-hover glow-green font-heading font-semibold text-base"
            style={{ background: "hsl(155 60% 48%)", color: "white" }}
            onClick={() => { setIsLogin(false); setIsForgot(false); setShowAuth(true); }}
          >
            Sign Up Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-2xl px-8 min-w-[160px] btn-hover font-heading font-semibold"
            onClick={() => { setIsLogin(true); setIsForgot(false); setShowAuth(true); }}
          >
            Log In
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 z-10"
        >
          <Button
            size="lg"
            className="rounded-2xl px-8 min-w-[180px] btn-hover glow-orange font-heading font-semibold text-base"
            style={{ background: "hsl(28 90% 55%)", color: "white" }}
            onClick={() => navigate("/demo")}
          >
            🧸 Try Demo
          </Button>
        </motion.div>

        {/* Feature cards — glassmorphic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-lg sm:max-w-2xl w-full z-10"
        >
          {features.map(({ icon: Icon, emoji, title, desc, gradient, glow }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.15 }}
              className={`group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 flex flex-col items-center gap-3 text-center transition-all duration-300 hover:scale-[1.03] hover:ring-2 ${glow} cursor-default`}
            >
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl">{emoji}</span>
              <h3 className="text-sm font-heading font-bold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "hsl(222 47% 11% / 0.5)", backdropFilter: "blur(8px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowAuth(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <Card className="w-full max-w-sm card-dreamy border-0 relative">
                <button
                  onClick={() => setShowAuth(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <CardHeader className="text-center pt-8">
                  <CardTitle className="font-heading text-xl">
                    {isForgot ? "Reset Password" : isLogin ? "Welcome Back 🌙" : "Create Account ✨"}
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
                        className="rounded-xl"
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
                          className="rounded-xl"
                        />
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full rounded-xl btn-hover font-heading font-semibold"
                      style={!isLogin && !isForgot ? { background: "hsl(155 60% 48%)", color: "white" } : undefined}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : isForgot ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
                    </Button>
                  </form>
                  <div className="mt-4 text-center space-y-2">
                    {!isForgot && (
                      <button onClick={() => setIsForgot(true)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
