import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Moon, Clock, Sparkles, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

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
    { icon: Clock, title: "Sleep Tracking", desc: "One-tap logging with wake window timers" },
    { icon: Sparkles, title: "AI Insights", desc: "NHS-aligned tips powered by AI" },
    { icon: Volume2, title: "Sound Machine", desc: "White & brown noise to soothe your baby" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
            <Moon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold leading-tight">
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
          className="mt-8 flex flex-col sm:flex-row items-center gap-3"
        >
          <Button
            size="lg"
            className="rounded-xl px-8 min-w-[160px]"
            onClick={() => { setIsLogin(false); setShowAuth(true); }}
          >
            Sign Up Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-xl px-8 min-w-[160px]"
            onClick={() => { setIsLogin(true); setShowAuth(true); }}
          >
            Log In
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <Button
            variant="ghost"
            className="text-muted-foreground text-sm hover:text-primary"
            onClick={() => navigate("/demo")}
          >
            Try Demo (No Account)
          </Button>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg sm:max-w-2xl w-full"
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="text-center">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
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
          <Card className="max-w-sm mx-auto">
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
