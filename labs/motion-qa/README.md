# Spatial Lab 04 — Motion & Tactics Quality / 三维动作与战术质量实验

[Run original live demo / 打开实验](https://star8592.github.io/open-immersive-atlas/labs/motion-qa/) · [OIA labs index / 实验列表](../) · [Bilingual animation and game AI research / 动作与 AI 技术研究](../../docs/research/game-ai-motion-quality-2026-11-07.md)

**Project status / 状态:** Original, dependency-free native WebGL2 debug scene + deterministic numerical verification, **not** a final skinned human character or licensed martial-arts mocap.

This lab was created to make several frequently confused game-development problems observable **as separate subsystems**: contact and grounding, joint-chain reachability, anatomical knee-pole direction, semantic hand socket, sword-phase timeline, and NPC utility decisions. / 这个实验针对游戏人物滑步、膝盖反折、拿剑方向不对、出招没有节奏、敌人不会应对等症状，逐项建立可复现的基础测试。

## Five independent engineering units / 五条相互隔离的计算模块

| Source | Purpose / 作用 | Evidence / 验收 |
|---|---|---|
| [terrain.mjs](terrain.mjs) | Ground heights, slope/step samples, planted-foot anchors, stance/swing, foot drift / 地形与触地锁定 | Fixed same-cycle foot coordinates; ground/swing fixture tests |
| [kinematics.mjs](kinematics.mjs) | Semantic rig audit, fixed-length 2-bone IK, knee pole projection, unreachable-target clamp / 语义骨架与膝盖 IK | Original joint marker tests; length, clamp, knee forward checks |
| [combat.mjs](combat.mjs) | Three original sword gestures: thrust, diagonal cut, parry; anticipation, hit-active, recovery, guard / 右手剑柄与招式阶段 | Wrist/hilt coincidence, blade length, distinct tip tracks and timing |
| [tactics.mjs](tactics.mjs) | A transparent utility-scored enemy with approach/strike/retreat/search/guard and cooldown / 可解释敌人决策 | Deterministic state traces, priority and cooldown assertions |
| [acceptance.mjs](acceptance.mjs) | Combined cross-scene numerical fixtures with a machine-readable test report / 五模块联合测试 | Flat/slope/stair fixtures and six named QA checks |
| [visual.mjs](visual.mjs) | An original actual WebGL2 3D renderer of terrain, primitive limbs, contact markers and sword / 原生 WebGL2 三维可视化 | Independent actual Chrome 3D shader, terrain and UI smoke |

All source geometry is generated in JavaScript; **no dependencies load on the public site**. The original projection utilities from [Spatial Lab 03](../renderer-compare/scene.mjs) are reused to avoid duplicate coordinate conventions. No models, textures, imported videos, game private files or third-party clips are used.

**World coordinate convention / 坐标约定：** 1 unit = 1 metre, **+X right, +Y up, +Z forward**. Bone lengths are fixed and checked after solving. Stance foot positions are world-anchored during planted phases, independent of the root's forward travel.

## What the measured numbers actually mean / 指标边界

- **Planted-foot drift / 支撑脚滑动：** maximum consecutive world-coordinate step displacement among contact samples in the current synthetic rig, **not** a score from independently captured video. The current model analytically anchors the planted foot, so a zero drift result proves the fixture obeys its own constraint, not that a shipped character walks naturally.
- **IK reach error / IK 可达误差：** difference between the requested ankle target and the nearest physically reachable ankle, while keeping both leg bone lengths fixed. A nonzero value means the target was clamped; not all errors imply an inverted knee.
- **Knee pole / 膝盖朝向：** the knee component in the chosen forward-pole plane remains positive. This is a demonstration joint-axis constraint; real humanoid joints require calibrated joint frames and per-character limits.
- **Sword grip / 握剑误差：** hilt and declared right-wrist socket share a world transform. A zero gap demonstrates mathematical attachment only; it does **not** prove the hand looks human or is rotated correctly for an existing character's authored mesh.
- **Attack phase / 招式时间窗：** three original procedural trajectories with 22% windup, 30% active, 32% recovery and final guard; this is an explicit, inspectable toy sequence, **not certified Chinese sword technique**.
- **Enemy AI / 敌人 AI：** deterministic utility scores and a fixed cooldown show *why* an action was selected. It is not trained ML, tactical pathfinding or production boss AI.

## Tests / 可复现测试

From repository root:

    node --test labs/motion-qa/test-core.mjs

Optional actual Chrome with locally installed Playwright:

    OIA_PLAYWRIGHT_MODULE=/path/to/playwright \
      CHROME_EXECUTABLE=/path/to/chrome \
      OIA_SWIFTSHADER=1 OIA_NO_SANDBOX=1 \
      node labs/motion-qa/test-browser.mjs

In an environment with proper Chrome GPU support, omit the SwiftShader and no-sandbox overrides. The browser smoke checks actual WebGL2 initialization and GL error code, 3 terrain modes, 3 different techniques, NPC retreat/search, orbit and zoom, the six-component quality audit, local JSON download, and no external network requests.

**Initial acceptance / 首轮实测 (2026-11-07):** 38/38 deterministic Node tests **PASS**. Independent headless Chrome software-WebGL2 smoke **PASS**: 2 real draw calls, 3 terrain modes, 3 techniques, NPC state changes, 6/6 synthetic fixture QA, JSON report, camera orbit/zoom, **0 WebGL2 errors, 0 page JS errors, 0 external requests**.

The software browser demonstrates **functional correctness of this debug lab**, not production GPU FPS or professional animation quality.

## What this does not solve yet / 尚未解决

1. **Actual GLB/VRM humanoid rig import.** Bone naming, bind-pose transforms, animation retarget and deforming skin are not part of this lab.
2. **Real sword grip orientation and choreography from reference video.** Here the wrist/hilt matches mathematically, but does not hold a skinned character's weapon.
3. **Full collision controller, real physics engine or character/world navmesh.** Terrain height queries are used only for the synthetic contact fixture.
4. **Physical self-collision and actual weapon impact/hitbox/defense rules.** Timed phases are not collision events.
5. **Procedural vs captured motion quality.** Need approved videos/animations, a rig-permission plan, pose retarget coverage, per-frame screenshot and real-actor comparison.
6. **Production frame budgets.** Real GPU timestamp metrics are available in the separate [Spatial Lab 03](../renderer-compare/) but not used as proof here.

## Next validation / 下一轮

- Import a **license-cleared original GLB** and verify semantic joints, handedness, bind transforms, negative scale and right-hand sword socket.
- Add humanoid foot IK with physical terrain collider and measurable contact slip against an external pose reference.
- Author true original technique segments with defined strike planes, guard stages and target alignment; only claim motion-capture quality after independently verifying target footage, source rights and retarget errors.
- Compare finite-state and utility AI in a real tactic fixture, including target visibility, path reachability, timed attack windows and recovery.
- Introduce independent reference actor/blind reviewer ratings and compare real browser captures; do not use self-consistency alone as evidence of realistic motion.

**Rights and privacy / 授权隐私：** Original code, no scraped user content, no third-party asset redistribution, no telemetry, no upload. Public research findings never include private game source or unpublished models.
