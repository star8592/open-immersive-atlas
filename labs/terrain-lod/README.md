# Spatial Lab 01 — Procedural Terrain LOD / 原创地形层级细节实验

[Interactive demo / 在线实验](https://star8592.github.io/open-immersive-atlas/labs/terrain-lod/) · [Source / 源码](app.js) · [Atlas catalog / 图谱](../../CATALOG.md)

## Purpose / 目的

**中文：** Web3D 场景的“真实感”不应仅由一张静态全景图实现。本实验使用原生 WebGL2、高度函数和真实网格构建具有空间坐标的地形，并让相机距离决定瓦片精细度。适合研究地形尺度、细颗粒材质、远近层级及性能测量，不含任何私有游戏素材。

**English:** A convincing Web3D environment is not a static backdrop. This original, dependency-free WebGL2 example builds heightfield geometry with adaptive chunk LOD, a granular procedural material, small rocks and a measurable frame loop. It uses no proprietary assets.

## Technical breakdown / 技术拆解

1. **Heightfield / 高度场：** Deterministic math defines positions and normals, not a fake displaced background texture. / 确定性数学函数生成真实顶点与法线。
2. **7 × 7 chunks / 49 瓦片：** Each tile spans 12 world units; density is 10, 21 or 42 subdivisions per edge. / 三档网格精度。
3. **Adaptive LOD / 动态精细度：** Camera distance to a tile center selects LOD; dropdown overrides with all-low or all-high. / 可切换自动、全部低与全部高。
4. **Edge skirts / 边缘遮缝：** Lowered geometry reduces visible gaps along neighboring mismatched LOD boundaries. / 用下垂裙边遮盖瓦片接缝。
5. **Procedural material / 颗粒材质：** Fragment shader noise and tiny original rock meshes add scale without a large downloaded texture. / 程序化颗粒及小型三维石子体现尺度。
6. **Camera and markers / 相机与标尺：** Orbit, zoom and small original markers let viewers judge physical scale. / 拖动旋转与缩放。
7. **Statistics / 性能：** FPS, triangle count, LOD counts, p95 requestAnimationFrame interval. **Not an independent GPU timer query.** / 显示帧间隔 p95，不冒充 GPU 测时。
8. **Self-contained / 独立：** No CDN scripts, external models or textures are loaded. / 不依赖外部 JS、模型和贴图。

## Run locally / 本地运行

From this repository root / 在仓库根目录：

    python3 -m http.server 8000

Open / 打开：

    http://localhost:8000/labs/terrain-lod/

Use a browser with WebGL2 enabled. Interact using drag, wheel, LOD dropdown, wireframe/fog checkboxes and reset. Missing WebGL2 produces a visible error.

## Verification contract / 可重复验收

After initialization, inspect the read-only browser function window.__oiaTerrainLab.getStats(). Verify:

- terrainTiles equals 49.
- Forced low detail yields lodCounts[0] equals 49.
- Forced high detail yields lodCounts[2] equals 49.
- High detail uses more triangles than low detail.
- Wireframe and fog toggles update display state.
- No page errors, missing shader programs, or broken WebGL context.

This is **functional acceptance, not an FPS benchmark**. Compare results on the same hardware/viewport to assess improvements.

## Limits / 实验边界

- Edge skirts conceal T-junction cracks but do **not** remove LOD popping; continuous geomorphing is a separate experiment. / 遮缝不等于连续几何渐变。
- Render meshes are **not** collision meshes; there is no navmesh or walking controller. / 渲染网格不等于物理碰撞。
- The p95 measures the browser frame interval, not GPU execution time. / 帧间隔不等于独立 GPU 帧时。
- Rock distribution is for scale illustration, not a measured geological reconstruction. / 石子并非真实地质采样。
- This is a WebGL2 baseline, **not** a WebGPU implementation. / 并非 WebGPU 渲染器。
- Full production features such as virtual textures, CDLOD geomorphing, GPU occlusion and shadow maps remain future research, not a claimed result. / 不冒充完成的商业级地形引擎。

## Research links / 关联知识

- [VIPER 11 technical research](../../docs/cases/viper-11.md): terrain streaming and camera optics.
- [SuperSplat 3.0 research](../../docs/cases/supersplat-3-webgpu.md): GPU-resident data and performance heuristics.
- [glTF asset QA](../../docs/cases/gltf-asset-qa.md): geometry, materials and runtime contract.
- [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh): geometric spatial queries.

This is original educational code. No third-party proprietary shaders, models, textures or internal project source were copied. / 原创教学代码，未复制私有项目或第三方专有素材。
