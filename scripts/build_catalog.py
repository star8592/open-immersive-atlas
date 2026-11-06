#!/usr/bin/env python3
"""Regenerate the human-readable CATALOG.md from data/projects.json."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
payload=json.loads((ROOT/"data/projects.json").read_text(encoding="utf-8"))
items=payload["projects"]
groups=[("experiences","Immersive Experiences / 沉浸式作品"),("pipelines","3D & AI Production Pipelines / 3D 与 AI 工厂"),("engines","Frameworks & Engines / 框架与引擎"),("infrastructure","Rendering & Engineering Infrastructure / 渲染与工程技术")]
out=[f"# Curated Projects · 双语项目档案\n\n> **{len(items)} records, reviewed {payload['as_of']}.** Projects are linked, not mirrored. No claim of local reproduction is made.\n>\n> **{len(items)} 条档案，核查日期 {payload['as_of']}。** 仅提供研究性链接和原创分析，未宣称已在本地复现。\n\n[Home / 首页](README.md) · [Search / 搜索](index.html) · [Data / 数据](data/projects.json)\n"]
for category,title in groups:
    out.append(f"\n## {title}\n")
    for p in [x for x in items if x["category"]==category]:
        out.append(f"\n### {p['name']}\n\n")
        out.append(f"- **Official / 官方**: {p['website']}  \n")
        if p.get('repository'): out.append(f"- **Code / 源码**: {p['repository']}  \n")
        out.append(f"- **Evidence / 证据**: `{p['evidence']}` · **Upstream rights / 上游权属**: {p['upstream_license']}\n\n")
        out.append(f"**中文简介：** {p['summary']['zh']}  \n**English:** {p['summary']['en']}\n\n")
        out.append(f"**为什么厉害 / Why it stands out**  \n中文：{p['strength']['zh']}  \nEnglish: {p['strength']['en']}\n\n")
        out.append(f"**值得学习 / What to learn**  \n中文：{p['learning']['zh']}  \nEnglish: {p['learning']['en']}\n\n")
(ROOT/"CATALOG.md").write_text("".join(out),encoding="utf-8")
print(f"Built CATALOG.md with {len(items)} records")
