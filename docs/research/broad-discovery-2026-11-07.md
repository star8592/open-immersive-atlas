# Wide Game R&D Discovery — from 3D components to playable games, production and player demand
# 广域游戏研发情报：从 3D 技术扩展到可玩游戏、完整制作流程和真实玩家需求

**Date / 研究批次：** 2026-11-07  
**Project / 项目：** Open Immersive Atlas (OIA)  
**Evidence class / 证据等级：** primary repository existence verified through GitHub / official documentation, followed by original bilingual project annotations. **Not** 45 independent runtime reproductions.  
**New material / 实际收集：** 45 public-repository case records + 18 first-party non-code source references; 77 → **122** bilingual project entries.  
[Projects JSON / 源码项目数据](../../data/projects.json) · [Non-code source radar / 一手资料雷达](../../sources.html) · [Source JSON / 资料数据](../../data/source-radar.json)

## 0. Discovery changes / 改变搜索逻辑

**中文：** 只看 3D 画面，会漏掉真正决定游戏好不好玩的关键技术：循环结构、玩家学习过程、对抗公平性、关卡生成的可解性、音频反馈、社交扩散、发行转化与低配置可用性。因此搜索改为十条横向观察维度，不对某个引擎或审美风格设门槛。

**English:** A technically beautiful Web3D demo is not necessarily a compelling game. Game loops, learnability, fair combat, solvable level generation, audio, shared play, discovery/attribution and accessibility all contribute to a production-quality result. This research batch deliberately spans engine-independent concerns.

### Source classes / 不再混用的四类证据

| Source class | What it establishes / 能证明什么 | What it cannot establish / 不能证明什么 |
|---|---|---|
| Public repository / 开源仓库 | Source is inspectable, architectural choices can be studied | Working runtime on our devices; rights to redistribute art, data and model weights |
| Original paper / 一手论文 | Author method and author-reported benchmarks | Reproduced performance or device compatibility |
| Industry case / 行业复盘 | Team's retrospective, failure reasons, business constraints | Guaranteed popularity or demand for our specific game |
| Official standard, guide, rights / 标准、指导与版权 | Reference requirements and stated license scope | A blanket license for unrelated models, songs, brands or sites |

## 1. Ten expanded discovery axes / 十大搜集方向

