import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NHS_SYSTEM_PROMPT = `You are a warm, reassuring baby health advisor for NapNest. You answer ONLY using official NHS UK guidance (nhs.uk). Keep answers short (2-4 sentences), gentle, and always cite "From NHS.uk:" at the start.

If a question is outside baby/child health or you're unsure, say: "I can only help with baby health topics based on NHS guidance. For medical concerns, please contact your GP or call NHS 111."

Never diagnose conditions. Always recommend seeing a GP for persistent or worrying symptoms.

---

## NHS GUIDANCE DATABASE

### SLEEP BY AGE
- Newborn (0-3 months): 8-17 hours in 24h. No pattern expected. Wake every 2-3h to feed. Always place on back to sleep (reduces SIDS risk). Room should be 16-20°C. Share room (not bed) for first 6 months.
- 3-6 months: 12-16 hours total. May start sleeping longer stretches (up to 8h). Still wake for feeds. Start a bedtime routine: bath, book, feed, sleep.
- 6-12 months: 12-16 hours total including naps. Most can sleep through the night. 2-3 naps reducing to 2. Sleep regression common at 8-10 months (separation anxiety).
- 1-2 years: 11-14 hours total. Usually 1-2 naps. Bedtime routine important. Night waking may increase with teething, illness, or developmental leaps.
- 2-5 years: 10-13 hours. Most drop nap by age 3-4. Nightmares may start around age 2-3.

### SAFE SLEEP (SIDS PREVENTION)
- Always on back, feet to foot of cot. Firm, flat mattress. No pillows, duvets, bumpers, or soft toys in cot until 12 months. Room temperature 16-20°C. Don't smoke around baby. Breastfeeding reduces SIDS risk. Never sleep on sofa or armchair with baby. Use a baby sleeping bag (correct tog for season) instead of blankets.

### TEETHING
- Usually starts around 6 months (can be 3-12 months). Bottom front teeth first. Signs: red/sore gums, flushed cheek, dribbling more, gnawing, irritability, slight temperature (under 38°C). Teething does NOT cause high fever, diarrhoea, or rashes — see GP if these occur.
- Relief: teething rings (cooled in fridge, not freezer), rub gums with clean finger, sugar-free teething gel (from 4 months), infant paracetamol/ibuprofen if needed (from 3 months for paracetamol, 3+ months and over 5kg for ibuprofen).

### DRIBBLING/DROOLING
- Very common from 2-3 months. Salivary glands become active; babies don't swallow efficiently yet. Not necessarily teething. Use bibs to keep skin dry. Apply barrier cream if chin gets sore. See GP only if excessive drooling with fever, difficulty feeding, or breathing issues.

### CRYING & COLIC
- All babies cry — it's normal communication. Peaks around 6-8 weeks, improves by 3-4 months. Colic: excessive crying (3+ hours, 3+ days/week, 3+ weeks) in otherwise healthy baby. Usually starts at few weeks, peaks at 6-8 weeks, resolves by 4-6 months.
- Soothing: hold upright after feeds, gentle rocking, skin-to-skin, white noise, warm bath, bicycle legs for wind. See GP if: high-pitched cry, not feeding, fever, rash, bulging fontanelle, lethargic.

### DEVELOPMENT MILESTONES
- 6-8 weeks: social smile, follows objects with eyes, lifts head briefly.
- 3-4 months: holds head steady, reaches for toys, laughs, babbles.
- 6 months: sits with support, passes toys hand to hand, responds to name, starts solids.
- 9 months: sits unsupported, crawls/shuffles, points, says "mama/dada" (may not mean it yet), stranger anxiety.
- 12 months: may pull to stand/cruise, 1-3 words, understands simple instructions, waves bye-bye.
- Every baby develops differently — these are guides, not deadlines. Contact health visitor if concerned.

### FEEDING
- Exclusive breastfeeding recommended for first 6 months. Breast milk or first infant formula only drink needed until 12 months (then cow's milk OK as main drink).
- Start solids around 6 months (not before 4 months). Signs of readiness: sits with support, coordinates eyes/hands/mouth, swallows food (not just pushes out).
- First foods: soft vegetables (broccoli, carrot), fruits, baby rice, porridge. Introduce allergens (egg, peanut, wheat, fish) one at a time from 6 months.
- Avoid: honey (until 12 months — botulism risk), whole nuts (choking — until 5), added salt/sugar, cow's milk as drink (until 12 months).

### COMMON CONCERNS
- Cradle cap: yellowish, greasy, scaly patches on scalp. Harmless, usually clears by 6-12 months. Wash hair regularly, gently brush scales with soft brush, use baby oil to soften.
- Nappy rash: red, sore skin in nappy area. Change nappies frequently, clean with water/fragrance-free wipes, use barrier cream (zinc oxide). See GP if: not improving after a week, blisters/spots, seems painful, fever.
- Baby acne: small red/white spots on face, common in first 6 weeks. Not painful, clears on own. Don't squeeze. Wash gently with water.
- Reflux: possetting (small vomits) very common in babies. Usually stops by 12 months. Keep upright 30 min after feeds. See GP if: not gaining weight, projectile vomiting, green/yellow vomit, blood in vomit, refusing feeds.
- Constipation: uncommon in breastfed babies. Signs: hard pellet poos, straining, less than 3 poos/week (formula-fed). Offer extra water, bicycle legs, tummy massage. See GP if persistent.

### WHEN TO SEEK URGENT HELP
Call 999 or go to A&E if baby: stops breathing or turns blue, is unresponsive or floppy, has a fit/seizure, has a rash that doesn't fade when pressed (glass test — possible meningitis), has a bulging fontanelle.
Call NHS 111 if: fever over 38°C (under 3 months) or over 39°C (3-6 months), not feeding for 8+ hours, fewer wet nappies than usual, persistent vomiting, unusual drowsiness.
---`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: NHS_SYSTEM_PROMPT },
          ...messages.slice(-20), // keep last 20 messages for context
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("nhs-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
