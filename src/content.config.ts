/**
 * Astro content collections for the YAML data in `data/`.
 *
 * COUPLING — CLAUDE.md: "Astro content collections typed from the same shapes
 * as the JSON schemas — if you change a schema, change the collection config in
 * the same commit." The zod shapes below mirror `data/schema/*.json`
 * field-for-field, including enums, length caps, and patterns.
 *
 * There are three independent gates on this data, by design:
 *   1. `data/schema/*.json`      — the published contract for contributors
 *   2. `scripts/validate.py`     — CI gate, plus referential integrity
 *   3. this file                 — build gate, fails `astro build`
 *
 * Division of labour, verified: a *shape* violation (bad enum, over-long bio,
 * a personal field on an unclaimed profile) fails both gate 2 and gate 3. A
 * *relational* violation (dangling author/event slug, slug ≠ filename) fails
 * only gate 2 — Astro's reference() logs and returns undefined rather than
 * throwing. That is why `npm run build` runs the validator first and why it
 * must never be dropped from the build script.
 *
 * The glob pattern is `*.yaml` (not `**\/*`, not `.yml`) so it matches
 * `folder.glob("*.yaml")` in scripts/validate.py exactly — both gates see the
 * same file set. `data/_drafts/` is a sibling directory and is excluded by
 * construction, satisfying "drafts never build".
 *
 * The loader derives each entry `id` from its filename, and validate.py pins
 * `slug === filename`, so `entry.id === entry.data.slug` holds throughout.
 */
import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/** ISO 3166-1 alpha-2. Always optional — GOVERNANCE.md, "People: consent model". */
const country = z.string().regex(/^[A-Z]{2}$/, "must be an ISO 3166-1 alpha-2 code");

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be a lowercase hyphenated slug");

const language = z.enum(["en", "ar", "fr", "sw", "other"]);

const focusArea = z.enum([
  "web", "mobile", "cloud", "network", "hardware", "iot", "ics-ot",
  "reverse-engineering", "malware", "forensics-dfir", "threat-intel",
  "cryptography", "identity", "api-security", "ai-ml-security",
  "social-engineering", "grc", "blue-team", "red-team", "bug-bounty",
  "automotive", "telecom", "blockchain",
]);

/** Fields a person only gets to publish once they have claimed the profile. */
const PERSONAL_FIELDS = ["bio", "photo", "links", "name_ar"] as const;

const people = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./data/people" }),
  schema: z
    .object({
      slug: slug,
      name: z.string().min(2),
      /** Claimed profiles only. */
      name_ar: z.string().optional(),
      claimed: z.boolean(),
      country: country.optional(),
      focus: z.array(focusArea).optional(),
      /** Claimed profiles only. */
      bio: z.string().max(800).optional(),
      /** Claimed profiles only. Path under /public/photos/. */
      photo: z.string().optional(),
      /** Claimed profiles only. */
      links: z
        .object({
          website: z.url().optional(),
          github: z.url().optional(),
          linkedin: z.url().optional(),
          twitter: z.url().optional(),
          mastodon: z.url().optional(),
          scholar: z.url().optional(),
        })
        .strict()
        .optional(),
      /** Maintainer note on how the claim was verified. Never rendered. */
      claim_verification: z.string().optional(),
      added: z.coerce.date().optional(),
      updated: z.coerce.date().optional(),
    })
    .strict()
    // Consent model, CLAUDE.md rule 1: an unclaimed stub carries no personal
    // data at all. Enforced here as well as in the JSON Schema and validate.py
    // so no single gate can be bypassed.
    .superRefine((person, ctx) => {
      if (person.claimed) return;
      for (const field of PERSONAL_FIELDS) {
        if (person[field] !== undefined) {
          ctx.addIssue({
            code: "custom",
            path: [field],
            message: `unclaimed profile must not contain '${field}' (claimed: false)`,
          });
        }
      }
    }),
});

const works = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./data/works" }),
  schema: z
    .object({
      slug: slug,
      title: z.string().min(3),
      type: z.enum(["talk", "tool", "cve", "paper", "arsenal", "workshop", "book", "writeup"]),
      year: z.number().int().min(1990).max(2100),
      /**
       * Must exist in data/people/. `reference()` gives typed getEntry()
       * lookups, but note it does NOT fail the build on a dangling id —
       * Astro logs and returns undefined. scripts/validate.py is the
       * authoritative referential-integrity gate; see the header note.
       */
      authors: z.array(reference("people")).min(1),
      /** Must exist in data/events/. Same caveat as `authors`. */
      event: reference("events").optional(),
      abstract: z.string().max(1200).optional(),
      language: language.optional(),
      cve_ids: z.array(z.string().regex(/^CVE-\d{4}-\d{4,}$/)).optional(),
      /**
       * The page this entry was recorded FROM — provenance, not the work.
       * `links` point at the work itself (watch it, read it, run it); `source`
       * points at the agenda/speaker/repo page that establishes it exists, so
       * a reader can check the index against its origin. This is the `# Source:`
       * comment convention promoted into data.
       */
      source: z.url().optional(),
      links: z
        .object({
          video: z.url().optional(),
          slides: z.url().optional(),
          code: z.url().optional(),
          paper: z.url().optional(),
          advisory: z.url().optional(),
          /** Wayback mirror — add whenever possible; regional con sites die. */
          archive: z.url().optional(),
        })
        .strict()
        .optional(),
      tags: z.array(z.string()).optional(),
      /** Seed-helper output awaiting review. Drafts live in data/_drafts/. */
      draft: z.boolean().optional(),
      added: z.coerce.date().optional(),
    })
    .strict(),
});

const events = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./data/events" }),
  schema: z
    .object({
      slug: slug,
      name: z.string().min(2),
      kind: z.enum(["conference", "bsides", "ctf", "meetup", "village", "training"]),
      country: country.optional(),
      city: z.string().optional(),
      website: z.url().optional(),
      cfp_url: z.url().optional(),
      first_year: z.number().int().min(1990).optional(),
      status: z.enum(["active", "dormant", "ended"]).default("active"),
      description: z.string().max(600).optional(),
      languages: z.array(language).optional(),
    })
    .strict(),
});

export const collections = { people, works, events };
