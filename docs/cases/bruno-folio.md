# Bruno Simon Folio — a real playable 3D website
# Bruno Simon Folio：真正可玩的 3D 网站

**Site / 网站：** https://bruno-simon.com/  
**Source / 源码：** https://github.com/brunosimon/folio-2025  
**License:** MIT in upstream repository; browser/server portions are not all published / 开源仓库 MIT，但网站服务端并非全部开放。

## Chinese / 中文分析

作品集并不是简单地把页面放进 3D 场景：访问者能驾驶一辆车探索，场景有实质碰撞和动态物理。作者公开的 README 明确列出主循环步骤：时间/输入 → 玩家物理预处理 → 车辆物理预处理 → Physics → 车辆状态回写 → 玩家状态回写 → 视角 → 环境系统（昼夜/天气/世界对象）→ 声音/通知 → 渲染 → 监控。这种依赖排序非常重要，因为它防止相机、轮胎痕迹和车辆本体引用彼此不一致的时间状态。

作者还公开了 Blender 出口和资源压缩流程：静态 GLB 通过专门脚本处理，纹理采用 KTX/ETC1S 等 GPU 友好编码，并保留原资产。这比在加载时临时缩减模型更适合生产。

**值得学的三点：** (1) 用可控的物理交互承载信息导航；(2) 单线程主循环中明确声明依赖与更新顺序；(3) 从 Blender 到 GLB / 压缩 / 浏览器验证的稳定交付步骤。

## English / Analysis

The portfolio is more than 3D decoration: visitors drive a vehicle through a world with actual physics. The repository's README specifies a remarkably explicit update graph: time/input → player pre-physics → vehicle pre-physics → physics → post-physics state → view → world/weather systems → audio/UI → render → monitoring. The ordering keeps camera, tracks and vehicle visuals synchronized to the same simulation state.

The author also describes a Blender-to-GLB and GPU-friendly texture compression pipeline with separate derived files that preserve source assets.

**Three lessons:** (1) embody navigation as meaningful physical play; (2) document update dependencies and state ownership; (3) treat asset compression and browser compatibility as part of the DCC-to-web production process.

## Safe original exercise / 原创技术练习

Build an original 40×40 m interactive space with a single drivable cart, moving gate and at least one collectible information point. / 设计原创 40×40 米场地，车辆可驾驶、有动态闸门和信息点。 Record fixed-step physics, camera lag, hitbox failures and p95 frame time. / 记录固定步长、镜头延迟、碰撞失败和帧时。 No third-party artwork or brand materials copied. / 不复制作者美术或商标。
