/**
 * Atlas vocabulary: plate references, country names, and the enriched index
 * records the listing pages render from.
 *
 * The plate reference is the site's one memorable device (CLAUDE.md, "Signature
 * element"): a country code and a zero-padded number in mono, e.g. `MA·014`.
 */
import { getCollection, type CollectionEntry } from "astro:content";

import { resolveAuthors, resolveEvent } from "./resolve";

type Work = CollectionEntry<"works">;
type Person = CollectionEntry<"people">;
type Event = CollectionEntry<"events">;

/** Plate code for an entry whose country is unknown or deliberately withheld. */
export const UNKNOWN_COUNTRY = "XX";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/**
 * Human-readable country name. Falls back to the raw code so an unexpected or
 * withheld value still renders as something, never as "undefined".
 */
export function countryName(code: string | undefined): string {
  if (!code || code === UNKNOWN_COUNTRY) return "Unattributed";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Format a plate reference: `MA·014`. */
export function formatPlate(country: string, n: number): string {
  return `${country}·${String(n).padStart(3, "0")}`;
}

/**
 * Assign a stable plate number to every entry, sequenced per country.
 *
 * Stability matters — a plate reference is quoted in badges and OG images, so
 * it should not shift when the archive grows. Entries are ordered by `added`
 * date first, slug second, so a newly added entry sorts to the END of its
 * country's sequence and takes the next free number. Existing plates only move
 * if someone back-dates an entry or edits a slug, and slugs are "stable
 * forever" per CLAUDE.md.
 */
function buildPlates<T extends { id: string }>(
  entries: T[],
  countryOf: (entry: T) => string,
  addedOf: (entry: T) => Date | undefined,
): Map<string, string> {
  const byCountry = new Map<string, T[]>();
  for (const entry of entries) {
    const country = countryOf(entry);
    const bucket = byCountry.get(country);
    if (bucket) bucket.push(entry);
    else byCountry.set(country, [entry]);
  }

  const plates = new Map<string, string>();
  for (const [country, bucket] of byCountry) {
    bucket
      .slice()
      .sort((a, b) => {
        // Undated entries sort last so dating them later does not renumber
        // everything that already has a date.
        const at = addedOf(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bt = addedOf(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return at - bt || a.id.localeCompare(b.id);
      })
      .forEach((entry, i) => plates.set(entry.id, formatPlate(country, i + 1)));
  }
  return plates;
}

/** A work, flattened for listing and filtering. */
export interface WorkRecord {
  entry: Work;
  plate: string;
  /** Derived from the authors — works carry no country of their own. */
  country: string;
  authors: Person[];
  event: Event | undefined;
}

/** A person, flattened for listing. */
export interface PersonRecord {
  entry: Person;
  plate: string;
  country: string;
  workCount: number;
}

/** An event, flattened for listing. */
export interface EventRecord {
  entry: Event;
  plate: string;
  country: string;
  workCount: number;
}

/**
 * A work's REGION, resolved in a deliberate order of confidence:
 *
 *   1. the first author who states a country — the strongest claim, because
 *      the person said it about themselves;
 *   2. otherwise the country of the event it was presented at — a fact about
 *      the work ("this was presented in South Africa"), not a claim about any
 *      person's nationality;
 *   3. otherwise UNKNOWN_COUNTRY, so it still appears in the index.
 *
 * Step 2 matters. Country is optional and removable for people (GOVERNANCE.md),
 * and sourcing rules forbid inferring nationality from a name or from the fact
 * that someone spoke at a regional conference. Without the event fallback,
 * every talk by a speaker who has not stated a country would collapse into
 * "Unattributed" and the regional map would go blank — while the venue country
 * is a plainly documented fact. If a person later has their country removed,
 * their works degrade to the venue rather than disappearing.
 *
 * This is why the works facet is labelled "Region", not "Country": it mixes a
 * personal claim with a venue fact, and must not be read as either alone.
 */
function workCountry(authors: Person[], event: Event | undefined): string {
  return (
    authors.find((a) => a.data.country)?.data.country ??
    event?.data.country ??
    UNKNOWN_COUNTRY
  );
}

/**
 * Load and cross-link the whole archive once.
 *
 * Every listing page needs the same joins (works→authors, works→event, counts
 * per person and per event), so they are computed together here rather than
 * recomputed per page. All reference resolution goes through src/lib/resolve.ts,
 * so a dangling slug throws during the build.
 */
export async function loadArchive(): Promise<{
  works: WorkRecord[];
  people: PersonRecord[];
  events: EventRecord[];
}> {
  const [rawWorks, rawPeople, rawEvents] = await Promise.all([
    getCollection("works"),
    getCollection("people"),
    getCollection("events"),
  ]);

  const resolved = await Promise.all(
    rawWorks.map(async (entry) => ({
      entry,
      authors: await resolveAuthors(entry),
      event: await resolveEvent(entry),
    })),
  );

  const workPlates = buildPlates(
    resolved.map((r) => ({ id: r.entry.id, country: workCountry(r.authors, r.event), added: r.entry.data.added })),
    (w) => w.country,
    (w) => w.added,
  );
  const peoplePlates = buildPlates(
    rawPeople,
    (p) => p.data.country ?? UNKNOWN_COUNTRY,
    (p) => p.data.added,
  );
  const eventPlates = buildPlates(
    rawEvents,
    (e) => e.data.country ?? UNKNOWN_COUNTRY,
    // Events carry no `added` date; first_year is the closest thing to an
    // origin, and undated events sort last.
    (e) => (e.data.first_year ? new Date(Date.UTC(e.data.first_year, 0, 1)) : undefined),
  );

  const works: WorkRecord[] = resolved.map(({ entry, authors, event }) => ({
    entry,
    authors,
    event,
    country: workCountry(authors, event),
    plate: workPlates.get(entry.id) ?? formatPlate(UNKNOWN_COUNTRY, 0),
  }));

  const worksPerPerson = new Map<string, number>();
  const worksPerEvent = new Map<string, number>();
  for (const work of works) {
    for (const author of work.authors) {
      worksPerPerson.set(author.id, (worksPerPerson.get(author.id) ?? 0) + 1);
    }
    if (work.event) {
      worksPerEvent.set(work.event.id, (worksPerEvent.get(work.event.id) ?? 0) + 1);
    }
  }

  const people: PersonRecord[] = rawPeople.map((entry) => ({
    entry,
    plate: peoplePlates.get(entry.id) ?? formatPlate(UNKNOWN_COUNTRY, 0),
    country: entry.data.country ?? UNKNOWN_COUNTRY,
    workCount: worksPerPerson.get(entry.id) ?? 0,
  }));

  const events: EventRecord[] = rawEvents.map((entry) => ({
    entry,
    plate: eventPlates.get(entry.id) ?? formatPlate(UNKNOWN_COUNTRY, 0),
    country: entry.data.country ?? UNKNOWN_COUNTRY,
    workCount: worksPerEvent.get(entry.id) ?? 0,
  }));

  return { works, people, events };
}

/** Human label for a work type. */
export const WORK_TYPE_LABELS: Record<string, string> = {
  talk: "Talk",
  tool: "Tool",
  cve: "CVE",
  paper: "Paper",
  arsenal: "Arsenal",
  workshop: "Workshop",
  book: "Book",
  writeup: "Write-up",
};

/** Human label for an event kind. */
export const EVENT_KIND_LABELS: Record<string, string> = {
  conference: "Conference",
  bsides: "BSides",
  ctf: "CTF",
  meetup: "Meetup",
  village: "Village",
  training: "Training",
};

/** Human label for a focus area: "api-security" → "API security". */
export function focusLabel(focus: string): string {
  const words = focus.split("-");
  const acronyms = new Set(["api", "ai", "ml", "iot", "ics", "ot", "grc", "dfir"]);
  return words
    .map((word, i) => {
      if (acronyms.has(word)) return word.toUpperCase();
      return i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    })
    .join(" ");
}
