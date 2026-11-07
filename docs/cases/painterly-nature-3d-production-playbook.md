# Painterly Nature in Real-time 3D — an evidence-led production playbook
# 绘画式自然场景：从手绘植物到真实可漫游的三维美术生产法

**Reviewed / 研究日期：2026-11-07**
**Status / 状态：公开资料核查与工程方案；不代表已复现、已测试原作者工程文件，也不代表游戏上线。**

## Core correction / 根本纠偏

**中文：** 不能再把“风格化三维”翻译成“用少量圆球、圆锥和纯色盒子建一个场景”。低多边形是可选择的技术手段，**不是艺术风格，也不能替代植物结构、精细手绘纹理、空间组织和光色设计**。想要达到《Tiny Delivery》给人的温柔、水彩般的观感，首先必须设计 **植物的真实可辨识外轮廓、成簇分布、手绘叶片材质、阳光穿透与阴影、岩石苔藓的覆盖逻辑，以及可感知的空间故事**。第一阶段不以三角面预算作为创作输入；先在可控单景中取得审美合格的画面，再依据实测确定 LOD、实例化和贴图压缩。美术源文件保留高质量原版。

**English:** Stylized 3D is not cheap primitive geometry. The artistic impression of a painted world comes from authored silhouettes, plant taxonomy, deliberate texture work, diffuse/multi-scale lighting, contact depth, ecological clustering, camera composition and story details. A polygon budget is a **later delivery constraint**, not the art direction.

**Important attribution boundary / 核心事实边界：** The Tiny Delivery creator describes a *green, soft, Ghibli-inspired* look, Unity Terrain, selected stylized foliage packages, a custom grass/terrain-texture matching workflow, stylized water and tilt-shift. This is **not** evidence that Tiny Delivery uses an actual watercolor simulator or the specific leaf shader, atlas or camera-mapping techniques below. The following are **independent** candidate techniques selected to reproduce a similarly evocative **original** look.

## Evidence A — original target, not an invented pipeline / 原作者究竟说了什么？

