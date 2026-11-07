#!/usr/bin/env python3
"""Minimal fast validation for OIA's five independent public research lanes."""
from __future__ import annotations
import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / "data/research-lanes.json").read_text(encoding="utf-8"))
assert data["schema"] == "oia-research-lanes-v1"
assert data["parallel_workstreams"] == 5
lanes = data["lanes"]
assert len(lanes) == 5, "Expected exactly five independent research lanes"
assert len({x["id"] for x in lanes}) == 5
assert {x["number"] for x in lanes} == {1, 2, 3, 4, 5}
for lane in lanes:
    title = lane["id"]
    assert lane["status"]["research"] == "first-pass-published"
    assert lane["status"]["game_integration"] == "not-verified", f"{title}: private-game integration is unverified"
    assert lane["status"]["prototype"] == "working-diagnostic-demo", f"{title}: missing verified diagnostic source"
    for field in ("prototype_source", "prototype_test", "prototype_file"):
        asset = ROOT / lane[field]
        assert asset.is_file() and asset.resolve().is_relative_to(ROOT), f"{title}: missing verified {field}"
    assert lane["prototype_url"].startswith("https://star8592.github.io/open-immersive-atlas/labs/")
    evidence = lane.get("prototype_evidence", {})
    assert evidence.get("unit_tests") in ("38/38 PASS", "47/47 shared five-lane suite PASS")
    assert "synthetic" in evidence.get("scope", "").lower(), f"{title}: scope must identify synthetic-only proof"
    assert lane["status"]["game_integration"] == "not-verified"
    if title == "lane-03":
        assert evidence["unit_tests"] == "38/38 PASS", f"{title}: earlier diagnostic results must not be overwritten"
        assert lane["additional_prototype_url"].endswith("/labs/five-lane-runtime/")
        assert (ROOT / lane["additional_prototype_source"]).is_file()
    else:
        assert evidence["unit_tests"] == "47/47 shared five-lane suite PASS"
    for field in ("name", "focus", "next_test"):
        assert all(isinstance(lane[field].get(k), str) and lane[field][k].strip()
                   for k in ("zh", "en")), f"{title}: {field} needs both languages"
    doc = ROOT / lane["research_file"]
    assert doc.is_file() and doc.resolve().is_relative_to(ROOT), f"{title}: missing source note"
    content = doc.read_text(encoding="utf-8")
    assert len(content) > 2000 and "## " in content and any(c in content for c in ("中文", "一手", "原始", "研究")), f"{title}: note too thin or not bilingual"
    assert "https://github.com/star8592/open-immersive-atlas/issues/" in lane["issue_url"]
    assert len(lane["sources"]) >= 3
    for url in lane["sources"]:
        parsed = urlparse(url)
        assert parsed.scheme == "https" and parsed.netloc, f"{title}: invalid source {url}"
        assert url in content, f"{title}: source missing from note {url}"
    prohibited = ("globalgamefoundry", "playmoru.com", "mcp.devcontrol.dev", "zoryvia.dev")
    assert not any(s in content.lower() for s in prohibited), f"{title}: private project reference"
assert (ROOT / "research.html").is_file()
print(f"OK: {len(lanes)} independent bilingual research lanes; research-only statuses and local notes verified")
