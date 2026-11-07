# Open Immersive Atlas · 开放沉浸式技术图谱

[English / 主 README](README.md) · [一手资料与行业情报雷达](sources.html) · [五线并行研究看板](research.html) · [完整双语目录](CATALOG.md) · [交互检索页](index.html) · [作者技术图谱](creators.html) · [作者档案目录](CREATORS.md)

**我们不是在复刻一个 Three.js，而是在建立一座可持续增长的 3D 技术图书馆。** 收录高质量三维网站、交互游戏、AI 三维工具、渲染算法、开源游戏引擎、资产制作与验收工具。每个项目都有中英文介绍、独特优势、值得学习的实现机制、原作者链接与许可证信息。

**四大分类：** 沉浸式 3D 作品｜AI 3D 工厂｜框架与游戏引擎｜渲染、物理与工程基础设施。当前收录 **122** 条，按真实一手证据和较谨慎的许可表述建档。

## 向整个游戏研发体系扩展（2026-11-07）

这次不再只寻找 3D 或渲染技术。新增 **45 条经过 GitHub 仓库存在性核查的中英双语项目**，涉及可研究的完整 RTS/模拟/RPG 游戏、AI 三维工厂、关卡生成、2D 引擎、联机与社交后端、游戏音频、测试、无障碍和增长分析。目录合计 **122 条**。

另建立一个独立的 **[一手资料与行业情报雷达](sources.html)**，第一批收录 **18 个官方或作者原始来源**：GDC 演讲、开发复盘、IGDA 报告、Steamworks/itch.io 发行分析、Khronos/W3C 标准、素材授权以及前沿论文。资料有时付费，数据也可能只对账号持有人可见；本库只做合法链接和原创摘要，不绕过付费或收集私人数据。

**重点区别：** GitHub 仓库存在，不能证明我们已经安装运行；原作者声称性能提升，不代表我们在自己的 GPU 上复现；开源代码不等于模型权重、素材、音乐和商标全部开放。下一步按真实游戏需求评估和构建独立实验。

[阅读本轮广域研究结论](docs/research/broad-discovery-2026-11-07.md) · [查看完整项目目录](CATALOG.md) · [一手资料 JSON](data/source-radar.json)

## 原创可运行技术实验

新增 **[Spatial Lab 01：原生 WebGL2 地形 LOD 实验](labs/terrain-lod/)**，包含 49 个真实高度场瓦片、自动高低精度选择、颗粒材质、线框查看和 FPS/p95 帧间隔统计。源码完全公开、没有复制私有游戏资产。

在独立 Chrome 软件渲染环境已通过高低精度切换、旋转缩放与开关操作验收；不能将软件渲染帧率当作玩家显卡的性能结果。[查看测试和边界](labs/terrain-lod/README.md)。

**[Spatial Lab 02：GLB/glTF 离线资产检查台](labs/glb-inspector/)** 已完成：在浏览器拖入模型，检查 GLB 分块、BufferView、Accessor、网格引用、节点与变换异常，提供英文/中文问题清单和 JSON 报告。**文件只在本地浏览器处理、不上传，不请求模型携带的外部链接。** 已通过 15 项核心测试和独立 Chrome 交互测试。这是基本结构预检，不是 Khronos 完整标准认证和模型外观验收。[查看边界与源码](labs/glb-inspector/README.md)。

**[Spatial Lab 03：WebGPU / WebGL2 同场景对照实验](labs/renderer-compare/)** 现已实现两套独立原生渲染管线：共用一份原创高度场几何、顶点、索引、相机和相似的 GLSL/WGSL 材质。具备四档几何面数、按后端单独渲染、顺序 40 帧预热 + 120 帧采样、JSON 结果导出。已通过几何与相机数学测试、Linux Chrome 的 WebGL2 降级测试；**另在 Windows Chrome 真实浏览器中实测两套渲染管线各连续绘制 171 帧，并分别完成 120 帧顺序采样，双方图形错误码均为零**。但 JS 提交耗时、浏览器帧间隔并非 GPU 真正执行时间，仍不据此断言哪个 API 性能更好。[技术约束和详细源码](labs/renderer-compare/README.md)。

**真实 GPU 时间戳已接入第三个实验。** WebGPU 使用 `timestamp-query`，WebGL2 使用 `EXT_disjoint_timer_query_webgl2`。Intel Xe-LPG 在 Windows Chrome 中完成四档几何的两套后端计时，每档各 24/24 个有效样本，支持下载含原始采样数据的 JSON 报告。[阅读双语技术研究](docs/cases/gpu-browser-timestamp-queries.md) · [查看匿名化硬件数据](labs/renderer-compare/evidence/2026-11-07-intel-xe-lpg-gpu-timers.json)。此结果不代表所有 GPU 或游戏 WebGPU 都更快。

## 建档的三个原则

**研究技术，而非搬运他人的作品。** 保留原始链接与出处，分析设计机制；不能因开源代码而默认其模型、音乐、云 API 或商标也被授权。

**区别“作者披露”和“我们验证”。** 一手技术笔记与开源代码可以成为研究参考，但只有实际运行和截图/测试记录才能称为本地复现成功。

