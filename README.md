# Open Immersive Atlas · 开放沉浸式技术图谱

**Discover outstanding 3D experiences. Understand how they work. Learn from the best.**  
**发现卓越的三维作品，理解它们如何实现，向最优秀的创作者学习。**

[中文说明](README.zh-CN.md) · [Primary Source Radar / 一手资料雷达](sources.html) · [Five Research Lanes / 五线并行研究](research.html) · [Bilingual catalog / 双语目录](CATALOG.md) · [Interactive explorer / 交互检索](index.html) · [Creator Atlas / 作者图谱](creators.html) · [Creator profiles / 作者资料](CREATORS.md) · [Contribute / 参与贡献](CONTRIBUTING.md)

> **This is a curated, evidence-based index and knowledge archive — not a fork of any third-party product and not a replacement for Three.js, A-Frame, or Blender.**  
> 本仓库是经过出处核验的双语精选技术索引，不是第三方产品镜像，也不是一个新的 3D 引擎。

## Spatial Lab 04 — measurable motion and tactical AI / 可测量动作与战术

**[Open original 3D debug lab / 打开原创三维实验](labs/motion-qa/)** · [Source, tests and limitations / 源码、测试与边界](labs/motion-qa/README.md)

An original native WebGL2 character-and-sword *diagnostic fixture*, with independent mathematical modules for terrain/stance, fixed-length leg IK and knee direction, semantic right-hand sword socket, three timed gestures and explainable NPC utility AI. It passed **38/38 deterministic tests** and an independent actual-Chrome 3D smoke test (3 terrains, 3 techniques, orbit, NPC decisions, 6/6 built-in fixture checks, JSON export, no external requests or JS/GL errors). **This is not a rigged human skinned GLB, licensed sword mocap or proof of a private game's visual motion quality.** / 真实浏览器和数值测试已通过，但尚未把真实人物的骨骼动画或武术动捕整合进来。

## Premium immersive web / 高端视觉网站技术专题

**New 2026-11-07:** [Premium Visual Web Atlas — 14 source-grounded inspirations, 10 technique references, bilingual engineering breakdowns and X post watchlist](docs/research/2026-11-07-premium-visual-web-atlas.md). Public research only; private commercial service specifications are not published here. / 新增高级视觉网站技术案例库：公开搜集原创出处与实现方法，商业报价和客户项目不公开。

## Runnable code labs / 原创可运行技术实验

**[Spatial Lab 01 — Procedural Terrain LOD / 原创 WebGL2 地形 LOD 实验](labs/terrain-lod/)**

An independent, dependency-free WebGL2 demonstration with 49 real geometry chunks, near/far LOD selection, edge skirts, tiny-stone procedural shading, orbit controls, and live CPU frame-interval statistics. The first real headless Chrome smoke test passed low/high LOD switching, wireframe/fog toggles, orbit/zoom and reset. This is a functional smoke test under software rendering, **not** evidence of hardware GPU FPS.  
原创实验不依赖第三方模型和资产，独立验证可旋转的真实三维地形、LOD、尺度参照与帧间隔。已通过软件渲染模式的 Chrome 操作测试，尚不代表真实 GPU 性能。

[Technical limitations / 技术边界](labs/terrain-lod/README.md) · [Browser smoke test / 浏览器验收脚本](labs/terrain-lod/test-browser.mjs)

**[Spatial Lab 02 — Offline GLB Asset Inspector / 原创 GLB/glTF 离线模型检查台](labs/glb-inspector/)**

A local-only browser tool that parses GLB v2 or glTF JSON, checks binary chunk boundaries, BufferViews, Accessors, mesh references, node hierarchy and transforms, and exports bilingual findings as JSON. **No upload and no external model URI requests.** Its handcrafted triangle sample and malformed fixtures passed **15/15 core tests**; a real headless Chrome browser smoke test passed local import, malformed input, bilingual UI, privacy checks and export. This is deliberately **not** a Khronos conformance certificate or full rendered model QA.  
支持本地文件读取、结构错误诊断及报告导出；内置原创测试素材，经过独立浏览器操作验收，第三方模型绝不上传。

[Technical note / 技术边界](labs/glb-inspector/README.md) · [Core tests / 结构测试](labs/glb-inspector/test-core.mjs) · [Browser smoke / 浏览器测试](labs/glb-inspector/test-browser.mjs)

**[Spatial Lab 03 — WebGPU / WebGL2 same-scene comparison / 同场景双后端实验](labs/renderer-compare/)**

