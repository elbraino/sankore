#!/usr/bin/env python3
"""Fail the build if rendered prose has lost the space before an inline element.

WHAT THIS CATCHES
-----------------
    …without debate.<a href=…>Open a takedown request</a>
    …request any of the following, with<strong>no justification required</strong>

Both read as a typo to every visitor, and both came from correct source markup.

WHY IT CAN HAPPEN
-----------------
Astro's `compressHTML` (on by default) removes the whitespace between a text
node and an adjacent element when they are separated by a newline, rather than
collapsing it to the single space HTML would render. Authoring like this is
correct and normal:

    <p>
      Requests are honoured within 7 days, without debate.
      <a href={ISSUES_URL}>Open a takedown request</a> — it is pre-labelled.
    </p>

and it shipped as "debate.<a". At the time this check was written the site had
186 such joins across every page. The fix was `compressHTML: false` in
astro.config.mjs, which costs ~7.8KB gzipped across the whole site. This script
exists so that re-enabling compression — or any future change with the same
effect — fails loudly instead of quietly mangling prose.

Run: python3 scripts/check_spacing.py [dist_dir]
"""
import html
import pathlib
import re
import sys

INLINE = r"(?:a|strong|em|code|abbr|span|b|i)"

# A letter or sentence punctuation flush against an opening inline tag.
#
# Three deliberate exclusions, each of which produced a false positive on the
# first run of this check:
#   (   [   "   an opening bracket or quote before a tag is normal
#   ;       ends an HTML entity — FilterBar writes "&#32;<span>" on purpose to
#           force a space that survives any compressor
#   digits  "24<span class='bar-of'>/63</span>" renders "24/63" on the coverage
#           page, where a space would be wrong
MISSING_BEFORE = re.compile(r"[A-Za-z.,:!?](<" + INLINE + r"[\s>])")

# A closing inline tag flush against a word character. Punctuation after a link
# is correct ("</a>." or "</a>,"), so only letters and digits count.
MISSING_AFTER = re.compile(r"(</" + INLINE + r">)[A-Za-z0-9]")

STRIP = re.compile(r"<(script|style)\b.*?</\1>", re.S)


def context(text: str, start: int, end: int) -> str:
    raw = text[max(0, start - 60) : end + 40]
    return re.sub(r"<[^>]+>", "·", html.unescape(raw)).replace("\n", " ").strip()


def main() -> int:
    root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    if not root.is_dir():
        print(f"error: {root} not found — run a build first.", file=sys.stderr)
        return 1

    problems = []
    for page in sorted(root.rglob("*.html")):
        body = STRIP.sub("", page.read_text())
        for rx, label in ((MISSING_BEFORE, "before"), (MISSING_AFTER, "after")):
            for m in rx.finditer(body):
                problems.append((page.relative_to(root), label, context(body, m.start(), m.end())))

    if problems:
        print(f"FAIL — {len(problems)} missing space(s) around inline elements:\n", file=sys.stderr)
        for path, label, ctx in problems[:25]:
            print(f"  {path} ({label}) …{ctx}…", file=sys.stderr)
        if len(problems) > 25:
            print(f"  … and {len(problems) - 25} more", file=sys.stderr)
        print(
            "\nUsually means HTML compression stripped whitespace between a text node\n"
            "and an inline tag. See the note in astro.config.mjs.",
            file=sys.stderr,
        )
        return 1

    pages = sum(1 for _ in root.rglob("*.html"))
    print(f"OK — no lost spaces around inline elements across {pages} pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
