#!/usr/bin/env python3
"""Validate all data files against schemas + referential integrity.

Checks:
  1. Every YAML file validates against its JSON Schema.
  2. Slug in file matches filename.
  3. work.authors reference existing people; work.event references existing event.
  4. Unclaimed people carry no personal fields (defense in depth vs schema).
  5. Duplicate slugs.
Exit code 1 on any failure. Run: python scripts/validate.py
"""
import json
import sys
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SCHEMAS = {
    "people": DATA / "schema" / "person.schema.json",
    "works": DATA / "schema" / "work.schema.json",
    "events": DATA / "schema" / "event.schema.json",
}
PERSONAL_FIELDS = {"bio", "photo", "links", "name_ar"}

errors: list[str] = []


def _normalize(obj):
    """YAML parses bare dates as datetime.date; schemas expect ISO strings."""
    import datetime
    if isinstance(obj, dict):
        return {k: _normalize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_normalize(v) for v in obj]
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    return obj


def load_yaml(path: Path):
    with path.open(encoding="utf-8") as f:
        return _normalize(yaml.safe_load(f))


def main() -> int:
    validators = {
        kind: Draft202012Validator(json.loads(p.read_text(encoding="utf-8")))
        for kind, p in SCHEMAS.items()
    }

    entries: dict[str, dict[str, dict]] = {"people": {}, "works": {}, "events": {}}

    for kind in entries:
        folder = DATA / kind
        if not folder.exists():
            continue
        for path in sorted(folder.glob("*.yaml")):
            rel = path.relative_to(ROOT)
            try:
                doc = load_yaml(path)
            except yaml.YAMLError as e:
                errors.append(f"{rel}: YAML parse error: {e}")
                continue
            if not isinstance(doc, dict):
                errors.append(f"{rel}: top level must be a mapping")
                continue

            for err in validators[kind].iter_errors(doc):
                loc = "/".join(str(x) for x in err.path) or "<root>"
                errors.append(f"{rel}: [{loc}] {err.message}")

            slug = doc.get("slug")
            if slug and slug != path.stem:
                errors.append(f"{rel}: slug '{slug}' != filename '{path.stem}'")
            if slug in entries[kind]:
                errors.append(f"{rel}: duplicate slug '{slug}'")
            if slug:
                entries[kind][slug] = doc

    # Referential integrity + drafts
    for slug, work in entries["works"].items():
        if work.get("draft"):
            errors.append(
                f"data/works/{slug}.yaml: draft entries belong in data/_drafts/, not data/works/"
            )
        for author in work.get("authors", []):
            if author not in entries["people"]:
                errors.append(f"data/works/{slug}.yaml: unknown author '{author}'")
        ev = work.get("event")
        if ev and ev not in entries["events"]:
            errors.append(f"data/works/{slug}.yaml: unknown event '{ev}'")

    # Consent rule, enforced independently of schema
    for slug, person in entries["people"].items():
        if person.get("claimed") is False:
            leaked = PERSONAL_FIELDS & person.keys()
            if leaked:
                errors.append(
                    f"data/people/{slug}.yaml: unclaimed profile must not contain {sorted(leaked)}"
                )

    if errors:
        print(f"FAIL — {len(errors)} problem(s):\n")
        for e in errors:
            print(f"  ✗ {e}")
        return 1

    counts = {k: len(v) for k, v in entries.items()}
    print(f"OK — validated {counts['people']} people, {counts['works']} works, {counts['events']} events.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