**公开优秀公开技术，保护私有研发。** 自研未发布的游戏代码、商业策略、资产工厂、未授权素材和凭证完全不进入这里。

## 使用方法

- **直接读：** [CATALOG.md](CATALOG.md)，按分类查找项目。
- **程序引用：** [data/projects.json](data/projects.json)，可用于内部检索系统，只读取公开数据。
- **网页查看：** 运行 `python3 -m http.server 8000`，浏览 `http://localhost:8000/`。网页可以中英切换、关键词检索、分类筛选。
- **贡献条目：** 按 [CONTRIBUTING.md](CONTRIBUTING.md) 填写来源、真实授权状态、中英双语介绍和具体技术亮点。

## 建议第一批阅读顺序

1. **VIPER 11：** 学视觉参考→体积云→真实地形→参数化建模→飞行物理的整条链。
2. **AnyKit：** 学生成式模型如何修到具备真实尺度、统一朝向、纹理预算与 LOD 的游戏资产。
3. **AnyScene：** 学 AI Agent 驱动 Blender 场景的可重建流程。
4. **AnyShot：** 学镜头、运动轨迹、分段渲染与质量检查。
5. **Bruno Simon Folio 2025：** 学开源可玩的 Web 3D 游戏主循环和性能工程。
6. **Three.js / A-Frame / Rapier：** 补足可长期复用的底层结构。

有关版权和隐私边界，见 [SECURITY.md](SECURITY.md)。代码与原创目录采用 [MIT](LICENSE) 许可；第三方项目仍归原作者。

## 深度技术档案

除了双语索引，还完成了十份具有具体工程方法的专题研究：

- [VIPER 11：体积云、真实地形、镜头光学和飞行动力学](docs/cases/viper-11.md)
- [AnyKit：AI 模型尺寸、朝向、材质、LOD 和统一画风](docs/cases/anykit.md)
- [AnyScene + AnyShot：可重建的场景生产与专业镜头渲染](docs/cases/anyscene-anyshot.md)
- [Bruno Simon Folio：真实物理、游戏主循环与 GLB 资源管线](docs/cases/bruno-folio.md)
- [SuperSplat 3.0：GPU 计算架构、流式导出、WebMCP 与大场景内存](docs/cases/supersplat-3-webgpu.md)
- [glTF 资产 QA：结构、几何、材质、碰撞和跨引擎交付](docs/cases/gltf-asset-qa.md)
- [AI 驱动 3D 编辑器：受限操作、视角令牌、撤销历史](docs/cases/web3d-agent-editing.md)

每篇均区分作者已经公开的技术、我们建议的原创实验以及尚未验证的指标。

## 2026-11-07 新增三篇技术档案

- [R3F v10 Alpha：WebGPU 优先、WebGL2 回退和旧 GLSL 兼容](docs/cases/r3f-v10-webgpu-migration.md)
- [React Three Rapier：刚体碰撞、车辆接地、持剑与真实空间交互](docs/cases/react-three-rapier-physics.md)
- [WebXR Samples：空间坐标、手势与设备兼容性](docs/cases/webxr-spatial-interaction.md)

此前一轮将收录数扩至 66 条。新文档是源码研究，不代表内部项目已有测试结果或已生产发布。

## 绘画式自然场景：美术优先专题（2026-11-07）

这次的关键纠偏是：**不要再把风格化三维误解为廉价低面数几何拼装。** 先有植物的美术造型、手绘材质、空间分布与统一光影，再谈 LOD 和实例化优化。

- [《Painterly Nature》公开研究总纲：手绘草木、树冠、地表、水岸、三维水彩融合与可执行验收](docs/cases/painterly-nature-3d-production-playbook.md)
- [《Tiny Delivery》原作者生态场景与材质拆解](docs/cases/sinica-tiny-delivery-environment.md)
- [草地/泥土高度混合、真实接触轮迹技术](docs/cases/sinica-terrain-heightblend-vfx.md)

本轮补入 Tiny Delivery、Dordogne、Tiny Glade、Kayla Kosik Cozy Cottage，以及三项可研究的 Three.js 植被开源技术，此前完成 **73 条双语档案**。私有游戏代码、美术资产及专有试验继续与公开仓库隔离。

## Wildward：从作者公开视频研究驾驶、草和水（2026-11-07）

已经核查 @PlayWildward 的三段实际视频，以及 2026-11-05 的项目介绍：这是一款声称支持一到四人合作的荒野探险项目，公开提到程序化地形、草被接触响应、越野车地形重量感和模拟河流。**引擎、物理求解器和正式源码尚未核实，不能把视觉表现当成完成证明；同名中世纪奇幻网站也未确认属于该账号。**

- [Wildward：视频分镜、公开证据、真实 HTML5 水体/车辆/草地技术路径与独立验收](docs/cases/wildward-procedural-expedition-driving-water.md)
- [按专长搜索作者与团队账号](creators.html) · [完整中英双语作者目录](CREATORS.md)

本轮新增 Wildward、Evan Wallace WebGL Water、jeantimex WebGPU Water、SweK WebGL2 Water 四条可核查条目，**项目库总计 77 条**。作者资料目前是 **16 位个人作者 + 1 个项目账号**，分开分类以免误认团队身份。
