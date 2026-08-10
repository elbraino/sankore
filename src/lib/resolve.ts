/**
 * Reference resolution that actually fails.
 *
 * WHY THIS EXISTS
 * ---------------
 * Astro's `reference()` type-checks the *shape* of a collection reference, but
 * it does not enforce that the target exists. `getEntry()` on a dangling id
 * logs a message and returns `undefined` — the build still exits 0 and the page
 * renders with a hole in it. Verified in Phase 0: pointing a work at a
 * nonexistent author slug produced `Entry people → nonexistent-person was not
 * found` and a *successful* build.
 *
 * That left `scripts/validate.py` as the single gate on referential integrity.
 * These helpers make rendering a second, independent gate: every page resolves
 * references through here, never through raw `getEntry()`, so a dangling slug
 * throws and takes the build down with a message naming both ends of the broken
 * link.
 *
 * Rule: if you find yourself importing `getEntry` in a page, you probably want
 * a function from this file instead.
 */
import { getEntry, type CollectionEntry } from "astro:content";

type Work = CollectionEntry<"works">;
type Person = CollectionEntry<"people">;
type Event = CollectionEntry<"events">;

function integrityError(work: Work, collection: string, id: string): Error {
  return new Error(
    `Broken reference: data/works/${work.id}.yaml points at ${collection} ` +
      `'${id}', which does not exist in data/${collection}/.\n` +
      `Fix the slug or add the missing entry, then run: npm run validate`,
  );
}

/**
 * Resolve every author of a work. Throws if any author slug is dangling.
 * Order is preserved — author order in the YAML is meaningful (first author
 * leads the byline).
 */
export async function resolveAuthors(work: Work): Promise<Person[]> {
  const authors = await Promise.all(
    work.data.authors.map(async (ref) => {
      const person = await getEntry(ref);
      if (!person) throw integrityError(work, "people", ref.id);
      return person;
    }),
  );
  return authors;
}

/**
 * Resolve a work's event. Returns undefined when the work has no `event` field
 * at all — that is legitimate (tools, CVEs, and papers need no venue) and is
 * not an integrity failure. Throws only when an event IS named and missing.
 */
export async function resolveEvent(work: Work): Promise<Event | undefined> {
  const ref = work.data.event;
  if (!ref) return undefined;

  const event = await getEntry(ref);
  if (!event) throw integrityError(work, "events", ref.id);
  return event;
}

/** Convenience: authors and event in one await, for detail pages. */
export async function resolveWork(
  work: Work,
): Promise<{ authors: Person[]; event: Event | undefined }> {
  const [authors, event] = await Promise.all([resolveAuthors(work), resolveEvent(work)]);
  return { authors, event };
}
