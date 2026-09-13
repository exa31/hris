---
name: creative-ui-design
description: Cures generic 'AI Slop' UI design. Enforces distinct art direction, curated typography pairings, asymmetrical layouts, authentic microcopy, and rich tactile interactions instead of cookie-cutter purple gradients and centered 3-card templates.
---

# Creative UI Design & Anti-AI Slop Standards

This skill prevents the generation of generic, bland, cookie-cutter AI web interfaces ("AI Slop") and enforces distinct, high-taste art direction, bespoke typography, asymmetrical layouts, and rich tactile interactions.

---

## 1. The Anti-AI-Slop Manifesto (Strictly Banned Patterns)

When designing interfaces, **NEVER** default to these overused AI tropes:

| AI Slop Trope | Why It Fails | The Creative Cure |
| :--- | :--- | :--- |
| **Purple/Indigo Blob Glow** (`from-purple-600 to-indigo-500` with blurry radial background) | Every amateur AI demo since 2023 looks like this. Instantly signals "uninspired AI template". | Pick an intentional color palette: monochrome with 1 sharp neon accent, warm earthy paper tones, or deep obsidian slate with amber glow. |
| **The "Centered Hero + 3 Cards"** | Predictable, symmetrical, and completely ignores real visual storytelling. | **Asymmetrical Grid or Bento Box**: Hero with an oversized visual anchor on one side, dense data widgets, or staggered magazine layout. |
| **Bland Typography (Inter / System font everywhere)** | Zero personality; text feels like a technical documentation default. | **Expressive Pairing**: Pair an expressive display font (editorial serif, bold geometric, or brutalist mono) with a clean reading font. |
| **Corporate AI Buzzword Copy** ("Supercharge your workflow", "Next-gen AI platform", "Unlock possibilities") | Meaningless corporate filler that tells the user nothing. | **Concrete, human, punchy copy**: State the exact mechanism, numbers, or specific pain point solved. |
| **Overdone Generic Glassmorphism** (`bg-white/10 backdrop-blur border border-white/20`) | Washed out, poor contrast, and lazy depth simulation. | **Tactile Craft**: Crisp hairline borders (`ring-1 ring-white/10`), subtle inner shadows (`inset 0 1px 0 0 rgba(...)`), and textured surfaces. |

---

## 2. The 5 Distinct Aesthetic Archetypes

Before generating any UI, **pick ONE archetype** and commit to it 100%. Never mix styles indiscriminately.

### Archetype A: Tactical Craft & Dark Obsidian (Linear / Raycast / Supabase style)
* **Vibe**: High precision, developer-first, sophisticated, dark instrument.
* **Palette**: Rich deep slate (`#0B0C0E`, `#121417`, `#181A1F`), crisp white text (`#EDEDED`), muted gray borders (`#27272A`), single accent color (e.g. Electric Emerald `#10B981` or International Orange `#FF5500`).
* **Signature Details**:
  - 1px hairline separators (`border-white/[0.08]`) with subtle corner glow.
  - Keyboard shortcut badges (`<kbd>` with tactile inset shadow).
  - Micro-dense layouts, tabular numerals (`font-mono tracking-tight`).
  - Active button states with subtle spring (`active:scale-[0.98] transition-transform`).

### Archetype B: Editorial & High-End Magazine (Kinfolk / SSENSE style)
* **Vibe**: Cultured, bespoke, literary, spacious.
* **Palette**: Cream/Ivory background (`#F9F8F5`), rich charcoal text (`#1C1917`), muted olive or terracotta accents (`#706E5B`, `#B45309`).
* **Signature Details**:
  - Dramatic scale contrast: Huge serif headlines (`Playfair Display`, `Instrument Serif`, or `Fraunces`) paired with a refined geometric sans (`Plus Jakarta Sans` or `Satoshi`).
  - Asymmetrical multi-column text, pull-quotes, and generous negative space (padding `py-24` or `py-32`).
  - Ultra-thin borders (`border-stone-200`), no drop-shadows, pure structural elegance.

### Archetype C: Neo-Brutalist & High-Energy Indie (Gumroad / Figma Community style)
* **Vibe**: Playful, confident, retro-modern, raw, anti-corporate.
* **Palette**: Stark white or warm yellow canvas (`#FFFDF0`), high-contrast pitch-black strokes (`#000000`), punchy pastels or safety colors (Canary Yellow `#FFE600`, Hot Pink `#FF66C4`, Electric Lime `#A6FF00`).
* **Signature Details**:
  - Thick black borders (`border-2 border-black` or `border-[3px] border-black`).
  - Hard offset drop shadows with NO blur (`shadow-[4px_4px_0px_0px_#000]`).
  - Monospace or chunky sans display type, sticker-style badges, tilted tags (`rotate-[-2deg]`).
  - Tactile button press: `hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`.

