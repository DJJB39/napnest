import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, Area, AreaChart } from "recharts";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WeeklySummary } from "@/components/reports/WeeklySummary";
import { SleepTimeline } from "@/components/reports/SleepTimeline";

interface DayData {
  day: string;
  nap: number;
  night: number;
  total: number;
}

// NHS recommended total sleep by age (months)
const getNhsRange = (ageMonths: number): { min: number; max: number } => {
  if (ageMonths < 3) return { min: 8, max: 17 };
  if (ageMonths < 6) return { min: 12, max: 16 };
  if (ageMonths < 12) return { min: 12, max: 16 };
  if (ageMonths < 24) return { min: 11, max: 14 };
  return { min: 10, max: 13 };
};

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [thisWeekData, setThisWeekData] = useState<DayData[]>([]);
  const [lastWeekData, setLastWeekData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [childId, setChildId] = useState<string | null>(null);
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [pastReviews, setPastReviews] = useState<any[]>([]);
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [nhsRange, setNhsRange] = useState({ min: 12, max: 16 });
  const [viewDays, setViewDays] = useState(7);

  const fetchDayData = async (cId: string, daysAgo: number, count: number): Promise<DayData[]> => {
    const days: DayData[] = [];
    for (let i = daysAgo + count - 1; i >= daysAgo; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const { data: entries } = await supabase
        .from("sleep_entries")
        .select("*")
        .eq("child_id", cId)
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
    return days;
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    const { data: fam } = await supabase.from("family_members").select("child_id").eq("user_id", user.id).limit(1);
    if (!fam?.length) { setLoading(false); return; }
    setChildId(fam[0].child_id);

    // Get child age for NHS range
    const { data: child } = await supabase.from("children").select("date_of_birth").eq("id", fam[0].child_id).single();
    if (child) {
      const ageMs = Date.now() - new Date(child.date_of_birth).getTime();
      const ageMonths = Math.floor(ageMs / (30.44 * 24 * 60 * 60 * 1000));
      setNhsRange(getNhsRange(ageMonths));
    }

    const [thisWeek, lastWeek] = await Promise.all([
      fetchDayData(fam[0].child_id, 0, viewDays),
      fetchDayData(fam[0].child_id, viewDays, viewDays),
    ]);
    setThisWeekData(thisWeek);
    setLastWeekData(lastWeek);

    // All entries for timeline
    const since = new Date();
    since.setDate(since.getDate() - viewDays);
    const { data: entries } = await supabase
      .from("sleep_entries")
      .select("sleep_start, sleep_end, sleep_type")
      .eq("child_id", fam[0].child_id)
      .eq("is_deleted", false)
      .gte("sleep_start", since.toISOString())
      .order("sleep_start");
    setAllEntries(entries || []);

    // Past AI reviews
    const { data: reviews } = await supabase.from("ai_reviews").select("*").eq("child_id", fam[0].child_id).order("created_at", { ascending: false }).limit(5);
    setPastReviews(reviews || []);

    setLoading(false);
  }, [user, viewDays]);

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

  // NHS range chart data
  const nhsChartData = thisWeekData.map((d) => ({
    ...d,
    nhsMin: nhsRange.min,
    nhsMax: nhsRange.max,
    inRange: d.total >= nhsRange.min && d.total <= nhsRange.max,
  }));

  if (loading) return <div className="flex items-center justify-center min-h-[80dvh]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="px-4 pt-8 pb-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-heading font-bold">Sleep Reports</h1>
        <div className="flex gap-1">
          {[7, 14, 30].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={viewDays === d ? "default" : "ghost"}
              className="rounded-lg text-xs h-7 px-3"
              onClick={() => setViewDays(d)}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* Weekly Summary */}
      <WeeklySummary thisWeek={thisWeekData} lastWeek={lastWeekData} />

      {/* Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading">Daily Sleep</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={thisWeekData}>
              <XAxis dataKey="day" tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} axisLine={false} tickLine={false} unit="h" width={30} />
              <Tooltip contentStyle={{ background: "hsl(217 33% 17%)", border: "1px solid hsl(217 33% 22%)", borderRadius: "8px", color: "hsl(210 40% 96%)" }} />
              <ReferenceLine y={nhsRange.max} stroke="hsl(149 80% 74%)" strokeDasharray="4 4" />
              <ReferenceLine y={nhsRange.min} stroke="hsl(149 80% 74%)" strokeDasharray="4 4" label={{ value: "NHS", fill: "hsl(149 80% 74%)", fontSize: 10, position: "right" }} />
              <Bar dataKey="night" stackId="a" fill="hsl(263 70% 76%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="nap" stackId="a" fill="hsl(263 70% 76% / 0.4)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* NHS Range Chart */}
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
          <p className="text-[10px] text-muted-foreground">Green band = NHS recommended range ({nhsRange.min}–{nhsRange.max}h). Values outside range shown in amber — wide variation is normal, especially for newborns.</p>
        </div>
      </Card>

      {/* Sleep Timeline */}
      <SleepTimeline entries={allEntries} days={viewDays > 14 ? 14 : viewDays} />

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
              <p className="text-[10px] text-muted-foreground italic">⚠️ This is informational, not medical advice. See <a href="https://www.nhs.uk/conditions/baby/caring-for-a-newborn/helping-your-baby-to-sleep/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">NHS baby sleep guidance</a> for official recommendations.</p>
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
