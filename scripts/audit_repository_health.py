#!/usr/bin/env python3
"""Audit OIA GitHub references: deterministic identity checks, optional live read-only verification.

Run offline in CI; run with --live on an authenticated development workstation.
No writes to GitHub and no access to private repositories by name.
"""
from __future__ import annotations
import argparse
from collections import Counter
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]

def github_identity(url):
    parsed = urlsplit(url)
    if parsed.scheme != "https" or parsed.hostname not in ("github.com", "www.github.com"):
        return None
    parts = [x for x in parsed.path.split("/") if x]
    if len(parts) < 2 or any(not re.fullmatch(r"[a-zA-Z0-9_.-]+", x) for x in parts[:2]):
        return None
    return parts[0], parts[1].removesuffix(".git")

def offline(items):
    seen_ids, seen_repos, refs, problems = set(), {}, [], []
    for entry in items:
        ident = entry["id"]
        if ident in seen_ids: problems.append("Duplicate ID: "+ident)
        seen_ids.add(ident)
        if not entry.get("repository"): continue
        path = github_identity(entry["repository"])
        if path is None: continue
        key = "/".join(path).lower()
        if key in seen_repos: problems.append("Duplicate repository: "+ident+" and "+seen_repos[key])
        seen_repos[key] = ident
        refs.append((ident, *path))
        claim = entry.get("verification",{})
        if claim.get("license_spdx") and not re.fullmatch(r"[a-zA-Z0-9_.+-]+",claim["license_spdx"]):
            problems.append("Invalid SPDX: "+ident)
        if claim.get("local_runtime") == "tested" and not claim.get("test_evidence"):
            problems.append("Runtime test claimed without evidence: "+ident)
    return refs, problems

def run():
    p=argparse.ArgumentParser()
    p.add_argument("--live",action="store_true",help="Use authenticated GitHub CLI for read-only verification")
    p.add_argument("--output",help="Write result JSON to local file")
    p.add_argument("--batch",type=int,default=18)
    args=p.parse_args()
    if args.batch<2 or args.batch>25:p.error("Batch must be 2..25")
    data=json.loads((ROOT/"data/projects.json").read_text(encoding="utf8"))
    refs,problems=offline(data["projects"])
    if problems:
        print("\n".join(problems),file=sys.stderr)
        return 2
    if not args.live:
        print("PASS: %d project records; %d distinct GitHub repositories; license claims structurally valid"%(len(data["projects"]),len(refs)))
        return 0
    results=[]
    for start in range(0,len(refs),args.batch):
        chunk=refs[start:start+args.batch]
        fields=[]
        for i,(_,owner,name) in enumerate(chunk):
            fields.append('a%d:repository(owner:"%s",name:"%s"){nameWithOwner isArchived pushedAt licenseInfo{spdxId}}'%(i,owner,name))
        query="query{ "+" ".join(fields)+" }"
        try:
            cmd=subprocess.run(["gh","api","graphql","-f","query="+query],
                capture_output=True,text=True,timeout=45,check=False)
        except (OSError,subprocess.TimeoutExpired) as exc:
            print("GitHub check unavailable: "+str(exc),file=sys.stderr);return 3
        if cmd.returncode:
            print("GitHub API unavailable or rate limited during live audit",file=sys.stderr);return 3
        objects=json.loads(cmd.stdout).get("data",{})
        for i,(ident,owner,name) in enumerate(chunk):
            current=objects.get("a%d"%i)
            row={"catalog_id":ident,"queried":owner+"/"+name}
            if current is None:row["status"]="missing-or-inaccessible"
            else:
                row.update({"status":"archived" if current.get("isArchived") else "active",
                  "canonical":current["nameWithOwner"],
                  "license_spdx":(current.get("licenseInfo") or {}).get("spdxId"),
                  "last_push_utc":current.get("pushedAt")})
            results.append(row)
    counts=dict(Counter(x["status"] for x in results))
    report={"schema":"oia-repository-audit-v1",
      "checked_utc":datetime.now(timezone.utc).isoformat(timespec="seconds"),
      "catalog_count":len(data["projects"]),"github_references":len(refs),
      "summary":counts,
      "limits":["Metadata only: no local runtime claims",
      "Detected repository license does not automatically cover artwork, game data, fonts or model weights",
      "Missing may mean transfer, alias, API access or deletion and needs manual review"],
      "repositories":results}
    serialized=json.dumps(report,ensure_ascii=False,indent=2)+"\n"
    if args.output:Path(args.output).write_text(serialized,encoding="utf8")
    else:print(serialized)
    print("LIVE AUDIT: "+str(counts),file=sys.stderr)
    return 0

if __name__=="__main__":raise SystemExit(run())
