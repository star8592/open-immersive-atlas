# Sinica / Tiny Delivery — a deep study of handcrafted cozy 3D worlds
# Sinica《Tiny Delivery》：从绘本式氛围到可游玩的微缩三维世界

**Research date / 核查日期：2026-11-07**  
**Original inspiration / 用户提供的原始入口：** [X status 2118758890284163468](https://x.com/artem_sini39436/status/2118758890284163468) by [Sinica](https://x.com/artem_sini39436). **Access note:** the exact X status and its personalized recommendation feed could not be independently retrieved during this review. No claims below describe unseen footage or assert that a related game appeared in that recommendation feed. / **访问边界：**本次无法独立读取该条 X 的全部正文、视频及动态推荐流；下列内容基于已实际读到的一手文章、官方店铺及公开访谈，相关游戏为独立扩展研究，绝不冒充原帖推荐。

## Verified original-source chain / 经核实的一手来源链

1. [Steam — Tiny Delivery, App 3812830](https://store.steampowered.com/app/3812830/Tiny_Delivery/) — developer/publisher Sinica; game premise, official pictures and public screenshots; Steam currently lists release **Coming soon**. / 开发者、玩法、原图与发售状态。
2. [Artem Sinica, *Step By Step Environment Creation Breakdown In Unity* (2025-12-31)](https://medium.com/@sinitsyndev/step-by-step-environment-creation-breakdown-in-unity-4073f1a73125) — **primary author production breakdown** of terrain, color, art assets, vegetation, water, decals and performance. / 作者逐步写出的环境制作过程，本篇最重要的技术一手证据。
3. [Artem Sinica, *Removing the 4-Layer Limit for Height-Based Blending in Unity Terrain (URP)* (2026-02-18)](https://medium.com/@sinitsyndev/removing-the-4-layer-limit-for-height-based-blending-in-unity-terrain-urp-c0ba85444f58) — author-explained shader-pass workaround for blending four core terrain materials while using more terrain layers. / 作者公开的混合材质实验与局限。
4. [Author's GitHub repository — TerrainURPLitHeightBlend](https://github.com/ArtemSin/TerrainURPLitHeightBlend) — source available; README says “free to use” but **no standard LICENSE or LICENSE.md was confirmed** by this review. Treat commercial reuse and upstream Unity shader derivative terms as **unresolved**, not MIT. / 源码可见，但未确认标准许可证，商业搬运不可擅自视作 MIT。
5. [Game Dev Journey — interview with Artem](https://www.gamedevjourney.co.uk/home/developer-diaries/unity-diaries/tiny-delivery) — first-person developer testimony: 10+ years Unity experience, starting from footage of small delivery robots and growing into NPC-reactive, exploratory adventure. / 本人访谈，确认其引擎、定位与交互设计。
6. [80 Level — stylized wet tire trails (2025-07-29)](https://80.lv/articles/stylized-wet-tire-trail-vfx-created-for-cute-delivery-robot-in-indie-game) — observed trails and timing; [Hitmarker developer-related post](https://www.linkedin.com/posts/hitmarker_tiny-delivery-by-artem-sinica-activity-7356386885734203393-8_kL) reports that the author used Unity Trail Renderer for wheel traces and decals for wet spots. This is a **second-hand technical attribution**; do not treat as independently audited source code. / 车痕与水斑实现为媒体转述，未经源码验收。
7. [80 Level — mud mechanic (2025-09-26)](https://80.lv/articles/indie-game-about-adorable-delivery-robot-gets-mud-mechanic) — rover slows in mud, then shakes mud off to recover movement. / 泥地阻力与甩泥动作的公开报道。
8. [Sinica X public profile — secondary indexed mirror](https://www.sotwe.com/artem_sini39436) — creator's response mentions highlighting the bottom edge of occluded objects to keep their collision silhouette legible; do not infer exact shader implementation. / 作者评论披露遮挡轮廓方法，但具体代码未知。

All linked photographs, concept art, videos, Unity Asset Store bundles, character designs, sound and trademarks belong to their respective owners. **This atlas links; it does not mirror.** / 只引用出处，不复制任何媒体或美术素材。

## 1. Style DNA / 这类风格究竟好在哪里？

**中文研究：** 不要把它简单理解为“低面数卡通游戏”。Sinica 明确把目标描述为绿色、柔软、受手绘动画氛围启发的场景。图像魅力来自一组相互依赖的设计约束：

- **尺度关系 / Scale hierarchy：** 极小的白色送货机器人在具有可信尺寸的街道、河岸、建筑与草木间穿行。角色小并不是“玩具车被放在巨型贴图上”，而是地形的砖纹、花草、围栏、盒子、人和车身之间拥有连续的尺度参照。原作者没有公开所有实际米制参数；因此不能捏造具体比例。
- **有组织的自然杂乱 / Structured natural disorder：** 远看轮廓清楚、草地成片、河流边界可读；近看岩石底部藏草、树根周边有灌木、滨水植被更密、路径边缘不均匀。细节不是均匀噪点，而是由生态逻辑推动的局部成簇分布。
- **光色统一 / Consistent color language：** 主色偏明亮植被绿，水体用蓝青或深绿色，泥土和建筑用暖色对照；基础草地与 3D 草模型先匹配，再用线性颜色空间、方向光和少量后处理统一全局色调。
- **带呼吸感的动效 / Environmental motion：** 飘叶、飞鸟、蝴蝶与少量粒子使环境不是一张背景图。低频小幅运动与玩家交互相配合，但不应使屏幕处处高对比闪动。
- **镜头塑造微缩感 / Camera composition：** 俯斜视角与可选的倾斜移轴模糊塑造精致模型展柜感；**相机效果不是物理世界**，实体建筑、台阶、河岸、桥梁与碰撞几何仍须真实存在。画面四边过度景深模糊会妨碍玩法，应设置可访问性和开关。
- **环境响应而不只是装饰 / Semantic feedback：** 轮胎湿痕、泥地减速、机器人摆动或抖泥、居民响应喇叭声，将游戏物体与其接触表面建立因果联系。

**English:** The look is not simply low-poly. It combines credible relative scale, ecological clustering, a controlled palette, camera-directed composition and a world that responds to the player's physical presence. Stylized rendering works because the environment behaves like a place rather than a static illustration.

## 2. Reconstruct the author's environment production method / 作者公开步骤的独立整理

**A — Reference and visual contract / 先做视觉目标**
- Collect a reference board and choose an explicit atmosphere before importing assets; the author uses [PureRef](https://www.pureref.com/).
- Record target camera angle, palette, terrain-to-prop scale, vegetation density, silhouette hierarchy, interior/exterior readability and a small set of fixed comparison frames. / 先锁镜头、比例、色谱和“看起来像什么”，后建模。
- Distinguish a thematic reference from source art; never import reference images into commercial textures without rights. / 参考图不是可商用素材。

**B — Engine defaults and ground / 颜色空间与基础地形**
- Disclosed engine path: Unity Terrain with URP in 2022.3/6.3; linear rather than gamma color space for the intended lighting; no secret bespoke terrain engine claimed.
- Begin with grass and soil terrain layers. Block large slopes and valleys before polishing small props. Path irregularity and valley/bridge route connectivity are important.
- Reported tools: [Path Painter II](https://assetstore.unity.com/packages/tools/terrain/path-painter-ii-184623) for smooth terrain shaping; [F-Texture Tools](https://assetstore.unity.com/packages/tools/utilities/f-texture-tools-274837) for quick edits and seamless textures; always verify the **exact package and current rights** before acquiring them. No assumption that an Asset Store purchase can be re-licensed.
- Interesting author-specific shortcut: take a controlled, post-processing-free grass scene screenshot and turn it into a seamless base terrain texture, then align that texture's hue with actual 3D grass. **This is a described author workflow**, not a recommendation to reuse his art.

**C — Grass-first world building / 先建立草地，不是先堆建筑**
- The author starts with densely vegetated terrain before fine modeling. Align detail objects with the terrain surface and vary their tint, density and silhouettes.
- Darken grass roots to approximate contact shading at much lower cost than calculating dense per-blade SSAO. Avoid overly thick repeated alpha-card layers.
- Trees, rocks, stairs, paths, bridges and grass must respect the same physical terrain. Remove clashing grass inside solid objects; nest nearby vegetation selectively.
- Author-described vegetation source: Unity Asset Store **Meadow Environment — Stylized Pack**, with supplemental **Fantastic Ancient Forest**. [Meadow Environment — Stylized Pack](https://assetstore.unity.com/packages/3d/environments/fantasy/meadow-environment-stylized-pack-314902) and [FANTASTIC — Ancient Forest](https://assetstore.unity.com/packages/3d/environments/fantastic-ancient-forest-281914) are **not included in this repo, and license coverage remains per asset**.

**D — Terrain geometry and topology / 有道路逻辑的空间**
- Rough elevations → variable-width footpaths → edge vegetation → rocks → bridges → architecture; bridge crossings must connect walkable surfaces, not just look pretty in a screenshot.
- Avoid perfect-width artificial banks or paths; keep low-frequency erosion shapes and local slope changes.
- Riverbeds: softened raised banks, visible plant-water transition, adjustable depth/shoreline tint, plausible water-level continuity. The author cites [Stylized Water 3](https://assetstore.unity.com/packages/vfx/shaders/stylized-water-3-287769), with version choice depending on Unity version, not a globally reusable source shader.
- Architecture: the author cites the [Sun Temple](https://assetstore.unity.com/packages/3d/environments/sun-temple-115417) pack as a source for a bridge-like piece; in our own work, reuse only licensed compatible pieces in a new *original* design, then visually age it with moss and projector decals; verify real passage clearance and collider layout.

**E — Ecology as an artist's scatter algorithm / 生态驱动散布**
- Root/rock/bridge neighborhoods get clustered low vegetation; waterline gets reeds and marsh plants; woodland shade gets mushrooms and larger leaf masses.
- Restrict each flower meadow to a modest dominant color family to prevent colorful visual noise.
- Scatter with constraints: slope, sun exposure, water distance, road clearance, prop exclusion and deterministic seeds. This last sentence is **our proposed production generalization**, not a claim the author implemented those fields.

**F — Final atmosphere and visual readability / 最后做光影与微特效**
- The author reports using [Artistic: Tilt Shift](https://assetstore.unity.com/packages/vfx/shaders/fullscreen-camera-effects/artistic-tilt-shift-265465) on an angled camera, moss decals, leaf/butterfly particles and lighting adjustments.
- Important: blur should never destroy character silhouette, task object visibility, or camera rotation usability.
- Show both fixed-view and freely rotating 3D camera modes in any future implementation; otherwise beautiful composited screenshots may conceal broken spatial topology.

## 3. Performance model / 性能不是简单降低模型面数

**First-person source observations:**
- Enable GPU instancing for numerous grass/detail objects where compatible.
- The main bottlenecks may be high-alpha-clipped tree canopies and their overdraw, not polygon counts alone; simple distant tree LODs are often worthwhile.
- Grass's interaction with screen-space ambient occlusion can be disproportionately costly. The author describes changing shader normal/depth participation in HLSL. Such an edit changes visual correctness and must be benchmarked, especially with shadows/occlusion.
- Bake or partition occlusion/visibility so unseen areas do not render indiscriminately.
- The developer reports **80–90 FPS on a GTX 1060 laptop for the demonstrated scene**. **Not an independently reproduced or cross-device benchmark; resolution, settings, driver and GPU/CPU frame times were not fully specified.**

**Our independent acceptance plan:** desktop 1080p/1440p and low-end fallback; report draw calls, triangles, alpha overdraw proxy, p95 CPU/GPU frame time, 1% low, texture residency, first usable frame, shader errors and visual reference screenshots. Test visible grass and water both with and without post-processing.

## 4. What PlayMoru can learn / 原创游戏值得吸收什么

### Landscape and RTV camera / 地貌与镜头
A good stylized game remains fully 3D even when the default camera is a 3/4 isometric perspective. Build coherent terrain and landmarks in world meters, separate render and collider geometry, allow camera rotation when gameplay permits and verify that background geometry does not stretch when window aspect ratio changes. / RPG 可以以斜俯视构图为主，但必须有真实的前中后空间，而不是缩放时变形的整张背景图。

### RTS vehicles / RTS 载具真实接地
For an original RTS rover, emit tire marks only when a wheel probes a valid driveable ground contact. Use contact point/tangent, slip threshold, soil/material response, a bounded mark pool and gradual fading; retain object scale and geometry LOD independent of ground texturing. This is an **original proposed implementation**, not the game's leaked or copied shader.

### RPG characters and interaction / 角色动作与任务
NPCs need a state/reaction system independent of art style; a small interactable act (honk, push, throw, help) produces a readable result. For a swordfighter, foot contact, grounded animations, grip sockets and sheathing timing must be verified separately. This game's robot implementation is not proof that a humanoid sword rig works.

### WebGPU/WebGL2 transfer / 移植而不是搬运 Unity 资产
Port the **mechanisms**, not proprietary implementation: Linear/PBR colors, terrain layer masks, vegetation scatter, instancing, tree/grass LOD, shader pass budgeting, localized water shoreline effects, decal-like trails, dynamic culling and fixed-camera QA can be realized independently in WebGPU/WebGL2 + Three.js, Godot or Unreal; choose by project requirements. Unity Terrain-specific code or store bundles are not drop-in WebGPU modules.

## 5. Stepwise original recreation acceptance / 可独立复现的验收

| Stage / 阶段 | Output / 产物 | Acceptance / 验收 |
|---|---|---|
| S0 | Independent art bible: meters, palette, camera, source rights / 美术圣经 | Fixed reference cameras and copyright record / 固定机位与来源 |
| S1 | Real 3D ground, paths, bridge and river / 地貌 | Full 360° camera inspection; continuous walkable route / 可旋转且可走 |
| S2 | Original grass, tree, rocks and placement rules / 植被 | No plants through rock/walls; scale calibration; stable lighting / 无穿插 |
| S3 | Water, decals, seasonal color and ambient effects / 水与污渍 | Shoreline water-level consistent; VFX readable and bounded / 水岸连贯 |
| S4 | Original rover or character; contact feedback / 角色反馈 | Tracks grounded; path/obstacle interactions; no sliding/teleporting / 接地正确 |
| S5 | Multi-device optimization and QA / 性能 | Compare p95 CPU/GPU, memory and art parity on target browser/engine / 有数据回执 |

**Status:** primary material analyzed; document is a research case. **No claim of local engine implementation, GPU test or publishing to a game.**

---

## Related style benchmarks / 独立扩展研究：不是 X 动态推荐清单

These verified works share some visual or interaction DNA with Tiny Delivery. They are **independently selected**, not claimed as the exact “More for you” posts under the linked X status. / 它们是我们核对官方链接后独立补充的关联作品，不冒充 X 当前个性化推荐：

1. [Tiny Glade — Pounce Light](https://store.steampowered.com/app/2198150/Tiny_Glade/) — procedural details in miniature architecture, unusually coherent overgrowth and cozy light; **study automated composition/detail generation**. / 程序化建筑细节、手工模型感、苔藓草木与灯光。
2. [Untitled Goose Game — House House](https://goose.game/) — constrained low-complexity look, expressive animation and systemic mischief; developer interview specifically associates Tiny Delivery with this kind of gameplay. / 低复杂度美术与高密度互动。
3. [Little Kitty, Big City — Double Dagger Studio](https://www.littlekittybigcity.com/presskit) — a tiny protagonist in an urban world with characters reacting to playful activity. / 微小角色与城市交互，故事从行为里长出来。
4. [Mail Time — Kela van der Deijl](https://store.steampowered.com/app/1607240/Mail_Time/) — bright cottagecore micro-biomes, postal delivery task loop and readable foliage. / 童话森林与配送任务。
5. [Mika and The Witch's Mountain — Chibig / Nukefist](https://store.steampowered.com/app/1819460/) — a compact delivery world, colorful topology, visible locomotion progression (broom flight). / 小型岛屿与快递任务的空间组织。
6. [A Short Hike — adamgryu](https://store.steampowered.com/app/1055540/AShortHike/) — small yet legible mountainous exploration with appealing locomotion and shortcuts. / 精巧山地、多路线垂直探索。
7. [TOEM — Something We Made](https://store.steampowered.com/app/1307580/TOEM/) — distinctive constrained monochrome style and environment-driven observation objectives. / 虽是不同画风，却适合研究探索任务如何不依赖屏幕箭头。

**Do not treat screenshots, third-party game binaries, textures or music as licensed source assets. / 对标作品的截图、游戏文件、素材不得因“能看到”而被视为可复用资源。**

## Open questions / 后续核查清单

- Exact original X status text/media and personalized recommendations: **NOT OBSERVED**, require a permitted direct capture or shareable per-post URLs. / 原帖及其推荐的精确名单待可访问证据。
- Which camera effects are player-controlled vs promotional-only? / 景深与倾斜移轴是否是实际可切换玩法？
- Independent performance beyond author GTX 1060 figure and measurements with transparency modes: **NOT BENCHMARKED**. / 帧时实测未完成。
- Exact rights for each paid asset pack and the small custom terrain shader repo: **NOT CLEARED**. / 商用权利逐项核实。
