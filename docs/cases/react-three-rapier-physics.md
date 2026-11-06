# React Three Rapier: physics that makes browser 3D feel substantial
# React Three Rapier：让浏览器里的载具、人物和地形真正有物理关系

**Reviewed / 核查：2026-11-07**  
**Primary sources / 一手资料**
- [React Three Rapier repository and README / 开源仓库与文档](https://github.com/pmndrs/react-three-rapier)
- [Rapier JavaScript guide / Rapier 物理引擎](https://rapier.rs/docs/user_guides/javascript/)

**Evidence / 证据：** maintained public repository and documented API; no independent gameplay benchmark.  
**Rights / 许可：** `pmndrs/react-three-rapier` is MIT. Check dependency versions and all art licenses independently.

## Why this is not simply another shader / 为什么它很重要

**中文：** 让场景「看起来像 3D」很容易，难的是让脚、车轮、刀、墙、地貌在同一尺度内互相作用。React Three Rapier 把基于 WASM 的 Rapier 引擎接入 React Three Fiber，支持刚体、自动或显式碰撞器、关节、传感器、碰撞事件、力和冲量、实例化及物理状态管理。它解决的是**空间行为与物理语义**，不是把渲染模型直接变成真实模拟。

**English:** Good shaders do not prevent sliding feet, toy-scale vehicles or swords clipping through hands. React Three Rapier wraps WASM-based Rapier for R3F: rigid bodies, colliders, constraints/joints, sensors, collision events, applied forces and snapshots. It is a framework for spatial behavior, not an automatic guarantee of believable vehicles or animation.

## Mechanisms to learn / 四个关键机制

1. **Visual mesh ≠ collision shape / 可视网格与碰撞体分离。** Use a simple fit-for-purpose collider for real-time movement and preserve high-resolution geometry for rendering; inspect compound shapes where a single cuboid is misleading. / 视觉网格保精度，物理几何按需求简化并核对接触。
2. **Fixed physics step and interpolated render / 固定物理步与插值渲染。** Physics advances deterministically; rendering may be variable-rate. Verify movement and collisions at both fast and slow frame intervals. / 不允许因帧率变化出现穿墙或速度漂移。
3. **Joints and contacts / 关节与接触。** Test hinged doors, crates, a wheel suspension prototype, and contact forces separately. A hand gripping a sword also needs proper skeleton attachment and interaction choreography; a rigid-body joint alone does not correct a broken animation rig. / 剑术仍需骨骼挂点和动画约束。
4. **Physical effects / 物理反馈可视化。** Track marks should be emitted from *actual* wheel/terrain contacts, in local terrain coordinates, at real-world scale, with temporal fading and a drawing budget. / 轮胎印来自真实触地点，既不是屏幕贴图，也不能无限增殖。

## Proposed original game experiment / 可迁移到原创游戏的实验

- **Scene A: vehicle / 载具。** A six-wheel original rover traverses a meter-scaled terrain with small rocks. Record wheel contact, pitch/roll, suspension, lateral slip, skid marks and camera orbit. Test obstacles at known dimensions. / 用米制六轮车测试地形、车辙、转弯侧滑和镜头旋转。
- **Scene B: sword / 剑术。** Verify `hand_grip`, `sheath_mount`, draw and release markers and multi-angle screenshots. Use collider queries for hit confirmation; validate the rig itself before using physics effects. / 剑必须真正在持剑手中，拔剑有握柄时序与多机位证据。
- **Scene C: building / 建筑。** Sweep avatar and projectiles against stairs, doorframes, diagonal walls and moving props; report penetration and camera clipping. / 逐一测台阶、门、斜墙与弹丸碰撞。

## Evidence and acceptance / 验收

Measure contact correctness, collision events, p95 physics frame time, broadphase counts, input latency, position divergence under frame-rate changes and screenshot-visible scale. Keep source models and unreleased game integrations private. The public atlas records **technique and tests**, not product implementation.

**Status / 状态：Source-level research only; no claim of completed rover track marks, sword rig repair, or production integration. / 目前是源码级研究，不是假称已修复游戏。**
