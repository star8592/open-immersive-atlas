# Lane 02 — Continuous terrain LOD: CDLOD, clipmaps and RTIN
# 分线 02 — 连续地形 LOD：CDLOD、几何 Clipmap 与 RTIN

**Evidence / 证据：** original author code/paper and GPU Gems chapter; this note is **research**, not a claim of working continuous LOD in any existing game. / 已核对原作者源码、论文与 NVIDIA 技术章节，目前是研究结论而非已实现的游戏功能。

**Tracking:** [OIA research #5](https://github.com/star8592/open-immersive-atlas/issues/5)

## First-hand sources / 一手资料

1. [Filip Strugar — CDLOD source and paper](https://github.com/fstrugar/CDLOD) / [published paper](https://doi.org/10.1080/2151237X.2009.10129287): camera-distance-based quadtree LOD and coordinated smooth transition.
2. [NVIDIA GPU Gems 2, Chapter 2 — Terrain Rendering Using GPU-Based Geometry Clipmaps](https://developer.nvidia.com/gpugems/gpugems2/part-i-geometric-complexity/chapter-2-terrain-rendering-using-gpu-based-geometry): nested moving grid rings, filtering and transition regions.
3. [Mapbox MARTINI](https://github.com/mapbox/martini): real-time Right-Triangulated Irregular Network generation from grid heights with an error threshold.
4. [OIA original Terrain Lab 01](../../../labs/terrain-lod/): genuine WebGL2 heightfield with three discrete LODs and edge skirts. **Known limitation:** skirts mask holes but do not prevent morph popping.

## Compare the approaches / 三条成熟路线比较

| Technique | How it works / 原理 | Strength / 优势 | Limit / 局限 |
|---|---|---|---|
| **CDLOD** | Quadtree patches selected by 3D distance; GPU vertex position morphs toward parent representation in shared transition bands / 四叉树选块、过渡带顶点向父级表示渐变 | Controlled transition and triangle distribution / 可控制衔接与面数 | Quadtree bounds, correct edge matching and morph math need implementation / 需要严格一致的边界取样 |
| **Geometry clipmaps** | Camera-centred nested regular rings with incremental height updates / 相机中心的多层网格环 | Stable grid buffers, efficient very-large-scale streaming / 大地图和数据流友好 | Ring stitching, terrain texture paging, and memory/resolution policy must be designed / 纹理数据和环带衔接较复杂 |
| **MARTINI / RTIN** | Error-driven irregular triangulation of height data / 依照误差阈值生成不规则三角网 | High detail where geometry is complex, compact mesh / 按地形误差分配三角面 | Adjacent tile compatibility, time-varying transitions and GPU upload strategy are separate work / 不能自动解决邻块及时间连续性 |

**English:** Geometric simplification, geometric continuity and streaming are distinct problems. MARTINI's adaptive triangle counts do not by themselves supply CDLOD morphing; skirts hide the crack but not a vertex jumping on frame N.

## What must change from Lab 01 / 与现有实验的差距

- **Current:** distance thresholds choose one of three independent vertex densities, and low boundary skirts are added to hide visible gaps. / 当前是离散换档加裙边。
- **Required for true continuity:** parent/child height samples use a shared world-space function and consistent coordinate grid; each vertex has a smooth morph weight across the LOD transition band. / 连续变化必须在世界坐标、父子级采样和渐变权重上统一。
- **Crack control:** neighboring patches agree on boundary positions (or a formally defined stitching strategy). Morph both shared edges consistently, not only the interior. / 邻接边不能一个在旧层级、一个在新层级。
- **Stable collision:** the authoritative collider is independent of visual patch detail. Do not mutate physics geometry every time visual triangles change. / 视觉换档不能同步制造角色掉落或穿模。
- **Camera-relative precision:** avoid flickering or crack growth due to camera drift, huge coordinates and floating-point precision; evaluate local origin and world-space sampling policies. / 大场景精度需独立评测。

### Suggested prototype algorithm / 可实现的原创原型思路

1. Define a deterministic continuous height function H(x,z) and a quadtree of node world bounds. Start with **the same terrain used by existing Lab 01** to make A/B fair.
2. Compute a consistent distance d from camera to node/patch. Select patch LOD by distance and projected error, with entry/exit hysteresis to prevent repeated switching around a threshold.
3. For each vertex calculate full-detail height h_f and its *parent-grid interpolated height* h_p; evaluate smooth morph t across a transition band (0..1) and draw y = (1-t)h_f + t h_p. Define the same morph rules on neighboring boundaries.
4. Verify patch edge continuity numerically. Only then test screen-space discontinuity, horizon silhouettes, normal recalculation and material texture frequency.
5. Compare against the existing discrete-LOD/skirt baseline and a fixed high-resolution mesh at equal camera and viewport.

This is **a candidate implementation**, not copied CDLOD reference code and not a claim that the original algorithms are interchangeable.

## Experimental acceptance plan / 量化验收协议（待执行）

Use five deterministic camera paths: straight flight, slow lateral walk, grazing-angle near horizon, rapid orbit/zoom, back-and-forth crossing LOD thresholds. Record the same viewport size, camera and physics world.

| Metric / 指标 | What to measure / 测什么 |
|---|---|
| Edge height discontinuity / 边界高度 | Maximum and p95 absolute difference of paired world-space vertices on adjacent patches |
| Temporal popping / 时间跳变 | Matched camera-frame silhouette difference at threshold crossing; compare with fixed-resolution reference |
| Triangle budget / 面数 | Actual submitted triangles per frame and spatial density against camera distance |
| CPU/GPU frame time | JS submit time, rAF p95, and true GPU pass query when supported; never conflate |
| Grounded collision | Same root collider height/contact flags regardless of render LOD |
| Visual A/B | Blind screenshots for edge gaps, normal seams, texture discontinuity and "toy-sized" ground grain |

**Exit condition / 阶段完成条件：** dynamic morph transitions visibly continuous across camera paths, boundary errors measured with a declared tolerance, no regressed collisions, and a verified performance comparison. No numerical pass value is asserted until running the test on actual browsers.

## Licensing & modernization / 授权和现代化注意事项

CDLOD example code is historically tied to DirectX 9-era assumptions; its paper and source are excellent algorithm references but not a drop-in modern Three.js/WebGPU component. Check its actual license and preserve attribution if porting. GPU Gems describes a family of techniques, not a modern npm dependency. MARTINI is an error-driven mesh generator, not a built-in real-time LOD morph runtime. Any modern implementation in OIA should be original, with explicit tests and no private terrain data.
