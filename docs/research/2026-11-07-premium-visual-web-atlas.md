# Premium Immersive Web Atlas / 高端视觉网站技术案例库 — 2026-11-07

> **Public research, not a template store. / 公开研究，不是模板转售库。**
> Original creator work, linked for analysis only. No screenshots, site source, brands, client art, video or proprietary assets are republished. Source disclosed ≠ ours reproduced. This document does not include private client pricing, recipes, sales automation or unpublished proprietary code.

## Mission / 目标

**中文：** 专门收集优秀的高级视觉网站及其原作者帖子、技术复盘、可合法使用的框架，重点研究视觉质感、排版、动效、三维交互、响应式体验和实际业务价值。建立「作品 → 原作者与原帖 → 技术机制 → 可独立重建的原创练习 → 设备验收」链，而不是只收藏好看图片。面向中文市场的高级品牌网站、产品展厅和创意机构网站的技术学习，**不向买家转卖第三方模板、素材或网站源码**。

**English:** Curate outstanding visual websites and first-party creator posts, annotated with verifiable engineering mechanisms, legal reuse boundaries, independent original study ideas and practical device tests. Prioritize art direction plus working interaction; no redistribution of another studio's production work.

**Seed awaiting primary-post inspection / 尚待读取正文的原始 X 线索:** https://x.com/BeyondTheBoxCN/status/2118704959223116082 — X returned 403 to this research pass; **do not infer video contents, framework or author from this URL**.

## A. First 14 source-grounded inspirations / 首批 14 个可核验案例

Each row includes a directly attributable creator write-up, official work or award listing; "stack" describes only what that source actually states. / 只归档来源已经披露的技术，不猜测网站后端。

