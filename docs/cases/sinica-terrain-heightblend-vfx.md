# Sinica's terrain transitions and wheel feedback: evidence and portable experiments
# Sinica 地形混合与轮胎反馈：源码级机制、限制与原创复现实验

**Research date: 2026-11-07**  
**Original references:**
- [Artem's February 2026 shader paper](https://medium.com/@sinitsyndev/removing-the-4-layer-limit-for-height-based-blending-in-unity-terrain-urp-c0ba85444f58)
- [GitHub — ArtemSin/TerrainURPLitHeightBlend](https://github.com/ArtemSin/TerrainURPLitHeightBlend)
- [Artem's December 2025 terrain/grass optimization article](https://medium.com/@sinitsyndev/step-by-step-environment-creation-breakdown-in-unity-4073f1a73125)
- [80 Level — wet tire trail VFX](https://80.lv/articles/stylized-wet-tire-trail-vfx-created-for-cute-delivery-robot-in-indie-game)
- [Hitmarker reporting on Unity Trail Renderer + wet-spot decals](https://www.linkedin.com/posts/hitmarker_tiny-delivery-by-artem-sinica-activity-7356386885734203393-8_kL)
- [80 Level — mud slowdown and shake-off](https://80.lv/articles/indie-game-about-adorable-delivery-robot-gets-mud-mechanic)

## Problem 1 / 地表混合为何看起来“像贴图接缝”？

Unity URP multi-layer terrain may combine multiple 4-channel splatmaps into rendering passes. The creator's explanation documents a constraint: native height blending is disabled when total terrain layers exceed four, even when visually the first four are the only layers needing height-based mixing. Height maps generally represent relative height within each surface microtexture. / 多层地形混合不只要混颜色，还要让草地、泥土、碎石根据材质高度彼此交错；否则容易出现人为切割线。

### The author's specific workaround / 作者公开的方案

In Unity 6 URP, the author selectively applies **height blending to the first four layers in the base pass** and uses **ordinary alpha blending for subsequent additive passes**. This is **not true arbitrary-N-layer height blending**. He reports testing 4–16 layers and a small performance difference in his environment, not our independent measurement.

- Base layers 0–3: first-patch height-aware transition / 前四层高度混合。
- Higher layers 4+: standard alpha blend / 多出的层仍为普通 Alpha。
- Risks: different blend semantics across layer boundaries, future URP/Unity API changes, terrain shader derivative licensing and GPU/pass overhead. / 跨层观感不连续、引擎更新后的不兼容及许可证。
- Exact upstream source is in the creator's repository. **Do not import the original files into PlayMoru or publish them in the public atlas on the assumption that “free to use” is a complete SPDX/commercial license**; a LICENSE/LICENSE.md was not confirmed. Preserve the upstream attribution and check any Unity-derived source terms.

### Portable independent implementation design / 与 Unity 无关的可迁移思想

If building an original shader for Godot, Three.js/TSL/WebGPU or Unreal:  
1. Define a canonical 0–1 painted weight map per ground material; keep substrate/grass/rock/soil physical IDs independent of art textures. / 地表材质 ID 与图像纹理解耦。
2. For the primary material group, blend using height-adjusted normalized weights with a tunable transition width; for secondary materials use a documented compatibility rule. / 主材质高度权重，次材质明确退化规则。
3. Ensure near/Far LOD and triplanar rocks do not expose seams; waterline materials need a separate height/shoreline logic. / 分级细节和边坡保持稳定。
4. Measure shader passes, texture fetches, color deviations, memory and p95 render time; compare base/overlay transitions across zoom and camera rotations. / 多视角、多级别对照而不是只看单张截图。

**All equations and implementation decisions above are proposed experiments, not a port of the author's proprietary or ambiguous-license source.**

## Problem 2 / 车辙如何拥有真实的物理意义？

Public reporting shows visual wheel trails that fade and a mud-zone mechanic in which the robot slows then shakes off dirt. A developer-related media post attributes wet wheel lines to **Unity Trail Renderer** and wet spots to **Decals**. This is documented as *reported attribution*, not a source-audited implementation of the actual game.

### Independent 3D game asset contract / 原创车辙系统协议

Input: `vehicle_id`, `wheel_id`, `contact_point_world`, `contact_normal`, `travel_tangent`, `wheel_radius_m`, `slip_ratio`, `surface_type`, `time`. / 只能从当前触地轮接触点出发，不靠屏幕涂鸦。

Render: consistent world-space orientation, two wheel-track channels, local width measured in meters, alpha falloff, lifetime LOD, pooled geometry/decals or tiled terrain mask where suitable. / 世界空间朝向、双轮印、有限寿命、统一画质与池化。

Behavior: soil/wet surface supports tracks; paved roads have different wet splashes; snow/mud have appropriate drag; no skid while airborne; steering and reversing should visibly change mark direction. / 路面类型改变可视和物理反馈，离地无车痕。

QA: 360° camera orbit; zoom ×0.5/×1/×2; steady/accelerating/reversing; bridge-to-dirt transition; bounds/growth control; many simultaneous RTS vehicles. / 旋转、缩放、倒车、上桥、百车同时运动时都能验收。

## Problem 3 / 角色与地形之间的“真感”

Author's public response mentions emphasizing bottom outlines of occluded objects when dithering obscuration was unsatisfactory. The *idea* to learn is preserving the **collision silhouette** in a slanted camera, not a particular hidden implementation. Three layers should be evaluated independently: (1) draw visibility, (2) actual physics collider, (3) gameplay affordances and interaction markers. / 即便人物被房屋部分挡住，也要保持脚底落点、碰撞边界和交互方向清楚。

## Practical scope / 下一轮工程落地

- E1: reproducible original terrain test bench with 2/4/8 layers and reference angle snapshots;
- E2: six-wheel vehicle over wet paving and mud with ground-contact-derived traces;
- E3: camera orbit, occlusion and contact-silhouette QA;
- E4: vegetated scene overdraw + LOD comparison, WebGPU/WebGL2 p95 CPU/GPU and memory reporting.

**Status:** researched, source-linked, no local GPU/Unity/PlayMoru runtime execution or engine integration claimed. / 仅为资料研究，没有声称已在我们的机器上实测或部署。
