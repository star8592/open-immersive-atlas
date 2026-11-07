# Painterly Forest Botany & CC0 Asset Evaluation / 绘画式森林植被与 CC0 素材评估

Research date / 研究日期：2026-11-07  
Scope：Three.js / WebGL2 / WebGPU-ready visual-development reference; **public technical research only**, not proprietary game code.

## Core design observation / 核心判断

**中文：** 优秀森林画面并非简单依赖低面数模型或更密集撒草。关键是多种植物的结构轮廓、色块、地形与植被着色一致性、根部遮阴、成片生态分布、风的尺度以及透视构图。近景应允许高细分植物网格和专业绘画材质，不应为了节省面数牺牲质量。

**EN:** High-quality painterly forests are not produced by merely instancing more low-polygon cones. Invest in species-specific botanical anatomy, coherent ground/foliage pigments, root occlusion, ecological grouping, multi-frequency wind, camera composition and adequate close-range mesh detail before budget-based simplification.

## Verified source candidates / 核实来源

### 1. Quaternius — Stylized Nature MegaKit

Official: https://quaternius.com/packs/stylizednaturemegakit.html  
Publisher: Quaternius  
License advertised: **CC0** for released assets, including commercial use.  
Contents: 116 nature models, including approximately 40 trees, 35 plants/flowers and 27 rocks; compatible formats include glTF/FBX/OBJ.

**中文价值：** 多树种、草本和石头有较好的基础生态多样性，可以作为中景树林与不同植物形态的候选资产。但官方源工程附带的 Unity/Unreal/Godot 植被着色器属于其他分发版本，必须核对具体下载包，不可假定所有收费版本都随免费包提供。对照高质量水彩风格，仍需单独进行材质、树冠和色彩开发。

**EN value:** Useful diverse real mesh source for forest mid-ground and plant-species comparisons. Do not assume the source-engine shader projects are included in the free standard package. Artistic look development is necessary.

### 2. KayKit — Forest Nature Pack (Kay Lousberg)

Official: https://kaylousberg.com/game-assets/forest-nature-pack  
Publisher: Kay Lousberg  
License advertised: **CC0**, free commercial use.  
Free tier: 100+ models; full extra versions contain more than 200 kinds and 1500+ recolored assets. Formats include glTF/FBX/OBJ. Single gradient-atlas palette.

**中文价值：** 面向规则物体、道具、地形模块与中远景植物的高效基础库；配色一致，便于实例化。但整体偏低模风格，如果用在高品质水彩森林的近景，仍可能显得折纸、程序化。适合作为候选而不是默认最终美术。

**EN value:** Excellent consistent modular atlas for performant stylized environments. Hero-camera foreground foliage may be visually too low-poly without additional high-detail work.

### 3. GrassSimulation by gzatravkin — Three.js grass study

Official code: https://github.com/gzatravkin/GrassSimulation  
Live demo: https://gzatravkin.github.io/GrassSimulation/

**中文价值：** 适合研究成熟度变化、细草穗、草地生境密度场、多尺度风、露水闪光、日落光照与后期处理。**项目代码许可证应在实际移植前逐文件确认**；此处只链接并提取公开设计思想，不直接复制源码。

**EN value:** Techniques worth studying include maturity variance, seed heads, grass-biome fields, coherent wind, dew highlights, golden-hour light and post-processing. Check the repository license before code reuse.

## Reusable engineering patterns / 可复用技术

1. **Near / Mid / Far plant LOD:** Near = actual 3D leaf vein/curvature and professional textured fronds; mid = batched species-specific cards/meshes; far = aerial coherent green/brown biome with retained true tree silhouettes.
2. **Ground/grass pigment link:** Sample shared spatial biome field for both terrain albedo and per-instance foliage colors; roots darker, tips varied but no uniform neon greens.
3. **Biological placement:** Under oak/willow/pine canopy prefer distinct plant communities; riverbank wet sedges and ferns; dry exposed slopes different vegetation; avoid naive uniform-random scattering.
4. **Coherent wind:** broad gust waves with gentle local flutter, anchored at roots; wheel wake synchronized with actual wheel world positions.
5. **Water/shore integration:** riverbank transitions must be geometry-conforming and alpha feathered; depth samples affect actual water transparency; no detached rectangular lake card.
6. **Proof:** same-height and same-time-of-day screenshots from actual browser game plus console/WebGL errors, real GLB loads, route driving regression and sustained GPU sampling. Human visual art acceptance is independent of technical FPS.

## Status and reuse limits / 状态与边界

These are researched public references; **no commercial asset bundle is mirrored in this open-source catalog**. Screenshots/videos/models from Tiny Delivery or other games are not copied here. The existence of a CC0-licensed pack does not mean its free files have been downloaded or integrated into any game. Production game assets and implementation stay isolated in a private repository. Any adoption should retain a source URL, specific asset file hash, creator/license receipt, permitted derivative record, and original-game visual acceptance.

**Decision:** Prefer original artist-grade foreground vegetation and freely licensed, art-reviewed mesh packs. Don't use optimization-first assumptions to justify weak scenery.