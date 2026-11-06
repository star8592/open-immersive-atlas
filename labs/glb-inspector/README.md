# Spatial Lab 02 · GLB Asset Inspector / 离线 GLB 资产检查台

[Live inspector / 在线工具](https://star8592.github.io/open-immersive-atlas/labs/glb-inspector/) · [Core / 核心](core.mjs) · [Unit tests / 单元测试](test-core.mjs)

## Why / 为什么值得做？

A generated 3D model can have an impressive picture while failing as a real asset: broken buffer offsets, invalid mesh index formats, non-unit joint quaternions, missing scene nodes, or unexpected external dependencies. This original, no-package browser inspector provides **local structural preflight** with explicit evidence and bilingual feedback.

生成式模型即使外观看起来很好，仍可能存在 GLB 分块长度错误、BufferView 越界、Accessor 数据错位、骨骼/节点变换错误、引用失效或外部依赖。本工具以完全原创、零外部包的浏览器程序检查基本结构并提供中英双语报告。

## What it actually does / 功能

- Accepts local **.glb** and **.gltf** files with a **64 MiB size cap**. / 接收本地文件，64 MiB 上限。
- Parses the GLB v2 header, aligned chunks and JSON chunk; compares actual BIN padding to buffer declarations. / 解析文件头、分块与缓冲区声明。
- Checks bufferView references/ranges, accessor types, byte strides and ranges, mesh positions/indices/material references, node parenting/cycles/rotation quaternions, and default scene references. / 基础结构、越界、节点、旋转及索引检查。
- Estimates triangles and vertices from primitive mode and accessor **metadata only**. / 依据元数据估算面数与顶点数。
- Shows an **axis-aligned local bounding-box schematic** when POSITION min/max is available. **It is not a rendered model preview** and is not transformed through the node hierarchy. / 包围盒示意不等于实际模型渲染，亦未包含节点世界变换。
- Displays bilingual findings and exports a **JSON report**. / 输出中英双语诊断与可下载的 JSON 报告。
- Has a handcrafted triangle demo GLB which is generated entirely by this repository. / 包含原创最小 GLB 演示文件。
- Operates entirely in the browser: **does not upload user data or fetch buffer/image URIs**; no CDN scripts or telemetry. / 用户模型不上传；外部 URI 一律不请求。

## Limitations / 明确的能力边界

**This is not the official Khronos glTF Validator and not an asset acceptance certificate.** It does not implement all glTF 2.0 validation rules, sparse accessor content checks, extension decoding, animation interpolation validation, rigorous PBR material render tests, collider/rig inspection or actual geometry/texture drawing. External buffers are reported but never downloaded. Draco, meshopt and Basis/KTX2 payloads are **not decoded or visually verified**.

**这不是 Khronos 官方完整验证器，更不能替代商用资产质量验收。** 稀疏 Accessor、压缩扩展、动画采样、PBR 外观、材质渲染、碰撞体和绑定姿势等仍需进一步校验。外部 Buffer 会提示“未验证”，不执行网络抓取。

Reference source: [Khronos official glTF Validator](https://github.khronos.org/glTF-Validator/). For runtime QA, use a separate rendering engine and test animation, collisions, screen-space visual quality and performance on actual target hardware.

**Triangle-count disclaimer / 面数说明：** Primitive counts are taken from accessor metadata, and the sum may double-count shared geometry across primitives; this is a convenience metric, not an exact post-decoding hardware workload measurement.

**Privacy disclaimer / 隐私说明：** Processing happens locally in the browser; avoid saving or sharing exported JSON reports if the file name or asset metadata is confidential. / 检查本身离线，但用户自行下载的报告可能包含本地文件名，请审查分享范围。

## Reproduce / 本地运行

From repository root / 在仓库根目录：

    python3 -m http.server 8000

Open / 访问：

    http://127.0.0.1:8000/labs/glb-inspector/

To execute the dependency-free structural tests / 执行无需安装依赖的结构测试：

    node --test labs/glb-inspector/test-core.mjs

To perform the optional browser smoke test, install Playwright separately in a local environment and set CHROME_EXECUTABLE and OIA_PLAYWRIGHT_MODULE as appropriate. A public automated workflow only runs syntax and core tests, and does not launch private device browsers.

## Acceptance contract / 验收约定

1. Original sample GLB yields one mesh, three vertices and one estimated triangle, no errors.
2. Reject truncated headers, version mismatch, invalid chunks, bad bufferView/accessor bounds.
3. Report external resources without fetching them.
4. Detect invalid node links, node cycles, matrix+TRS and non-normalized quaternion.
5. Browser demo, file selection and JSON report export work with no JS exceptions.
6. Errors are correctly bilingual and malformed input cannot mutate other assets.

Our private asset factory and unreleased game assets are deliberately **not** part of the public fixture set. / 私有资产工厂与游戏素材完全不包含在公开测试样本内。
