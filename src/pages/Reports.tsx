import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from "recharts";
import { Sparkles, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [childId, setChildId] = useState<string | null>(null);
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [pastReviews, setPastReviews] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const { data: fam } = await supabase.from("family_members").select("child_id").eq("user_id", user.id).limit(1);
    if (!fam?.length) { setLoading(false); return; }
    setChildId(fam[0].child_id);

    // Last 7 days
    const days: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const { data: entries } = await supabase
        .from("sleep_entries")
        .select("*")
        .eq("child_id", fam[0].child_id)
        .eq("is_deleted", false)
        .gte("sleep_start", d.toISOString())
        .lt("sleep_start", next.toISOString())
        .not("sleep_end", "is", null);

      const napMs = (entries || []).filter(e => e.sleep_type === "nap").reduce((s, e) => s + (new Date(e.sleep_end!).getTime() - new Date(e.sleep_start).getTime()), 0);
      const nightMs = (entries || []).filter(e => e.sleep_type === "night").reduce((s, e) => s + (new Date(e.sleep_end!).getTime() - new Date(e.sleep_start).getTime()), 0);

      days.push({
        day: d.toLocaleDateString([], { weekday: "short" }),
        nap: +(napMs / 3600000).toFixed(1),
        night: +(nightMs / 3600000).toFixed(1),
        total: +((napMs + nightMs) / 3600000).toFixed(1),
      });
    }
    setChartData(days);

    // Past AI reviews
    const { data: reviews } = await supabase.from("ai_reviews").select("*").eq("child_id", fam[0].child_id).order("created_at", { ascending: false }).limit(5);
    setPastReviews(reviews || []);

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAiReview = async () => {
    if (!childId) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-sleep-review", {
        body: { childId },
      });
      if (error) throw error;
      setAiReview(data.review);
      fetchData();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to get AI review", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[80dvh]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="px-4 pt-8 pb-4 space-y-6">
      <h1 className="text-xl font-heading font-bold">Sleep Reports</h1>

      {/* Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading">Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} axisLine={false} tickLine={false} unit="h" width={30} />
              <Tooltip contentStyle={{ background: "hsl(217 33% 17%)", border: "1px solid hsl(217 33% 22%)", borderRadius: "8px", color: "hsl(210 40% 96%)" }} />
              <ReferenceLine y={14} stroke="hsl(149 80% 74%)" strokeDasharray="4 4" label={{ value: "NHS range", fill: "hsl(149 80% 74%)", fontSize: 10, position: "right" }} />
              <Bar dataKey="night" stackId="a" fill="hsl(263 70% 76%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="nap" stackId="a" fill="hsl(263 70% 76% / 0.4)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Review */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> AI Sleep Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleAiReview} disabled={aiLoading} className="w-full rounded-xl" variant="outline">
            {aiLoading ? "Analysing..." : "Get AI Review"}
          </Button>
          {aiReview && (
            <div className="space-y-2">
              <p className="text-sm whitespace-pre-wrap">{aiReview}</p>
              <p className="text-[10px] text-muted-foreground italic">⚠️ This is informational, not medical advice. See NHS baby sleep guidance for official recommendations.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Reviews */}
      {pastReviews.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-heading">Past Reviews</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pastReviews.map((r) => (
              <div key={r.id} className="border-b border-border pb-3 last:border-0">
                <p className="text-[10px] text-muted-foreground mb-1">{new Date(r.created_at).toLocaleDateString()}</p>
                <p className="text-xs whitespace-pre-wrap">{r.review_text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
