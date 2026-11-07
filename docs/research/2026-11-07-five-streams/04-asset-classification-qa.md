# Lane 04 — Automated 3D asset classification, optimization and acceptance
# 分线 04 — 自动识别、重建、优化与验收游戏 3D 资产

**Status / 状态:** Primary-source-backed pipeline study. The existing [OIA GLB Inspector](../../../labs/glb-inspector/) is an **offline structural preflight**, not Khronos certification or an end-to-end commercial asset pipeline. / 基于官方来源的生产流程研究；既有 GLB 工具不是完整生产级合规认证。

**Tracking:** [OIA research #7](https://github.com/star8592/open-immersive-atlas/issues/7)

## Primary references / 原始依据

- [Khronos glTF-Validator](https://github.com/KhronosGroup/glTF-Validator) — JSON / GLB structural and specification validation, binary data checks, asset statistics and structured issue reports.
- [Khronos glTF Sample Viewer](https://github.com/KhronosGroup/glTF-Sample-Viewer) — an independent rendering reference for glTF/PBR material appearance.
- [glTF Transform official docs](https://gltf-transform.dev/) — transforms including dedup/prune, geometry compression, meshopt and texture resize/compression.
- [meshoptimizer](https://github.com/zeux/meshoptimizer) — geometry/index encoding, optimization, simplification and related mesh processing primitives.
- [Blender glTF extension](https://github.com/KhronosGroup/glTF-Blender-IO) — DCC interchange that must be verified with actual export/import round-trips; Blender operations are not automatically watertight mesh repair.
- [Existing bilingual glTF QA study](../../cases/gltf-asset-qa.md).

## The key insight / 最重要的流程更正

**中文：** 对全部 AI 生成物盲目做一次网格 Decimate，并不能得到最好的游戏简模。资产必须先判断语义、几何规则性、拓扑有效性、结构边界和预期用途。一个工业齿轮、平板、房屋墙体或圆柱孔，可能应该**参数化重建**；树根、岩壁、人物服装则更适合**有约束的几何简化与法线烘焙**。规则人造物体还需要保持直线、平面、孔位、轴线与对称性，而不只是减少三角面。

**English:** Mesh reduction and geometry reconstruction are not synonyms. High-poly organic surfaces may benefit from error-controlled simplification with normal/tangent baking; CAD-like manufactured parts should often be classified and reconstructed from explicit planes, cylinders, symmetry axes and hole constraints. An automated factory needs a routing decision, not a single destructive decimator.

## Candidate decision router / 自动分类与执行路线

| Class / 类型 | Preferred candidate / 优先策略 | Essential checks / 必须检查 |
|---|---|---|
| Prismatic manufactured part / 棱柱机械件 | Recover primitive planes, arcs, holes, extrusions; rebuild parameterically when evidence supports it / 可依据证据参数化重建 | Hole alignment, dimensions, flatness, symmetry, editable part grouping |
| Symmetric vehicle/architecture / 对称车体建筑 | Segment components, identify hard edges, instances, material groups; use hard-surface reconstruction or constrained simplification | Silhouette, hard edge normals, UV seams, independent rotating/moving assemblies |
| Organic creature/cloth / 生物衣物 | Topology-aware simplification + weighted normals, bake details to normal maps, preserve rig deformation zones | Joint deformation, weight transfer, morph targets, silhouette, self-intersection |
| Terrain/rocks/trees / 地形岩石植被 | Spatial-error-aware mesh/LOD, collider simplification independent of render mesh | LOD transitions, impostor normals, collision fidelity, wind compatibility |
| Ambiguous/poor input / 证据不足 | Preserve original, flag missing views/units/scale, ask for additional authoritative geometry rather than inventing holes or dimensions | Confidence, traceability of geometric constraints, no fabricated industrial precision |

**Important:** A classifier's labels or heuristic scores are hypotheses. Confidence must be calibrated against labeled test assets, and any low-confidence manufactured feature should be reported as unresolved; do not silently hallucinate dimensions.

## Proposed fully automated pipeline / 全自动工厂候选流程

1. **Ingest / 原版保存:** Immutable high-poly source, original textures, model units, asset rights, intended target platform, original metadata and a robust content hash. / 保留高模和原始材质。
2. **Parse + standards / 结构预检:** OIA Inspector catches obvious malformed GLB structure; then use the **official Khronos Validator** for authoritative glTF syntax/structure rules. A pass still doesn't establish visual quality.
3. **Semantic segmentation / 语义拆分:** Identify separate moving parts, rigid vs deformable regions, symmetry, expected physical features, materials and UV islands.
4. **Route choice / 自动分支:** Geometric reconstruction for sufficiently evidenced regular shapes; simplification/retopology for organic or irregular surface data; preserve manually authored and safety-critical dimensions.
5. **Multiple LODs / 多档模型:** Generate game target tier(s) from a retained high-poly original, not repeatedly simplifying an already degraded LOD. Keep rigged regions and normal/tangent correctness.
6. **Textures / 材质处理:** Bake details, resize/compress textures by role, preserve normal map color-space semantics, and avoid blindly converting normal/data textures to sRGB color.
7. **Optimize / 压缩优化:** Apply compatible glTF Transform and meshoptimizer transformations. Record extensions required by runtime; compression can reduce downloads but decoding cost and browser compatibility must be measured.
8. **Validate + render / 双重验收:** Re-run Khronos validation and load through an independent runtime renderer. Capture fixed cameras, materials, geometry edges, animation, texture mipmaps, shading and scale references.
9. **Collision/rig QA / 运行测试:** Separate render mesh from physics collision and check skeleton joints, bounding volumes, foot contact and LOD transition behavior.
10. **Publish + rollback / 发布回退:** Only publish after the previously established minimal objective checks pass, retain original high-poly source, and automatically roll back failed runtime versions. Don't add arbitrary bureaucracy.

## Proposed objective evaluation / 待实现的客观考核

- Structural: GLB parse and official Validator errors/warnings by severity; referenced extension support.
- Geometric: triangle count per tier; connected components; manifold and degenerate metrics (where mesh representation permits); axis/plane/hole dimension deviations for manufactured parts.
- Appearance: silhouette metric from fixed multi-view cameras; average/perceptual color or normal error against high-poly reference, with equal lighting and viewport; screenshots and 3D bounding box references.
- Motion: bone axis/range, skin-weight coverage, retarget deformation, contact pose on sampled animation frames.
- Performance: compressed bytes, original/LOD triangle counts, browser decode/upload time, actual GPU pass p50/p95 and memory estimates where measurable.
- Commercial usability: independent preview thumbnail, stable scale/orientation, clear origin, separate materials and LOD selection.

**Acceptance logic / 建议判定：** both absolute objective regressions and relative improvement vs baseline must be reported. A 95% triangle reduction that destroys a mechanical hole or humanoid knee is a **failure**, not a success.

## Known limits / 局限和授权

- Khronos Validator checks standard conformance, not topology artistic quality, CAD dimension truth or animation artistry.
- glTF Transform/meshoptimizer optimize existing representations; they do not infer a correct missing machine part from an ambiguous image.
- Generated texture previews and reconstructed models need separate rights/provenance checks. No automatic copying of author code or customer models into the public atlas.
- Different licenses apply to upstream repositories, tools and specific sample assets; verify the exact dependency and input model rights before redistribution.

**Next original experiment / 下一个原创实验：** a fully synthetic set of original regular parts, rock/clothing proxies and intentionally malformed GLBs. Measure routed reconstruction-versus-simplification accuracy, and compare multiple LODs through browser screenshots and independent validators.