Two original native pipelines use the **same packed terrain geometry and camera**, with 4 mesh densities (4,608–131,072 triangles), independent WebGL2 and WebGPU shader code, software-adapter safety guards, and a sequential 40-frame warmup + 120-frame sampling workflow. Browser tests have confirmed the WebGL2 path, software WebGPU rejection/fallback and JSON report export. **A separate Windows Chrome browser session confirmed both WebGL2 and WebGPU pipelines rendering 171 frames each without graphics errors, then completed 120 independently sampled frames per backend at 697 × 300 pixels with 18,432 triangles.** Linux headless SwiftShader remains explicitly unsupported. JS submit-call time and requestAnimationFrame intervals are **not GPU execution time** and do not establish an API speed ranking.  
同一份几何数据进入 WebGL2 和 WebGPU；Windows Chrome 实测两套管线各连续绘制 171 帧、分别完成 120 帧采样，图形错误码为零。Linux 无头软件 GPU 仍不稳定，不将 JS 提交耗时或帧间隔混称 GPU 执行时间。

[Source and limitations / 源码与测量边界](labs/renderer-compare/README.md) · [Browser smoke / 浏览器测试](labs/renderer-compare/test-browser.mjs)

**GPU Timestamp Query upgrade / 真正 GPU 渲染计时：** Spatial Lab 03 now uses optional WebGPU `timestamp-query` and WebGL2 `EXT_disjoint_timer_query_webgl2`, with 24 asynchronous per-backend samples, explicit unsupported/disjoint reporting and downloadable raw sample data. Actual Windows Intel Xe-LPG browser runs succeeded at all four geometry densities (each API collected 24/24 samples), without implying a general API performance ranking. [Bilingual technical case](docs/cases/gpu-browser-timestamp-queries.md) · [Hardware evidence JSON](labs/renderer-compare/evidence/2026-11-07-intel-xe-lpg-gpu-timers.json).  
**实测升级：** 第三个实验现在支持真正的 GPU 通道时间戳查询；Intel Xe-LPG 的四档几何在 Windows Chrome 已完成 WebGL2/WebGPU 两后端共八组 GPU 计时，结果及限制公开，不把个别数据推广为普遍性能结论。

## NPC AI & motion-quality research / 战斗与动作质量专题（2026-11-07）

A second, more selective discovery cycle verified **14 additional AI, animation, rigging, physics and experimental-voxel repositories** against live GitHub metadata, including their detected SPDX license and archived state (136 project records total). The [Primary Source Radar](sources.html) has expanded to **27 original works**, including official GDC 2026 Kung Fu motion and learned character locomotion sessions, motion matching, game architecture and physics articles.

New source-level analysis documents how to diagnose incorrect sword grip and mirrored hands, foot sliding, reversed knees, weak combat choreography and NPC decision quality before investing in a complex motion generator. **No private-game animation repair or new production integration is claimed.**

[Read the bilingual game AI & motion study](docs/research/game-ai-motion-quality-2026-11-07.md) · [Review repository license/health audit](scripts/audit_repository_health.py) · [Source Radar](sources.html)

## Expanded game intelligence / 游戏研发视野扩展（2026-11-07）

**45 additional source-verified public repositories** have been catalogued across research-grade WebGPU/3DGS, AI asset generation, procedural levels, playable RTS/simulation/RPG references, game engines, multiplayer infrastructure, audio, automation, accessibility and analytics. That first broad discovery batch reached **122 bilingual project records**. Public repository existence was verified; **their runtime quality and licensing for individual art, model weights and datasets are not automatically verified**.

**The initial 18 original-source references**, separately indexed in the [searchable Source Radar](sources.html), cover GDC technical talks, developer postmortems, IGDA research, Steamworks/itch publishing, accessibility, W3C/Khronos standards, CC0 art licensing and current research papers. Not every resource is free or usable commercially; each has an explicit rights caveat.

- [Source Radar / 一手资料与行业情报](sources.html)
- [What to adopt and validate / 本轮研究结论及验收路线](docs/research/broad-discovery-2026-11-07.md)
- [Machine-readable project catalog / 项目 JSON](data/projects.json) · [Source Radar JSON / 资料 JSON](data/source-radar.json)

## First edition / 首批收录

**136 independently described references · 4 categories · Chinese and English for every record.**