| Axis / 研究轴 | High-value sources / 本轮可研究参考 | Applied question / 反推游戏问题 |
|---|---|---|
| GPU & spatial computing / GPU 与空间计算 | [WebSplatter](https://github.com/websplatter/WebSplatter), [WebDGS](https://github.com/krispy-kenay/WebDGS), [GSWT Renderer](https://github.com/zengyf131/gswt_renderer) | Can browser 3DGS scale across NVIDIA/Intel/Apple/mobile without device-loss? / 多架构稳定性和真实显存？ |
| AI geometry / AI 三维 | [Hunyuan3D 2.1](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1), [HunyuanWorld](https://github.com/Tencent-Hunyuan/HunyuanWorld-1.0), [TRELLIS](https://github.com/microsoft/TRELLIS) | Which representations produce game-ready mesh, scale, UV/PBR, and independent LOD? / 如何从高精细展示转到游戏可用？ |
| Procedural world / 程序化关卡 | [WaveFunctionCollapse](https://github.com/mxgmn/WaveFunctionCollapse), [MARTINI](https://github.com/mapbox/martini), [CDLOD](https://github.com/fstrugar/CDLOD) | Are levels **playable**, collision-safe, visually continuous, not merely random? / 有出口可走、不会穿模？ |
| Full-game systems / 完整游戏系统 | [Mindustry](https://github.com/Anuken/Mindustry), [OpenRA](https://github.com/OpenRA/OpenRA), [0 A.D.](https://github.com/0ad/0ad) | How do resource logistics, faction differentiation and opponent AI create strategy? / 不只是战车模型？ |
| Long-session loops / 长局机制 | [OpenTTD](https://github.com/OpenTTD/OpenTTD), [Widelands](https://github.com/widelands/widelands), [Unciv](https://github.com/yairm210/Unciv) | What makes optimization/turn loops compelling without constant content drops? / 可持续可玩性来自哪里？ |
| Story & sandbox / 剧情沙盒 | [Veloren](https://github.com/veloren/veloren), [Endless Sky](https://github.com/endless-sky/endless-sky), [OpenRCT2](https://github.com/OpenRCT2/OpenRCT2) | How to build quests, simulation agents and player goals instead of disconnected missions? / 任务状态与角色行为如何闭环？ |
| Authoring / 制作工具 | [LDtk](https://github.com/deepnight/ldtk), [Tiled](https://github.com/mapeditor/tiled), [Assimp](https://github.com/assimp/assimp) | How to keep maps, entities and assets editable with schema and correct units? / AI 输出如何进入专业工具？ |
| Networking & audio / 联机音效 | [Colyseus](https://github.com/colyseus/colyseus), [Nakama](https://github.com/heroiclabs/nakama), [SpacetimeDB](https://github.com/clockworklabs/SpacetimeDB), [Howler.js](https://github.com/goldfire/howler.js) | Is multiplayer state authoritative, reconnection safe and feedback timed correctly? / 联机与音效是否真实可用？ |
| QA, UX & accessibility / 验收和玩家体验 | [Playwright](https://github.com/microsoft/playwright), [axe-core](https://github.com/dequelabs/axe-core), [Lighthouse](https://github.com/GoogleChrome/lighthouse), [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/) | Can we test real inputs, startup, readable HUD and disabled-player navigation? / 是否真能玩而不仅能打开？ |
| Distribution & demand / 商业发行与需求 | [Steamworks UTM](https://partner.steamgames.com/doc/marketing/utm_analytics), [itch.io creators](https://itch.io/docs/creators/getting-started), [GDC Vault](https://gdcvault.com/browse), [Game Developer Postmortems](https://www.gamedeveloper.com/keyword/postmortems) | Which channel brings qualified players and repeat play? / 不能把曝光与真实玩家混淆 |

The ten axes are **research filters** rather than ten more implementation teams. The five existing technical lanes remain intact; new evidence feeds them, or starts a separate product decision only when a testable demand exists. / 十轴用于搜索归类，不等于新增十组持续运行的 Agent。

## 2. Five high-priority engineering lessons / 五个可直接用于未来实验的结论

### A. Compare across GPU families / 从“我这台能跑”到跨 GPU 可靠

The WebSplatter paper reports cross-device rendering and proposes wait-free radix sorting rather than naively carrying CUDA synchronization to WebGPU. That is an **author result**, not a measured benchmark in OIA. In future OIA 3DGS trials, record WebGPU capability, Intel/NVIDIA/AMD/Apple/phone adapter, memory growth, startup time, GPU pass time and device-loss rate. No blanket claim of 1.1–2.5× improvement can be reused from the paper without reproduction.

**工程动作：** 先把 3DGS 的跨设备失效模式收进测试计划，再考虑优化单 GPU 的最快 FPS。

### B. Learn *game loops* from shipped source, not just screenshots / 优先研究有真实玩法循环的成品源码

[Mindustry](https://github.com/Anuken/Mindustry) couples logistics and RTS/tower defense. [OpenRA](https://github.com/OpenRA/OpenRA) offers inspectable real-time strategy architecture, but its classic franchise assets and trademarks have their own rights. [Widelands](https://github.com/widelands/widelands) and [OpenTTD](https://github.com/OpenTTD/OpenTTD) demonstrate resource bottlenecks and systemic goals. We should compare actual user actions, reward timing, decision diversity and failure recovery, not merely re-skin a game title.

**工程动作：** 对 RTS 原型建立开局前 10 分钟用户行为脚本：发现资源→建造→第一场遭遇→损失→修复→反击，并记录真正的策略选择。

### C. Procedural "looks varied" is not procedural "plays well" / 程序化关卡必须可解

WFC propagates local adjacency constraints, but a pattern-valid map may still lack an accessible exit, meaningful quest triggers or fairness for combat encounters. Test graph connectivity, encounter accessibility, navigation paths, density, sight-lines and guaranteed exit independently. Add bounded retry and explicit failure cases; do not silently publish a dead-end map.

**工程动作：** 生成器输出连通性报告与路径样本，不满足时重建局部区块而非忽略。

### D. Production-ready art is an entire evidence chain / 资产商用要经过证据链

Generated AI geometry is only the first stage. Require source rights, units, orientation, geometry group/mesh naming, LOD, UV/PBR material consistency, glTF validator, independent fixed-camera preview, animation, physics and runtime GPU budgets. [Khronos KTX artist guide](https://github.com/KhronosGroup/3D-Formats-Guidelines/blob/main/KTXArtistGuide.md) distinguishes ETC1S/UASTC by texture role. [Khronos Sample Assets](https://github.khronos.org/glTF-Assets/) contain different **per-asset licenses**. [Poly Haven](https://polyhaven.com/license) and [ambientCG](https://docs.ambientcg.com/license/) publish CC0 asset scope, but website branding/API terms are separate.

**工程动作：** 以原始高模为根生成多个低模，而不是反复从破损低模减面；规则机械件优先考虑参数化几何重建。

### E. User growth requires distinct measurements / 经营游戏要区分点击和真实游玩

Steamworks UTM distinguishes total, trusted and tracked visits, with privacy limits and wishlist/purchase conversions tied to specific conditions; Itch creators' dashboard separately reports views, downloads and purchases. None of these measures by itself establishes a good first-session gameplay experience.

**工程动作：** 保留前端基础事件口径：曝光、详情页访问、启动、首次交互、有效游玩秒数、关卡完成、回访、点赞与评论；以去重、合理用户授权与反刷为前提。内部测试流量必须单列，不能混到真实玩家增长里。

## 3. Source rights are not one Boolean / 授权绝不是“开源就能拿”

- **Code repositories / 仓库：** public source visibility proves inspectability, not any particular commercial grant; consult the exact license, dependencies, dataset/model weights and embedded artwork before adoption.
- **CC0 art / 可授权资源：** Poly Haven, ambientCG and Kenney explicitly document CC0 scope for relevant assets. Record individual source URLs and do not assume site logos or all editorial material are CC0.
- **Game case studies / 游戏案例：** gameplay ideas and technical patterns may be studied, but recognizable art, dialogue, music and brands can retain separate protection even when code is openly published.
- **Research claims / 论文报告：** distinguish authors' measured figures from our own reproduced evidence. Sample count, hardware and method must be disclosed.
- **Private data / 玩家数据：** obtain proper permission before accessing creator dashboards or accounts; publish aggregates rather than individual player data. Never duplicate protected GDC video libraries.

## 4. Next executable tests / 下一批可落地原型

| Priority | Proposed reproducible experiment / 候选实验 | Scope / 边界 |
|---|---|---|
| P0 | RTS production-vs-combat gameplay loop harness / RTS 经济与战斗脚本 | Original units, balanced costs and 10-minute player action simulation |
| P0 | Asset router: regular mechanical shapes vs organic decimation / 规则几何自动分类 | Synthetic meshes, high-poly retained, glTF/visual QA, dimensions |
| P0 | Terrain collision + continuous LOD integrated fixture / 地形碰撞与连续换档联测 | Fixed-step capsule collision, NavMesh, cracks and actual GPU timings |
| P1 | Card/puzzle game prototype tested for real play quality / 卡牌与益智游戏 | Turn state, explanation/tutorial, difficulty curve, completion metrics |
| P1 | Browser analytics data contract + accessibility audit / 数据口径与无障碍 | Anonymous aggregate, internal traffic exclusion, keyboard/gamepad navigation |

**No claim these five new experiments are complete.** The deliverable of this batch is an expanded, source-verified research collection and an explicit prioritization of hypotheses to test. / 本批完成收集与筛选，不冒称五项原型已经上线。

## 5. How the radar should grow / 之后如何真正持续扩展

1. Search broadly across research papers, developer talks, actual games, production code, toolchain docs, player discussions and distribution reports.
2. Retrieve **primary sources** rather than copying secondhand popularity lists. Verify repo existence and source content, identify auth/rate limits and access restrictions.
3. Deduplicate by repository URL, normalized identity and actual overlapping functionality. Preserve independent implementations when technically distinct.
4. Write both zh/en descriptions of **what it does / what makes it special / what to learn**, with concrete benchmarks or experiments.
5. Add a candidate to the project catalog only when substantial and relevant; add standards, marketing references and rights pages to the **separate** original-source radar.
6. Keep source/research/test/deployed status independent, use CI for schema/deterministic catalog regeneration and publish under normal GitHub Pages.
7. Prioritize by player and customer problems, technical merit and measured effect, not star count, promotional claims or novelty alone.

This is a dated collection. It does **not** represent an autonomous always-on crawler unless a separate authorized scheduled process is actually installed and observed.
