# Lane 05 — Natural-world atmosphere, painterly rendering and art direction
# 分线 05 — 自然世界的氛围、绘画化材质与美术表现

**Status / 状态:** Source-backed art/engineering study; **not** a completed shader demo or finished game-art reconstruction. / 本篇属于有原始来源的美术技术研究，不冒充已完成游戏美术改造。

**Tracking:** [OIA public research issue #8](https://github.com/star8592/open-immersive-atlas/issues/8)

## Evidence and inspiration / 实证与参考作品

- [THREE.Watercolor — mattatz](https://github.com/mattatz/THREE.Watercolor): an early Three.js watercolor post-process using EffectComposer and paper texture. The repository's sample references **older Three.js APIs**; study the effect, do not copy old implementation into a current renderer without rework.
- [Franky Hung — Watercolor Reveal](https://github.com/franky-adl/watercolor-reveal-effect): documented original painterly approach using procedural paper relief, a shader pipeline and irregular diffusion; distinguish interactive watercolor **reveal** from painting the entire 3D scene.
- [yomotsu/vegetation](https://github.com/yomotsu/vegetation): seeded procedural stylized trees, rocks, pebbles, grass, flowers and multiple LOD/impostor levels; includes collider variants for some geometry categories, not all.
- [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing): modern, composable postprocessing pipeline that can merge compatible effects; downstream GPU time and color-management changes must be measured.
- [Three.js post-processing manual](https://threejs.org/manual/pages/post-processing.html): RenderPass, postprocessing composer, OutputPass and final color-space/tone-mapping responsibilities.
- [HillyDaan ballpoint shader source](https://github.com/HillyDaan/HillyDaan.github.io): illustrates multi-layer hatching, edge extraction and paper compositing as a separate non-photorealistic family.
- [THREE MeshStandardMaterial](https://threejs.org/docs/pages/MeshStandardMaterial.html): PBR baseline for material response under coherent environment illumination.

## What makes natural scenes feel believable / 自然场景优秀的真正原因

**中文：** 真正的自然表现力不等于“面数多、贴图大、纹理噪声强”。一个美丽的水彩自然场景，需要把 **地形形状、植物生态分布、整体构图、光照方向、空气透视、局部色调变化、细粒度材质、动画节奏和镜头设计** 一起组织成可感知的世界。画面像“玩具”，通常是比例参照、植被/石子尺度、材质粗糙度、重复模型、阴影、深度层次或镜头透视出了问题，而不是单纯分辨率不足。

**English:** Atmosphere emerges from composition, layered depth, coherent light, scene scale, foliage ecology, material response and time, not from increasing polygon count. Painterly appearance needs controlled pigment/edge/noise behavior and a sensible camera as much as a postprocess shader.

### Four coupled layers / 四层需要协作的美术系统

1. **Natural structure / 自然形态：** Mix tree age/height, trunk lean, crown asymmetry, clumped undergrowth, exposed roots, boulder clusters and pebble size distributions. Growth/placement should follow ground slope, sunlight, moisture, river banks and authored landmarks where relevant.
2. **Material language / 材质语言：** Start with coherent surface response and plausible roughness for rocks, soil, water, foliage, painted stone and metal. Add bounded albedo hue variation, moss edges, wetness gradients, distance-appropriate small details and spatially consistent grain.
3. **Atmospheric depth / 空气透视：** Distant terrain loses contrast and color saturation, blends with sky/fog and light scattering, and carries carefully limited bloom/DOF. Avoid full-screen blur that erases useful navigation landmarks and player silhouettes.
4. **Painterly treatment / 绘画感：** Edge-aware pigment accumulation, paper-like low-frequency relief plus fine grain, controlled wash/bleed and mild stroke irregularity. Apply at a *stable world/screen frequency* so zooming doesn't change all strokes into static noise. Foreground silhouettes must remain readable.

## Research design: layered ablations / 分层消融实验

A trustworthy artistic comparison should **not** show only a best-looking final image. Make original small scene variants with the same camera/geometry:

- **A — Geometry only:** Shapes and scale markers, no special materials.
- **B — Physically coherent baseline:** Original materials, lighting, fog and shadows; same underlying geometry.
- **C — Natural placement:** More varied foliage/rock size and context-sensitive distribution; no watercolor postprocess.
- **D — Painterly material only:** Color palettes, stroke-scale patterns and pigment edge effects.
- **E — Full composition:** Painterly material plus coherent atmospheric depth, balanced grading and scene composition.

Compare A–E for both *visual preference* and *gameplay legibility*. Check whether the stylization remains appealing after camera motion and at low pixel density, not only in one still screenshot.

### Practical shader design / 实际 Shader 可研究的机制

- **Procedural paper texture:** Multiple spatial scales of smoothly varying height noise, subtle bump shading and offset color diffusion. Paper texture should not visibly swim across the world as the camera moves.
- **Pigment/edge masks:** Use depth and surface normal discontinuities to retain readable silhouettes; adjust outline strength separately for near/far objects.
- **Depth-colored fog:** Base contrast reduction on distance and lighting; avoid using one uniform gray curtain that destroys dawn/dusk mood.
- **Color management:** Test linear-light operations, output color-space and tone mapping consistently. Chain full-screen passes only where needed; confirm antialias/transparent materials stay correct.
- **Vegetation motion:** Branch/leaf sway should reflect plausible wind coherence and hierarchy. A shader moving all foliage in identical phases looks artificial.
- **Scale and terrain microdetail:** At gameplay view distance, pebble size, soil grains and foliage leaf clusters need to support believable scale. Do not turn an entire terrain into a field of regular geometric noise.

**Rights note / 版权边界:** Study the referenced author shaders and source licensing, but implement an original research version; do not copy a site's artwork, assets, proprietary textures, imagery or entire effect chain without permission and verification.

## Proposed acceptance / 尚待执行的验收项目

| Dimension / 维度 | Evidence to collect / 记录 |
|---|---|
| Real-world proportions / 比例 | Human/vehicle/door/rock markers; median visible pebble and leaf scale; consistency through camera movement |
| Natural distribution / 自然性 | Varied plant height/orientation/clumping; no periodic grid repetition or identical wind phase |
| Scene hierarchy / 构图层次 | Clear near/mid/far visual reading, guided route and landmark silhouettes |
| Style coherence / 风格统一 | Similar pigment, roughness, value range and light across terrain, buildings and characters |
| Temporal stability / 时间稳定性 | No texture crawl, silhouette flicker, alpha shimmer or giant abrupt LOD change during orbit |
| Interaction legibility / 可玩性 | Character, interactable object, traversable edge and target remain distinguishable |
| Real performance / 真实性能 | GPU pass p50/p95 on target devices, texture memory, screen resolution and mobile fallback |
| Blind preferences / 盲测审美 | Anonymous side-by-side ratings A–E and notes about atmosphere, scale and appeal |

**No invented satisfaction or FPS claims.** This table defines the evaluation that a future original Lab should run. / 以上是待测方案，绝不将未测试的效果写成“已验收”。

## Why we should not transplant an old shader blindly / 为什么不能直接搬旧插件

- THREE.Watercolor is useful *historically* but is tied to older Three.js/EffectComposer APIs; the modern pipeline needs compatibility and color-space verification.
- A fullscreen watercolor reveal shader is not a substitute for believable three-dimensional trees, rocks, paths, architecture and actual navigation/collisions.
- Procedural vegetation with LOD/impostors can be efficient, but alpha foliage, collision and wind all require separate runtime tests. A physics collider on a rock does not mean every blade of grass needs one.
- Postprocessing can unify style and cost multiple rendering passes; performance and image quality must be evaluated together.

**Next original prototype / 下一原创原型：** a small landscape with riverbank, rocks, grass, foliage and one scale object, shown in parallel PBR / watercolor / ink styles through the same camera. Use original shader code, no proprietary scene assets and honest GPU query metrics.