| Category / 分类 | Contents / 内容 |
|---|---|
| [Immersive experiences / 沉浸式作品](CATALOG.md#immersive-experiences--沉浸式作品) | VIPER 11, Bruno Simon Folio, ORYZO, IVRESS, NASA Eyes… |
| [3D production pipelines / 3D 工厂](CATALOG.md#3d--ai-production-pipelines--3d-与-ai-工厂) | AnyScene, AnyKit, AnyShot, Video-to-Game, AssetFurnace… |
| [Frameworks & engines / 框架与引擎](CATALOG.md#frameworks--engines--框架与引擎) | Three.js, A-Frame, Babylon.js, PlayCanvas, Blender, Godot… |
| [Infrastructure / 基础技术](CATALOG.md#rendering--engineering-infrastructure--渲染与工程技术) | Rapier, glTF Transform, meshoptimizer, VGGT, shader/QA tools… |

## Why these projects matter / 它们为什么厉害？

- **VIPER 11:** Browser flight simulation, real terrain, temporally reconstructed volumetric clouds, cinematic optics, six-DOF physics. / 浏览器战机模拟、真实地形、时域重建体积云、摄影镜头与飞行动力学。
- **AnyKit / AnyScene / AnyShot:** A reproducible path from AI-generated props to a clean Blender scene, assets and graded shots. / 从 AI 道具、几何清理到真实场景、镜头和影像的可重建工作流。
- **Bruno Simon Folio:** A playable site with an explicit input → physics → world → render loop and available source. / 公开主循环与可玩源码的游戏化网站。
- **Three.js / A-Frame:** Reusable web 3D foundations: programmatic control or declarative entity-component VR. / 程序化控制与声明式 VR 的两种不同开发抽象。

## Data format / 数据规范

All records live in **[data/projects.json](data/projects.json)**. Every entry contains: official URL, repository URL if available, source-evidence level, third-party license status, a **Chinese and English introduction, technical strength and what to learn**, tags, and review date.

每条档案都包含**官方入口、可用源码、证据等级、第三方版权状态、中英文介绍、技术优势、可学习机制及核查日期**。目录可在 GitHub 阅读，也可用纯静态网页搜索。

```bash
python3 scripts/validate_catalog.py
python3 scripts/build_catalog.py    # regenerate CATALOG.md from JSON
python3 -m http.server 8000       # then open http://localhost:8000/
```

No build tool, API key or cloud account is required to browse the atlas. / 浏览本图谱无需构建工具、API 密钥或云账户。

## Curation rules / 收录规则

1. Primary creator notes and actual upstream code beat marketing claims. / 原作者笔记与源码优先于宣传。
2. Distinguish `source-code`, `creator-notes`, `creator-article`, `official-product` and `official-site`. / 明确证据等级。
3. “Source available” does **not** mean commercially reusable; a repository's license never automatically covers models, textures, third-party datasets, music or cloud services. / 源码可读不等于所有素材都可商用。
4. Do not copy screenshots, assets, proprietary code or private research without express permission. / 未经授权不搬运截图、美术、源码或私有研究。
5. A public catalog is not proof of local installation, GPU testing or production acceptance. / 入库不等于本地运行、性能测试或生产验收。

## Open / Private boundary · 开放与私有边界

**Public:** factual project descriptions, creator links, independently written technical explanations, contribution tools.  
**Private:** original unpublished production code, commercial datasets, proprietary experiments, account credentials, internal prompts, client assets and unreleased game resources.

We welcome community additions through GitHub issues/PRs. See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## License / 许可证

This repository's **original prose, structured catalog and code** are published under [MIT](LICENSE). Third-party works retain their own licenses and copyrights. External links are references, not mirrors or sublicenses. / 本项目原创文字、结构化索引和代码采用 MIT 许可，所有收录项目保留原作者版权；外链不意味着转授权。

Created: **2026-11-07**. Catalog entries are research references, not verified hands-on benchmarks unless explicitly indicated.

## Newly verified research tracks / 新增重点研究方向

- **SuperSplat 3.0:** WebGPU compute, GPU-resident splat data, streamed exports, native WebMCP; the Editor is WebGPU-only while the Viewer separately supports WebGL fallback. / GPU 数据驻留与计算排序；编辑器和查看器兼容性不同。
- **glTF QA:** Khronos Validator + reference render + geometry/LOD + collision/runtime tests. / 用文件规范、材质、物理和真实运行四层验收模型。
- **Spline + WebMCP:** explicit agent operations with scopes, stable IDs, view tokens, undo and preview. / 让 AI 编辑具备明确作用域、版本、可回退与视觉证据。
- **Creator-led experiences:** Aten7, Cartier in Time, ITom and Immersive Garden case studies, separating first-party creator disclosures from proprietary code. / 新增来自制作方的一手作品案例。

## Featured deep dives / 专题技术拆解

Read independent technical case studies, with primary sources, concrete engineering mechanisms and license-safe experiments:

- [VIPER 11 — volumetrics, terrain, optics and flight dynamics / 体积云、地形、镜头与飞控](docs/cases/viper-11.md)
- [AnyKit — normalizing AI-generated models into coherent asset kits / 将 AI 模型做成可靠资产](docs/cases/anykit.md)
- [AnyScene + AnyShot — reproducible scenes and camera pipelines / 可重建场景与镜头工厂](docs/cases/anyscene-anyshot.md)
- [Bruno Simon Folio — real physics, game loop and browser asset pipeline / 可玩网站与物理主循环](docs/cases/bruno-folio.md)
- [SuperSplat 3.0 — WebGPU compute, memory and browser WebMCP / GPU 计算、内存与原生 AI 编辑](docs/cases/supersplat-3-webgpu.md)
- [glTF Asset QA — specification, geometry, materials and runtime / 游戏级资产验收](docs/cases/gltf-asset-qa.md)
- [Agent-operable 3D editors — safe operations and undo / AI 操作三维编辑器](docs/cases/web3d-agent-editing.md)

These essays are authored analysis of public sources, **not** upstream source mirrors or measured local reproductions. / 它们是公开资料的原创分析，不是第三方源码镜像或本地性能验收报告。

## 2026-11-07 continued research / 持续研究增补

- [R3F v10 alpha WebGPU migration / R3F v10 Alpha 与双渲染器迁移](docs/cases/r3f-v10-webgpu-migration.md) — production-safe version boundaries and visual QA / 稳定版本边界与画质验收。
- [React Three Rapier physics / 真实物理、碰撞与接触](docs/cases/react-three-rapier-physics.md) — original game physics experiment designs / 原创游戏物理实验。
- [WebXR spatial input / 多设备空间输入](docs/cases/webxr-spatial-interaction.md) — capability detection and fallback / 设备能力探测与降级。

These are independently researched public guides, **not** evidence of internal game deployment. / 以上为公开研究文档，尚不等于内部游戏已集成。

## Painterly Nature Research / 绘画式自然场景技术专题

**New technical direction: artistic quality first, geometry/LOD optimization later. / 新方向：先完成美术表达，再优化几何与性能。**

- [Painterly Nature Production Playbook / 绘画式自然场景制作总纲](docs/cases/painterly-nature-3d-production-playbook.md) — artist-authored foliage atlases, cutout leaf silhouettes, tree-canopy normals, ecological clustering, atmospherics, true watercolor camera mapping and WebGPU/WebGL2 implementation candidates. / 手绘叶片、植物形态、自然散布、光影与可运行浏览器技术。
- [Tiny Delivery original creator environment article analysis / 原作者环境技术剖析](docs/cases/sinica-tiny-delivery-environment.md).
- [Tiny Delivery terrain transitions and grounded trails / 地表材质与轮迹专题](docs/cases/sinica-terrain-heightblend-vfx.md).

New verified references include Tiny Delivery, Dordogne, Tiny Glade, Kayla Kosik's Cozy Cottage, Just a Simple Tree, Three.js Field Grass and Yomotsu Vegetation. **These are evidence-indexed studies, not claims of locally integrated high-fidelity gameplay.** / 以上仅为公开技术与美术方法研究，不代表游戏已经完成美术重构。

## Wildward: procedural wilderness × terrain-responsive vehicle × simulated river / 程序化荒野技术专题

Source-audited **three actual creator videos** plus the original introduction: [Wildward independent technical case](docs/cases/wildward-procedural-expedition-driving-water.md). The `@PlayWildward` account publicly describes Jeep driving with terrain response, procedural-grass contact, simulated water and a 1–4-player expedition. The author **has not disclosed implementation source or physics/renderer details**. The similarly named medieval-fantasy website cannot be attributed to the account without evidence. / 已审阅三段作者视频与一条介绍，分析车与地形、草和水的联动，明确哪些机制仍未获源码证明。

Three linked, source-checked browser water references are now part of the project catalog: [Evan Wallace's WebGL water](https://github.com/evanw/webgl-water), [Jean Timex's WebGPU water](https://github.com/jeantimex/webgpu-water) and [SweK's single-file WebGL2 water](https://github.com/HowdyKeith/swek-webgl2-water). Do not confuse their separate licensing with Wildward promotional video rights. / 本轮 73→77 条中英双语项目记录。

**[Search creators by expertise / 按专长检索作者](creators.html)** · [Bilingual biographies, representative works, rights and evidence / 双语作者档案](CREATORS.md) · [JSON data](data/creators.json). The new people atlas contains **16 individual creators + 1 project account**; team membership for Wildward remains unverified. / 作者图谱含 16 位个人作者和 1 个未核实成员身份的项目账号。
