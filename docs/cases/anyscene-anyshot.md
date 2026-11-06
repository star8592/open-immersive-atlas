# AnyScene + AnyShot — a reproducible virtual art department
# AnyScene + AnyShot：可重建的 AI 场景美术与镜头工厂

**Projects / 项目：** https://github.com/apekshik/anyscene and https://github.com/apekshik/anyshot  
**Evidence / 证据：** public repositories, README, AnyScene SKILL.md, builder/CRAFT.md, AnyShot technical architecture notes. / 一手公开源码与制作规范。

## AnyScene — Build the set / 场景制作

**中文：** 场景生产并非“用 AI 一次生成一个房间”。AnyScene 将空间定义、道具清单、单物件参考图、两个模型后端的对照、比例修复、道具落位、污染/磨损材质、灯光、体积氛围和相机分镜各自脚本化。真正的成果不是一次渲染，而是可以重新运行的资产与代码。

**English:** AnyScene does not simply ask an image model for a whole room. It scripts room specification, prop manifest, per-object references, competing 3D generators, normalization, physically grounded placement, wear, practical lights, atmosphere and shots. The important output is a reproducible build, not a single final still.

### Five critical corrections / 五个质量要点

1. **See actual renders / 实际查看出图** — a successful script exit proves execution, not visual correctness.
2. **Name exact errors / 错误具体化** — “the screen is flat gray” is fixable; “looks wrong” is not.
3. **Fix in scripts / 修复写回脚本** — prevent changes from disappearing on rebuild.
4. **Change viewpoint / 换角度验收** — ground-level shots reveal floating props hidden in hero shots.
5. **Independent critic / 独立质量评价** — someone other than the building agent checks scene-scale consistency.

These five ideas are explicitly emphasized by the creator in https://github.com/apekshik/anyscene/blob/main/builder/CRAFT.md .

## AnyShot — Shoot the set / 让 AI 摄影师工作

**中文：** AnyShot 读取现有 Blender 场景，不直接破坏源工程。它由 AI Agent 规划摄影机轨迹，逐帧进行镜头与物体间的几何间隙检查，使用 Eevee 快速预览构图，再交给 Cycles 生成正式画面。视频可以按帧块拆分到云端并发执行，结果支持缓存和恢复。

**English:** AnyShot works on copies of existing Blender scenes, builds camera paths, checks clearance throughout the movement, previews cheaply in Eevee and renders finals through Cycles. Video frames can be split into remote chunks with cache and retry semantics.

### Production lessons / 工程启示

- **One scene, many reproducible shots. / 同场景多镜头重建。**
- **Camera navigation needs geometry awareness. / 镜头运动必须了解几何障碍。**
- **Preview before expense. / 低成本预览优先于昂贵正式渲染。**
- **Idempotent jobs. / 同请求不重复计费和重复生成。**
- **One GPU-heavy local job at a time unless measured otherwise. / 没有显存余量证据时，不在本地并发重渲染任务。**

## Experimental learning path / 实验学习路线

Build one **original** small room with five original props / 用五件原创物品造小房间 → produce three fixed-angle clay images / 输出三机位素模 → perform support/penetration checks / 验证落地和穿插 → fix materials / 修材质 → produce a 10-second camera move with clearance checking / 制作十秒且不会穿模的运镜 → export a reproducible Blender scene and shot manifest / 导出可重建工程与分镜清单。

The author lists usage costs for third-party image-to-3D services and cloud GPUs; these are environment-specific and not a free-service guarantee. / 外部 3D 生成和云 GPU 需要另外计费、核权，研究仓库不会自动启动付费任务。
