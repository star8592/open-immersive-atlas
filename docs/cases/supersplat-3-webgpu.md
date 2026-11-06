# SuperSplat 3.0: A WebGPU-first editor, not just a prettier renderer
# SuperSplat 3.0：让浏览器三维编辑器跨越内存瓶颈

**Primary sources / 一手来源**

- [SuperSplat official repository / 开源编辑器](https://github.com/playcanvas/supersplat)
- [Author engineering post / 作者技术文章 (2026-09-09)](https://github.com/playcanvas/blog/blob/main/blog/2026-09-09-new-in-supersplat-editor-3-0-rebuilt-on-webgpu.md)
- [Native browser WebMCP contract / 原生 WebMCP 接口规范](https://github.com/playcanvas/supersplat/blob/main/docs/webmcp.md)
- [SuperSplat viewer / 独立静态 Viewer](https://github.com/playcanvas/supersplat-viewer)
- [splat-transform CLI / 格式与 LOD 处理](https://github.com/playcanvas/splat-transform)
- [PlayCanvas hosted/open component boundary / 开源与托管边界](https://developer.playcanvas.com/user-manual/gaussian-splatting/editing/supersplat/)

**Evidence:** primary author engineering post + publicly available README/code/documentation, **not** local GPU benchmark.  
**Rights:** Editor, Viewer, SplatTransform code MIT; hosted Studio, Manage, scene publishing API and other hosted surfaces are proprietary. Imported scans, photos, models and account data have separate rights. / 三个核心工具 MIT，托管平台专有，场景和用户素材另审。

## 1. The engineering breakthrough / 工程突破是什么？

**中文：** 这次改版不仅更换渲染 API，而是把数据模型和图形计算职责一起重新设计。旧版在 JavaScript 端保留过多完整场景与排序数据，大场景编辑和导出容易触及内存限制。3.0 改为分块 GPU 存储，只有较小的逐 Gaussian 可编辑状态，投影、视锥剔除、GPU radix sort、选区、统计和提交绘制都在 GPU 上实现。导出也变为流式处理。

**English:** The 3.0 release rethinks both data ownership and rendering. Instead of keeping large complete scene copies and sort buffers in JavaScript, it stores Gaussian data in chunked GPU buffers and keeps a smaller editable instance list. Projection, culling, radix sorting, selection, statistics and draw submission move to GPU compute. Exports stream incrementally, avoiding full scene materialization.

### Source-author benchmark / 作者原始基准

**Same 4.4-million-Gaussian / 990 MB PLY scene; JavaScript heap, not total GPU memory.** 以下为作者披露的**同一场景 JavaScript 堆内存**，不是显存、也不是本项目实测。

| Operation / 操作 | Editor 2.x | Editor 3.0 | Difference / 差异 |
|---|---:|---:|---|
| Scene loaded, idle / 静置 | 1,557 MB | 105 MB | -93.3% |
| Save PLY / 保存 | 1,722 MB | 623 MB | -63.8% |
| Save compressed PLY / 压缩保存 | 2,982 MB | 1,759 MB | -41.0% |
| Save .ssproj / 工程保存 | 1,723 MB | 790 MB | -54.1% |
| Publish / 发布 | 1,934 MB | 741 MB | -61.7% |
| Render 1080p video / 渲染视频 | 1,673 MB | 142 MB | -91.5% |

The measurements are reported by the project developer; they require independent reproduction before being described as our results. / 上述提升为官方作者测试数据，未经本项目独立复现。

## 2. Four transferable mechanisms / 四项可迁移工程技术

### A. Data residency / 数据驻留位置

**中文：** 让大体积场景“留在 GPU”，而不是每次操作都复制成 JS 对象数组。结构化编辑属性按块存储，CPU 只保存可识别、可追踪的小型状态。这个经验适用于百万面模型浏览器和云端大型三维资产预览，前提是区分 GPU VRAM 与 JS 堆的预算。

**English:** Keep large spatial arrays GPU-resident; keep only compact identity/command state on CPU. This improves JavaScript heap pressure but does **not** eliminate GPU VRAM limits, upload costs or synchronization barriers.

### B. Sort only when needed / 交互时不必总进行全精度排序

**中文：** SuperSplat 3.0 提供 Stochastic Alpha 模式，在复杂场景快速运动时改为近似的顺序无关渲染，静止后恢复排序融合。Auto 模式按真实排序帧成本判断是否进入近似路径。这样做的哲学是“用户正在操作，先保证可控；用户停下观察，再恢复精细画质”。

**English:** Stochastic Alpha uses a sort-free, depth-tested coverage approximation during expensive camera movement, then returns to sorted blending when the view settles. Its auto decision is performance-sensitive, not simply a permanent low-quality switch.

**Caution:** A sort-free approximation can change transparency, edge noise and accumulation behavior. / 近似透明不是零代价；需要观测噪声、轮廓差异。

### C. Depth-aware editing / 三维编辑与遮挡有真实空间关系

**中文：** Sphere Brush 在实际被选中的表面定位路径，遇到深度断层自动断开；可切换“只选可见表面”和“是否考虑整个 Gaussian 面积”。这对高复杂模型的分区选择、清理悬浮点及局部材质修改非常重要。

**English:** Sphere Brush depth-picks surface positions; selection strokes split across depth discontinuities. Visible-only and full-footprint selection distinguish front surfaces from hidden geometry. These ideas transfer to brush editing, CAD selection and cleanup workflows.

### D. First-class WebMCP tools / 浏览器原生可调用的三维编辑接口

**中文：** SuperSplat 公开 WebMCP 规范，登记了 29 个工具，包括读取场景与层、区域选择、变换、相机、关键帧、Undo/Redo、导入导出。API 与用户 UI 操作进入**同一编辑器命令队列和撤销历史**。最值得学习的是：
1. 使用层 ID，不以可能重名的标签识别对象；
2. 改动必须明确作用域（选区或层）；
3. 视角相关操作必须携带 `viewToken`，过期则失败，避免模型在镜头移动后选错；
4. 编辑可 Undo，重复请求要明确是 Preview 还是 Commit；
5. 不对外提供任意执行 JavaScript 的万能接口。

**English:** The project documents 29 native browser WebMCP tools spanning inspection, selection, transforms, camera and timeline, undo/redo and import/export. Its key lesson is **one typed command queue and one undo history for agents and humans**, with stable numeric layer IDs, explicit target scope, view tokens for camera-dependent actions and preview-vs-commit semantics. Browser support is experimental; do not assume universal deployment.

## 3. Renderer / Viewer / Hosted service are different / 三层产品不能混淆

| Layer / 层 | Role / 职责 | Published rights / 公开边界 |
|---|---|---|
| SuperSplat **Editor** | Editing and optimizing in browser / 浏览器编辑 | Open-source MIT |
| **Viewer** | Self-hostable static viewing; WebGPU with WebGL fallback, independent collision/scene inputs / 可自托管静态展示 | Open-source MIT |
| **SplatTransform** | CLI conversion, filter, compression, streamed LOD, collision output / 资产批处理 | Open-source MIT |
| Hosted **Studio/Manage/API** | Accounts, collaboration-like curation, distribution and service / 平台服务 | Proprietary |

**Important:** Editor 3.0 is WebGPU-only; the Viewer has an automatic WebGL fallback. Do not flatten them into the statement “SuperSplat 3.0 supports WebGL fallback.” / **重点纠错：** 编辑器 3.0 仅支持 WebGPU；独立 Viewer 才支持 WebGL 回退。

## 4. Original experiments / 可合法复现的工程实验

- **E1 memory:** benchmark a synthetic 1M / 3M splat sequence; report JS heap, GPU buffer allocation, frame p95 and first usable frame separately. / 用合成样本分别测 JS 堆、GPU 缓存、p95 帧时及首个可用画面。
- **E2 interaction fidelity:** compare sorted blending and stochastic approximations during orbit, stop and zoom. / 相机移动和停止前后对照透明融合的噪声与轮廓。
- **E3 workflow:** convert the same rights-cleared synthetic PLY to SOG and Streamed SOG, verify file size and progressively rendered LOD. / 将授权样本转换为 SOG/Streamed SOG，验证体积与渐进加载。
- **E4 agent safety:** build a tiny editable scene with `get_scene`, `select_region`, `transform`, `undo`, `redo`, using layer IDs, explicit scope and stale view tokens. / 在原创最小场景实现有限的语义化可撤销编辑，不提供任意命令。
- **E5 physics:** layer collision GLB over a splat, prove camera and player do not move through walls; splat color alone is not collision geometry. / 单独加载碰撞网格，验证用户不会穿墙。

## 5. Operational caution / 实际工程限制

WebGPU compute support depends on platform/browser/driver. A browser editor should show a meaningful fallback message if compute is unavailable; the playback viewer can use a separate compatible renderer. Large AI models or GPU jobs should not be started by simply reading this catalog. / 阅读研究档案不会启动耗显存实验，测试前先核对显卡、权限和成本。

This is independent bilingual analysis of cited public sources, not copied upstream source or an assertion that the original software was installed here. / 本文为公开资料的原创中英技术分析，非第三方代码搬运。
