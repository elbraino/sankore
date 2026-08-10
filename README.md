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

CI runs `npm ci` on Linux, so `package-lock.json` must carry the Linux
platform-specific optional dependencies (sharp, lightningcss) as well as your
own. After adding or upgrading a dependency on macOS or Windows, run:

```
npm install --package-lock-only --os=linux --cpu=x64
```

and commit the result, otherwise CI fails with "can only install packages when
your package.json and package-lock.json are in sync".

## Maintainers
- (add 2–3 regional co-maintainers here before public launch)

## License
Data: CC BY 4.0 · Code: MIT (pending confirmation)
