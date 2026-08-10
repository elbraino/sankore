# Project: Atlas — Arab World & Africa Security Research Index

## What this is
A public, GitHub-backed directory of cybersecurity researchers and their work
(conference talks, tools, CVEs, Arsenal entries, papers) from the Arab world and
Africa. Modeled on atlaslatino.org. The repo IS the database: all content lives
as YAML files under `data/`, validated by JSON Schema, rendered to a static site.

Working name is a placeholder — final brand TBD. All naming must come from
`site.config.ts` (`SITE_NAME`, `SITE_TAGLINE`, `SITE_URL`). Never hardcode a name.

## Non-negotiable product rules
1. **Works are indexed by default; people are opt-in.** A `person` entry with
   `claimed: false` renders ONLY: display name, country (optional), and list of
   linked works. No photo, no bio, no socials until `claimed: true`.
2. **No rankings, no scores, no leaderboards. Ever.** This is an archive, not a
   competition. Do not add "top researchers" features even if asked casually.
3. **Removal must be easy.** Every person page footer links to the removal
   process (GOVERNANCE.md). A takedown request is honored without debate.
4. **Neutral inclusion criteria** are defined in GOVERNANCE.md — purely
   technical/public-record based. Never editorialize about nationality,
   politics, or employers in site copy.
5. **Bilingual-ready**: English first; architecture must not block adding
   Arabic (RTL) and French later. Use logical CSS properties
   (margin-inline-start, not margin-left).

## Stack (decided — do not substitute)
- **Astro** (static output), TypeScript, no client framework unless a component
  truly needs interactivity (search, map) — then use Astro islands.
- Data: YAML in `data/`, schemas in `data/schema/`, validated by
  `scripts/validate.py` (Python, jsonschema lib) in CI.
- Search: Pagefind (build-time index, zero backend).
- Deploy: GitHub Pages via Actions (Cloudflare Pages acceptable alternative).
- No database, no server, no CMS. The claim flow generates PRs via a small
  form → GitHub API bridge (Phase 2 — see PROMPTS.md).

## Data model (source of truth: data/schema/*.json)
- `data/people/<slug>.yaml` — one researcher
- `data/works/<slug>.yaml` — one talk / tool / CVE / paper / arsenal entry
- `data/events/<slug>.yaml` — one conference or recurring event
- Works reference people by slug (`authors: [slug]`). People never embed works.
- Slugs: lowercase, ascii, hyphenated, stable forever (they are URLs).

## Site structure
- `/` — hero + featured recent works + region entry points
- `/people/` — filterable index (country, focus area, claimed status ignored in filters)
- `/people/<slug>/` — profile (respects claimed/unclaimed rendering rule)
- `/works/` — filterable index (type, year, event, country)
- `/works/<slug>/` — work detail with links (video, slides, code, CVE)
- `/events/` — the con landscape of the region (differentiator — keep it good)
- `/contribute/` — explains both funnels: web form and direct PR
- `/about/` — mission, governance link, maintainers

## Design direction (deliberate — follow, don't genericize)
Subject-grounded: cartography + archive. This is an atlas — lean into map/atlas
vernacular: coordinates, plate numbers, index tables, meridian lines.
- Palette: deep atlas-ink blue-black `#101823`, paper `#EDE7DB`, meridian
  gold `#C9A227`, terracotta accent used ONLY for interactive states `#B4552D`,
  muted teal for data/tags `#3E7C7B`. No purple gradients, no glassmorphism.
- Type: display = a sharp grotesque with character (e.g. "Space Grotesk" or
  better if available); body = readable humanist sans ("Inter" acceptable);
  mono for metadata/coordinates ("IBM Plex Mono"). Arabic-capable fallbacks
  in the stack from day one ("IBM Plex Sans Arabic").
- Signature element: the people/works indexes are styled as atlas index plates —
  each entry carries a small "plate reference" (country code + entry number,
  e.g. `MA·014`) rendered in mono. This is the one memorable device; keep
  everything else quiet and disciplined.
- Quality floor: responsive to 360px, visible keyboard focus, prefers-reduced-motion
  respected, WCAG AA contrast.

## Engineering conventions
- Every build runs `python scripts/validate.py` first; broken data fails the build.
- Astro content collections typed from the same shapes as the JSON schemas —
  if you change a schema, change the collection config in the same commit.
- No external tracking scripts. Plausible/self-hosted analytics only, later.
- Commits: conventional commits. PRs from the form bot are labeled `submission`.

## What NOT to do
- Do not scrape or auto-import personal data (photos, emails, socials).
  Seeding = public work metadata only.
- Do not add authentication, user accounts, or a backend.
- Do not use the word "Syndicate" anywhere in public-facing copy.
