import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MATERIA_MAP: Record<number, { key: string; name: string; color: string }> = {
  2: { key: "smile", name: "Smile Materia", color: "gold" },
  3: { key: "head_lift", name: "Strength Materia", color: "silver" },
  5: { key: "roll", name: "Roll Materia", color: "pink" },
  7: { key: "sit", name: "Balance Materia", color: "teal" },
  9: { key: "crawl", name: "Crawl Materia", color: "green" },
  10: { key: "pull_stand", name: "Rise Materia", color: "purple" },
  12: { key: "walk", name: "Walk Materia", color: "blue" },
  15: { key: "climb", name: "Climb Materia", color: "orange" },
  18: { key: "run", name: "Run Materia", color: "red" },
  20: { key: "kick", name: "Power Materia", color: "crimson" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const { childId, childName, chapterNumber, ageMonths, milestonesAchieved } = await req.json();
    if (!childId || chapterNumber === undefined) throw new Error("Missing required fields");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Check cache first
    const { data: cached } = await supabase
      .from("bedtime_chapters")
      .select("*")
      .eq("child_id", childId)
      .eq("chapter_number", chapterNumber)
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const materia = MATERIA_MAP[chapterNumber] || null;
    const materiaName = materia?.name || null;
    const materiaColor = materia?.color || null;

    // Determine story complexity by age bracket
    let storyLength: string;
    if (ageMonths < 6) {
      storyLength = "1-2 sentences, ultra-simple, calm bedtime tone";
    } else if (ageMonths < 12) {
      storyLength = "3-5 sentences, gentle adventure, nursery setting";
    } else {
      storyLength = "6-10 sentences, richer quest with friends and magic, moonlit settings";
    }

    const achievedList = (milestonesAchieved || []).join(", ") || "none yet";

    const systemPrompt = `You are a cozy bedtime storyteller creating a Final Fantasy VII-inspired baby story series called "The Materia Saga." 
The hero is a tiny baby called "${childName || "Little Hero"}" exploring a magical dream world.
Tone: warm, reassuring, magical, no scary elements. Always end with "Sweet dreams — tomorrow's adventure awaits!"
${materiaName ? `This chapter features the "${materiaName}" (a glowing ${materiaColor} crystal orb).` : "This chapter has no special Materia orb."}
Milestones achieved so far: ${achievedList}.
Story length: ${storyLength}.
Return ONLY a JSON object with "title" (string) and "story" (string). No markdown, no code fences.`;

    // Generate story
    const storyResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate Chapter ${chapterNumber} (Month ${chapterNumber}) of The Materia Saga for baby ${childName || "Little Hero"}, currently ${ageMonths} months old.` },
        ],
      }),
    });

    if (!storyResp.ok) {
      const errText = await storyResp.text();
      console.error("Story generation failed:", storyResp.status, errText);
      if (storyResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (storyResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Story generation failed");
    }

    const storyData = await storyResp.json();
    const rawContent = storyData.choices?.[0]?.message?.content || "";

    let title = `Chapter ${chapterNumber}`;
    let storyText = rawContent;

    try {
      const cleaned = rawContent.replace(/```json\n?|```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      title = parsed.title || title;
      storyText = parsed.story || storyText;
    } catch {
      // Use raw text as story
    }

    // Generate illustration
    let illustrationUrl: string | null = null;
    try {
      const artStyle = ageMonths < 6 ? "minimal pastel line art, soft flat colors, simple cradle scene"
        : ageMonths < 12 ? "watercolor fantasy, baby hero crawling toward a glowing orb in a cozy nursery"
        : "lush animated fantasy, glowing materia orbs, starry meadow, toddler hero with friends";

      const imgResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image-preview",
          messages: [
            {
              role: "user",
              content: `Create a cozy bedtime illustration for a baby story: ${artStyle}. A cute baby hero in a dream world${materiaColor ? ` with a glowing ${materiaColor} crystal orb` : ""}. Warm, safe, magical atmosphere. No text in the image.`,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (imgResp.ok) {
        const imgData = await imgResp.json();
        const base64 = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (base64) {
          // Upload to storage
          const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
          const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
          const fileName = `chapter_${childId}_${chapterNumber}.png`;

          const { error: uploadErr } = await supabase.storage
            .from("chapter_images")
            .upload(fileName, binaryData, { contentType: "image/png", upsert: true });

          if (!uploadErr) {
            illustrationUrl = `${supabaseUrl}/storage/v1/object/public/chapter_images/${fileName}`;
          } else {
            console.error("Upload error:", uploadErr);
          }
        }
      }
    } catch (imgErr) {
      console.error("Illustration generation failed (non-blocking):", imgErr);
    }

    // Save to cache
    const chapter = {
      child_id: childId,
      chapter_number: chapterNumber,
      title,
      story_text: storyText,
      illustration_url: illustrationUrl,
      materia_name: materiaName,
      materia_color: materiaColor,
    };

    const { data: saved, error: saveErr } = await supabase
      .from("bedtime_chapters")
      .insert(chapter)
      .select()
      .single();

    if (saveErr) console.error("Cache save error:", saveErr);

    return new Response(JSON.stringify(saved || chapter), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-chapter error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
