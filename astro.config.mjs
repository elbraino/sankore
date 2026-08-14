// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import { SITE_URL } from "./site.config.ts";

// https://astro.build/config
export default defineConfig({
  // Always the production origin. Astro derives canonical URLs, the sitemap,
  // and Astro.site from this — a staging origin must never appear here.
  // See the SITE_STAGING_URL note in site.config.ts.
  site: SITE_URL,

  // Custom domain is root-served, so no `base` path.
  // If this ever moves to a GitHub Pages *project* site
  // (user.github.io/<repo>/), add `base` and audit every internal link.

  // Matches the /people/, /works/, /events/ URL scheme in CLAUDE.md.
  trailingSlash: "always",

  // SET DELIBERATELY — do not delete this line, and read before changing it.
  //
  // Leaving it out shipped prose with the space missing before inline elements.
  // Ordinary, correct authoring:
  //
  //     Requests are honoured within 7 days, without debate.
  //     <a href={ISSUES_URL}>Open a takedown request</a> — it is pre-labelled.
  //
  // reached readers as "without debate.Open a takedown request". There were 186
  // such joins across every page, including the About page's consent and
  // removal sections — the last copy on the site that should look careless.
  //
  // Measured across the whole site, same source, three configurations:
  //
  //     omitted (the default)   raw 3,134,852   gz 112,292   BROKEN
  //     compressHTML: true      raw 3,177,733   gz 116,944   correct
  //     compressHTML: false     raw 3,439,614   gz 120,327   correct
  //
  // Note the first two rows. Omitting the option is documented as equivalent to
  // `true`, and it is not: only the explicit value preserves the whitespace. I
  // could not determine why, and `false` is chosen over `true` for that reason
  // — not for output size, which `true` wins by 3.4KB. Depending on an
  // undiagnosed difference between a default and its explicit equivalent is how
  // this returns silently after an Astro upgrade. `false` means what it says.
  //
  // The cost is ~8KB gzipped across every page on the site, for prose that
  // reads correctly. `scripts/check_spacing.py` runs in postbuild and fails the
  // build if the joins come back, so a future change here cannot pass unnoticed.
  compressHTML: false,

  // Fonts are downloaded at BUILD time and served from our own origin.
  // Deliberate: visitors to a security-research index in this region should
  // not have their IP handed to a third-party font CDN on every page view.
  // CLAUDE.md, "No external tracking scripts" — same principle.
  fonts: [
    {
      // Display — "a sharp grotesque with character" (CLAUDE.md).
      name: "Space Grotesk",
      cssVariable: "--font-display",
      provider: fontProviders.fontsource(),
      weights: [500, 700],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
    },
    {
      // Body — readable humanist sans.
      name: "Inter",
      cssVariable: "--font-body",
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
    },
    {
      // Mono — metadata, coordinates, and the plate references.
      name: "IBM Plex Mono",
      cssVariable: "--font-mono",
      provider: fontProviders.fontsource(),
      weights: [400, 500],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
    },
    {
      // Arabic-capable, in the stack from day one (CLAUDE.md, bilingual-ready).
      name: "IBM Plex Sans Arabic",
      cssVariable: "--font-arabic",
      provider: fontProviders.fontsource(),
      weights: [400, 600],
      styles: ["normal"],
      subsets: ["arabic", "latin"],
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
    },
  ],
});
