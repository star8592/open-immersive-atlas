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
- **Sequential measurement / 顺序测试** — freezes camera, warms up each available renderer for 40 frames, then takes 120 separate frame samples. After these CPU/browser samples, each backend **if it supports GPU timer queries** executes another **24 isolated render-pass GPU timing queries** with asynchronous readback. Exports JSON including unsupported, disjoint, timeout and partial sampling outcomes; never fills in invented GPU numbers.

The three measurements have different meanings:

1. **JavaScript render/submit-call p95:** wall-clock JavaScript time spent inside synchronous rendering/API submission code. WebGL2 draw calls and WebGPU command encoding can enqueue actual GPU work differently. **This is not GPU execution time and not a directly comparable GPU pass benchmark.**
2. **requestAnimationFrame interval p95:** presentation cadence including CPU, vsync, browser scheduling and compositor. **This is not GPU time.**
3. **GPU render-pass elapsed p95 (new, conditional):** WebGPU uses the `timestamp-query` device feature and a render-pass beginning/end timestamp pair, resolved to a readback buffer and asynchronously mapped. WebGL2 uses `EXT_disjoint_timer_query_webgl2` with `TIME_ELAPSED_EXT`, polling availability and refusing disjoint results. Both timestamps are expressed in nanoseconds and converted to milliseconds. **Only the render pass is measured**; CPU preparation, upload, presentation and the rest of the game frame are outside scope.
4. **Support boundaries:** if either API's query feature is unavailable, the lab reports `unsupported` with `null` p95 instead of invented timings. 24 queries are attempted when supported; dropped/disjoint/timed-out results reduce the collected count and are marked `partial` or `unavailable`.
5. **No universal API ranking:** measured GPU pass times can reflect driver, backend, browser, timer precision, device clock, scene complexity and concurrent workloads. 24 pass samples are an illustrative measurement, not a certified performance comparison.

Even sequential samples have confounders: background browser tasks, GPU clocks, thermal conditions and OS scheduling. / 即使分别测试，也存在时钟、浏览器和操作系统噪声，不能仅凭一次结果排名。

## Compatibility facts / 兼容性事实

WebGPU generally requires HTTPS or localhost and a suitable adapter. This lab attempts a hardware-oriented adapter and displays a real error instead of inventing support.

**Independently observed limitation (2026-11-07):** Linux Chrome 157 headless using the Google SwiftShader software adapter lost the WebGPU device even during an independent minimal three-pass clear test. The reported loss reason was "destroyed" / "Device was destroyed." Consequently, software WebGPU adapters are skipped by default to preserve a usable WebGL2 canvas. For explicit debugging only, the page accepts the URL flag ?allowSoftwareWebGPU — this is not a hardware benchmark mode.

**中文：** 已通过最小清屏程序确认 Linux 无头 Chrome 157 的 SwiftShader WebGPU 软件设备异常销毁，因此默认不将该软件适配器当作可靠 WebGPU 性能设备。必要时可用上述参数进行故障诊断，但不能将其结果与真实显卡比较。

## Independent real-browser acceptance / 双浏览器环境真实验收（2026-11-07）

1. **Linux Z890, Chrome 157, headless SwiftShader:** WebGL2 renderer and fallback tests passed. The independent minimal WebGPU clear-only experiment lost its SwiftShader device with "Device was destroyed." Consequently, the lab correctly recognizes the software adapter and skips it by default.
2. **Windows Chrome, isolated headless browser profile, WebGPU enabled:** both original rendering pipelines initialized with **18,432 triangles / 9,409 vertices / 697 × 300 pixels** and each reached **171 consecutive drawn frames** with WebGL2 error code 0 and WebGPU error code 0.
3. **WebGPU hardware adapter identification:** The isolated Windows Chrome browser identified an adapter with GPUAdapterInfo **vendor = intel**, **architecture = xe-lpg** (not the Google SwiftShader software adapter). A subsequent live-site session rendered 97 frames on each backend with graphics errors 0. This validates that the tested Windows WebGPU path was backed by an Intel graphics adapter, but does not by itself measure GPU execution time.
4. **Windows sequential sample:** both renderers separately completed **40 warm-up frames + 120 measured frames** at the same dimensions and geometry. JS call p95 was approximately 0.10 ms (WebGL2 draw call path) versus 0.30 ms (WebGPU command encoding/submit path); rAF frame interval p95 was approximately 16.8 ms for both.
5. **Interpretation:** The above establishes functional compatibility and successful sequential sampling on the tested Windows browser. These numbers do **not** measure GPU shader or render-pass execution time, and they are not proof that WebGL2 outperforms WebGPU. Device/driver details, thermal conditions and repeated independent GPU-timestamp benchmarks are required for actual hardware speed claims.

