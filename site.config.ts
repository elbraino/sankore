/**
 * Single source of truth for site naming and URLs.
 *
 * CLAUDE.md: "All naming must come from site.config.ts. Never hardcode a name."
 * Import from here anywhere a name, tagline, or absolute URL is needed.
 */

/** The brand is the word alone. Never write the domain as prose in copy. */
export const SITE_NAME = "Sankore";

export const SITE_TAGLINE =
  "An open archive of security research from the Arab world and Africa.";

/** Production origin. No trailing slash. */
export const SITE_URL = "https://sankoreindex.org";

/**
 * Staging deploys override the *deploy target* via environment variable only.
 *
 * Canonical URLs, sitemap entries, and Open Graph tags are ALWAYS built from
 * SITE_URL — never from SITE_STAGING_URL — so a staging origin can never leak
 * into search indexes or social cards.
 */
export const SITE_STAGING_URL = "https://casatokaza.org";

/** owner/repo. Backs the issue-based takedown route and Phase 2's PR URLs. */
export const SITE_REPO = "elbraino/sankore";

/** The repository is the database — every page should be able to point at it. */
export const SITE_REPO_URL = `https://github.com/${SITE_REPO}`;

/** Default branch, used to build permalinks into the data files. */
export const SITE_BRANCH = "main";

/**
 * Link to the YAML file that backs a single entry. This is the source of truth
 * for that entry: what the site renders is a projection of this file, and a
 * correction is a change to it.
 */
export function dataFileUrl(kind: "people" | "works" | "events", slug: string): string {
  return `${SITE_REPO_URL}/blob/${SITE_BRANCH}/data/${kind}/${slug}.yaml`;
}

/** Link to a directory of data files, for the contribute flow. */
export function dataDirUrl(path: string): string {
  return `${SITE_REPO_URL}/tree/${SITE_BRANCH}/${path}`;
}

/** Where a takedown or correction request can be filed, with no account needed
 *  beyond GitHub. Issues may be filed anonymously per GOVERNANCE.md. */
export const ISSUES_URL = `https://github.com/${SITE_REPO}/issues/new?labels=takedown`;

/**
 * Takedown + claim contact.
 *
 * Deliberately `null` until a real, monitored address exists. CLAUDE.md rule 3
 * makes removal non-negotiable, so publishing a placeholder address here would
 * be worse than publishing none: it would advertise a route that silently
 * fails. While this is null, /about/ routes removal requests to ISSUES_URL,
 * which works. Set it to a real address to add the email route back.
 */
export const MAINTAINERS_EMAIL: string | null = null;
