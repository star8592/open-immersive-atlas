# Open Immersive Atlas · 开放沉浸式技术图谱

[English / 主 README](README.md) · [完整双语目录](CATALOG.md) · [交互检索页](index.html)

**我们不是在复刻一个 Three.js，而是在建立一座可持续增长的 3D 技术图书馆。** 收录高质量三维网站、交互游戏、AI 三维工具、渲染算法、开源游戏引擎、资产制作与验收工具。每个项目都有中英文介绍、独特优势、值得学习的实现机制、原作者链接与许可证信息。

**四大分类：** 沉浸式 3D 作品｜AI 3D 工厂｜框架与游戏引擎｜渲染、物理与工程基础设施。当前收录 **66** 条，按真实一手证据和较谨慎的许可表述建档。

## 原创可运行技术实验

新增 **[Spatial Lab 01：原生 WebGL2 地形 LOD 实验](labs/terrain-lod/)**，包含 49 个真实高度场瓦片、自动高低精度选择、颗粒材质、线框查看和 FPS/p95 帧间隔统计。源码完全公开、没有复制私有游戏资产。

在独立 Chrome 软件渲染环境已通过高低精度切换、旋转缩放与开关操作验收；不能将软件渲染帧率当作玩家显卡的性能结果。[查看测试和边界](labs/terrain-lod/README.md)。

**[Spatial Lab 02：GLB/glTF 离线资产检查台](labs/glb-inspector/)** 已完成：在浏览器拖入模型，检查 GLB 分块、BufferView、Accessor、网格引用、节点与变换异常，提供英文/中文问题清单和 JSON 报告。**文件只在本地浏览器处理、不上传，不请求模型携带的外部链接。** 已通过 15 项核心测试和独立 Chrome 交互测试。这是基本结构预检，不是 Khronos 完整标准认证和模型外观验收。[查看边界与源码](labs/glb-inspector/README.md)。

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

本轮将收录数扩至 66 条。新文档是源码研究，不代表内部项目已有测试结果或已生产发布。
