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

/**
 * TODO (Phase 1): `public/CNAME` containing the production hostname ships with
 * the GitHub Pages deploy workflow. Do not create it before then.
 */

/** TODO (Phase 2): owner/repo, used to build pre-filled GitHub PR URLs. */
export const SITE_REPO = "OWNER/REPO";

/** TODO: takedown + claim contact, referenced by GOVERNANCE.md. */
export const MAINTAINERS_EMAIL = "maintainers@example.org";
