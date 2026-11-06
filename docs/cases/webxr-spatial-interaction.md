# WebXR Samples: spatial interaction as a reproducible API laboratory
# WebXR Samples：从三维网页迈向真实空间交互的可复现实验室

**Reviewed / 核查：2026-11-07**  
**Primary sources / 一手资料**
- [W3C Immersive Web samples / 官方示例源码](https://github.com/immersive-web/webxr-samples)
- [Samples explainer / 示例说明](https://github.com/immersive-web/webxr-samples/blob/main/explainer.html)
- [Upstream license / 上游许可证](https://github.com/immersive-web/webxr-samples/blob/main/LICENSE.md)

**Evidence / 证据：** upstream code, examples and license; not local device testing.  
**Rights / 许可：** MIT software license; do not assume every bundled media item or external device dataset shares the same provenance.

## Why relevant beyond headsets / 不只是 VR 眼镜

**中文：** WebXR Samples 通过可阅读的最小示例拆开沉浸式 VR、AR、控制器输入、手势追踪、定位空间、锚点、碰撞面命中测试、传送、立体视频与空间音频等问题。即使主平台仍是 PC/Mac/平板/手机网页，学习这些例子也有助于设计**输入设备抽象、世界坐标、空间 UI 与多平台降级**。

**English:** The official samples isolate core WebXR concerns such as sessions, reference spaces, input tracking, anchors, hit testing, teleportation, stereo media and positional audio. Their reusable value is rigorous spatial semantics and input adaptation, not an assumption that every device runs immersive XR.

## Important boundaries / 不能误解的边界

- **Support is per device and mode / 支持能力逐项检查：** `immersive-vr`, `immersive-ar` and `inline` are different sessions; a desktop page displaying 3D is not proof of immersive support.
- **Coordinate spaces matter / 坐标系是基础：** distinguish viewer/local/local-floor and world attachments, with meaningful fallback if floor tracking is unavailable.
- **AR hit test is not generic physics / AR 命中测试不等于物理引擎：** plane placement and anchors do not replace a separate solid collision/navigation system.
- **Permission, privacy and comfort / 权限与舒适性：** use explicit user gestures for sessions, meaningful exit paths, stable horizons, motion sensitivity options and fallback 2D controls.
- **WebGPU render != WebGPU XR / 渲染兼容不能替代 XR 兼容：** test XR-specific binding and browser/device support independently. Do not assume a WebGPU-capable canvas can automatically drive immersive sessions.

## Proposed test matrix / 原创测试矩阵

| Scenario / 场景 | Evidence / 验收证据 |
|---|---|
| Desktop 2D canvas / 普通桌面网页 | Full keyboard/mouse play; no forced XR permissions / 键鼠完整操作 |
| Touchscreen / 触控屏 | Pointer/touch mapping and readable controls / 手势及控件 |
| Inline XR / 页面内 XR | Detect capability, preserve page continuity / 能力探测 |
| Headset VR / 头显 VR | Session entry/exit, tracking, controller actions / 进出与追踪 |
| Hand input / 手部输入 | Detect supported feature and give controller fallback / 实际支持能力 |
| AR plane placement / AR 平面放置 | Hit test and anchor persistence where available / 命中与锚点 |

## Original knowledge transfer / 可以独立吸收的知识

Build an input abstraction (`source_type`, `pose`, `actions`, `tracking_status`) and keep the game's original world independent of controller hardware. Add XR only as an optional adapter; never degrade ordinary browser gameplay to accommodate unsupported immersive modes. Use original 3D assets and report exact devices/browsers during future tests.

**Status / 状态：API study only. No claim that WebXR hardware acceptance has been performed. / 仅完成资料研究，未声称头显真机验收。**
