# React Three Fiber v10 alpha: the WebGPU-first migration
# React Three Fiber v10 Alpha：WebGPU 优先，但不要误把预发布版当生产基线

**Reviewed / 核查：2026-11-07**  
**Primary sources / 一手资料**
- [R3F official releases / 官方版本说明](https://github.com/pmndrs/react-three-fiber/releases)
- [R3F canonical introduction / 官方文档](https://github.com/pmndrs/react-three-fiber/blob/master/docs/getting-started/introduction.mdx)
- [R3F repository and license / 仓库及许可证](https://github.com/pmndrs/react-three-fiber)

**Evidence / 证据：** upstream release notes and repository documentation, not our own runtime benchmark.  
**Rights / 许可：** R3F repository is MIT; project-specific models, HDRIs, shaders and commercial assets are separate.

## What actually changed / 真正改变的是什么

**中文：** 官方 `v10.0.0-alpha.6` 的普通 `@react-three/fiber` Canvas 默认走基于 `WebGPURenderer` 的新管线，该渲染器可按能力退回 WebGL2；它不同于旧版单纯 `WebGLRenderer`。传统 GLSL 材质或旧组件需要评估 `@react-three/fiber/legacy`，不能把「WebGPU 降级为 WebGL2」理解成「所有旧 GLSL 组件自动兼容」。目前 v10 仍属预发布。

**English:** In `v10.0.0-alpha.6`, the ordinary R3F Canvas selects the newer WebGPURenderer architecture, which can use WebGPU or fall back to WebGL2. This is not the same as the historical WebGLRenderer; GLSL-only integrations may need the explicit `@react-three/fiber/legacy` entry point. v10 is an **alpha**, not a proven stable upgrade target.

| Concern / 领域 | Stable route / 稳妥路径 | Experimental route / 实验路径 |
|---|---|---|
| Existing WebGL2/GLSL game / 现有游戏 | Keep pinned, working R3F/Three + WebGLRenderer | Test `/legacy` separately before upgrading |
| TSL/node materials / 节点材质 | Maintain an independently verified fallback | R3F v10 default WebGPURenderer |
| Compute shaders / GPU 计算 | Feature-gate; no silent assumptions | WebGPU capabilities and resource-lifetime probes |
| Multiple canvases / 多画布 | Deterministic camera/resource cleanup | Test the new scheduler and root lifecycle |
| Shipping / 上线 | Visual/gameplay evidence first | Isolated alpha trial, never blind mass migration |

## Transferable engineering ideas / 值得吸收的机制

1. **Renderer as explicit contract / 渲染器类型是接口约束。** Record whether a material uses GLSL, TSL/WGSL-compatible nodes, compute, external post-processing and compatible fallback. / 每个材质和后处理记录渲染器兼容性。
2. **Scheduling as a system / 帧循环不是单一回调。** Distinguish fixed-step physics, input sampling, character animation, GPU submission and UI events; reproduce order-sensitive bugs. / 区分物理固定步长、输入、骨骼、渲染与 UI，专测顺序错误。
3. **Migration by a small vertical slice / 小样板迁移。** Take one original scene with a skinned character, glass, particles, shadows and a known GLSL effect. Run both render paths and compare objectively. / 用一个含角色、玻璃、粒子、阴影与自定义 Shader 的原创场景做双路径实验。
4. **Visual parity before deployment / 画质不允许静默退步。** Preserve fixed-angle reference renders and interaction recordings. FPS improvements do not excuse lost reflections, shadows, antialiasing or broken animation. / 不能以帧率提升换取视觉下降。

## Proposed reproduction protocol / 独立复现实验

- Pin exact React, Three, R3F and Drei versions; record browser, OS, GPU and driver. / 固定所有版本和运行环境。
- Test WebGPU, new renderer on WebGL2 and legacy WebGLRenderer as **three distinct cases** where supported. / 三条路径分别测，不能合并为一项。
- Capture first usable frame, CPU/GPU p95 frame-time, VRAM/JS heap, shader errors and resize/recovery behavior. / 同时采集首帧、p95、显存与错误。
- Compare fixed camera images, camera orbit, character gait, transparent surfaces, input latency and context-loss handling. / 做视觉、动画、操作与设备异常回归。
- Keep experimental code and any unpublished original assets **private**. / 私有试验源码和未发布资产不进入此公开知识仓。

**Status / 状态：Research documented; no claim that R3F v10 was installed, benchmarked or deployed into any PlayMoru game. / 研究已建档，未宣称已安装、实测或上线。**
