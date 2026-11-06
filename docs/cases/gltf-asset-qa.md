# glTF Asset QA: structure, geometry, shading and runtime
# glTF 资产质量闭环：结构、几何、材质与真实运行

**Primary sources:**

- [Khronos glTF Validator](https://github.com/KhronosGroup/glTF-Validator) — specification-level validation.
- [Khronos glTF Sample Viewer](https://github.com/KhronosGroup/glTF-Sample-Viewer) — independent PBR/material rendering reference.
- [Khronos glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models) — test fixtures, **per-model rights vary**.
- [Google model-viewer](https://github.com/google/model-viewer) — standalone, integrable product-page viewer.
- [glTF Transform](https://github.com/donmccurdy/glTF-Transform) — optimization and transformations.
- [meshoptimizer](https://github.com/zeux/meshoptimizer) — geometry and index optimization.
- [Google Draco](https://github.com/google/draco) — geometry compression.
- [Basis Universal](https://github.com/BinomialLLC/basis_universal) — GPU texture compression/transcoding.

## Why pretty screenshots are insufficient / 为什么截图好看也不能交付

**中文：** 一个生成成功的高面数模型仍可能没有明确朝向、正确米制尺度、合法 UV、可控关节、正确玻璃材质、合理三角面预算或可靠碰撞。渲染截图不证明它在游戏中能转身、持剑、走动或通过门。建议用四层独立 QA 避免将外观误当功能。

**English:** A high-poly model can look impressive yet lack canonical orientation, real scale, valid UVs, articulated joints, correct glass, triangle budgets or dependable collision. A good image is not evidence of a usable runtime asset. Use separate layers of validation.

## Four verification layers / 四层质量验收

| Layer / 层 | Checks / 检查 | Suitable tool / 参考 |
|---|---|---|
| **1. File & spec / 文件与规范** | glTF structure, buffer ranges, animation data, extensions, invalid quaternions / 数据结构、扩展、四元数合法性 | Khronos glTF Validator |
| **2. Geometry / 几何** | Meters, pivot, unit frame, front direction, triangle budgets, LOD, normals / 米制、枢轴、朝向、法线与面数 | Blender normalization + meshoptimizer |
| **3. Visual / 材质视觉** | Base color, metalness, roughness, transmission, HDR, tone-map, transparency / PBR、HDR、透明 | Khronos reference viewer + original fixed-angle screenshots |
| **4. Behavior / 交互运行** | Collider, nav, IK, animation FSM, grip contact, FPS and memory across devices / 碰撞、导航、骨骼、帧时 | Real-time engine + deterministic tests |

**Why independent rendering matters / 为什么需要独立渲染器：** If the same GLB looks wrong in every viewer, the problem may be in the asset. If it breaks only in the game, suspect tone mapping, lighting, extension compatibility or shader state. / 同一 GLB 交叉观察有助于区分文件自身缺陷和某个引擎的缺陷。

## Original asset contract / 建议我们的原创资产接口

This is an **illustrative proposed schema**, not a copied vendor file / 以下为原创建议示例，非第三方源码：

```json
{
  "id": "original-iron-sword-001",
  "source": "original_authored_asset",
  "units": "m",
  "up": "+Y",
  "forward": "-Z",
  "origin": "grip_root",
  "lods": [
    {"file": "sword_lod0.glb", "role": "near"},
    {"file": "sword_lod1.glb", "role": "far"}
  ],
  "semantic_nodes": ["grip_root", "blade", "guard", "scabbard_pivot"],
  "collision": "sword_collider.glb",
  "validation": {"gltf": "pending", "visual": "pending", "runtime": "pending"}
}
```

**Caution:** `+Y`/`-Z` in this example is one project-specific convention; an asset factory may choose another, but must document and enforce it. Do not assume every GLB shares a universal “front.” / 坐标约定是项目协议，不是任意模型自动匹配的事实。

## Recommended reproducible flow / 建议流水线

1. **Keep raw input / 保存源模型**: do not overwrite original generated meshes. / 原始模型只读。
2. **Normalize / 标准化**: set real dimensions, pivot, orientation and safe transforms. / 真实尺寸与朝向。
3. **Validate / 结构校验**: run glTF Validator and retain JSON issue report. / 保留报告。
4. **Optimize / 优化**: compute geometry LOD; encode textures with KTX2/Basis or use mesh compression per compatibility budget. / 测压缩兼容与画质。
5. **Reference render / 视觉对照**: fixed camera + known lighting across two viewers. / 固定机位跨引擎比较。
6. **Runtime test / 真实测试**: animation, collisions, navigation and low-memory devices. / 运动与物理回归。
7. **Audit rights / 权利审查**: code, model weights, input assets, textures, scanned environments, music and external APIs have distinct permissions. / 逐层许可。

**Baseline outcomes to record / 应记录指标：** triangles per LOD, texture bytes, GLB bytes, material/shader count, draw calls, first render time, p95 GPU/CPU frame time, detected intersections, failed animation steps and provenance. / 不应只记录“生成成功”。

## Test hypothesis / 实验设计

Choose one original industrial hard-surface object plus one skinned character. Export both to Three.js, Godot and the Khronos Viewer. / 选择一个原创机械硬表面物体和一个原创带骨架角色，分别在 Three.js、Godot 与标准查看器中观察。 The goal is identical geometry/material semantics and well-documented exceptions, **not** identical pixels across disparate shading pipelines. / 目标是语义与结构一致，跨不同光照管线不应盲目要求像素完全相同。

This is a public educational design and contains no private factory source code or unpublished assets. / 本文没有内部工厂源码或未公开资产。
