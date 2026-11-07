#!/usr/bin/env python3
"""Validate the first-party/non-code source radar independently of source-code catalog."""
from __future__ import annotations
import json
from pathlib import Path
from datetime import date
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
payload = json.loads((ROOT / "data/source-radar.json").read_text(encoding="utf8"))
assert payload["schema"] == "oia-primary-source-radar-v1"
records = payload["sources"]
assert payload["record_count"] == len(records) and len(records) >= 12
assert (ROOT / "sources.html").is_file()
assert date.fromisoformat(payload["reviewed_on"])
ids = set()
for record in records:
    name = record["id"]
    assert name and name not in ids, f"Duplicate source: {name}"
    ids.add(name)
    assert record.get("category") and record.get("source_kind")
    u = urlsplit(record["url"])
    assert u.scheme == "https" and u.netloc, f"Invalid original source: {name}"
    assert record["verification"] == "first-party-source-reviewed"
    assert record["replication"] == "not-claimed"
    assert record.get("rights_note") and len(record["rights_note"]) > 20
    assert date.fromisoformat(record["reviewed_on"])
    for field in ("summary", "learning"):
        for language in ("zh", "en"):
            text = record[field].get(language)
            assert isinstance(text, str) and len(text) >= 16, f"Missing {field}.{language}: {name}"
    serialized = json.dumps(record, ensure_ascii=False).lower()
    for private in ("globalgamefoundry", "playmoru.com", "devcontrol.dev", "zoryvia.dev", "localhost", "127.0.0.1"):
        assert private not in serialized, f"Private material in radar: {name}"
print(f"OK: {len(records)} source-backed non-code entries, {len({x['category'] for x in records})} subject groups")
