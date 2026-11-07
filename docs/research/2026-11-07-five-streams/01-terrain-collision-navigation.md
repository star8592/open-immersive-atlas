# Lane 01 — Terrain collision, grounded motion and navigation
# 分线 01 — 地形碰撞、角色贴地与导航

**Research status / 状态:** Verified upstream documentation and repository references; architecture and acceptance tests are **proposals**, not an implemented game fix. / 已核对原始资料；工程建议与验收标准尚未在具体游戏中实现。

**Tracking / 跟踪:** [OIA public research issue #4](https://github.com/star8592/open-immersive-atlas/issues/4)

## Primary evidence / 一手证据

- [Rapier JavaScript character controller](https://rapier.rs/docs/user_guides/javascript/character_controller/) — official documentation describes kinematic character translation, maximum walkable slopes, automatic stepping, snap-to-ground and collision data. / 官方解释胶囊角色的运动校正、坡度、上台阶与贴地。
- [Rapier controller collisions](https://rapier.rs/docs/user_guides/javascript/character_controller_collisions/) — controller contacts and interaction with dynamic bodies. / 接触事件及动态物体处理。
- [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) — accelerated spatial queries against triangle meshes; does not itself replace a full rigid-body physics world. / 三角网格 BVH 查询，不等于完整物理引擎。
- [Recast Navigation JS](https://github.com/isaac-mason/recast-navigation-js) and [Recast/Detour reference](https://github.com/recastnavigation/recastnavigation) — independent navmesh generation and pathfinding; navmesh is a *routing representation*, not the collider. / 导航网格用于选择可行路径，不代替碰撞体。

## Core diagnosis / 问题真正的分层

1. **Render geometry / 可视地形:** High-resolution surface for appearance, fine pebbles, cliffs and vegetation. Changing render LOD must *not* silently change collision semantics.
2. **Collider geometry / 物理几何:** Stable heightfield for broad terrain, trimesh or simplified hulls for cliffs/architecture, capsules for characters. Dynamic rigid-body geometry and static terrain require different collider policies.
3. **Character movement / 角色控制:** Fixed-step desired motion → swept/kinematic corrected translation → grounded/slope/step classification → visual pose. Raycast-only "put feet at height" cannot prevent a fast character from tunnelling through a wall.
4. **Navigation mesh / 寻路网格:** Recast's walkable surfaces are baked using agent radius/height and maximum slope. NPCs plan on navmesh but the controller still checks collisions at runtime.
5. **Animation contact / 动画贴地:** Animation foot locking and pelvis correction happen **after** the physical root position is resolved. The render skeleton never directly authoritatively overwrites the collider's grounded position.

**English:** Separate what a surface *looks like*, which space a character may *occupy*, which way an NPC can *plan*, and how a foot *looks planted*. Collapsing them into one render mesh is a common source of penetrations, sliding and scene-scale instability.

## Candidate implementation sequence / 建议原型顺序

- Create a fixed-step test course: flat plane, 15°/30°/45° slopes, 0.1m/0.3m/0.5m steps, walls, narrow corridors, moving platforms, uneven triangle edges, heightfield chunk boundaries.
- Keep world coordinate units explicit (e.g. 1 unit = 1 meter) and record collider shapes separately from visual meshes; do not invent scale retroactively.
- Use a kinematic capsule + Rapier controller to compute corrected movement. Evaluate slope climb, autostep, snap-to-ground, step-on-dynamic and collision filters as **measured choices**; the official defaults are not universal quality settings.
- Add terrain hits and surface-normal queries for animation; add Recast navmesh generation and compare navigation polygons against the physical collision course.
- Run the *same* deterministic inputs with 30/60/120 Hz render cadence while the physics step remains fixed. Verify movement invariants and no frame-dependent walking through walls.
- Independently test cross-chunk LOD transitions: **render** LOD changes should not force rebuilding the authoritative static collider every frame.

## Proposed reproducible acceptance / 可重复验收建议（未执行）

| Test case / 测试 | Proposed assertion / 建议判据 |
|---|---|
| Wall impact / 墙壁 | High-speed movement stops at swept capsule contact, no tunnelling |
| Stairs / 台阶 | Expected small step succeeds; taller prohibited obstacle fails |
| Slopes / 坡面 | Angles below tested climbing limit pass; exceeding limit does not climb |
| Ground snap / 下坡贴地 | No visible airborne gap after shallow downhill movement when grounded |
| Fast camera / 快速移动 | No collider instability when render LOD changes while moving |
| NPC path / NPC 寻路 | Path stays on navigable polygons; dynamic obstacle still requires runtime avoidance |
| Frame cadence / 渲染帧率 | Same fixed physics inputs yield equivalent end positions and contact flags |
| Coordinate scale / 比例 | All exported collider dimensions use declared world units, not screenshot-scale estimates |

Log before/after root position, contact normal, penetration depth when available, grounded flag, collision count, animation foot gap and CPU p95. These metrics are **test contracts**, not reported successful experiments.

## Risks and reuse boundary / 风险与授权边界

- Rapier character controller does not rotate the player's pose automatically; visual facing and animation must be handled separately.
- Recast navmesh generation is not a replacement for collision resolution; agent configuration changes walkability.
- BVH raycasts alone are insufficient to prove swept-character collision, and visual meshes with open non-manifold boundaries are poor general-purpose static trimesh colliders.
- Review upstream licenses and versions before direct dependency integration. This note contains no copied upstream code, no proprietary project file, and no private terrain asset.

**Next independent experiment / 下一实验：** a self-contained public collision course with debug contacts and repeatable motion scripts, or private game integration only within the private repository; mark their validation separately.
