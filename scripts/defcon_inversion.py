#!/usr/bin/env python3
"""Match people ALREADY indexed here against a DEF CON file listing.

WHY THE SEARCH RUNS THIS WAY ROUND
----------------------------------
Asking "which DEF CON speakers are from the region?" cannot be answered
honestly. DEF CON publishes an abstract and a speaker name and nothing else --
sixteen DC33/34 video descriptions were sampled and not one contained a bio,
employer, university, CERT or location. Answering it would mean inferring
origin from names, which GOVERNANCE.md criterion 2 forbids and SOURCES.md
rule 1 restates.

Asking the inverse -- "which of the people already in this index spoke at
DEF CON?" -- needs no inference at all, because their place in the index is
already evidenced. That is how `7-vulns-in-7-days-2025` was found.

INPUT
-----
HTML directory listings from media.defcon.org, saved to disk. This script does
not fetch them: media.defcon.org/robots.txt names ClaudeBot, Claude-Web and
anthropic-ai followed by `Disallow: /`, so automated agents must not crawl it.
A maintainer fetching the listing in their own browser or shell is a different
act from an agent crawling the host, and is theirs to decide.

    curl -s "https://media.defcon.org/DEF%20CON%2034/DEF%20CON%2034%20workshops/" > dc34-workshops.html
    python3 scripts/defcon_inversion.py dc34-workshops.html

TWO MATCHING BUGS, BOTH FOUND THE HARD WAY
------------------------------------------
Both produced a wrong answer that looked right, so the guards below are load
bearing and the self-test at the bottom pins them:

1. Requiring two name parts made mononyms unmatchable. The index contains
   handles ("Singe"), so those people could never match anything -- a silent
   false negative.
2. Filtering name parts to len > 2 dropped "JP" from "JP Smith", collapsing it
   to the mononym "smith", which then matched an unrelated Caleb "calebot"
   Smith -- a silent false positive that read as a real find.
"""
import html
import pathlib
import re
import sys
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parent.parent
PEOPLE = ROOT / "data" / "people"


def norm(s: str) -> str:
    """Fold to ascii lowercase words; punctuation and diacritics become spaces."""
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9 ]", " ", s.lower())


def parts_of(name: str) -> list[str]:
    """Name tokens. >= 2 chars, never > 2 — see bug 2 in the module docstring."""
    return [w for w in norm(name).split() if len(w) >= 2]


def match(name: str, entry: str) -> bool:
    parts = parts_of(name)
    tokens = norm(entry).split()
    if not parts:
        return False
    if len(parts) == 1:
        # Mononym or handle: needs the whole token, and enough length that it
        # cannot collide with an ordinary word in a talk title.
        return len(parts[0]) >= 4 and parts[0] in tokens
    # Surname AND at least one other part, so a shared surname alone can never
    # claim a person.
    return parts[-1] in tokens and any(p in tokens for p in parts[:-1])


def roster() -> list[tuple[str, str]]:
    out = []
    for path in sorted(PEOPLE.glob("*.yaml")):
        m = re.search(r'^name: "?([^"\n]+)"?$', path.read_text(), re.M)
        if m:
            out.append((m.group(1).strip(), path.stem))
    return out


def entries(paths: list[str]) -> list[str]:
    found = []
    for p in paths:
        text = pathlib.Path(p).read_text()
        for _, label in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', text, re.S):
            label = re.sub(r"<[^>]+>", "", html.unescape(label)).strip()
            if label.startswith("DEF CON"):
                found.append(label)
    return found


def self_test() -> None:
    assert not match(
        "JP Smith",
        "DEF CON 34 - Workshops - cale - calebot - smith - Web Hacking 101.md",
    ), "regression: an unrelated surname matches again (bug 2)"
    assert match("Singe", "DEF CON 30 - singe - Something"), \
        "regression: mononyms unmatchable again (bug 1)"
    assert not match("Nitay Artenstein", "DEF CON 34 - Workshops - Nitay Bachrach - Salesforce"), \
        "regression: shared first name alone is enough again"


def main() -> int:
    self_test()
    if len(sys.argv) < 2:
        print(__doc__)
        return 2

    people = roster()
    listing = entries(sys.argv[1:])
    print(f"roster {len(people)} people | {len(listing)} listed entries")

    hits = [(n, s, e) for n, s in people for e in listing if match(n, e)]
    print(f"matches: {len(hits)}")
    for name, slug, entry in hits:
        print(f"  {name} ({slug})\n    {entry}")
    if not hits:
        print("  (nothing — expected; DC32+DC33 together yielded exactly one)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