### Archetype D: Modern Swiss & Bauhaus (Grid-First / Vignelli style)
* **Vibe**: Objective, clean, typographic hierarchy, functionalist.
* **Palette**: Strict monochrome (Pure White, Deep Carbon `#111111`) with a single primary color strike (Swiss Red `#E60000` or Yves Klein Blue `#002FA7`).
* **Signature Details**:
  - Visible or implied structural grid lines (`border-t border-l border-neutral-300`).
  - Strict typographic scale: Micro metadata tags (`text-[11px] uppercase tracking-widest text-neutral-500`) vs Massive display title.
  - High information density, zero decorative fluff or unnecessary cards.

### Archetype E: Warm Humanist & Nordic Craft
* **Vibe**: Welcoming, calm, organic, approachable, tactile.
* **Palette**: Oatmeal/Sand canvas (`#F4F1EA`), warm taupe/espresso typography (`#292524`), sage green or soft clay accents.
* **Signature Details**:
  - Softly rounded corners (`rounded-2xl` to `rounded-3xl`).
  - Organic multi-layered shadows (`shadow-[0_8px_30px_rgb(0,0,0,0.06)]`).
  - Subtle noise or paper texture overlay.
  - Humanist grotesque sans typography.

---

## 3. Typography Rules & Curated Pairings

Never rely on the browser default sans. Always load modern fonts (Google Fonts / CDN):

1. **The Editorial Look**:
   - Heading: `Instrument Serif` or `Playfair Display` (Italic accents for emphasis).
   - Body: `Inter` or `Plus Jakarta Sans`.
2. **The Tech / Terminal Look**:
   - Heading: `Space Grotesk` or `Syne`.
   - Body & Code: `Geist Mono` or `JetBrains Mono`.
3. **The Brutalist / Punchy Look**:
   - Heading: `Cabinet Grotesk` or `Clash Display`.
   - Body: `Satoshi` or `General Sans`.
4. **The Warm Scandinavian Look**:
   - Heading & Body: `Plus Jakarta Sans` or `Outfit` with generous letter-spacing on uppercase tags (`tracking-wider`).

---

## 4. Bento Grid & Layout Asymmetry Recipes

Avoid repeating the same card 3 times in a row. Use high-contrast layout blocks:

```
+------------------------------------------+-----------------------+
|  HERO WIDGET (2 columns wide)            | STAT WIDGET (1 col)   |
|  - Live interactive graph or preview     | - Massive stat number |
|  - High visual interest                  | - Sparkline / badge   |
+-------------------+----------------------+-----------------------+
| FEATURE A (1 col) | FEATURE B (1 col)    | FEATURE C (1 col)     |
| - Tall portrait   | - Horizontal pill    | - Interactive toggle  |
+-------------------+----------------------+-----------------------+
```

### Layout Heuristics:
- **Variable Heights & Spans**: Mix `col-span-2`, `row-span-2`, and standard 1x1 cards.
- **Hero Anchor**: One card must be the "Hero Card" (larger, richer color, or showing a live interactive UI element) while secondary cards stay minimal.
- **Asymmetric Offsets**: Offset secondary elements slightly (`translate-y-4` on every second item in desktop view) to break robotic symmetry.

---

## 5. Micro-Interactions & Tactile Polish

Every clickable element must feel responsive and alive:
- **Tactile Buttons**: `transition-all duration-150 active:scale-[0.98]`
- **Card Hover**: Don't just increase shadow. Subtle border brightening (`hover:border-white/20`) or subtle cursor-following spotlight effect.
- **Micro-Badges**: Use pill indicators with glowing pulse dots:
  ```html
  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
    Live Operational
  </span>
  ```

---

## 6. Real-World Execution Checklist

Before finishing any frontend or UI task, audit against this checklist:
- [ ] Does this look like a generic purple-gradient template? If yes, **rewrite the color scheme immediately**.
- [ ] Are all 3 cards in the grid identical? If yes, **turn it into a dynamic bento grid**.
- [ ] Is the headline generic buzzwords? If yes, **rewrite with specific, crisp value propositions**.
- [ ] Are the fonts generic? If yes, **import and apply an expressive font pairing**.
- [ ] Do buttons and interactive elements have tactile press/hover feedback?
