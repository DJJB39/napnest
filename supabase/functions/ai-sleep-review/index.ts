import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { childId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get child info
    const { data: child } = await supabase.from("children").select("*").eq("id", childId).single();
    if (!child) throw new Error("Child not found");

    // Get last 14 days of sleep data
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const { data: entries } = await supabase
      .from("sleep_entries")
      .select("*")
      .eq("child_id", childId)
      .eq("is_deleted", false)
      .gte("sleep_start", since.toISOString())
      .order("sleep_start", { ascending: true });

    // Calculate age
    const ageMs = Date.now() - new Date(child.date_of_birth).getTime();
    const ageWeeks = Math.floor(ageMs / (7 * 24 * 60 * 60 * 1000));
    const ageMonths = Math.floor(ageMs / (30.44 * 24 * 60 * 60 * 1000));

    // Format data for AI
    const sleepSummary = (entries || []).map(e => {
      const dur = e.sleep_end ? Math.round((new Date(e.sleep_end).getTime() - new Date(e.sleep_start).getTime()) / 60000) : null;
      return `${e.sleep_type} | ${e.sleep_start} → ${e.sleep_end || 'ongoing'} | ${dur ? dur + ' min' : 'ongoing'}`;
    }).join("\n");

    const systemPrompt = `You are a gentle, reassuring baby sleep consultant. You analyse sleep data and provide age-appropriate guidance based on NHS recommendations.

Key rules:
- Be warm, supportive, and never judgmental
- For babies under 3 months: NEVER recommend strict schedules. Emphasise that irregular sleep is completely normal.
- Always cite specific data from the logs (e.g., "bedtime shifted 20 minutes later over the week")
- Provide 2-3 actionable, age-appropriate suggestions
- Mention NHS recommended sleep ranges for context
- End with reassurance

NHS sleep ranges:
- Newborn (0-3 months): 8-17 hours (very variable, no set pattern expected)
- 3-6 months: 12-16 hours total
- 6-12 months: 12-16 hours total
- 1-2 years: 11-14 hours total`;

    const userPrompt = `Baby: ${child.name}, Age: ${ageWeeks} weeks (${ageMonths} months)

Sleep data from last 14 days:
${sleepSummary || "No sleep data recorded yet."}

Please provide a sleep review with patterns, observations, and recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings > Workspace > Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("AI gateway error: " + response.status);
    }

    const aiData = await response.json();
    const review = aiData.choices?.[0]?.message?.content || "Unable to generate review.";

    // Store review
    await supabase.from("ai_reviews").insert({
      child_id: childId,
      review_text: review,
      data_range: "14 days",
      model_used: "gemini-2.5-flash",
    });

    return new Response(JSON.stringify({ review }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-sleep-review error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
