# Lane 03 — Locomotion, cadence, animation transitions and foot IK
# 分线 03 — 行走节奏、动作融合、落脚锁定和逆运动学

**Status / 状态:** Independently verified original documentation and open repositories. This note does not claim any existing character has been repaired. / 研究阶段，不宣称任何既有角色动作已在游戏内修好。

**Tracking:** [OIA research #6](https://github.com/star8592/open-immersive-atlas/issues/6)

## Upstream technical references / 一手技术资料

- [Three.js Animation System](https://threejs.org/manual/pages/animation-system.html) / [AnimationMixer API](https://threejs.org/docs/pages/AnimationMixer.html) — clips, actions, blending, crossfades, time scaling and synchronized animation states.
- [Three.js CCDIKSolver](https://threejs.org/docs/pages/CCDIKSolver.html) — supports IK chains with effectors and constrained joints on skinned meshes; a solver is not itself a complete planted-foot controller.
- [MULUALEM-TEKLE/IK-test](https://github.com/MULUALEM-TEKLE/IK-test) — original implementation description for foot contact state, planted locks, two-bone IK, smoothing and pelvis correction.
- [jsantell/THREE.IK](https://github.com/jsantell/THREE.IK) — FABRIK approach for multi-joint effectors; its README describes it as work in progress.
- [Original Ozz foot IK sample discussion](https://github.com/fenghuayumo/DIVSHOT/blob/master/external/ozz-animation/samples/foot_ik/README.md) — raycast to ground, ankle aim, pelvis displacement and reachability, and limits of simple planting.

## Why an animation clip alone still looks wrong / 为什么有走路片段仍然会滑

**中文：** 角色看起来“滑”可能是根节点移动速度与走路周期不同步；看起来“膝盖反折”往往和骨骼关节轴、静态绑定姿势、IK 膝盖平面和不可达足部目标有关。仅仅添加 Walk 动画，或者无限加大 IK 迭代次数，都无法彻底解决。

**English:** Foot skating is a *relationship* between root travel distance, animation phase and contact stance. A backwards knee can be a rig-axis/rest-pose error, incorrect pole direction or an unreachable IK target. The solution needs a state machine plus contact-aware constraints, not a longer animation clip.

### Independent subsystems / 独立子系统

1. **Rig audit / 骨骼结构审计:** Verify left/right bone maps, parent topology, rest pose, handedness, knee flexion axis, ankle orientation, stable humanoid scale and mesh skin weights. Validate negative scaling/mirrors before solving joint angles.
2. **Motion state graph / 动作状态图:** Idle → Walk → Run → Stop → Turn → Jump → Land with blending and interruption rules, not one disconnected animation clip per keyboard event.
3. **Cadence matching / 步频同步:** Convert actual root linear speed into animation cycle rate based on each clip's authored stride distance; accelerate and brake without teleporting the gait phase.
4. **Contact state / 足部接触:** Determine whether a foot is swinging or planted using gait phase, toe height and estimated toe velocity. Use hysteresis so it does not lock/unlock every frame.
5. **Ground raycast / 地形查询:** Query *collision* geometry for sole position and normal, not only the visual terrain shader. Account for heel/sole thickness and reachability.
6. **Two-bone IK + knee pole / 双骨 IK:** Hip–knee–ankle must solve target distance with joint limits, preserve anatomical flexion direction and clamp impossible full extension. Position target is different from ankle orientation target.
7. **Pelvis correction / 骨盆校正:** Raise/lower pelvis within a declared range when standing on uneven terrain; limit abrupt shifts to avoid "bobbing" or knee snapping.
8. **Pose composition / 动画叠加:** Base locomotion → turn/weapon/upper-body animation → IK adjustment → final pose. Weapon grip transforms must follow a semantic wrist and hand socket; an unconstrained prop offset can intersect or reverse the hand.

## Proposed original architecture / 推荐原型结构（尚未实现）

Represent each clip with metadata (duration, authored stride length, foot-down intervals, retarget coverage). Build a deterministic motion-state machine whose transition snapshots can be tested without any rendered mesh. Apply AnimationMixer and per-action weights only after the state machine selects weights; do not mix per-frame world transforms with conflicting animation root offsets.

Feed the physical root transform from a collision controller, not untested raw joystick speed. Anchor a planted foot in world coordinates for its stance interval; during swing, track the animated target through a timed Bézier/arc approach. Solve IK only within physical leg reachability, and taper blending toward the unconstrained clip where the target is invalid.

Explicitly separate **weapon swing trajectory** from locomotion leg IK: the sword/prop should be attached at a hand socket, tracked in the same rig space, with collision volumes/animation contact timing validated independently.

## Proposed acceptance data / 建议验收指标（未实测）

| Scene / 工况 | Objective checks / 客观检查 |
|---|---|
| Start/stop / 起停 | No root teleport or action weight discontinuity at state transitions |
| Slow walk / 慢走 | Root displacement matches declared clip cadence; planted foot drift is logged in world units |
| Run → walk / 跑转走 | No phase flip, foot shuffle or sliding at transition |
| Slope 20° / 20度坡 | Foot sole follows collider normal with permitted ankle rotation, no knee inversion |
| Stair 0.25m / 台阶 | Pelvis and ankles correct reach; feet do not penetrate or visibly hover |
| Jump/land / 起跳落地 | Foot lock releases during flight; reacquires ground only after grounded event |
| Direction reverse / 方向反转 | Knee pole remains anatomically valid; no handedness inversion |
| Prop interaction / 道具交互 | Grip attachment follows the correct hand without teleportation or wrist penetration |
| Frame rate / 帧率 | Compare deterministic 30/60/120 Hz render sequences with fixed animation tick and measured foot slip |

Suggested initial thresholds to **calibrate**, not guaranteed quality: planted-foot horizontal drift ≲ 3 cm over an ordinary stance period in a scene where 1 world unit is 1 meter; no knee bend beyond authored joint limits; zero mesh penetration in fixed collision fixtures. Human motion-capture pose and screenshot review remain necessary.

## Failure modes & privacy boundaries / 常见错误和边界

- Retargeting is not a free guarantee: if a skeleton lacks known joints, report partial coverage and refuse to fake a pose.
- Two-bone IK on an impossible leg target must fail gracefully, not flip the knee to hit it.
- If root displacement and animation motion are both applied, double motion causes drift; define one authoritative owner.
- Avoid proprietary clips and models in the public technical notes. Check per-repository licensing and asset rights before importing third-party animations.

**Next research experiment / 下一步：** use an original minimal two-leg rig and scripted test slopes to measure planted-foot world-space movement, knee-plane stability and state-transition continuity before applying the architecture to any private game.
