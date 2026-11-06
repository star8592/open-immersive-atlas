# AnyKit — from generated meshes to coherent production asset kits
# AnyKit：让 AI 模型真正符合生产标准

**Official source / 源码：** https://github.com/apekshik/anykit  
**Relevant implementation / 关键源码：** https://github.com/apekshik/anykit/blob/main/kit/tools/normalize.py  
**Evidence:** official README + actual Blender Python source read / 已阅读作者 README 与 Blender 脚本。  
**Rights:** MIT repository code; generator APIs and produced third-party assets require separate rights review / 仓库 MIT，模型服务与生成资产另审。

## What makes it special / 为何值得学习

**中文：** 许多图像转三维模型看起来好，但尺寸、朝向、材质、面数和相互风格一致性并不适合项目生产。AnyKit 把这些问题变成可以逐件校准和系统性评审的流程。输入一至四张风格参考图，输出独立 GLB、LOD1、Blender 资产库、合照与 JSON 清单。

**English:** Raw image-to-3D outputs often have arbitrary scale, orientation, materials, triangle budgets and style. AnyKit turns these into a systematic per-asset normalization and set-level critique workflow, delivering individual GLBs, LOD1, a Blender asset library, lineup images and JSON manifests.

## Extracted engineering mechanisms / 代码级工程机制

| Problem / 问题 | Author implementation / 作者实现 | Design lesson / 可学习原则 |
|---|---|---|
| Wrong scale / 比例错误 | Known real-world height or explicit dimensions in meters / 以真实尺寸标定 | Store dimensions as data, never guess from a beauty render / 尺寸是源数据 |
| Direction mismatch / 朝向不一 | Imported glTF transforms baked to mesh; Tripo +X vs Meshy -Y correction / 转换 glTF 节点并统一正面 | Define canonical forward, up and origin / 统一坐标规范 |
| Bloated topology / 面数过高 | Triangle budget and decimation by item / 逐资产减面预算 | Budget per asset role / 按资产用途分预算 |
| Expensive distance rendering / 远景太重 | Additional LOD1 asset, lower geometry and textures / LOD1 | Verify actual far-camera appearance / 以相机视距验收 |
| Baked fake glass / 假玻璃 | Specialized material repair / 材质修复 | Real geometry and real PBR must be separable / 纹理不能代替全部几何 |
| Different aesthetics / 风格不统一 | One style brief and a lineup comparison / 合照审查 | Validate the kit, not only isolated props / 整套优于单件 |
| Generator variability / 单模型偏差 | Same-light Meshy vs Tripo comparison / 同条件选优 | Choose per object, not one universal winner / 单件竞争而非固定模型 |

The published `normalize.py` accepts `--h` or `--fit X Y Z`, `--gen`, `--yaw`, `--tex`, `--max-tris` and `--lod1`, and writes a normalized per-item GLB, a distant LOD1 GLB and stats metadata. Its README also documents a hidden three-quarter node rotation for Tripo `align_image` outputs. See the actual upstream code for current behavior.

## Original, license-respecting exercises / 可合法实践的练习

1. Create eight original household props with one art-direction paragraph / 以同一风格说明制作八件原创道具。
2. Assert real dimensions (m), canonical -Y forward, bottom-center origin / 自动验证单位、朝向和原点。
3. Render every prop front/back/clay under the same lights / 正背面与素模同灯光对比。
4. Export LOD0/LOD1, manifest and visual contact sheet / 产出双 LOD、清单和合照。
5. Import into Blender, Three.js and at least one separate engine / 跨引擎实际导入而非仅检查文件扩展名。
6. Record both technical failures and visible defects / 记录结构错误和肉眼可见的质量缺陷。

**Do not assume commercial rights of generated files from the MIT license of the orchestration code. / 不可把流水线 MIT 源码许可证理解为外部模型服务的资产商业授权。**
