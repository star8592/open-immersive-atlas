# Real GPU timer queries across WebGL2 and WebGPU
# 真正测量 GPU 渲染时间：WebGL2 / WebGPU 的同场景实证

**Evidence class / 证据等级：** original code + unit tests + isolated real-browser execution + four anonymized hardware test records. / 原创源码、单测、独立浏览器与四档硬件实测，不只是作者文章。

## Primary platform sources / 一手标准

- [W3C WebGPU — Timestamp Queries](https://www.w3.org/TR/webgpu/#timestamp-queries): render-pass beginning/end timestamps, feature requirements and implementation-defined precision.
- [W3C WebGPU — Render Pass Timestamp Writes](https://www.w3.org/TR/webgpu/#dom-gpurenderpasstimestampwrites): query set and begin/end pass indices.
- [Khronos WebGL2 EXT_disjoint_timer_query_webgl2](https://registry.khronos.org/webgl/extensions/EXT_disjoint_timer_query_webgl2/): elapsed-time queries, asynchronous result readback and GPU disjoint handling.
- [Original code / 原创代码](../../labs/renderer-compare/renderers.mjs) · [Timer normalization / 计时统计](../../labs/renderer-compare/timing.mjs) · [Real-browser CDP test / Chrome 免依赖测试](../../labs/renderer-compare/test-cdp-windows.cjs)
- [Machine-readable test evidence / 可机器读取的四档实测](../../labs/renderer-compare/evidence/2026-11-07-intel-xe-lpg-gpu-timers.json)

## Why p95 FPS is insufficient / 为什么 FPS 不等于 GPU 耗时？

**中文：** requestAnimationFrame 时间间隔包含浏览器调度、显示器同步、CPU 计算、合成与渲染等因素；JavaScript 对 WebGL2 提交绘制命令，或编码 WebGPU CommandBuffer 的耗时，也不等于 GPU 真正执行这些命令的时间。需要专门的 GPU 计时查询。

**English:** requestAnimationFrame interval is affected by scheduling, vsync and the compositor; JavaScript draw/submit duration measures synchronous CPU-side API work, not asynchronous GPU execution. GPU timer queries provide a separate observable quantity.

### Three separate metrics / 三项独立指标

| Metric | Chinese definition / 中文定义 | What it excludes / 不包含 |
|---|---|---|
| JS call p95 | JavaScript API 调用耗时 | Actual full GPU execution; driver work scheduled later |
| rAF interval p95 | 浏览器帧间隔 | Exact GPU render-pass time |
| GPU pass p50/p95 | GPU 计时查询所包围的渲染命令执行跨度 | Presentation, full game loop, texture loading, end-to-end input latency |

## Original implementation / 原创实现思路

**WebGL2:** Check for `EXT_disjoint_timer_query_webgl2`. Create one `WebGLQuery`, call `beginQuery(ext.TIME_ELAPSED_EXT)`, render, then `endQuery`. On subsequent event-loop turns, check `QUERY_RESULT_AVAILABLE` and `GPU_DISJOINT_EXT`. Only accept available, non-disjoint elapsed nanoseconds. A timeout or disjoint result is **missing data**, not 0 milliseconds. / 后续异步获取结果，拒绝异常和超时样本。

**WebGPU:** Check `GPUAdapter.features` for `timestamp-query`, request that optional device feature if available, and attach a two-index `timestampWrites` block to the render pass. Resolve query values into a buffer and copy to a `MAP_READ` staging buffer. Only after asynchronous `mapAsync()` completion, convert the two 64-bit nanosecond timestamps to milliseconds. If feature negotiation fails, obtain a normal GPU device without timestamp queries. / 特性不存在时仍保留基本渲染功能。

**Isolation / 隔离：** Each renderer completes 40 warmup + 120 browser-frame samples, then (if supported) 24 independent GPU timer queries. The alternative backend is not concurrently rendered during GPU query sampling. / 测量时不同时执行另一个后端的 GPU 绘制。

**Statistical integrity / 数据完整性：** Requested and collected counts, method, status, rejection reason, median and p95 are reported per backend. Unsupported = `null` timing; partial or disjoint sampling is labeled rather than silently replaced with a 0. / 严禁填入伪造的零值。

## Intel Xe-LPG / Chrome 156 real-browser observation

The test used a disposable headless Chrome profile on Windows with an actual Intel Xe-LPG adapter; both pipelines shared **the same original geometry, 697×300 viewport, camera, fog setting and no backface culling**. GPU-timing features were available for both APIs. Each row is **one separate browser session**, and **each API collected 24/24 GPU-query samples**.

| Geometry | WebGL2 GPU pass p50 | WebGL2 p95 | WebGPU GPU pass p50 | WebGPU p95 |
|---|---:|---:|---:|---:|
| 4,608 triangles | 0.0676 ms | 0.1419 ms | 0.0230 ms | 0.0423 ms |
| 18,432 triangles | 0.0726 ms | 0.6460 ms | 0.0269 ms | 0.0706 ms |
| 51,200 triangles | 0.1105 ms | 0.9675 ms | 0.0740 ms | 0.1961 ms |
| 131,072 triangles | 0.2074 ms | 0.3672 ms | 0.1703 ms | 0.3323 ms |

**Do not present this as a universal WebGPU speed advantage.** WebGL2's timer wraps GL commands from clear through draw, whereas WebGPU timestamps span its Render Pass, so the two are similar but not identical scopes. Individual p95 spikes indicate runtime noise: a larger mesh does not always yield a larger p95 in this limited experiment. Different drivers, browsers, GPUs, viewport sizes, shader complexity or animation loads can reverse the result. / 此表只能代表所测机器上的小型原创实验，不能推广为所有游戏 WebGPU 更快的结论。

The Chrome session was launched with opt-in WebGPU/ignore-blocklist flags. Production browser capability and browser privacy/timestamp quantization need independent checks. The tester reports Intel adapter identity but **no user-specific identifiers, secrets or private files** were captured. / 测试使用实验功能参数，真实用户默认配置需要另行验收。

## Software fallback observation / 软件渲染与降级

Linux Chrome 157 with SwiftShader can perform WebGL2 disjoint timer queries, but the results are **software-renderer-specific**, not real GPU hardware performance. Its minimal WebGPU device could be destroyed even in a separate clear-only application; therefore the public demo does not activate known SwiftShader WebGPU by default. / 软件实现的纳秒计时不能冒充显卡执行性能。

## What to research next / 下一轮实验方向

1. Perform at least **5 repeated fresh browser sessions per geometry density** on the same hardware; include raw samples, GPU clock conditions, p50/p95, confidence intervals and robust outlier handling.
2. Test **multiple draw calls, PBR textures and animation** rather than a single small heightfield. Single-pass timing does not predict a production RPG/RTS frame budget.
3. Report **render pass, upload and presentation separately**; add GPU timestamps to more complex pass trees and compare them against CPU wall times and memory.
4. Validate actual **content/geometry equivalence** using matched screenshot crops and visual regression, while accounting for GLSL/WGSL differences.
5. Add **physical collision, navmesh and continuous LOD morphing** as independent functional modules; visual geometry does not prove player movement.

This public educational case intentionally does not include internal game systems, unlicensed models, production business rules or private customer assets. / 本文公开技术研究，不公开私有研发。
