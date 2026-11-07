# Wildward (@PlayWildward) — procedural wilderness, Jeep terrain contacts and simulated water
# Wildward：程序化荒野、越野车接地与模拟水体的可核查案例

**Review / 核查：2026-11-07**  
**Project identity / 项目身份：** [Wildward X profile](https://x.com/PlayWildward), a newly announced **1–4 player cooperative wilderness expedition**. The individual game developers, engine, repository, Steam store and executable playtest were **not identified** at the time of research. / 作者个人身份、引擎、源码仓库、Steam 商店和可操作的测试版均未核实。  
**Critical disambiguation / 严格区分：** The separately found [wildwardgames.com](https://www.wildwardgames.com/games) advertises a **narrative medieval fantasy** project. **No primary evidence establishes that this website belongs to @PlayWildward**, whose profile describes a wilderness **vehicle/river/outpost** game. Do **not** merge the two projects. / 同名网页所述内容不同，绝不能将其当作本视频作者的官方技术披露。

## 1. Verified original-post chain / 四条作者原始记录

1. [Nov 5 introductory announcement](https://x.com/PlayWildward/status/2118369897654927406): "Introducing Wildward"; author's description says **1–4 player co-op wilderness expedition**, exploration, mapping uncharted lands, navigating rivers and building remote outposts. / 2026-11-05，官方账号说明多人合作荒野探索、河流和前哨站。
2. [Nov 5 nature and water](https://x.com/PlayWildward/status/2118380623672787389): author describes **"fully procedural world, 100% simulated water"** and an autumn breeze; published with a short video of roughly 10 seconds. / 声称世界全程序化、水体模拟、有秋风氛围；未披露求解器。
3. [Nov 6 driving work](https://x.com/PlayWildward/status/2118672374379717001): author says Jeep has **satisfying weight, reacts to the terrain, pushes through procedural grass, splashes through simulated water**; published with roughly 26.55 seconds of video. / 声称车辆重量感、地形响应、程序化草被推开以及涉水反馈。
4. [Nov 6 user-submitted clip](https://x.com/PlayWildward/status/2118723059444297933): author says **driving, environment interactions and simulated water**; **22.83-second video**. / 用户提供的核心研究视频。

**Method / 观察方法：** Public posts and creator metadata were fetched on 2026-11-07; MP4 media were inspected as sampled multi-frame contact sheets from the public posts. We did **not** run a game build, see a debug rendering pass, or acquire project files. / 本次实际获取公开动态与原视频片段，查看跨时间画面；不等于实机交互或源码复现。

## 2. What we actually observed vs what is claimed / 观察、作者声称和未知三者分开

| Dimension / 维度 | Direct observation / 从公开片段看见的 | Creator's explicit claim / 作者声称 | Unknown / 未经验证 |
|---|---|---|---|
| Camera / 镜头 | Elevated 3/4 chase view follows small Jeep with continuous world movement / 倾斜俯视、跟车 | Driving demo / 驾驶 | Camera spline, follow damping, projection FOV / 具体镜头参数 |
| Terrain / 地形 | Grass/trees/rocks, winding routes and colored seasonal biomes / 草、树、岩石、不同色彩区域 | Fully procedural world / 世界全程序化 | Heightmap algorithm, erosion, seamless tiles, world scale, colliders |
| Grass / 植被 | Dense growth and road-edge variation / 植被密度变化 | Jeep pushes through procedural grass / 车辆与草互动 | Whether displacement is physically contact-based or visual field shader |
| Vehicle / 载具 | Jeep turns/drives across different elevations and river approaches / 车辆在坡地和河岸移动 | Weight and terrain reaction / 重量感、地形响应 | Engine, wheels/suspension solver, collision, tire slip |
| Water / 水 | Bright blue-green river, vehicle approach/crossing visible in footage / 水色明亮，车辆涉水 | Simulated water, splashes / 模拟水、飞溅 | Shallow-water solver, particles vs dynamic heightfield, depth & flow |
| Visual style / 画风 | Green lush forest and warm orange sunset/autumn terrain / 青绿森林与橘红秋色 | Autumn breeze / 秋风 | Authoring pipeline, PBR assets, lighting LUTs, whether any textures are AI-generated |
| Networking / 多人 | No multiplayer shown in three retrieved clips / 视频无多人同屏证据 | 1–4 co-op / 1–4 人合作 | Server authority, prediction, sync rate, replication implementation |

**Caveat / 高优先级风险：** These are **short promotional clips** from a new account, not a source release or verified live gameplay; consistency of screenshots does not by itself prove every simulated subsystem is implemented. No inference that the official website of a differently described project is related to this account is justified. / 不允许因为视频漂亮，就宣布所有系统真实存在并经过商业性能验证。

## 3. Why it looks closer to a finished game than our earlier geometrical sketches / 为什么比我们的旧样板更有“世界感”

1. **Scale relationship / 真实尺度关系：** Small Jeep relative to lane width, rocks, grasses and river forms; microtextures and botanical shapes make the terrain feel broad rather than a plastic toy tray. / 不是单看车辆好不好看，而是道路、石头、草叶、树干和车宽相互对齐。
2. **Continuous depth / 连续空间：** Roads slope and weave, canopy shadows and cliffs create near/mid/far layering; the camera follows a world, not a background painting. / 真正的空间关系才能抵抗镜头转动和缩放。
3. **Ecological transitions / 生态过渡：** Vegetation clumps change along riverbanks, roadsides, forest interiors and dry autumn terrain, avoiding uniform random scatter. / 草被、蕨类、落叶、卵石应根据地理条件而变化。
4. **Motion explains material / 运动证明物体属性：** Vehicle movement meets terrain, grass and water, telling the player what is soft, wet, heavy or solid. / 接触反馈是风格的一部分，不是最后才加的小特效。
5. **Coherent color script / 色彩脚本：** Cool cyan water and lush green flora contrasted with warm dust and sunset light; strong atmosphere is controlled spatially, not injected by one global oversaturated filter. / 光色变化要与时间、季节和生态统一。
6. **Camera art direction / 镜头有美术目的：** A high 3/4 follow camera makes the Jeep readable while giving room for water/grass response and nearby exploration. / 摄像机应服务地面材质与操作反馈。

This is **independent composition analysis**, not a claim about the creator's undisclosed project implementation. / 上述为画面分析，不代表已掌握原工程。

## 4. Proven browser engineering references / 可真正使用的 HTML5 技术资料

### Water simulation / 水体

- [Evan Wallace — WebGL Water (original WebGL + MIT notice)](https://github.com/evanw/webgl-water): 2D heightfield disturbance plus reflection/refraction, caustics and floating objects. The repository's index.html contains an MIT notice; third-party tile textures have separate provenance. / 原始可复现水面高度场与光学基础。
- [Jean Timex / Su — webgpu-water (MIT)](https://github.com/jeantimex/webgpu-water) / [live](https://jeantimex.github.io/webgpu-water/): explicit **256×256** heightfield and **1024×1024** caustics, GPU compute/waves, Fresnel reflections, simulated buoyancy and caustics. This is a bounded pool demo, **not automatically a flowing irregular river**. / 专门研究水位/速度场与实时焦散，再适配真实河岸。
- [Three.js WebGL GPGPU water](https://threejs.org/examples/webgl_gpgpu_water): interactive disturbances in a water surface; can serve as compatibility baseline. / 官方可控水波基准。
- [Three.js WebGPU water example](https://threejs.org/examples/webgpu_water) / [WebGPU compute water](https://threejs.org/examples/webgpu_compute_water): independent WebGPU techniques; verify feature availability and fallback paths. / 官方 WebGPU 水面与计算示例。
- [HowdyKeith swek-webgl2-water (MIT)](https://github.com/HowdyKeith/swek-webgl2-water): a single-file WebGL2 GPU heightfield plus Fresnel and caustics. Good for tightly controlled minimal reproducibility. / 单文件水面求解最小样板。

**What not to assume / 不得误判：** A beautiful fragment shader with scrolling normals does **not** by itself prove physical shallow-water waves, the vehicle's buoyancy, wet splashes or depth-dependent flow. These are separate contracts. / 彩色水纹不等于物理模拟。

### Contact-driven grass and terrain / 草、地形和车辆

- [Three.js Field Grass](https://github.com/matthew-kissinger/threejs-field-grass): multiple grass tuft forms, wind, **bounded body-wake fields**, TSL WebGPU/WebGL2; source README explains this is an experimental preview and has engine-version constraints. / 车辆推草可参考受限空间形变场，不使用巨大圆锥草。
- [Yomotsu Vegetation](https://github.com/yomotsu/vegetation): seeded foliage/rocks, controlled moss, Workers and collision mesh separation. / 草、石和湿地苔藓生态关系。
- [Rapier JS](https://rapier.rs/docs/user_guides/javascript/) / [React Three Rapier](https://github.com/pmndrs/react-three-rapier): rigid bodies, colliders, ray queries, joints and fixed time steps. **No claim that author used Rapier** and no claim that Rapier provides Wildward's suspension out-of-the-box. / 需单独设计车辆接地、悬架和水阻。
- [Three.js mesh BVH](https://github.com/gkjohnson/three-mesh-bvh): raycast acceleration against detailed terrains for precise ground/wheel/splash queries. / 真实地面接触检测，而非在屏幕固定位置画车辙。

### Artwork and ground scale / 美术先于减面

- [Sinica Tiny Delivery environment walkthrough](sinica-tiny-delivery-environment.md), [painterly nature production guide](painterly-nature-3d-production-playbook.md), [Theo Tillberg Moss reference](https://github.com/ttillberg/codevember-2026/tree/main/05) — waterline plants, moss growth, art-authored foliage cards and layered lighting. / 将用户连续提出的高级自然风格需求合并，不能重回几何球树冠。

## 5. Proposed private 3D factory integration / 私有工厂可复用的原创模块

| Module / 技术模块 | Input / 数据输入 | Core output / 输出 | Why it matters |
|---|---|---|---|
| `TerrainWorld` | Seed, 40×40 m terrain tile, splatmaps, slope, water distance | continuous world geometry + collision + material ids | Terrain must have credible physical scale / 地貌比例与可走性 |
| `FoliageContactField` | Wheel/contact position, radius, vehicle direction, soil/wetness | bend/compress/recover fields for multiple authored plant species | Response must follow actual tires / 草与接地点一致 |
| `VehicleSuspension` | Chassis rigid body, wheel locations, contact normals, steering, damping | spring/damper force, pitch/roll, slip and traction | No toy-car hovering / 无悬空滑行 |
| `SurfaceWaterSim` | Height/velocity fields, river flow, terrain depth, submerged wheel contacts | ripples and advected disturbances; shared wetness/splash events | Water must respond to the same world coordinates / 世界空间水波 |
| `WaterOptics` | surface normals, depth, sky/scene light, foam mask | refraction, reflection, Fresnel, shoreline foam, caustics where justified | Clean blue color alone is not water / 高级水光 |
| `AtmosphereArtDirection` | time, season, canopy, height and color script | coherent fog, sun/shadows, foliage palettes, color grading | Painterly atmosphere depends on scene design / 氛围统一 |
| `CameraRig` | player pose, speed, obstacles, composition zones | responsive 3/4 follow camera + occlusion | maintain comfortable visual scale / 镜头不能变形 |

All modules above are **proposed original architecture**, not Wildward source. / 上述全部是我们的可复现设计，而非 Wildward 源码。

### Minimum honest integrated vertical slice / 专业验收场景

Use one independent **40×40 m** terrain with a **20 m** winding shallow stream, one original Jeep, two original tree species, four authored grasses, one rocky bank and a short drivable path. Target visual reference shots first; **do not impose premature low-poly or hard triangle limits**. / 先完成与视频同级的局部美术，而不是先研究省面数。

Test:
1. A stationary scene at three fixed high-quality reference camera angles; validate proportion and material transitions against our own reference captures. / 三机位比例与视觉验收。
2. A vehicle moves across hard ground, wet soil, grass and water; each material triggers a distinct contact action; no ground marks while airborne. / 四种材质接触分类。
3. Wheel hits a puddle: correct world-space ripple, foam/splash event, displacement decay and return to calm; verify render and physics logs. / 轮胎碰水真实连动。
4. A tire pushes grass and vegetation recovers as it leaves; vehicle doesn't pass through trunks or stones. / 草恢复，树干有碰撞。
5. Same geometry and camera in WebGPU and WebGL2 where supported, 60-second continuous drive, p95 GPU/CPU frames and JS errors; screenshots and input recordings required. / 双路径实际跑。
6. Keep this in an isolated **private** art/physics laboratory until approval; don't change other live PlayMoru games. / 独立研发、自动回退，不影响线上项目。

**Art and code rights / 授权：** The X videos belong to the author. We link, not mirror, trace, extract assets or claim a license. MIT only applies to the respective open-source code and its notices, not arbitrary media in a repository. / 公开研究仓只放原创文字和出处，私有游戏实现和付费素材不公开。

## 6. What remains unverified / 待证伪清单

- The human developers and organizational identity behind @PlayWildward; no confirmed linkage to the medieval fantasy site of the same name. / 团队身份与同名网站关联。
- Whether the three clips are interactive engine captures, pre-rendered shots, processed footage or a combination. / 真实交互录像、离线渲染与视频加工的边界。
- Water algorithm and source; vehicle rigid-body solver, wheel physics, terrain/grass implementation, runtime metrics, asset provenance and actual co-op network code. / 全部尚无直接技术证据。
- Independent public playtest, full source license, and multi-device/browser performance data. / 尚未经过公开可玩验收。

**Conclusion / 结论：** Wildward is a **high-priority visual/system design reference** for original browser Jeep+landscape projects, but **not an audited open-source engine**. Treat its creator claims and linked clips as inspiration; verify all actual mechanisms using original code studies and repeatable browser prototypes. / 值得吸收其“自然世界一体化交互”的制作思路，不能假称已经复刻或获得源码。
