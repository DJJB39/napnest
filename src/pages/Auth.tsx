import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Clock, Sparkles, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { MoonStars, SleepingBabyNest } from "@/components/decorative/MoonStars";

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
    { icon: Clock, title: "Sleep Tracking", desc: "One-tap logging with wake window timers", color: "bg-primary/15 text-primary" },
    { icon: Sparkles, title: "AI Insights", desc: "NHS-aligned tips powered by AI", color: "bg-nap/15 text-nap" },
    { icon: Volume2, title: "Sound Machine", desc: "White & brown noise to soothe your baby", color: "bg-accent/15 text-accent" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-page">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <MoonStars className="absolute top-6 right-6 w-24 h-24 opacity-30" />
        <MoonStars className="absolute bottom-20 left-4 w-16 h-16 opacity-20 rotate-45" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center text-center max-w-md relative z-10"
        >
          {/* Baby in nest illustration */}
          <SleepingBabyNest className="w-32 h-24 mb-6" />

          <h1 className="text-3xl sm:text-4xl font-heading font-bold leading-tight text-foreground">
            NapNest: Track Your Baby's Sleep Like Magic
          </h1>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Log naps, get AI tips, soothe with noise — free & simple
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 z-10"
        >
          <Button
            size="lg"
            className="rounded-2xl px-8 min-w-[160px] btn-hover glow-primary font-heading font-semibold"
            onClick={() => { setIsLogin(false); setShowAuth(true); }}
          >
            Sign Up Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-2xl px-8 min-w-[160px] btn-hover font-heading font-semibold"
            onClick={() => { setIsLogin(true); setShowAuth(true); }}
          >
            Log In
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 z-10"
        >
          <Button
            variant="ghost"
            className="text-coral font-semibold text-sm hover:text-coral/80 btn-hover"
            onClick={() => navigate("/demo")}
          >
            🧸 Try Demo (No Account)
          </Button>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg sm:max-w-2xl w-full z-10"
        >
          {features.map(({ icon: Icon, title, desc, color }) => (
            <Card key={title} className="card-dreamy card-hover text-center border-0">
              <CardContent className="p-5 flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-heading font-semibold">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

      {/* Auth Form */}
      {showAuth && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-8"
        >
          <Card className="max-w-sm mx-auto card-dreamy border-0">
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
                <Button type="submit" className="w-full rounded-xl btn-hover font-heading font-semibold" disabled={loading}>
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
      )}
    </div>
  );
};

export default Auth;
