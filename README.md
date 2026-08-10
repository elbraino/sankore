# Sankore — Arab World & Africa Security Research Index

A public, open archive of cybersecurity research from the Arab world and
Africa: conference talks, tools, CVEs, papers — and the researchers behind
them, on an opt-in basis.

Inspired by [Atlas Latino](https://atlaslatino.org/).

## How it works
- All data lives in this repo as YAML under `data/`, validated in CI.
- The site is generated statically (Astro) and deployed from this repo.
- Anyone can contribute a work via the web form (generates a PR) or a direct PR.
- Researchers can claim their profile to unlock bio, photo, and links.
  Unclaimed profiles show only a name and linked works. See GOVERNANCE.md.

## Contributing
1. `data/works/` — add a talk, tool, CVE, paper (see `data/schema/work.schema.json`).
2. `data/people/` — stubs only unless it's you (consent model in GOVERNANCE.md).
3. `data/events/` — regional conferences, BSides, meetups, CTFs.
4. Run `npm run validate` before opening a PR.

## Development
```
npm install
npm run setup:py     # creates .venv and installs the validator's deps
npm run dev
```

`npm run build` runs the data validator first and refuses to build on invalid
data. `npm run validate` runs it on its own.

### Dependency lockfile

CI runs `npm install`, not `npm ci`. Astro depends on sharp, whose optional
`@img/sharp-wasm32` package declares `@emnapi/runtime`; npm does not write that
entry into a lockfile generated on macOS, so `npm ci` fails on Linux runners
with an EUSAGE "out of sync" error even though nothing is actually wrong.
Versions are still pinned by the lockfile — install only reconciles the
platform-specific optional packages. Commit `package-lock.json` as usual.

## Maintainers
- (add 2–3 regional co-maintainers here before public launch)

## License
Data: CC BY 4.0 · Code: MIT (pending confirmation)
