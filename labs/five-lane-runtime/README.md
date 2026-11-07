# Spatial Lab 05 — Five-Lane Engineering Bench / 五线工程实验台

[Open actual browser experiment / 在线实验](https://star8592.github.io/open-immersive-atlas/labs/five-lane-runtime/) · [Research lanes / 五线研究](../../research.html)

**Status (2026-11-07):** Five original, independently importable computing modules + browser dashboard. This is an engineering diagnostic prototype, not a production game or a complete physics/animation/3D generation pipeline.

| Lane / 分线 | Source / 源码 | Implemented and tested / 已实现 | Not implemented / 未实现 |
|---|---|---|---|
| 01 Collision/nav / 碰撞导航 | [physics.mjs](physics.mjs) | Deterministic bounded 2.5D AABB contact, grounded slope/step limits, A* routing / 数值碰撞、坡度台阶及寻路 | Rapier/rigid bodies, mesh colliders, true continuous TOI or Recast navmesh |
| 02 Terrain LOD / 地形层级 | [lod.mjs](lod.mjs) | Shared global-coordinate boundary at unequal mesh density; measured geomorph and seam / 不同网格密度共边与连续渐变 | Full CDLOD/clipmaps, streaming, GPU terrain texturing, physics terrain coupling |
| 03 Rig QA / 骨架预检 | [rig.mjs](rig.mjs) | Local glTF JSON/GLB v2 JSON chunk, hierarchy/TRS transforms, 10 semantic humanoid joints, mirror flags / 本地真实文件解析 | Skinned-mesh deformation, inverse bind matrix verification, animation retarget/mocap or Khronos certificate |
| 04 Asset classification / 资产分类 | [assets.mjs](assets.mjs) | Evidence-based parametric vs organic-process router, dimension refusal and LOD quality assertions / 尺寸证据不足则拒绝瞎造 | Actual CAD geometry, retopology, normal baking or production LOD meshes |
| 05 Nature / 自然美术 | [nature.mjs](nature.mjs) | Original seeded vegetation, layered noise, natural/watercolor/ink Canvas2D demonstration / 独立自然、水彩与墨绘演示 | WebGPU foliage, real 3D PBR, hardware GPU benchmarks or final game art |

All modules are original and dependency-free. Browser demo makes no external data requests, has no model upload or telemetry, and does not reproduce proprietary game assets, copyrighted animations, music or third-party artwork.

## Reproduction / 复现步骤

From repository root:

    node --test labs/five-lane-runtime/test-core.mjs

With an existing Playwright + Chrome installation:

    OIA_PLAYWRIGHT_MODULE=/path/to/playwright CHROME_EXECUTABLE=/path/to/chrome node labs/five-lane-runtime/test-browser.mjs

For disposable root Linux CI only, set OIA_NO_SANDBOX=1. Keep the Chrome sandbox on for normal users.

**Initial actually measured results (2026-11-07):** 47/47 deterministic Node test cases PASS. Actual Chrome browser test PASS: 5 modules loaded; 55-degree slope blocks travel; stair mode renders; 16-segment and 8-segment adjacent patches report maximum synthetic shared-edge error 2.7755575615628914e-17 m; local glTF with a mirrored right-hand transform reports that flag; invalid local file rejected; uncertain mechanical dimensions do not get fabricated; deforming clothing gets a different processing route; natural/watercolor/ink and seed controls work; all five result groups export as JSON. No page JS exceptions and no external HTTP requests.

### Interpreting results / 数据解释

- **Seam error** measures only numerical height equality on a synthetic shared border. It cannot prove normal/texture/mesh streaming seams are eliminated in production.
- **2.5D collision** uses a bounded substep controller against boxes. This is not a swept physical engine, obstacle dynamics, detailed stair shape or crowd routing.
- **GLB rigs** are checked by node/skin metadata and normalized naming. A positive mapping is not a guarantee of anatomical correctness, hand grip, imported skin deformation or animation quality. Joint mirror flags are diagnostic, not proof of a broken model.
- **Asset route** returns only classification and suggested budgets. No actual regular CAD holes, part dimensions or simplified model is produced. Real dimensions and validation must come from authoritative data.
- **Nature** uses 2D Canvas and deterministic primitive scenery, not production WebGPU vegetation, real-time PBR lighting or a polished game map. Its appeal requires human visual review.

## How to use the panels / 五线操作

1. Change the ground mode to observe separate collision and A* route; re-run the test fixture.
2. Drag the terrain morph slider; fine and coarse panels share a global edge and report maximum height mismatch.
3. Choose the built-in synthetic humanoid or a local 16 MiB-or-smaller GLB/glTF file. The browser reads the file locally; no glTF external URI is fetched.
4. Select manufactured bracket, ambiguous gear, deforming cloth or organic rock and compare the proposed strategy and LOD budgets.
5. Change pigment style and seed. Original procedural foliage and world-space noise are redrawn deterministically.
6. Click Export five-lane QA JSON for a local snapshot of current numeric evidence.

## Private game handoff / 私有游戏落地边界

Terrain colliders, animation grounding, actual rig retargeting, correct right-hand sword poses and actual geometry production must be validated in their **private game/asset projects**. No private production game was modified in this public research batch.

Recommended next stages: use approved real skinned humanoid assets and source motion with explicit rights, integrate a true physics controller and navmesh, implement terrain streaming and renderer LOD, build a rule-based CAD geometry reconstruction fixture, and compare genuinely 3D painterly scenes on target devices. These are **future tasks, not claimed completed achievements**.

