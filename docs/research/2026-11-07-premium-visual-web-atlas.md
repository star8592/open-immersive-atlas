# Premium Immersive Web Atlas / 高端视觉网站技术案例库 — 2026-11-07

> **Public research, not a template store. / 公开研究，不是模板转售库。**
> Original creator work, linked for analysis only. No screenshots, site source, brands, client art, video or proprietary assets are republished. Source disclosed ≠ ours reproduced. This document does not include private client pricing, recipes, sales automation or unpublished proprietary code.

## Mission / 目标

**中文：** 专门收集优秀的高级视觉网站及其原作者帖子、技术复盘、可合法使用的框架，重点研究视觉质感、排版、动效、三维交互、响应式体验和实际业务价值。建立「作品 → 原作者与原帖 → 技术机制 → 可独立重建的原创练习 → 设备验收」链，而不是只收藏好看图片。面向中文市场的高级品牌网站、产品展厅和创意机构网站的技术学习，**不向买家转卖第三方模板、素材或网站源码**。

**English:** Curate outstanding visual websites and first-party creator posts, annotated with verifiable engineering mechanisms, legal reuse boundaries, independent original study ideas and practical device tests. Prioritize art direction plus working interaction; no redistribution of another studio's production work.

**Original X post now independently text-verified in existing signed-in Chrome / 原帖已通过已登录设备核验正文：** [@BeyondTheBoxCN / status 2118704959223116082](https://x.com/BeyondTheBoxCN/status/2118704959223116082). The first external text fetch returned 403, but this is *not* an access failure for the user's existing Z890 Chrome session. A DevControl/Zoria browser snapshot successfully read the original Chinese post and discussion. Topic: **Chrome 157 HTML-in-Canvas**; embedded @clockmaker video seen in the DOM, frames not yet independently examined. The Chrome developer blog independently confirms stable API shipping on 2026-10-26. / Z890 已登录 Chrome 成功读取正文；最初外部网页抓取 403 并不意味着用户设备无法浏览 X，视频帧仍待逐帧核对。

## Priority technology: Chrome 157 HTML-in-Canvas / 优先研究：原生可交互 HTML 进入 3D 场景

**Primary evidence / 一手官方资料:** [Chrome official release, Oct 26 2026](https://developer.chrome.com/blog/html-in-canvas), [API overview](https://developer.chrome.com/docs/web-platform/html-in-canvas), [WebGL/WebGPU UI guide](https://developer.chrome.com/docs/modern-web-guidance/guides/visual-design/interactive-content-in-3d-scenes), [WICG explainer](https://github.com/WICG/html-in-canvas).

**Actual user-supplied post:** Z890 existing signed-in Chrome + DevControl/Zoria browser snapshot; no new login required. It describes future 3D malls, in-world websites and factory dashboards and links embedded @clockmaker media. Independent video frame review remains outstanding.

**Verified implementation:** `<canvas content="drawable">` + descendant `drawable`, Canvas2D `drawElementImage()`; for 3D, WebGL/WebGPU integration and `canvas.updateElementGeometry()` keep interactive DOM geometry aligned. Browser still supports screen readers, find-in-page and form controls per official docs. Chrome 157 ships API stable; **not** universal Chrome/Firefox/Safari equivalence. Check feature support and retain a semantic HTML experience on unsupported browsers. Three.js `THREE.HTMLTexture` is experimental; PlayCanvas, Babylon.js and PixiJS also have APIs, but require version-specific QA. / HTML 保留真实可操作性，但所有功能和兼容性都要本机测，不能凭帖子等同已验收。

**Prioritized original demos / 下一批原创演示选题：**
- **3D equipment showroom** — clickable GLB machine with live HTML specification/quotation cards bound to product hotspots; semantic normal product page fallback. / 工业设备三维展厅带原生参数表单。
- **3D retail showroom** — original mall scene with product catalog and clickable cart, standard HTML storefront behind the immersion layer. / 3D 商场商品卡、正常的购物导航。
- **3D operations dashboard** — fictional factory devices with interactive machine telemetry forms; fabricated test data labeled as demonstration. / 工厂数字孪生演示，不接真实控制权、不伪造生产数据。
- **Cinematic web content composer** — WebGL shader over real editable, selectable, translatable DOM; export demo with browser-specific support checks. / 真正可选中、可编辑、可搜索的电影式网页内容。

**Commercial boundary:** original architecture and art only; never sell copied third-party X videos. Device compatibility/feature detection and performance evidence are mandatory before claiming the API is production-ready on a customer's browser.

### Verified original media chain / 已通过用户浏览器追到的视频原作者

The signed-in Z890 Chrome X post links to **[@clockmaker's X video](https://x.com/clockmaker/status/2118490890927067597/video/1)**. This precise video URL was obtained by activating the `clockmaker` reference in the original @BeyondTheBoxCN post, not guessed from the external X crawler. Original author is **Yasunobu Ikeda (池田泰延), ICS MEDIA**, and a first-party [HTML-in-Canvas technical article published by ICS MEDIA](https://ics.media/entry/260825/) provides three reproducible demonstrations: one-shot `drawElementImage`, automatic `paint/requestPaint`, and transformed yet interactive 2D DOM. / 从用户 X 原帖点开后取得准确的原作者视频链接，进一步找到 ICS 原创教程和三个演示；不得声称已对视频逐帧审核。

A **private original implementation** now exists: [three premium visual web demo sources in CommerceFlow](https://github.com/star8592/CommerceFlow/tree/main/demos/premium-visual-web) — accessible to repository collaborators only. Six software-browser responsive/interaction tests passed, plus a separate Z890 Chrome157 headless SwiftShader smoke returned `WebGL2 ACTIVE` and native Canvas2D HTML-in-Canvas paint. **This is not a reproduction of @clockmaker's audiovisual work or a claim of client deployment.** / 技术方法的原创实验已完成第一版，未复制作者视频与美术作品。

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

## B2. Direct X post shortlist and feed audit / 最新 X 原帖实录

**Machine-readable bilingual records / 双语结构化档案：** [data/creative-visual-web-x-posts.json](../../data/creative-visual-web-x-posts.json) — **10 original X permalinks traced through a third-party archive + 1 user original X DOM-verified in signed-in Z890 Chrome**. Each item has author/date/post permalink/archived transcription/brand link/explicitly disclosed technology/rights and reproduction state. 10 archived-media records were **not independently played**; the user-supplied X source was separately text-verified directly in Chrome. / 第三方归档的10条并未逐帧播放，用户提供的一条 X 原帖则已在本机浏览器直接读取正文与评论。 / 10 条追溯 X 原帖及第三方归档的记录、1 条尚无法读取的用户原帖；我们没有冒称在 X 上独立播放了全部视频。

| Work / 作品 | Original X post / 原帖 | Confirmed details / 已有依据 | How it transfers to original client work / 可学习点 |
|---|---|---|---|
| **Overworld Audio** | [@greensock 2026-11-04](https://x.com/greensock/status/2117685463205171492) | GSAP quote explicitly names Three.js, VueJS, WebGL; blue 3D audio-world maze and camera fly-through. / 蓝色 3D 迷宫与滚动飞行 | Original sound-studio immersive lobby / 原创声音工作室交互首页 |
| **Jolt** | [@rafaelaugustoms 2026-11-05](https://x.com/rafaelaugustoms/status/2118061715359494310) | Author explicitly names Jolt Web as experimental, spring-driven shaders and liquid masks. / 弹簧驱动 Shader | Premium software hero with original geometry; do not promise untested production support. / 高端软件动效 |
| **Relevo & Vinco** | [@greensock 2026-11-04](https://x.com/greensock/status/2118007670582165879) | GSAP ScrollTrigger, ScrollSmoother, SplitText, ScrollTo, SVG, reduced motion disclosed; paper embossing visual. / 压印纸纹与滚动叙事 | Industrial materials and craft manufacturer identity / 制造与印刷行业高端官网 |
| **Plum Autumn Release** | [@tanish2k 2026-11-04](https://x.com/tanish2k/status/2117812560917561378) | Creator's seasonal release story and skydiving landing page; technical stack unverified. / 滚动跳伞叙事 | Original yearly product reveal / 年度品牌发布 |
| **DeepBook** | [@Holographikco 2026-11-03](https://x.com/Holographikco/status/2117638168333721733) | Creator reports Awwwards Site of the Day + Developer Award, cinematic trader and monochrome product dials. / 电影化金融科技视觉 | Fintech brand launch; do not imply award or technical stack for our work. / 金融品牌官网 |
| **Syndicator** | [@y_molodtsov 2026-11-05](https://x.com/y_molodtsov/status/2118014408110579987) | Product supporter credits designer @karlov_zip; editorial typography and UI demo. / 优质排版与真实产品展示 | High-end SaaS page without expensive WebGL / 低技术成本高设计感 |
| **RoutingCat** | [@c_emile_c 2026-11-04](https://x.com/c_emile_c/status/2117720852821385417) | Product-builder post; cream/red typographic system + metrics UI. / 奶油色与红字的品牌系统 | Conversion-driven AI product branding / B2B产品视觉 |
| **Simsalasim** | [@KDHabibi 2026-11-03](https://x.com/KDHabibi/status/2117578808404365701) | Founder reports site launch; neon gradients and portrait cards. / 渐变摄影与大卡片 | Consumer tech branding / 消费科技视觉 |
| **Denada** | [@orpetron 2026-11-03](https://x.com/orpetron/status/2117625777365688579) | Award curator, **not original studio**; retro static / pastel product site. / 奖项机构分享非作者技术复盘 | Food and beverage brand visuals / 食品品牌 |
| **Shift Robotics** | [@orpetron 2026-11-03](https://x.com/orpetron/status/2117631823563932073) | Award curator, **not original studio**; full-bleed video and hardware selling points. / 硬件商品视觉叙事 | Premium physical-product showcase / 智能硬件品牌 |

### Collection engines / 长期筛选入口

- [WHAT NEW IN X — Landing Page Design](https://x.yrzhe.top/en/c/landing-pages): a **third-party X post index** with **252 records shown on the inspected 2026-11-07 collection page** (the index changes dynamically). Captures original permalinks and descriptions; prioritize original maker disclosure over reshare/awards. / 可通过类别筛选动效、3D、WebGL 与行业。
- [Landing Love — collection](https://www.landing.love/collection/): full-page site recordings, category selectors for 3D / GSAP / Three.js / WebGL. **Counts vary by crawl**; directory membership alone is not a rights grant or benchmark. / 可逐个研究可交互页面完整体验。
- [Codrops author case studies](https://tympanus.net/codrops/tag/case-study/): source-grounded implementation notes and production postmortems; pair with creator posts. / 由演示回溯作者工程复盘。

**Verification discipline / 来源证据分层：** author X post mirrored by independent index ≠ original platform opened; original creator's technology disclosure ≠ our own reproducing the website; visual style resemblance ≠ asset licence or permission to reuse branded work. / 账号内容、真实技术和版权授权严格区分。

## C. X post watchlist, evidence levels / X 帖子雷达与证据等级

**Seed: original X post directly text-inspected / 原帖已直接读取** — [@BeyondTheBoxCN / status 2118704959223116082](https://x.com/BeyondTheBoxCN/status/2118704959223116082). Existing Z890 signed-in Chrome accessible via DevControl/Zoria; post explains interactive HTML surfaces inside Canvas and imagines an explorable 3D mall, in-game live website and 3D factory operations UI. The attached @clockmaker video appeared in accessibility metadata; visuals not independently frame-audited. Official Chrome reference: [HTML-in-Canvas in Chrome 157](https://developer.chrome.com/blog/html-in-canvas). Browser support: Chrome 157+ and capability-dependent; implement detection and normal DOM fallback. / 已用真实登录设备核验正文，Chrome 157 正式上线不意味着所有浏览器兼容。

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
