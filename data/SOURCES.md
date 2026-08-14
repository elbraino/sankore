# Source coverage

Provenance for the seed dataset, and the map of what is still unmined. Every
entry currently in `data/` was extracted from one of the sources below. Each
YAML file carries a `# Source:` comment naming which one.

## Sourcing rules (binding)

1. **Country is recorded only where the source states it.** Never inferred from
   a name, a language, or an event's location.
2. **Speaking at a regional event is not a nationality claim.** Most BSides Cape
   Town speakers therefore carry no `country` field, even though the event is
   South African.
3. A work's *region* on the site is derived — first author's stated country,
   else the venue's country. That derivation lives in `src/lib/atlas.ts` and is
   labelled "Region", never "Country". It is a property of the work, not of any
   person.
4. If a pairing of speaker ↔ talk could not be confirmed against fetched
   content, it was **excluded**, not guessed.

## Mined — entries in this repo come from here

| Source | Yield |
|---|---|
| `bluekaizen.org` — Cairo Security Camp 2011 speakers page + agenda PDF | 12 works, 13 Egyptian researchers (country stated via bios) |
| `github.com/msuiche/OPCDE` — organiser's own repo, talks by year | OPCDE Dubai + Kenya talk/speaker pairings |
| `kenya.opcde.com/speakers.html` | Amat Cama (Senegal, stated), Charles Muiruri |
| `emirates.opcde.com/agenda/` | WhatsApp Digger — four Saudi authors, university affiliation stated |
| `bsidescapetown.co.za/about-us/past-events/` | 37 works, 2012–2024 |
| BSides Cape Town talk videos on YouTube | Per-talk source URLs, recorded in `links.video` |

## Swept and returned nothing — do not repeat without a new method

A zero-yield sweep is worth recording. Without this, the next person re-runs the
same search, gets the same nothing, and cannot tell whether the source is barren
or was never tried.

| Source | Swept | Result |
|---|---|---|
| `blackhat.com/us-26/briefings/schedule/` (Black Hat USA 2026) | 2026-08-14 | **0 of 230 speakers** state a regional affiliation. The schedule's own `sessions.json` carries `company`, `title` and full `bio` per speaker — good data, no regional rooting in any of it. All 123 distinct employers are US/EU/Israel/Korea/Taiwan/India. The 13 speakers with no employer have substantive bios; none names the region. |
| DEF CON 34 talks (official YouTube channel) | 2026-08-14 | **Not published yet.** All 14 DC34 uploads are Video Team B-roll, no Briefings. DEF CON posts talks weeks-to-months after the event; recheck later. |
| DEF CON 32/33 talks vs. this index's roster | 2026-08-13 | **1 hit** — Leon Jacobs, already indexed, now carrying `7-vulns-in-7-days-2025`. |

Two findings that constrain any future DEF CON or Black Hat USA pass:

- **DEF CON publishes no affiliations.** Sixteen DC33/34 video descriptions were
  sampled and none contained a bio, employer, university, CERT, or location —
  abstract and speaker name only, which fits a conference built on handles. There
  is therefore no way to select regional speakers from DEF CON without inferring
  origin from names, which rule 1 above forbids. The only sound method is the
  **inversion**: match people already indexed here, whose rooting is already
  evidenced, against DEF CON titles. Re-run it whenever the roster grows; it is
  cheap and it is the only thing that will ever yield.
- **Black Hat USA has excellent affiliation data and no regional speakers.** The
  `sessions.json` feed makes this sweep fast and reliable, so it is worth
  repeating each year — but expect zero, and do not soften the criterion to
  manufacture a result. One 2026 bio mentioned "Black Hat MEA (UAE)" and "BSides
  Dubai" purely as venues the speaker had presented at; that is a speaking
  history, not regional rooting, and it was rejected.

## Verified event metadata only (no talk-level data yet)

`arabsecurityconference.com` (agenda is JS-rendered), `blackhatmea.com`,
`athack.com`, `naijaseccon.com`, `africahackon.com`.

## Blocked this pass

- `cairosecuritycamp.com` — robots-disallowed
- `conference.africahackon.com/speakers/`, `summit.africahackon.com` — robots-disallowed
- `athack.com/agenda` — redirects; needs an archive.org snapshot
- `naijaseccon.com`, `2018.naijaseccon.com` — robots-disallowed
- AfricaHackon YouTube channel — listing returned no per-video titles

**Workaround:** archive.org static snapshots bypass both the robots blocks and
the JS-rendering problem.

## Unmined — priority order

1. **Cairo Security Camp 2013–2019** agendas via archive.org. Likely the single
   biggest yield of Egyptian researchers.
2. **Bluekaizen YouTube channel** — per-talk video titles for recorded CSCAMP sessions.
3. **@Hack 2021** and **Black Hat MEA 2022–2025** briefings/Arsenal via archive.org,
   filtered to regionally-based presenters.
4. **Black Hat Arsenal tool authors** — `toolswatch/blackhat-arsenal-tools` and
   `elbraino/awesome-blackhat-arsenal`. Structured tool + author + repo link, so
   the lowest fabrication risk of anything remaining, and the best source of
   `tool` / `arsenal` type entries.
5. **AfricaHackon** agendas via archive.org + the AfricaHackon254 channel;
   full **OPCDE Kenya** agenda.
6. **HITB+CyberWeek 2019** CommSec schedule; **HITB+in{:cyber} 2024** speakers.
7. **NaijaSecCon** 2017–2020 archived agendas; **BSides Lagos**, **BSides Nairobi**,
   **ITWeb Security Summit**, **ZaCon** archives.
8. **Arab Security Conference** archived agendas.

## Events still unverified

These were seeded before the research pass and remain **unconfirmed** — treat
their metadata as provisional until sourced:

`bsides-cairo`, `bsides-lagos`, `cyber-africa-forum`, `cybertalents-ctf`,
`gisec-global`, `securinets-ctf`, `zacon`.

## Known gaps and flags

- **Country pending a bio** for Mohamed Saher, Ahmed Garhy, Saif ElSherei
  (Egyptian per external profiles) and Charles Muiruri (Kenyan per external
  profiles). The agenda text does not state it, so the field is blank. Fill it
  only from a fetched bio.
- **Nunudzai Mrewa, Blessing Mufaro Kashava, Silent Dzikiti** — Zimbabwean per
  public knowledge, not per the source. Left blank.
- **Michael Lewis** (CSCAMP 2011) has no stated regional rooting. Retained as
  part of a regional conference programme; drop it if the inclusion criteria in
  GOVERNANCE.md are read strictly.
- **AfricaHackon founders** (Bright Gameli Mawudor, Tyrus Kamau) are named in
  sources but with no confirmed talk. No person entry was created — an entry
  with no linked work would publish a name for no archival purpose.
