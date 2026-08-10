# Build prompts — run in order with Claude Code (VS Code)

CLAUDE.md is auto-loaded; these prompts assume it. Run one phase per session,
commit between phases, review before moving on.

---

## Phase 0 — Scaffold & data pipeline (run first)

```
Initialize this repo as an Astro project (static output, TypeScript strict)
without deleting any existing files. Then:

1. Wire Astro content collections for data/people, data/works, data/events,
   with zod shapes that exactly mirror data/schema/*.json.
2. Make scripts/validate.py runnable (requirements.txt with jsonschema + pyyaml)
   and verify it passes against the sample YAML files.
3. Add npm scripts: "validate" (runs the python validator), "build" (validate
   then astro build), "dev".
4. Confirm .github/workflows/validate.yml works with this layout; fix paths if needed.
5. Add site.config.ts exporting SITE_NAME="Atlas" (placeholder), SITE_TAGLINE,
   SITE_URL — import it wherever a name is needed.

Do not build any pages yet. Finish by running validate + build and showing me
the output.
```

## Phase 1 — Core site

```
Build the site per the "Site structure" and "Design direction" sections of
CLAUDE.md. Priorities in order:

1. Layout shell: header (site name from config, nav), footer (governance +
   removal-process links), design tokens as CSS custom properties from the
   palette in CLAUDE.md.
2. /works/ index with client-side filters (type, year, country) as an Astro
   island — filtering must work with 500+ entries without lag.
3. /works/<slug>/ detail pages.
4. /people/ index + /people/<slug>/ — implement the claimed/unclaimed rendering
   rule from CLAUDE.md exactly. Write a test or demo entry for each state.
5. /events/ index + detail.
6. Home page with the atlas-plate signature device.
7. Pagefind search wired into the header.

Every entry displays its plate reference (country code + zero-padded number).
After building, run a Lighthouse-style self-review: check mobile at 360px,
keyboard focus, and reduced-motion. Show me screenshots or describe issues found.
```

## Phase 2 — Submission funnel (form → PR)

```
Build the /contribute/ flow:

1. A static form page (no backend) for two flows: "Add a work" and "Claim your
   profile". Fields mirror the schemas; client-side validation matches them.
2. On submit, generate a pre-filled GitHub PR using the fork-less flow:
   construct a github.com/<org>/<repo>/new/main?filename=...&value=... URL that
   opens GitHub's web editor with the YAML pre-generated, so the submitter only
   clicks "Propose change". Include clear instructions for people without a
   GitHub account: a mailto fallback that sends the generated YAML to the
   maintainers' address (from site.config.ts).
3. "Claim your profile" additionally requires a verification hint field
   (link to a tweet/LinkedIn post or DNS TXT they control mentioning the claim)
   — maintainers verify manually before merging. Document this in GOVERNANCE.md
   under "Claim verification".
4. Add a PR template (.github/PULL_REQUEST_TEMPLATE/submission.md) with a
   consent checkbox for person entries: "I am this person or have their
   explicit consent."

Keep the whole flow usable on mobile.
```

## Phase 3 — Growth assets

```
1. Embeddable badge: /badge/<person-slug>.svg generated at build time
   ("Listed · <SITE_NAME>" + plate ref), plus a copy-paste embed snippet on
   each claimed profile.
2. RSS + JSON feeds for new works (feeds are the digest/amplification pipeline).
3. Open Graph images generated at build time per work/person (satori or
   astro-og-canvas) using the atlas-plate visual language.
4. /stats/ page: counts by country, year, and work type — descriptive numbers
   only. No per-person metrics, no ordering people by count (rankings ban).
```

## Phase 4 — Seed tooling (assist, never auto-publish)

```
Write scripts/seed_helper.py: given a conference schedule URL or pasted
schedule text, extract candidate work entries (title, speaker names, year,
event) into data/_drafts/ as YAML matching the work schema, with
`draft: true`. Drafts are excluded from the build. I will manually review,
create person stubs (claimed: false, minimal fields only), and move entries
into data/works/. The script must never fetch or store emails, photos, or
social links — work metadata only.
```

---

## Prompting tips for this project
- Reference CLAUDE.md rules by name when correcting drift ("claimed/unclaimed
  rendering rule", "rankings ban").
- After each phase: `npm run validate && npm run build` before commit.
- If Claude proposes adding a backend, accounts, or a ranking — refuse and
  point to CLAUDE.md "What NOT to do".
