# Agent-operable 3D editors: controls, undo, view validity and provenance
# AI 可操作的 3D 编辑器：控制、撤销、视角有效性与记录

**Primary evidence / 一手证据：**
- [SuperSplat native browser WebMCP contract](https://github.com/playcanvas/supersplat/blob/main/docs/webmcp.md)
- [Spline interactive 3D editor and MCP integration](https://spline.design/)
- [Spline official documentation](https://docs.spline.design/)
- [AnyKit deterministic asset cleanup](https://github.com/apekshik/anykit)
- [AnyScene script-rebuild workflow](https://github.com/apekshik/anyscene)

## Central discovery / 核心认识

**中文：** AI 做 3D 并不等于 AI 看一眼截图然后用鼠标乱点。优秀的工具越来越倾向提供明确的对象模型、合法编辑范围、可查询状态、原子操作、可撤销历史和预览反馈。超级重要的不是“让 Agent 获得任意执行脚本的能力”，而是把编辑器真正变成**有结构、可验证、可回退**的专业系统。

**English:** Agent-driven 3D is not an AI blindly clicking on screenshots. Robust tools expose explicit scene objects, constrained edit scopes, inspectable state, atomic operations, undoable history and visual previews. The valuable architecture is a structured, verifiable, reversible editor — not an unrestricted shell exposed to agents.

## Five design contracts / 五个设计契约

1. **Discover before edit / 先读取再编辑** — `get_scene`, `get_objects`, stable identifiers, relevant dimensions and current camera. / 获得对象 ID、尺寸和相机。
2. **Scope every action / 明确每次作用域** — selection, layer, object, scene; never silently widen an empty selection into “all.” / 空选区不得自动全局修改。
3. **Tie camera picks to a view token / 选取绑定视角版本** — reject a stale camera-dependent selection rather than accidentally changing the wrong object. / 镜头位置变化时旧坐标失效。
4. **One atomic undo item / 原子修改可回退** — agent and human changes share the same edit history; a failed operation leaves no partial state. / 操作与撤销历史统一。
5. **Visual proof / 可视检查** — after applying a transform, render a known view and verify the intended change with collision/geometry checks. / 修正后固定机位复核。

## Useful contrast / 两种开放程度

- **SuperSplat:** a fully documented **native WebMCP** adapter exposing 29 bounded tools through supported preview browsers. Its public source can be inspected. Specific browser versions and host integration matter; do not presume universal support.
- **Spline:** a commercial collaborative 3D editor featuring an MCP-connected agent, runtime interactivity, WebGPU rendering with WebGL fallback and exports to web/native targets. Its editor is a **proprietary service**; publicly documented integration does not mean the underlying studio code is open source.

## Proposed safe editing flow / 原创工程建议

```text
inspect scene → identify stable object ids → preview proposed change
    ↓
assert camera token + object version + unit system
    ↓
perform one scoped edit in transactional command queue
    ↓
record undo id + original dimensions + updated dimensions
    ↓
render QA camera + check intersections + compare expected delta
    ↓
accept / undo and refine
```

**Not upstream code / 非搬运源码。** The sequence above is a conceptual interface proposal derived from shared software engineering principles. It is not a claim that any private system already implements it.

## Three minimum experiments / 三个最小实验

1. **Object placement:** move one prop 0.25 m along a known axis, confirm its world matrix and absence of ground intersections, then undo. / 精确平移道具并验证与撤销。
2. **Stale view:** rotate the camera after obtaining a screen selection token and ensure the old selection is rejected. / 相机变化后拒绝旧拾取。
3. **Concurrent editor:** while a human is changing a material, an agent attempts a transform; ensure deterministic ordering and separate undo entries. / 人机并发操作按明确顺序进入撤销历史。

**Relevance:** 3D asset inspectors, game level editors, CAD reconstruction, model marketplaces, and Blender agent adapters. / 适用于模型浏览、游戏关卡、CAD 工厂和 AI 美术协作。

The catalog remains public; independently developed production editors, credentials, commercial datasets and unpublished work remain outside this repository. / 开放研究不公开私有生产系统。
