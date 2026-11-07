# Spatial Lab 03 — WebGPU / WebGL2 Render API Comparison
# Spatial Lab 03 — WebGPU 与 WebGL2 同场景对照

[Live demo / 在线实验](https://star8592.github.io/open-immersive-atlas/labs/renderer-compare/) · [Shared geometry](scene.mjs) · [Renderer code](renderers.mjs) · [Tests](test-core.mjs)

## Why this lab exists / 研究目标

**中文：** 使用完全原创的确定性地形网格，分别在 WebGL2/GLSL 和 WebGPU/WGSL 中进行渲染。共用顶点、法线、索引、相机和尽可能一致的光照、距离雾和配色方程。实验目标是验证双后端、正确的深度坐标转换、可重复测试和兼容性回退，而不是提前宣布哪种 API 更快。

**English:** Both native pipelines render the same deterministic original terrain mesh, camera and near-equivalent shader equations. The focus is correct WebGPU/WebGL2 integration, robust fallback and reproducible browser observations — not declaring a performance winner.

## Fixed geometry / 固定工作量

| Grid / 细分 | Triangles / 三角面 | Vertices / 顶点 |
|---:|---:|---:|
| 48 × 48 | 4,608 | 2,401 |
| 96 × 96 | 18,432 | 9,409 |
| 160 × 160 | 51,200 | 25,921 |
| 256 × 256 | 131,072 | 66,049 |

Both backends receive identical Float32 vertex buffers and Uint32 indices. There are no third-party meshes, textures, CDNs, customer assets or private game code.

## Modes and measurement / 模式与测量

- **Both / 双画面对照** — shows both canvases for qualitative comparison; not a controlled throughput benchmark.
- **WebGL2 only / 仅 WebGL2** — stable fallback and compatibility check.
- **WebGPU only / 仅 WebGPU** — tests the real native WebGPU pipeline, if supported.
- **Sequential measurement / 顺序测试** — freezes camera, warms up each available renderer for 40 frames, then takes 120 separate frame samples. Exports local JSON with frame intervals and synchronous API-call statistics.

The two measurements have different meanings:

1. **JavaScript render/submit-call p95:** wall-clock JavaScript time spent inside synchronous rendering/API submission code. WebGL2 draw calls and WebGPU command encoding can enqueue actual GPU work differently. **This is not GPU execution time and not a directly comparable GPU pass benchmark.**
2. **requestAnimationFrame interval p95:** presentation cadence including CPU, vsync, browser scheduling and compositor. **This is not GPU time.**
3. **No independent GPU timestamp query** is collected in the first edition. No claim of raw GPU throughput, VRAM cost, hardware FPS superiority or exact color pixel equality is supported.

Even sequential samples have confounders: background browser tasks, GPU clocks, thermal conditions and OS scheduling. / 即使分别测试，也存在时钟、浏览器和操作系统噪声，不能仅凭一次结果排名。

## Compatibility facts / 兼容性事实

WebGPU generally requires HTTPS or localhost and a suitable adapter. This lab attempts a hardware-oriented adapter and displays a real error instead of inventing support.

**Independently observed limitation (2026-11-07):** Linux Chrome 157 headless using the Google SwiftShader software adapter lost the WebGPU device even during an independent minimal three-pass clear test. The reported loss reason was "destroyed" / "Device was destroyed." Consequently, software WebGPU adapters are skipped by default to preserve a usable WebGL2 canvas. For explicit debugging only, the page accepts the URL flag ?allowSoftwareWebGPU — this is not a hardware benchmark mode.

**中文：** 已通过最小清屏程序确认 Linux 无头 Chrome 157 的 SwiftShader WebGPU 软件设备异常销毁，因此默认不将该软件适配器当作可靠 WebGPU 性能设备。必要时可用上述参数进行故障诊断，但不能将其结果与真实显卡比较。

## Run / 运行

From repository root / 在仓库根目录运行：

    python3 -m http.server 8000

Open / 打开：

    http://127.0.0.1:8000/labs/renderer-compare/

Core tests / 核心测试：

    node --test labs/renderer-compare/test-core.mjs

Optional real-browser smoke testing uses Playwright and Chrome when already installed; visiting the public site does not install any dependencies. / 网站零第三方脚本依赖，无需安装 Node 包。

## Implementation details / 实现注意事项

- WebGL2 clip-space depth is [-1,1], whereas WebGPU clip-space depth is [0,1]. The shared camera projection is converted for WebGPU.
- A single terrain mesh and one indexed draw call are tested, not texture streaming, 3DGS, advanced LOD, GPU culling, collisions or shadows.
- GLSL and WGSL implement near-equivalent equations, but color-space and precision differences can yield non-identical pixels. Do not claim strict image parity without measured reference renders.
- Actual GPU performance analysis should use hardware validation, real adapter information, viewport pixels, repeated runs, warmup, and optional timestamp queries where supported.

Primary platform references: [MDN WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) and [GPUCanvasContext](https://developer.mozilla.org/en-US/docs/Web/API/GPUCanvasContext/configure).

This work is original public educational code. Private game assets, customer data and internal R&D source are not included. / 只公开原创示例，不收录私有游戏源码或商业资产。
