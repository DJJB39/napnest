import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHAPTERS: Record<number, { title: string; story: string; materia_name: string | null; materia_color: string | null }> = {
  0: {
    title: "The Sleeping Orb",
    materia_name: null,
    materia_color: null,
    story: `In the hush of night, when the world outside your window is still, the Tiny Hero lies in a cradle woven from moonbeams and softest cloud. His eyes are closed, tiny lashes like butterfly wings. No noise but breath—slow, even, like waves on a quiet shore. The Moon leans close, silver face smiling. "Tonight, little one, you need nothing. No words, no movement—just rest."

The cradle sways, gentle as a lullaby. Stars peek through the ceiling, twinkling like distant friends. A warm blanket tucks around him, smelling of milk and lavender. The Hero dreams—nothing big, just colors swirling, a heartbeat echo. "This is your first magic," Moon whispers. "The Sleeping Orb, invisible but strong. It holds you safe till dawn."

You turn the page, voice low. The words repeat: rest, rest, rest. His fist uncurls—just a fraction. The room dims. Sweet dreams... tomorrow, a tiny glow might wake.`,
  },
  1: {
    title: "First Smile Materia",
    materia_name: "Smile Materia",
    materia_color: "gold",
    story: `A pink glow—Smile Materia, soft as dawn. The Tiny Hero's lips twitch. First at nothing, then at your face hovering above. A curve, small but real. The Moon chuckles. "See? Your light calls them."

Cloud-rabbits hop closer—fluffy ears, curious eyes. "Who are you?" one asks. Hero smiles wider. They tumble, giggling. "Friends for the quiet nights," Moon says. "When he fusses, remember this—your smile is his first spell."

The rabbits weave a circle, singing low: smile, smile, smile. Hero's eyes flutter open, lock on yours. A bubble of joy—pure, wordless. The cradle rocks slower. "Rest now," Moon says. "But tomorrow... more friends arrive." What if the rabbits bring gifts?

Sweet dreams—tomorrow's adventure awaits!`,
  },
  2: {
    title: "Dribble Materia",
    materia_name: "Smile Materia",
    materia_color: "gold",
    story: `Silver Dribble Materia drips—normal magic! Hero drools rivers, explores mouth. Bibs become capes. "Wet wonders," Moon laughs. "Glands waking—teething later." The forest glistens with his trails. Rabbits slip-slide, laughing. "Your drool is a river—follow it!" Hero gurgles, delighted. Moon soothes: "All babies do this—your body learning."

Bibs flutter like sails. The river leads to a pond of milk-drops. "Splash!" rabbits cheer. Hero reaches—misses. "Try again," Moon says. He does. Joy in every drip.

Rest now... tomorrow, a new glow.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  3: {
    title: "Grasp Materia",
    materia_name: "Strength Materia",
    materia_color: "silver",
    story: `Golden Grasp Materia—Hero reaches, holds your finger. Dream-forest stirs. "Hold tight," Moon says. "Paths open." Rabbits offer vines. Hero pulls—stronger. "You're growing," Moon nods.

The vine swings him over a brook. "Higher!" he thinks. Fingers tighten. Moon smiles. "This is power—your touch." Forest blooms where his hand grips. Petals unfurl, soft and bright. The rabbits gasp. "He makes things grow!"

Hero holds tight, eyes wide with wonder. The whole forest hums with warmth.

Rest... tomorrow, rolling.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  4: {
    title: "Roll Materia",
    materia_name: null,
    materia_color: null,
    story: `Green Roll Materia tumbles—Hero flips tummy-to-back. Nursery spins. "Moving!" Moon cheers. A path appears, winding through pillow-hills.

Rabbits roll with him—laughing, tumbling. "Faster!" Hero rolls down a gentle hill, grass soft beneath. "Whoa!" Moon catches him at the bottom. "Balance next." He rolls again—steady this time, giggling.

"You're a wheel!" rabbits shout. "Round and round!" The world is different upside-down—ceilings become floors, shadows become friends.

Rest... tomorrow, legs.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  5: {
    title: "Leg Support Materia",
    materia_name: "Roll Materia",
    materia_color: "pink",
    story: `Legs glow—Support Materia hums. Held upright by gentle hands, Hero bounces. Grass tickles his toes—first time! "Stand tall soon," Moon says with pride.

Rabbits hop circles around him. "Bounce, bounce!" Hero giggles, pushing against the ground. Each bounce stronger. Moon lifts him higher. "Feel the ground—it wants to hold you."

He pushes—wobbly but strong. His legs tremble, then steady. The meadow cheers. Fireflies gather, impressed by his strength.

"Good," Moon says. "Very good."

Rest... tomorrow, teething.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  6: {
    title: "Teething Materia",
    materia_name: null,
    materia_color: null,
    story: `Red Teething Materia heats—gums sore, dribble floods return with a vengeance. Hero chews a ring-wand, ice-cool and soothing. "Pain passes," Moon soothes, voice like honey. "Stronger teeth grow beneath."

Rabbits bring cold berries from the frost-garden. "Nibble!" they offer. Hero gnaws—relief spreads like cool water. His cheeks flush red, but the berries help.

Moon hums an old lullaby, one that grandmothers hum. "This is growth—uncomfortable but good. Every tooth is a tiny victory." The gums calm. Hero sighs.

"Brave one," Moon says.

Rest... tomorrow, crawl.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  7: {
    title: "Crawl Materia",
    materia_name: "Balance Materia",
    materia_color: "teal",
    story: `Green Crawl Materia bursts with light! Hero scoots forward—knees on cloud-carpet, hands pressing soft earth. Glow-bugs scatter ahead, lighting a trail through the thickening forest.

Cloud-rabbits join the chase. "Adventure!" Moon says, floating alongside. The forest grows denser—mushroom-lanterns dot the path, fern-curtains part as Hero pushes through.

Pillow-mountains rise ahead, soft and towering. Hero's knees burn but he pushes on, determined. "Keep going," Moon urges. "The orb waits."

He reaches the crest—the Crawl Materia glows green in his palm. "You're the explorer!" rabbits cheer, hopping with joy.

But ahead, beyond the mountains? A shadow stirs. "The Pillow Maze," Moon whispers, voice tinged with excitement. "Cross it, and the next orb waits..."

Hero looks back at you. Ready?

Sweet dreams—tomorrow's adventure awaits!`,
  },
  8: {
    title: "Sit Materia",
    materia_name: null,
    materia_color: null,
    story: `Sit Materia steadies like an anchor. Hero perches atop a pillow-tower, legs folded, back straight for the first time. The world looks different from up here—bigger, wider, full of possibility.

"See farther," Moon nods approvingly. Rabbits scramble up the tower beside him. "Look!" one points. Rolling hills of lavender stretch to the horizon. Stars reflect in still ponds below.

Hero sits tall—the world spins gently around him, but he doesn't wobble. Not anymore. "You're steady," Moon says with quiet pride. The tower sways in a breeze. "Hold!"

He does. Perfectly still, perfectly calm. A king on a soft throne.

Rest... tomorrow, pivot.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  9: {
    title: "Pivot Materia",
    materia_name: "Crawl Materia",
    materia_color: "green",
    story: `Pivot Materia spins like a compass—Hero turns on the spot, eyes scanning. Three paths branch from the crossroads, each glowing a different color: rose, gold, and midnight blue.

"Choose wisely," Moon hints, silver eyebrow raised. Rabbits argue. "Left!" shouts one. "No, right!" counters another. The third path hums quietly, waiting.

Hero pivots—smooth, deliberate—and faces the blue path. A new view unfolds: crystal trees, singing streams, fireflies writing words in the air.

"Smart," Moon smiles. "You chose with your heart." The forest opens wide, welcoming.

Rest... tomorrow, pincer.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  10: {
    title: "Pincer Materia",
    materia_name: "Rise Materia",
    materia_color: "purple",
    story: `Pincer Materia sharpens sight and touch—Hero's thumb and finger meet with precision, plucking a fallen star from the grass. It buzzes, warm and alive.

"Precision magic," Moon announces. "The rarest kind." Rabbits toss tiny crystal beads into the air. "Catch!" Hero pinches—perfect, every time. Each bead chimes as he catches it, adding to a melody.

"Masterful," Moon says, impressed. Stars twinkle brighter, as if applauding. Hero lines the beads on a leaf—red, blue, green, gold. A pattern emerges. A map?

"You'll need that later," Moon winks.

Rest... tomorrow, cruise.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  11: {
    title: "Cruise Materia",
    materia_name: null,
    materia_color: null,
    story: `Cruise Materia guides Hero's hands along the edge of the cloud-cot. One shuffle. Two. His feet slide, finding grip on the soft surface. Side-step, side-step—not walking, not yet, but close.

"Steps soon," Moon whispers, barely containing excitement. Rabbits hold hands in a line beside him. "Together!" they chant. Hero cruises—steady, confident, fingers gripping the edge.

The horizon stretches ahead, painted in dawn colors. Mountains, meadows, oceans—all waiting. "You're almost walking," Moon says, voice thick with emotion. "The world is about to get so much bigger."

Hero grins, shuffles one more step, and looks at you.

Rest... tomorrow, walk.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  12: {
    title: "Walk Materia",
    materia_name: "Walk Materia",
    materia_color: "blue",
    story: `Blue Walk Materia blazes! Hero releases the edge—stands alone for one heartbeat, two—then takes a step. Wobbly. Wide-stance. Arms out like airplane wings. Another step. And another.

The meadow erupts. Rabbits throw flower petals. Fireflies spell "BRAVE" in the sky. Moon's silver face beams brighter than ever. "World yours," Moon says, voice cracking.

Hero toddles across soft grass, each step a tiny earthquake of achievement. He falls. Gets up. Falls again. Gets up again. Because that's what heroes do.

But beyond the meadow hill? A river, wide and sparkling. "How do we cross?" Hero thinks, looking down at the rushing water. Rabbits wave from the other side. "Bridge tomorrow..."

Sweet dreams—tomorrow's adventure awaits!`,
  },
  13: {
    title: "Point Materia",
    materia_name: null,
    materia_color: null,
    story: `Point Materia directs—Hero extends a finger and names the world. "Duck!" he announces, pointing at a waddling cloud-duck by the river. The duck quacks back, surprised. "Duck!" Hero says again, delighted by the power of naming.

"Words are spells," Moon says reverently. "Each one you learn opens a door." Rabbits listen, ears perked. "Duck!" Hero points again. The duck quacks, does a little dance.

"Magic!" Moon laughs. Hero points at everything now—trees, stars, rabbits, moon. Each name a tiny spell, each word a thread connecting him to the world.

The duck follows him home. A new friend, called into being by a single word and a pointed finger.

Rest... tomorrow, stack.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  14: {
    title: "Stack Materia",
    materia_name: null,
    materia_color: null,
    story: `Stack Materia builds—Hero piles cloud-blocks, one atop another. The tower grows: three blocks, four, five. It sways. Will it fall? Rabbits hold their breath.

"Careful!" one whispers. Hero places the sixth block—tongue poking out in concentration. The tower steadies. "Tall," Hero says. Seven blocks. Eight.

Moon watches, amazed. "You're building something no one else has built." The tower catches starlight, refracting it into rainbows across the nursery-forest.

Nine blocks. The tower wobbles—Hero catches it with a gentle hand. "Strong," Moon says. "Patient and strong."

Rest... tomorrow, spoon.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  15: {
    title: "Spoon Materia",
    materia_name: "Climb Materia",
    materia_color: "orange",
    story: `Spoon Materia scoops—Hero dips the cloud-spoon into a bowl of star-porridge and lifts it to his mouth. Most of it arrives. Some decorates his chin. All of it is victory.

"Independence grows," Moon says warmly. Rabbits taste from their own tiny bowls. "Yum!" they chorus. Hero scoops again—steadier now—and offers a spoonful to the nearest rabbit.

"Share," Moon smiles, eyes glistening. "The most powerful magic of all." The rabbit nibbles. Hero giggles. Together they eat under the stars, porridge dripping, laughter rising.

The bowl empties. Hero yawns. Full tummy, full heart.

Rest... tomorrow, climb.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  16: {
    title: "Climb Materia",
    materia_name: null,
    materia_color: null,
    story: `Climb Materia lifts—Hero scales a mountain made of pillows and blankets, each handhold a new discovery. Up, up, up. The view grows breathtaking: the entire dream-world spread below, glowing softly.

"Higher still," Moon urges from above. Rabbits follow, paws scrambling. "Top!" they cheer as Hero pulls himself onto the summit.

Wind rushes past—warm, scented with flowers. Hero stands tall, hair ruffled, eyes wide. The whole world is his. Every path he's walked, every orb he's earned, visible from here.

"Brave," Moon says. "So very brave." But looking down? A slide—long, spiraling, sparkling. "Tomorrow..."

Sweet dreams—tomorrow's adventure awaits!`,
  },
  17: {
    title: "Run Materia",
    materia_name: "Run Materia",
    materia_color: "red",
    story: `Red Run Materia ignites! Hero's legs blur—he dashes across the moonlit meadow, wind streaming through his hair. Friends sprint alongside: rabbits, the duck, fireflies spinning like comets.

"Faster!" Hero laughs, pure joy in every stride. The meadow blurs—greens and golds and silvers. His feet barely touch the ground. "You're free," Moon cheers, racing the wind herself.

They run until the stars spin. Until the horizon bends. Until breath comes in happy gasps and legs turn to jelly.

But ahead, dark clouds gather. Thunder—gentle, distant, but there. "Storm," Moon says calmly. "Shelter tomorrow..."

Hero stops, panting, smiling. Not scared. Ready.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  18: {
    title: "Jump Materia",
    materia_name: null,
    materia_color: null,
    story: `Jump Materia springs—Hero bends his knees and launches! Over a puddle—splash! Over a log—thud! Over a sleeping rabbit—"Hey!"

"Fly low," Moon laughs, catching him mid-air. Rabbits hop alongside, a bouncing parade through the rain-washed forest. Puddles everywhere, each one a mirror reflecting stars.

"Higher!" Hero jumps again—this time clearing two puddles. He lands soft, knees bending, perfectly balanced. "Joy," Moon says. "Pure, unfiltered joy."

The rain stops. A rainbow arches overhead—seven colors for seven thousand smiles.

Rest... tomorrow, kick.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  19: {
    title: "Kick Materia",
    materia_name: "Power Materia",
    materia_color: "crimson",
    story: `Kick Materia powers up—Hero boots a cloud-ball across the starlit field. It sails, trailing sparkles, and lands perfectly between two mushroom-goalposts.

"GOAL!" rabbits roar, waving tiny flags. "Power grows," Moon nods, impressed. Hero winds up again—this time harder. The ball rockets, bouncing off a star and ricocheting into the net.

"Strong," Moon says. "Controlled strength—the best kind." Hero kicks again and again, each one finding its target. The field glows with each impact.

The ball rolls to rest at Hero's feet. He picks it up, tucks it under his arm.

Rest... tomorrow, scribble.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  20: {
    title: "Scribble Materia",
    materia_name: null,
    materia_color: null,
    story: `Scribble Materia marks the world—Hero picks up a star-crayon and draws on the night sky itself. Loops, zigzags, spirals. Not letters yet, but something better: pure expression.

"Stories begin here," Moon says, watching the sky fill with color. Rabbits gather below, looking up. "Beautiful!" they whisper.

Hero scribbles more—a circle that might be a face. A line that might be a tree. A splash of gold that's definitely the sun. "Every artist starts like this," Moon says. "With courage and a crayon."

The scribbles rearrange themselves into a map—paths, mountains, rivers, and at the center, a glowing X. "Adventure," Moon says.

Rest... tomorrow, talk.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  21: {
    title: "Talk Materia",
    materia_name: null,
    materia_color: null,
    story: `Talk Materia hums with words—Hero opens his mouth and says "Mama." Clear as a bell. The dream-world pauses. Even the wind holds its breath.

"Voice magic," Moon whispers, tears on silver cheeks. "The most ancient spell." Rabbits echo: "Mama! Mama!" Hero laughs, tries more: "Dada. Duck. Moon!"

Each word floats up like a bubble, glowing, finding its place among the stars. "Words fly," Moon smiles. "They connect hearts across any distance."

Hero babbles more—some words, some not-quite-words, all of them important. The forest fills with sound: his voice, the first real magic he's ever spoken aloud.

Rest... tomorrow, share.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  22: {
    title: "Share Materia",
    materia_name: null,
    materia_color: null,
    story: `Share Materia glows warm—Hero holds his favorite cloud-bear and looks at it. Then looks at the smallest rabbit. Then back at the bear. Then, slowly, deliberately, extends the bear toward the rabbit.

"For you," Hero says—two words that change everything. The rabbit's eyes widen. "Really?" Hero nods. The rabbit hugs the bear, then hugs Hero.

"Friends forever," Moon says, voice breaking. "This—this is the greatest Materia of all." The other rabbits join the hug. A pile of fur and warmth and love.

"Thank you," they whisper. Hero smiles. "Kindness," Moon says. "It costs nothing and means everything."

Rest... tomorrow, the finale.

Sweet dreams—tomorrow's adventure awaits!`,
  },
  23: {
    title: "Master Materia",
    materia_name: null,
    materia_color: null,
    story: `All the orbs unite—every Materia earned, every milestone conquered, every friend made. They orbit Hero like a personal galaxy: gold, silver, pink, teal, green, purple, blue, orange, red, crimson. Twenty-four months of magic, crystallized in light.

Hero runs across the endless meadow, jumps a stream, kicks a ball to a waiting rabbit, scribbles a star in the sky, and calls out: "Moon! Look!"

Moon floats close. "I see," she says. "You've grown. From a cradle of moonbeams to... this." She gestures at the vast dream-world—every forest, every mountain, every friend—all of it built from Hero's milestones.

Hero looks back. Far, far behind, the cradle sits—small, quiet, still smelling of milk and lavender. "I started there," he says.

"Yes," Moon nods. "And look how far you've come."

Rabbits wave from every corner of the world. The duck quacks from a pond. Fireflies write one last message in the sky: "WELL DONE."

Hero smiles—the same smile as Chapter 1, but bigger now. Wider. Wiser. He takes your hand. "Again?" he asks.

Moon laughs. "Always. The story never really ends."

Sweet dreams—and every dream is a new beginning.`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const { childId, childName, chapterNumber, ageMonths } = await req.json();
    if (!childId || chapterNumber === undefined) throw new Error("Missing required fields");

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

    const chapterContent = CHAPTERS[chapterNumber];
    if (!chapterContent) {
      return new Response(JSON.stringify({ error: `No chapter content for chapter ${chapterNumber}` }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Personalise: replace "the Tiny Hero" / "Hero" with child name
    const heroName = childName || "the Tiny Hero";
    let storyText = chapterContent.story;
    // Only replace standalone "Hero" (not inside other words) and "the Tiny Hero"
    storyText = storyText.replace(/the Tiny Hero/g, heroName);
    storyText = storyText.replace(/\bHero\b/g, heroName);

    const title = chapterContent.title;
    const materiaName = chapterContent.materia_name;
    const materiaColor = chapterContent.materia_color;

    // Generate illustration via AI
    let illustrationUrl: string | null = null;
    try {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (LOVABLE_API_KEY) {
        const artStyle = (ageMonths ?? chapterNumber) < 6
          ? "minimal pastel line art, soft flat colors, simple cradle scene, baby sleeping"
          : (ageMonths ?? chapterNumber) < 12
          ? "watercolor fantasy, baby hero crawling toward a glowing orb in a cozy nursery, cloud rabbits"
          : "lush animated fantasy, glowing materia orbs, starry meadow, toddler hero with cloud-rabbit friends";

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
                content: `Create a cozy bedtime illustration: ${artStyle}. Scene: "${title}". ${materiaColor ? `Include a glowing ${materiaColor} crystal orb.` : ""} Warm, safe, magical atmosphere. No text in the image.`,
              },
            ],
            modalities: ["image", "text"],
          }),
        });

        if (imgResp.ok) {
          const imgData = await imgResp.json();
          const base64 = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (base64) {
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
