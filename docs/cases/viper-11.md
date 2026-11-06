# VIPER 11 — Flight simulation as a Web3D engineering benchmark
# VIPER 11：浏览器飞行模拟的工程级案例

**Project / 项目：** https://viperoneone.com/  
**Primary creator notes / 作者一手笔记：** https://viperoneone.com/notes/  
**Evidence / 证据类型：** creator-notes, not a verified open full-game repository / 作者技术说明，并非已经确认公开的完整游戏源码。  
**Study date / 研究日期：** 2026-11-07.

## Overview / 作品介绍

**中文：** 这是一款直接在浏览器中运行的战机飞行体验。其特殊价值不是单独的精美模型，而是把摄影镜头、大气、地形、真实机械部件、飞行控制、音频和玩家输入系统进行连贯设计。作者公开了十五篇分主题工程笔记。

**English:** A browser-based fighter flight experience whose distinguishing achievement is the integration of lens optics, atmosphere, terrain, mechanically meaningful aircraft parts, flight dynamics, audio and input systems. The creator published fifteen focused engineering notes.

## Why it stands out / 真正厉害的地方

### 1. Clouds are volumes, not billboards / 云是有体积的物体

- 中文：作者采用体积密度场和 Raymarching 计算云的内部散射与透过率，采用 Beer–Lambert 衰减。4×4 像素分组在十六帧内分期更新，随后结合历史信息重建画面；入云近景有特殊处理。作者还披露动态质量调节、近远层和云影级联。 
- English: A density field and raymarching model extinction and scattering. A 4×4 sparse update pattern distributes work over sixteen frames and reconstructs from history; near-field flight-through needs special handling. Adaptive quality and cloud-shadow cascades control cost.
- Primary evidence: https://viperoneone.com/notes/clouds/
- **Important:** Historical reuse requires motion/depth invalidation; “only update 1/16 each frame” alone is not a production solution.

### 2. A virtual camera obeys photographic behavior / 相机模拟摄影光学

- 中文：作者公开了超广角多方向投影合成、座舱玻璃的视角相关反射、污渍/水滴、HDR 曝光、ACES 调色及 LUT 匹配。其核心启发是固定参考视觉后再调整渲染算法，而非盲目堆叠特效。
- English: The disclosed camera pipeline composes wide-angle views, angle-dependent canopy reflections, scratches and droplets, HDR exposure, ACES mapping and reference-driven LUT matching. Visual reference precedes tuning.
- Evidence: https://viperoneone.com/notes/lens/

### 3. Real-world terrain without full-resolution rendering everywhere / 真实地形的性能分层

- 中文：通过真实高程数据、航拍影像瓦片、四叉树 CDLOD、粗到细渐进加载与顶点形态过渡，让远处山脉和近处跑道保持合适的精细度。具体地形影像数据和授权仍需按使用场景单独审查。
- English: Real elevation and aerial tiles feed quadtree continuous-distance LOD, coarse-first streaming and morphing between mesh levels. Near-runway details are synthesized instead of relying entirely on aerial pixels.
- Evidence: https://viperoneone.com/notes/nellis/

### 4. Mechanically meaningful procedural jets / 有明确机械语义的程序化飞机

- 中文：机身截面、机翼、翼面、起落架、座舱盖等按参考尺寸和运动轴建模，允许按零件状态精确控制。作者公开了不同飞机的近远景面数预算。它对需要可旋转、可装配、可动画的硬表面模型尤其有价值。
- English: Parametric cross-sections, wings, control surfaces, gear and canopy give geometry real pivots and state semantics. The author reports separate near- and far-LOD budgets, making this particularly relevant to mechanical assets.
- Evidence: https://viperoneone.com/notes/jets/

### 5. Flight feel is state, not a visual effect / 飞行手感来自物理状态

- 中文：六自由度运动、气动简化、飞控律与输入设备共同决定状态变化；音频、视野与震动则从状态提取反馈。作者不同笔记中的固定步长数字可能涉及不同模块或版本，不应写成已经验证的当前运行时配置。
- English: Six-DOF dynamics, simplified aerodynamics, control laws and real device mapping drive state; audio, visual and tactile responses derive from that state. Different notes mention different timestep contexts, so current runtime scheduling remains unverified.
- Evidence: https://viperoneone.com/notes/flight/ and https://viperoneone.com/notes/controllers/

## Safe replication experiments / 可合法复现的原创实验

1. **Volumetric cloud A/B:** same camera path, compare billboard sky, raymarched full-resolution cloud and sparse temporal cloud; record p95 GPU time and ghosting. / 用相同相机路径对比天空贴片、完整步进与分时重建，测帧时和鬼影。
2. **Terrain LOD transition:** a synthetic heightmap with four LOD tiers, stress-test level morphing while moving a free camera. / 合成地形四级 LOD，测试相机移动时的跳变。
3. **Parametric mechanism:** original aircraft-like landing gear with authored pivots; compare animation bounds and mechanical clearance. / 原创起落架机械机构的轴和限位测试。
4. **Camera color analysis:** compare a licensed original visual reference with HDR→tone-map→LUT outputs. / 使用拥有权利的原创参考图验证曝光与调色。

## Rights and verification boundary / 产权与事实边界

The original game, its meshes, textures, audio, branding, level design and unpublished source are **not** included here. All formulas/engineering summaries are independent educational commentary on public creator notes. No benchmark in this atlas claims a local reproducible pass. / 本文不收录游戏专有源码、美术、音乐和素材；仅提供公开作者说明的原创研究性归纳。未进行本地可复现性能验收。
