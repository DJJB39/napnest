

# Add "Ask AI" Chat Tab — NHS-Guided Baby Q&A

## Overview
Add a 5th bottom nav tab "Ask AI" that opens a chat interface where parents can ask baby health/sleep/development questions. Answers are grounded in NHS UK guidance via a system prompt with embedded NHS content (no RAG/vector DB needed — the NHS content fits within the system prompt context window). Responses are short, reassuring, and cite NHS.uk.

## Architecture

```text
User → Chat UI (/ask-ai) → Edge Function (nhs-chat) → Lovable AI Gateway
                                                         ↑
                                              System prompt with
                                              embedded NHS guidance
```

**Why embedded NHS content instead of RAG**: The relevant NHS baby guidance (sleep, teething, development, feeding) is ~10-15KB of text — well within model context limits. This avoids the complexity of vector embeddings, storage buckets, and retrieval pipelines while ensuring accuracy.

## Files to Create/Edit

| File | Action |
|------|--------|
| `supabase/functions/nhs-chat/index.ts` | **New** — Edge function with NHS guidance system prompt |
| `src/pages/AskAI.tsx` | **New** — Chat page with warm UI |
| `src/components/layout/BottomNav.tsx` | Add 5th nav item |
| `src/App.tsx` | Add `/ask-ai` route |

## Implementation Details

### 1. Edge Function (`supabase/functions/nhs-chat/index.ts`)
- Accepts `{ messages: [{role, content}] }` array (conversation history)
- Auth: validate JWT, require authenticated user
- System prompt contains curated NHS.uk content covering:
  - Sleep guidance by age (newborn through 5 years)
  - Teething (signs, timeline, relief)
  - Development milestones (0-12 months)
  - Feeding basics
  - Common concerns (dribbling, crying, colic, rashes)
- Instructions: answer ONLY from NHS content, 2-4 sentences, prefix with "From NHS.uk:", reassuring tone
- Uses Lovable AI Gateway with `google/gemini-3-flash-preview`
- Streaming SSE response for real-time token delivery
- Handles 429/402 errors

### 2. Chat Page (`src/pages/AskAI.tsx`)
- Warm pastel gradient background matching app theme
- Decorative SVG: cute baby with bib (inline SVG, pastel style) in header
- Title: "Ask about your baby" in Caveat handwritten font
- Subtitle: "NHS-guided answers about sleep, development & health"
- Chat bubbles: user messages right-aligned (primary tint), AI messages left-aligned (card bg with soft shadow)
- AI messages rendered with `react-markdown` for formatting
- Text input with placeholder "Ask about your baby's sleep, development, or health…"
- Send button with sparkle icon
- Micro-fade animation on new messages (framer-motion)
- Scroll-to-bottom on new messages
- Loading state: pulsing dots animation while AI responds
- Streaming: tokens appear as they arrive

### 3. Bottom Nav Update
- Add `MessageCircle` (or custom star-chat icon) between Reports and Settings
- Label: "Ask AI"
- Same styling as existing nav items

### 4. Route
- Add `/ask-ai` inside the protected `AppLayout` route group

## What Stays the Same
- All existing pages, components, data fetching, auth
- Existing AI sleep review feature (separate edge function)
- No database tables needed (chat is ephemeral, not persisted)