**中文说明：** Windows Chrome 同场景两个后端都完成真实绘制，并顺序预热、采样通过。上述 API 调用时间与浏览器帧间隔不能解释为 GPU 算力排名；Linux 无头 SwiftShader 的 WebGPU 失败则通过独立最小程序复现过，属于测试环境的实际局限。

## Real GPU timer query extension / 新增 GPU 通道计时

- Source: [WebGL2 EXT_disjoint_timer_query_webgl2](https://registry.khronos.org/webgl/extensions/EXT_disjoint_timer_query_webgl2/) and [W3C WebGPU render-pass timestampWrites](https://www.w3.org/TR/webgpu/#timestamp-queries).
- `getTimerSupport()` describes capability and a precise unsupported reason; `measureGpuPass()` performs a single independent draw plus asynchronous query readback.
- WebGPU requests the `timestamp-query` optional device feature *only* when supported. If the feature request fails, a normal rendering device remains available without GPU timing.
- GPU timestamps are often quantized or limited for privacy/security and implementation-defined. Small durations can have substantial quantization uncertainty.
- **2026-11-07 first test:** Linux Chrome 157 software WebGL2 exposed the extension and completed 24/24 timer queries. In this **software renderer**, observed values are for the software stack only; **not hardware-GPU throughput evidence**. Windows Intel Xe-LPG WebGPU timestamp support and real hardware timing are tested independently from this result.

`gpuPassMs` in the exported JSON stores `supported`, `method`, `requested`, `collected`, `p50Ms`, `p95Ms`, `status` and `reason`. Any `null` p95 must be interpreted as missing measurement, **never 0 ms**.

## Run / 运行

From repository root / 在仓库根目录运行：

    python3 -m http.server 8000

Open / 打开：

    http://127.0.0.1:8000/labs/renderer-compare/

Core tests / 核心测试：

    node --test labs/renderer-compare/test-core.mjs

Optional real-browser smoke testing uses Playwright and Chrome when already installed; visiting the public site does not install any dependencies.

**Windows built-in Node + Chrome hardware test / Windows 无额外软件硬件验收** (new isolated Chrome profile; does not take over user's existing browser):

    node labs/renderer-compare/test-cdp-windows.cjs

For hard acceptance of both features on a test machine, set environment variables `OIA_REQUIRE_WEBGPU=1` and `OIA_REQUIRE_GPU_TIMESTAMPS=1`. This optional script runs a localhost-only temporary HTTP server, launches a disposable Chrome session, captures the result JSON and cleans up. It requests the experimental browser WebGPU API but uploads no user files.

**Caveat:** a timestamp-query-capable device/driver is required to obtain actual GPU pass values. The script prints `supported=false` and null metrics when the optional feature is unavailable instead of claiming a pass. / 网站零第三方脚本依赖，无需安装 Node 包。

## Implementation details / 实现注意事项

- Both pipelines leave face culling disabled to avoid a mismatch in triangle visibility. The test uses the same shared winding and indices. / 两边统一不裁剪背面，确保同一索引数据不会因裁剪策略产生画面差异。
- WebGL2 clip-space depth is [-1,1], whereas WebGPU clip-space depth is [0,1]. The shared camera projection is converted for WebGPU.
- A single terrain mesh and one indexed draw call are tested, not texture streaming, 3DGS, advanced LOD, GPU culling, collisions or shadows.
- GLSL and WGSL implement near-equivalent equations, but color-space and precision differences can yield non-identical pixels. Do not claim strict image parity without measured reference renders.
- GPU-pass timing is now supported where the platform offers timestamp-query/EXT_disjoint_timer_query_webgl2. Hardware comparisons still require real adapter information, matching viewport dimensions, repeated independent runs, adequate warmup and temperature/clock controls.

Primary platform references: [MDN WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) and [GPUCanvasContext](https://developer.mozilla.org/en-US/docs/Web/API/GPUCanvasContext/configure).

This work is original public educational code. Private game assets, customer data and internal R&D source are not included. / 只公开原创示例，不收录私有游戏源码或商业资产。
