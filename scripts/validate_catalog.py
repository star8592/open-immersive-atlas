#!/usr/bin/env python3
"""Validate public bilingual project catalog with the Python standard library."""
import json
import re
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "projects.json"
CATEGORIES = {"experiences", "pipelines", "engines", "infrastructure"}
EVIDENCE = {"source-code", "creator-notes", "creator-article", "official-product", "official-site"}
PRIVATE = ("localhost", "127.0.0.1", "file://", ".internal", ".local", "/.env", "/secrets/")

def check():
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    items = payload["projects"]
    errors, ids = [], set()
    for n, item in enumerate(items, 1):
        where = f"item {n} ({item.get('id','?')})"
        id_ = item.get("id", "")
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", id_): errors.append(f"{where}: invalid id")
        if id_ in ids: errors.append(f"{where}: duplicate id")
        ids.add(id_)
        if item.get("category") not in CATEGORIES: errors.append(f"{where}: category")
        if item.get("evidence") not in EVIDENCE: errors.append(f"{where}: evidence")
        for key in ("name","upstream_license","reviewed_on","evidence_url"):
            if not item.get(key): errors.append(f"{where}: missing {key}")
        for key in ("website", "repository", "evidence_url"):
            url=item.get(key)
            if not url and key=="repository": continue
            p=urlsplit(url or "")
            if p.scheme!="https" or not p.netloc: errors.append(f"{where}: invalid {key} URL")
            if any(s in (url or "").lower() for s in PRIVATE): errors.append(f"{where}: nonpublic/internal URL")
        for key in ("summary","strength","learning"):
            val=item.get(key, {})
            for lang in ("zh","en"):
                s=val.get(lang, "") if isinstance(val,dict) else ""
                if len(s)<15: errors.append(f"{where}: incomplete {key}.{lang}")
        try: date.fromisoformat(item["reviewed_on"])
        except (ValueError,KeyError): errors.append(f"{where}: invalid reviewed_on")
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"OK: {len(items)} bilingual records; categories={dict(Counter(x['category'] for x in items))}")
    return 0

if __name__ == "__main__": raise SystemExit(check())