| # | Work & authoritative reference / 作品及依据 | Visual advantage / 视觉优势 | Verified mechanism / 可核验机制 | Original study opportunity / 可原创练习的能力 |
|---|---|---|---|---|
| 01 | **HAOQI.DESIGN** — [creator's Codrops analysis](https://tympanus.net/codrops/2026/08/15/inside-haoqi-design-letting-dom-and-webgl-share-a-retro-futurist-stage/) | 透明玻璃、复古未来感 / translucent glass and retro-futurism | Next.js, React Three Fiber, Three.js, Lenis, custom shaders; shared scroll/pointer buses keep DOM and canvas aligned | Original translucent product hero with DOM/WebGL sync; 原创玻璃产品首屏与内容同步 |
| 02 | **Mathias Adolfsson ’26** — [creator case study, 2026-11-05](https://tympanus.net/codrops/2026/11/05/mathias-adolfsson-portfolio/) | 弧形作品轮播、桶状画廊 / curved carousel and barrel gallery | Nuxt + Three.js WebGPU + GSAP; full-screen scene under semantic DOM | Original curved luxury-product gallery with fallback; 弧形产品画廊与 WebGL 降级 |
| 03 | **Juan Mora Romero ’26** — [creator case study](https://tympanus.net/codrops/2026/10/22/juan-mora-romero-portfolio/) | 无边际拖动作品墙、光谱分离、布料海报 / infinite lab, channel split, fabric-like posters | Next.js + React Three Fiber + GSAP, custom GLSL | Drag-to-explore agency portfolio; 可拖动设计师作品矩阵 |
| 04 | **ITom** — [creator's site and technical statements](https://itomdev.com/) | 手绘空间、笔触显影、分房间叙事 / sketch-textured interactive rooms | React, Three.js and GSAP explicitly stated by creator | Original spatial portfolio with accessible normal-menu fallback; 有普通导航备份的原创空间作品站 |
| 05 | **4WIDE** — [creator case study](https://tympanus.net/codrops/2026/04/23/building-4wide-turning-distortion-blur-and-motion-into-a-coherent-experience/) | 精准扭曲、模糊与动态视觉 / controlled distortion, blur and motion | GSAP + Three.js/WebGL identified in first-person article | Editorial studio website with restrained image distortion; 视觉表达与内容清晰度同测 |
| 06 | **Podium** — [production case study](https://tympanus.net/codrops/2026/06/23/podium-building-a-website-where-running-becomes-storytelling/) | 体育影像连续叙事 / cinematic sport portfolio storytelling | GSAP, Three.js and WebGL identified by studio-authored article | Continuous scroll film reel with readable service information; 连贯影像叙事 |
| 07 | **Dash Creative** — [team's case study](https://tympanus.net/codrops/2026/07/21/magnetic-commerce-building-the-dash-creative-website/) | 吸附式磁力互动、品牌符号 / magnetic cursor-driven mark | Webflow and WebGL cited by the builders | Original 3D cursor-responsive logo to support B2B brand differentiation; 原创响应式品牌标志 |
| 08 | **Chasing the Moment** — [creator's technical article](https://tympanus.net/codrops/2026/10/12/chasing-the-moment/) | 网站像电影、票根导航 / browser-based short film | Three.js, GLSL, GSAP ScrollTrigger, Lenis, Blender and Web Audio detailed in source; mobile transmission fallback | Original cinematic brand opener; precompile shaders, reduced-motion text alternative; 电影开场与移动端降级 |
| 09 | **ULTRAGRID portfolio** — [creator case study index](https://tympanus.net/codrops/tag/case-study/) | 桌面上的 3D 产品和交互导航 / isometric desk as navigation | Blender + Spline + Webflow disclosed in case-study summary | Simple no-code-assisted 3D hero without full game engine; 桌面模型与交互热点 |
| 10 | **21 Hrs On The Moon** — [award case reference](https://github.com/coroboros/research/blob/main/articles/award-winning-websites-2025-2030/winners/awwwards-2026-winners.md) · [site](https://21hrs.space/) | 宇宙场景、漫游叙事 / lunar exploration | Award catalog tags WebGL/3D and audio; camera controls and internal implementation **not verified** | Story-map with numbered chapters; 可探索的品牌空间章节 |
| 11 | **RXN Web Solutions** — [award entry, Nov 3 2026](https://www.webguruawards.com/winners) · [site](https://rxnwebsolutions.com/) | 三维办公室、自动绘制内容 / real-time office and plotter | Award submission describes Blender, Three.js and custom WordPress | 3D studio lobby synced to ordinary SEO-friendly pages; 3D 办公室与普通网页联动 |
| 12 | **Lusion: My Little Storybook** — [studio spotlight](https://tympanus.net/codrops/2026/04/13/lusion-where-digital-craft-meets-ambitious-experimentation/) | 手工童话 3D 场景和交互绘本 / crafted 3D illustrated story | Studio confirms WebGL, hand-built 3D and illustrated animation; no public implementation licence claimed | Original brand storybook with modest assets and coherent color palette; 轻量叙事式品牌网站 |
| 13 | **Bruno Simon Folio** — [live original](https://bruno-simon.com/) · [upstream MIT code](https://github.com/brunosimon/folio-2025) · [existing atlas analysis](../cases/bruno-folio.md) | 真实可驾驶游戏化网站 / playable navigation | Public repository describes Three.js/physics/asset optimization; server part not all released | Purpose-made interactive mini-space for a client, not a replica of the car or world; 原创可探索品牌空间 |
| 14 | **Noho** — [creator/agency production reflection](https://tympanus.net/codrops/tag/case-study/) | 克制动效和产品优先 / restrained, product-first visuals | Case-study index discloses GSAP and WebGL; individual mechanics need direct read | Luxury product layout where motion helps rather than obscures purchase; 用动效辅助转化 |

### Reusable technique sources, not commercial template licenses / 技术教学与源码许可另列

1. [Codrops Interlude: 21 Astro/GSAP/WebGL transitions](https://github.com/codrops/interlude) — **MIT** repository; independently re-design any client art and branding. / Astro 原生路由的完整转场起点，代码 MIT，第三方图片和品牌另核。
2. [Three.js Wave Propagation Grid tutorial](https://tympanus.net/codrops/2026/07/09/building-an-interactive-wave-propagation-cube-grid-with-three-js/) — mouse-following waves, postprocessing and optimization, **tutorial/demo reuse terms must be checked**. / 鼠标波纹、后处理与性能优化；教程不等于自动商用授权。
3. [Lenis](https://github.com/darkroomengineering/lenis) — MIT, native-scroll-based smoothing, reduced-motion behavior. / 平滑滚动与无障碍兼容。
4. [React Three Fiber](https://github.com/pmndrs/react-three-fiber) — MIT React renderer for Three.js. / React 组件式 3D 组织。
5. [Three.js](https://github.com/mrdoob/three.js) — MIT renderer library; models/textures are separately licensed. / 3D 基础库开源，素材独立授权。
6. [GSAP](https://github.com/greensock/GSAP) — available for commercial work under GreenSock's **own no-charge standard license, not MIT**; review full terms before reuse. / 动效及 ScrollTrigger，可商用但不是 MIT 许可证。
7. [Codrops 2026 case-study feed](https://tympanus.net/codrops/tag/case-study/) — first-party case studies, a high-signal ongoing discovery source. / 原作者技术长文，优先于无出处短视频。
8. [Codrops tutorial hub](https://tympanus.net/codrops/hub/tutorials/) — code learning demonstrations, verify each experiment's source and licence. / 技术实验与源码教学逐项核权。
9. [Made with three.js](https://madewiththreejs.com/) — active X-post aggregator with sites, experiments and runnable links. / 从真实 X 原帖追溯到创作者和可运行作品。
10. [CSS Nectar WebGL gallery](https://cssnectar.com/css-gallery/nominees/site-features/webgl/) — discovery/awards, **award placement is not technical proof**. / 获奖索引仅用于发现，栈以原作者为准。

## B. Effect library / 按可出售能力拆解的视觉效果（无内部报价）

| Effect / 效果 | Typical technique / 常用机制 | Suitable websites / 适用客户 | Quality risk / 关键风险 |
|---|---|---|---|
| Cinematic hero / 电影式首屏 | high-resolution editorial photography/video, timeline, masking | 品牌、设计工作室 / brand, studio | 首屏体积、LCP、版权 / asset size, loading, rights |
| Scroll storytelling / 滚动叙事 | GSAP ScrollTrigger + DOM semantic content | 建筑、汽车、文化展陈 / architecture, automotive, exhibitions | 手机滚动、键盘、动态减少 / mobile and accessibility |
| Product 3D / 产品三维展示 | Three.js/R3F + GLB + HDR light + KTX2 | 工业、珠宝、家具 / industrial, jewelry, furniture | 模型质量、性能、授权 / model quality, speed, license |
| Glass/metal shader / 玻璃金属材质 | GLSL/TSL + environment + postprocess | 科技、高端硬件 / tech, premium hardware | 移动端折射成本 / mobile transmission cost |
| Kinetic editorial / 动态排版 | CSS + GSAP text transitions | 创意机构、文化品牌 / agencies, culture | 可读性、布局偏移 / legibility, layout shift |
| Endless gallery / 无限画廊 | virtualized list, pointer drag, WebGL planes | 作品集、艺术馆 / portfolios, galleries | 触屏/键盘无替代 / touch, keyboard fallback |
| Spatial navigation / 空间导航 | Spline or original scene + semantic HTML links | 体验馆、创意品牌 / immersive showrooms | SEO、后退导航、加载 / crawlability and page flow |
| Interactive brand symbol / 品牌互动标志 | stateful hover/drag + shader/GSAP | B2B 品牌 / B2B brand | 花哨盖过营销 CTA / distracts from conversions |

## C. X post watchlist, evidence levels / X 帖子雷达与证据等级

**Seed: 1 permalink, uninspected** — [@BeyondTheBoxCN / status 2118704959223116082](https://x.com/BeyondTheBoxCN/status/2118704959223116082). Original content was inaccessible via this research environment on 2026-11-07. It remains a **pending item**; zero stack claims.

**Discovery lanes / 持续检索线路：**
- X keyword combinations: `("interactive website" OR "creative developer" OR "immersive website") (threejs OR WebGL OR GSAP)`, `"website breakdown" "shader"`, `"built this site" "React Three Fiber"`, `"scroll storytelling" "portfolio"`; inspect creator links and the actual runnable website.
- Follow **creator-authored case studies**, not account reach: Haoqi, Mathias Adolfsson, Juan Mora Romero, ITom/Tomasz Szmajda, Tomoya Okada/4WIDE, Podium builders, Dash Creative, Lusion.
- Discovery directories: Codrops case studies, Awwwards, CSS Nectar, Made with three.js, developer GitHub release notes. A listing is **not** a verified repost.
- New record fields: `post_url`, `author`, `date_posted`, `video_checked`, `official_site`, `original_case_study`, `declared_stack`, `confirmed_license`, `reproduction_status`, `visual_qa`, `conversion_use_case`, `reviewed_on`.
- Evidence statuses: `creator-video-read` > `creator-article-read` > `source-reviewed` > `site-observed` > `award-index-only` > `uninspected-link`.
- Deduplicate by canonical work URL and normalized creator-post URL, not by thumbnail title. / 根据项目网址和作者原帖去重，避免搬运号造成重复。

## D. Independent implementation and validation / 原创实现与验收

1. Study the mechanism, never copy site/brand assets. Produce own Figma art direction + original models/content; confirm every third-party asset's scope. / 只学方法，不直接复刻销售。
2. Build reusable primitives with separate visual and content layers; site remains navigable without WebGL. / 视觉渲染与真实 HTML 内容分离。
3. Define desktop + phone experiences and reduced-motion behavior from the start. / 电脑与手机双端设计、保留无障碍。
4. Record actual Chrome/Edge/Safari observations with screenshot or video, not guessed FPS. Measure p75 Core Web Vitals only when field data exists; distinguish from local Lighthouse. / 必须用真实环境证据，不把 Lighthouse 当真实用户指标。
5. Quality rubric: brand direction 25%, visual craft 25%, interaction coherence 20%, mobile usability 15%, accessible SEO/content 10%, handoff 5%; high visuals cannot override broken navigation. / 视觉高级必须同时可用。
6. Keep **public knowledge** here, and **commercial customer intake, bids, private code, unpublished demos and platform publishing** in the separately permissioned operating repository. / 公共研究与私有商业生产严格隔离。

**Status / 状态:** public reference research only. No claim of reproducing these client websites, launching products, producing new demos or publishing marketplace listings.
