# Five independent Web3D research streams · 五线并行研究

**Status / 当前状态 (2026-11-07):** Five original bilingual, primary-source-linked research case notes have been committed, and five independent public GitHub issues opened. **This is five parallel research workstreams, not five continuously running autonomous agents and not five completed implementations.** / 已完成五份双语研究档案和五个独立 GitHub 任务；不冒充后台全天候智能体，也不冒充游戏功能全部落地。

[Public machine-readable state / 可机器读取的五线状态](../../../data/research-lanes.json) · [OIA interactive research board / 五线网页看板](../../../research.html) · [Open original Spatial Labs / 原创技术实验](../../../labs/)

| Track / 分线 | Research file / 技术档案 | Independent issue / 独立问题 | Proposed experimental target / 下一项原创验证 |
|---|---|---|---|
| **01 Physics / 碰撞导航** | [Rapier, BVH and Recast](01-terrain-collision-navigation.md) | [#4](https://github.com/star8592/open-immersive-atlas/issues/4) | Fixed-step collision course, slopes, stairs and NPC navmesh |
| **02 Terrain / 地形 LOD** | [CDLOD, clipmaps, RTIN](02-continuous-terrain-lod.md) | [#5](https://github.com/star8592/open-immersive-atlas/issues/5) | Edge cracks, morph transitions, temporal popping across camera paths |
| **03 Motion / 人物动作** | [Animation blending and foot IK](03-locomotion-foot-ik.md) | [#6](https://github.com/star8592/open-immersive-atlas/issues/6) | Joint-axis correctness, grounded feet, anti-skating, gait transitions |
| **04 Assets / 资产工厂** | [Parametric rebuild vs topology simplification](04-asset-classification-qa.md) | [#7](https://github.com/star8592/open-immersive-atlas/issues/7) | Synthetic regular/organic test assets, official glTF Validator and render QA |
| **05 Art / 自然美术** | [Watercolor, procedural vegetation, atmosphere](05-painterly-nature.md) | [#8](https://github.com/star8592/open-immersive-atlas/issues/8) | Same-camera PBR/watercolor/ink visual ablation, blind ratings and GPU p95 |

## Independent lifecycle / 各分线独立推进

1. **Source discovery → verify / 查证原始资料:** Source must be an author repository, documented algorithm/paper or other credible firsthand explanation. Distinguish public code, author claims and independently reproduced performance.
2. **Bilingual understanding / 中英双语档案:** Document mechanism, assumptions, bottlenecks, tradeoffs, license caution and explicit non-claims.
3. **Original minimal reproduction / 独立原创最小实验:** Only mark a prototype complete after original code, test fixtures and an actual browser/device run.
4. **Measured acceptance / 真实测试:** Independent tests for expected correctness, visual quality, CPU/GPU p95, input handling and failure states; never invent results.
5. **Private implementation handoff / 私有产品应用:** Track architecture ideas in private product engineering. Private games, unpublished generated assets, customer files and proprietary workflows are not uploaded here. Public research source and private implementation have different gates and release records.

Five tracks can be researched and verified concurrently; releases of shared public navigation and schema may be batched atomically to avoid merge collisions. A failure in one track must **not** block unrelated independent research. / 五线研究可并发，公共导航与 schema 更改合并发布以减少冲突；单线资料不完整不应阻断其他分线。

## Prioritization / 如何分配研究精力

The order in this table is an initial **dependency-aware suggestion**, not a prohibition on concurrent work. Character IK needs reliable ground queries from physics. Smooth visual LOD should not mutate authoritative collision. Automated asset QA supports both scene art and animation rigs. Painterly atmosphere needs genuine geometry and stable scale to avoid attractive screenshots that fail as playable game scenes.

**English:** Independent research lanes have shared interfaces: world units, terrain height/collider queries, rig semantics, geometry/material asset contracts, screenshot cameras and runtime performance metrics. Coordinate on those interfaces while leaving the five source studies isolated.

## Public safety and citation / 开源边界

Link to external repositories, do not mirror them indiscriminately. Preserve authorship and check upstream license, model rights and music rights before using code or assets. A research note does not automatically grant permission to copy a demo, shader, texture or animation clip. OIA's original narrative and examples use its own license; upstream projects retain theirs.

No scheduled background task is created by this page. The five line statuses are **static, reviewed snapshots**, not live agents. To update them, change the docs and the JSON in a reviewed commit. / 看板是有日期的仓库快照，不声称后台持续自主运行。