- [Artem Sinica, Step By Step Environment Creation Breakdown In Unity (2025-12-31)](https://medium.com/@sinitsyndev/step-by-step-environment-creation-breakdown-in-unity-4073f1a73125). Author explicitly begins with a **reference board and visual target**; Unity URP in linear color space; grass/soil layers; Meadow Environment Stylized Pack + Fantastic Ancient Forest; foliage around rocks, roots and water, stylized shoreline; moss/decals, tilt-shift, particles; notes overdraw and shadows. / 作者真正使用的是先锁定参考、美术搭配，再围绕生态关系迭代场景。
- [Official Tiny Delivery Steam page](https://store.steampowered.com/app/3812830/Tiny_Delivery/) — authenticated official visual target and game premise, **not** source assets to copy. / 只做审美对标和比例观察，不搬截图或资源。
- [Sinica custom terrain height blending article](https://medium.com/@sinitsyndev/removing-the-4-layer-limit-for-height-based-blending-in-unity-terrain-urp-c0ba85444f58) — documents a Unity-specific material transition issue. / 地表材料过渡研究，不能当成植被画法或现成 WebGPU 源码。
- [Research archive of target](sinica-tiny-delivery-environment.md), [terrain/VFX](sinica-terrain-heightblend-vfx.md).

## Evidence B — authentic, artist-authored foliage: Kayla Kosik / 真正的专业手绘植被法

[Kayla Kosik — Creating A Stylized Cozy Cottage In Unity](https://www.exp-points.com/kayla-kosik-creating-a-stylized-cozy-cottage-in-unity) / [artist's Cozy Cottage](https://kkosik.artstation.com/projects/KrnQA4).

Kayla, an environment artist, gives a concrete, source-authored workflow:

1. **Art breakdown:** paint over a concept and separate terrain, foliage, rock, building, props, textures and VFX. / 用画面拆图管理造型，不先设计系统。
2. **Foliage atlas:** hand-paint individual plants into a shared **Albedo+Transparency** sheet; derive an alpha mask. / 不画一片绿色抽象云，而是逐类画草、叶、花形。
3. **Geometry support:** map the atlas onto planes, manually cut along each visible silhouette, alter vertices/angles, set pivots at each plant's base. / 叶片和草不是方形透明纸板，更不能是球体。
4. **Building texture craft:** combine sculpted shape and texture sheets; color, curvature and ambient-occlusion passes give structural legibility. / 木板的刻痕、石缝和苔藓需与形体对应。
5. **Composition and sky:** author painted cloud skybox and tune directional light, fog and shadows to match the concept. / 天空、整体明暗关系比单个 shader 更决定氛围。
6. **Rights:** her artist-created result and third-party source references (commercial MicroSplat, Stylized Grass Shader, and original concept) are **not downloadable art for our products**. Learn the method and create our own artwork.

**Key transfer / 最值得直接吸收：** draw **one coherent hand-painted botanical texture atlas** (grass tip/root variation, fern, wildflower, serrated leaves, broad leaves, climbing ivy, moss) and **test its silhouette in a real rotating 3D scene** before laying out a meadow.

## Evidence C — actionable open Three.js/WebGPU forest technology / 可直接深入研读的浏览器工程源码

### C1 — Just a Simple Tree (MIT source)
[Live tree editor](https://justasimpletree.com/) · [Repository](https://github.com/MikeFernandez-Pro/just-a-simple-tree) · [MIT LICENSE](https://github.com/MikeFernandez-Pro/just-a-simple-tree/blob/main/LICENSE)

Author exposes a complete parameterized six-species tree generator (oak, pine, cypress, willow, bush, spooky), ages, seasons, twig branching, textured leaf cards, tree-canopy AO, cel color bands, multi-frequency wind and GLB exports. **The critical technical trick:** cards distributed over organic leaf clumps **inherit the clump normals**, so the crown shades as a coherent soft volume instead of a mess of rigid rectangles. Author notes learning this from [trungduyng anime tree lesson](https://www.youtube.com/results?search_query=trungduyng+anime+tree+tutorial). Real MIT source is confirmed; inspect notices for any externally credited audio, character or demo media **before copying those**.

**Fit:** P0 for stylized broadleaf tree model architecture, leaf-card material, branch silhouette, wind and LOD. **Limitation:** anime/cel quantization is not automatically watercolor; source reuse must be adapted to the chosen palette/textures. / 直接研究骨架与叶簇法线，成品材质须重新调成柔和手绘而非硬边赛璐璐。

### C2 — Three.js Field Grass (MIT source; public-source preview 0.1.0)
[Live demo](https://matthew-kissinger.github.io/threejs-field-grass/) · [Source](https://github.com/matthew-kissinger/threejs-field-grass) · [LICENSE](https://github.com/matthew-kissinger/threejs-field-grass/blob/main/LICENSE)

Shows author-designed multi-blade clumps, baked deterministic scatter, **TSL-based WebGPURenderer with WebGL2 fallback**, multi-scale wind and bounded player disturbance, plus separate flat field/island/third-person demo. Author reports **18,000 tufts / 126,000 blades in one draw** as a sample configuration; **not independently benchmarked by this project**. The README explicitly calls it a 0.1.0 public-source preview with Three.js **0.185.x** pinned; don't blindly transplant into a project pinned to 0.180.0. Demo character/motion data have separate third-party rights; core MIT code is a different rights surface.

**Fit:** P0 as candidate grass dynamics and local deformation, after building a hand-painted style atlas. Wind and wake should move visually identifiable plants—not anonymous green spikes.

### C3 — Just vegetation (MIT source)
[Repo](https://github.com/yomotsu/vegetation) · [MIT LICENSE](https://github.com/yomotsu/vegetation/blob/main/LICENSE).

Seeded vegetation **trees, rocks, pebbles, grass, flowers**, plant variants, moss controls, collider meshes for solid objects, asynchronous Web Workers, browser-friendly APIs and multiple LODs. Supports WebGLRenderer and WebGPURenderer, with a dedicated WebGPU entry for some node effects. Useful as reference for *asset type system, authorable seeding, mixed vegetation and rocks + moss*. Its default visual language may not match the desired painting; the source is a technical substrate, not a finished art pass. / 可用于生态种类与地表石头，但不要把默认成品当作最终美术。

### C4 — Stylized WebGL Components (GLSL; inspect upstream license)
[Repository](https://github.com/craftedbygc/stylized-webgl-components) · [README](https://github.com/craftedbygc/stylized-webgl-components/blob/main/README.md)

Reusable anime-water and stylized-grass scenes in React Three Fiber / Three.js with hand-written GLSL, grass/flower instancing, dirt transitions and trampling; useful **concept-by-concept shader reference**. This repository is a fork; read its own LICENSE and upstream before reuse. The GLSL stack cannot be assumed to work unchanged with a WebGPURenderer TSL path. / 将水面波纹、污泥边界、踩踏与草原分开消化，别把 GLSL 直接当 TSL。

### C5 — High-scale forest, only **after** style acceptance
[Nanite Forest Three.js WebGPU](https://github.com/VictorZakharov/threejs-nanites) — GPU cluster LOD for massive forest. / 可研究丰富树冠在大世界的细节管理；不允许为了省面把所有树简化成几何球。

## Evidence D — genuine watercolors in 3D: the Dordogne contrast / 真正水彩画的实现途径

[Art director Cédric Babouche's first-person interview (AUTOMATON)](https://automaton-media.com/en/interviews/20230621-19630/) · [long first-person breakdown (Game Developer)](https://www.gamedeveloper.com/design/q-a-hand-painting-the-watercolor-world-of-i-dordogne-i-).

Unlike the unverified assumption that Tiny Delivery is an actual watercolor shader, **Dordogne genuinely projects manually painted watercolor paintings onto simplified 3D surfaces using camera mapping**. The art director says the paintings retain their real media qualities, with most background light/shadow painted into the image. Multi-view camera mapping and patches make limited exploration possible, but a large freely rotating 3D camera is significantly harder. This is a powerful alternative for a **fixed/semi-fixed camera cutscene**—not the default solution for a fully rotatable 3D game.

**Hybrid recommendation / 混合但不造假：** use authentic hand-painted leaf/ground textures **on proper 3D models** as the main freely explorable world; use authored painting projection/camera mapping **selectively** for distant compositions or fixed cinematics. Never replace collision spaces and buildings with an unstretchable whole-screen background.

## Evidence E — Tiny Glade's 2026 botanical update / 大规模而精致的植物系统

[Official Steam News / Tiny Glade update](https://steamcommunity.com/app/2198150/allnews) / [2026-09 patch detail](https://steamdb.info/patchnotes/25477972/).

The studio says its previous grass system was insufficient to scale and a new authoring/rendering system (loosely inspired by **Nanite Foliage**) now supports flowers and crops with thicker-looking meadows. They also describe selectable fog height/density and a froxel-based participating-media renderer. These disclosures are **first-party statements about their proprietary implementation**, not open-source code, nor proof that Tiny Delivery uses the same renderer. / 美术呈现与技术容量可以兼得，但要先在美术设计上确定植物类型，再设计渲染数据结构。

## Visual systems / 必须配合运行的六层美术系统

| Layer | Production work / 美术工序 | Technical mechanism / 技术机制 | Failure to reject / 拒绝错误 |
|---|---|---|---|
| **Tree silhouette / 树形** | Branch taxonomy, asymmetric silhouette, individual leaf clumps / 枝干拓扑、树叶组 | Authored/sculpted trunk + clustered cards, inherited normals, per-cluster hue/AO | Uniform rounded "green balls" / 一排绿色球 |
| **Grass painting / 草地** | Painted blade/fern/flower atlas; root/tip hue, species variation / 草茎根尖与各植物手绘 | Trimmed alpha meshes, orientation, wind and grounded base blending | Thin same-height cones/spikes / 一片同高圆锥 |
| **Ground / 地表** | Soil, grass, rock, damp banks, fallen leaves, scattered pebbles / 多材质和微环境 | Hand-authored tiles + multi-material height blend, decals, triplanar rock blending | One flat green color and huge texture motifs / 单色面 |
| **Water + edges / 水岸** | Shallow-depth color, foam, overhanging ferns and reeds / 水岸植被层次 | Real 3D water, shoreline depth, ripples, rocks and aquatic plants | Perfectly straight shoreline / 直线切边 |
| **Light + atmosphere / 光色** | Color script, warmth vs cool shadow, canopy dapples, painted sky / 色彩脚本 | Soft shadows, AO in foliage, linear pipeline, ground haze, sky texture | Everything fully lit or harsh cel stripes / 过曝平光 |
| **Composition / 构图** | Curated view, seasonal structure, narrative prop placement / 镜头与叙事 | Art-directed camera anchors, depth layers, controlled DOF and environmental motion | Arbitrary procedural clutter / 随机堆积 |

## Paint-to-3D workflow / 拟采用的专业制作顺序

**Stage 00 — Visual art bible / 美术总纲**  
Choose three primary reference viewpoints (opening meadow, wooded creek, mossy bridge), lock an **original** mood board, palette, plant taxonomy, canonical real-world scale, key-light direction and quality target. Use pinned original-source screenshot links only as external references. Score silhouette, brush softness, ground connection, shade richness and atmospheric depth. / 先定义视觉风格，再开工。

**Stage 01 — Hero asset proof / 单棵主角树与一平方米草地**  
Make one original crooked broadleaf tree with real bark, branching limbs and 5–8 leaf-clump variations; a texture atlas drawn with brushes; 4–6 distinct grasses, 2 fern species, 3 flowers; one mossy rock. Their materials must be coherent at multiple angles and retain a painterly quality under both sun and shadow. **Do not use a sphere or cone as the final canopy.** / 先只造好一棵树、一片草和一块石头。

**Stage 02 — Fully traversable micro-scene / 可漫游的样板景**  
Build a **single** walkable 25×25 m original forest fragment with real bridge/riverside geometry; camera orbit and undergrowth occlusion, grass contact, readable robot/player. Cluster plants by slope, water distance, rocks, shade and path clearance. Preserve a human-authored final scatter pass. / 生态驱动，加人工美术定稿。

**Stage 03 — Color and lighting pass / 电影级光色**  
Paint seasonal vegetation cards and grass-root shading; use balanced sunlight, colored shadows, ambient bounce, atmospheric perspective, wood/stone painting, accents of wildflowers. Optional edge-aware paper/pigment grain and subtle color bleeding can be tested, but **a global watercolor post-process alone cannot create well-designed plant geometry**. / 水彩屏幕后处理只能辅助，不能代替美术。

**Stage 04 — Interactive quality / 物理与镜头**  
Real collision and grounded footprints/wheel tracks; partial occlusion reveals player outline at ground contact. Test free camera movement and aspect ratios, not just one attractive still. / 真交互、无穿插、没有假背景。

**Stage 05 — Optimization after art acceptance / 画质确认后再优化**  
Keep high-res source assets; use instancing, texture atlases, impostors, KTX2 and LOD only while preserving a stable visual similarity score. Compare screenshot/turntable before-after at equal camera/lighting. No arbitrary triangle cap may force hero tree silhouette collapse. / 优化必须让位于画面。

## Original acceptance rubric / 独立质量验收表

**Five weighted art factors (proposed, not measured):**
- Botanical silhouette and biodiversity / 植物形态辨识与层次 **30%**.
- Painterly surfaces and color continuity / 绘画纹理与色彩统一 **25%**.
- Ecological placement and ground transitions / 生长逻辑、地表接触 **20%**.
- Lighting, atmosphere, visual storytelling / 光照氛围与叙事 **15%**.
- Camera stability, interaction and navigability / 多机位运动与空间真实性 **10%**.

No claims of numerical similarity to Tiny Delivery without independently captured, angle-matched screenshots and human art review. **Hard reject:** hero foliage composed only of balls/cones, no authored alpha art, hard stamped texture repeats, cutout halos, plants intersecting rocks/walls, plastic specular shine, no dark under-canopy, flat monochrome terrain, distant-only composition that hides the unfinished foreground.

**Copyright and privacy / 权利边界：** External art is **for visual research only**. No tracing or rehosting upstream screenshots, game assets, commercial Asset Store textures, logos, music or characters. Public knowledge docs contain links and original analysis; unpublished art references, internal prompts, prototypes and commercial scene files remain private in GlobalGameFoundry. Check license and third-party notices before any code/asset reuse.
