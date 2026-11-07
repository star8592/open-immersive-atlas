# Game AI, Animation and Combat Quality — evidence-based research batch
# 游戏 AI、角色动作与战斗质量：有证据的工程研究

**Research date / 研究日期:** 2026-11-07  
**Evidence / 证据类型:** public original source repositories, verified GitHub licenseInfo, official GDC session pages and firsthand author articles.  
**Status / 实际完成状态:** literature/source review and original engineering acceptance plan; no new private-game motion or combat feature is claimed as implemented.

[Browse public catalog / 公开项目](../../CATALOG.md) · [Primary-source radar / 一手资料](../../sources.html) · [Repository audit program / 仓库健康核查](../../scripts/audit_repository_health.py)

## 1. A concrete quality problem / 实际技术问题

**中文：** 游戏人物的错误动作可能涉及几个完全不同的根因：

- **拿剑手反向：** 骨骼左右映射、负缩放、绑定姿态、手腕 socket、单位轴或世界/局部矩阵处理有误。
- **只有拔剑/出拳没有真正招式：** 缺少可辨识的战斗动作阶段、击中时机、目标方向和攻击输入缓冲；只是循环播放挥手片段。
- **人物在地上滑：** 角色根节点速度与步频、行走动作位移、落脚锁定和物理地形接触没有统一时间/空间基准。
- **膝盖反折：** IK 链关节朝向、pole vector、骨架镜像和超出腿长的足部目标没有安全约束。
- **敌人只有追逐没有策略：** 缺少分层感知、目标选择、行为状态、路径查询和招式/技能时间窗。

These are separate failure classes; **buying animation clips or switching the renderer will not automatically fix them**. / 出现这些故障时，只添加素材或换渲染引擎并不能自动解决。

## 2. Primary sources / 技术一手资料

### Combat animation, capture and motion synthesis / 战斗动作

1. [GDC 2026 official: The Hidden Ones — realtime AI generation of Kung Fu motions](https://schedule.gdconf.com/session/the-hidden-ones-real-time-ai-generation-of-kung-fu-motions-presented-by-tencent-games-ai/917893) — Tencent Games' official session description discusses markerless capture, compact realtime motion-generation inference, wrist/foot continuity and deployment postprocessing. It is evidence of **the speaker's reported engineering approach**, not a published reusable sword-motion model.
2. [GDC Vault original: Motion Matching and the Road to Next-Gen Animation](https://www.gdcvault.com/play/1023280/) — Ubisoft/Simon Clavet describes pose-plus-future-trajectory database search with shorter blends, instead of manually writing every transition for starts, stops and turns.
3. [GDC original speaker: Learning to Move, physics-based enemy locomotion in ARC Raiders](https://schedule.gdconf.com/speaker/singh-blom-martin/81755) — Embark/ML production research combines physics and learned motion for enemy traversal. An abstract alone is not a downloadable policy/checkpoint.
4. [three.ws Motion original source](https://github.com/nirholas/three-ws-motion) — synthesizes timed skeletal clips from structured motion scores, balance/IK/foot contact. The author claims deterministic output; verify on original test rigs before adoption.
5. [three.ws Retarget original source](https://github.com/nirholas/three-ws-retarget) — canonical skeleton mapping and rest-pose/world-space corrections. Its claims about universal rig coverage remain research hypotheses until incompatible rigs are explicitly tested.
6. [Blender Rigger original source](https://github.com/asu37/Rigger) — modular control rigging, reference landmarks, retarget and clean export. GitHub reports GPL-3.0: comply with tool-code distribution terms and keep proprietary game content separate.
7. [Motion Matching research does not replace contact physics](https://www.gdcvault.com/play/1026712/Machine-Learning-Summit-Ragdoll-Motion) — the follow-up presentation combines a learned physical character with motion matching; it does **not** imply every browser game needs reinforcement learning.

### Game AI, NPCs and strategy / 战斗 AI

- [LimboAI](https://github.com/limbonaut/limboai): Godot behavior trees plus hierarchical state machines and active-branch visual debugging. Live upstream licenseInfo MIT.
- [Beehave](https://github.com/bitbrain/beehave): Godot-native editable BT hierarchy. Live upstream licenseInfo MIT.
- [Game AI Cheatsheet](https://github.com/CanReader/game-ai-cheatsheet): independently runnable small reference algorithms and tests for FSM, utility, GOAP, influence maps, perception and navigation.
- [AI Toolkit C++](https://github.com/linkdd/aitoolkit): small FSM/BT/Utility/GOAP reference surface; is not automatically compatible with JS/WebGPU game loop.
- [Game AI Pro](https://www.gameaipro.com/): professional chapters on reactive game AI, squad tactics, influence maps, procedural pacing and automated AI tests; chapters remain copyrighted and **must not be mirrored**.
- [Tank AI Comparison](https://github.com/XiangLi2004/Game_AI_Demo): a same-arena Unity reference comparing condition-based, FSM, BT, Utility and GOAP; game assets and production balancing need independent review.

### Engineering fundamentals / 引擎基础

- [Gaffer On Games: Fix Your Timestep!](https://www.gafferongames.com/post/fix_your_timestep/) — a fixed physics step, sensible accumulator and render interpolation address variable-framerate integration errors.
- [Gaffer On Games: Networked Physics](https://www.gafferongames.com/categories/networked-physics/) — lockstep, snapshot interpolation and synchronization require different assumptions.
- [Robert Nystrom: Game Programming Patterns](https://gameprogrammingpatterns.com/) — event queues, game loop, object pools and data locality help separate the simulation state from presentation.
- [The Level Design Book](https://book.leveldesignbook.com/) — blockout and traversal design should precede expensive environment art; its CC BY-NC-SA 4.0 rights are not a commercial copying license.
- [Minerust](https://github.com/B4rtekk1/Minerust) — experimental Rust/wgpu GPU-driven voxel terrain; its stated FPS figures are creator claims until reproduced on defined target hardware.

## 3. Technical decision, not a shopping list / 技术选型和实施顺序

### A — Prioritize deterministic rig diagnosis / 先修骨骼约定

1. Parse the skinned asset's full hierarchy, rest pose, axes, world transforms, inverse bind matrices, handedness and scale determinants.
2. Build a left/right landmark fixture: left and right hand sockets, forward vector of weapon grip, elbows, knees and ankles. At a fixed pose, visual arrows must align with the actual semantic joints.
3. Use a synthetic sword with authored handle/guard/blade dimensions (not a copyrighted model). Anchor the handle to a declared grip transform, then check right-hand clasp and world-space weapon orientation across poses.
4. Check rig retarget coverage before accepting any animation. A missing wrist or an inverted upper leg is a **stop/invalid result**, never a silently generated replacement.
5. Export/import a GLB, repeat in independent browser renderer, retain original source and screenshot views.

**Suggested acceptance:** finite bone transforms; declared world-up and hand-forward; no negative determinant silently mirrored; semantic joint mapping explicit; no animation clip that changes selected sword hand while the grip socket stays bound.

### B — Build readable combat motion / 再设计真正的招式

Do **not** begin with 50 pretty attack clips. Begin with 3 professional motions using an original reference actor/approved motion source:

- **Ready → advance → thrust / 起势—进步—刺击**: explicit guard stance, target line and blade tip trajectory.
- **Cross guard → diagonal cut → recovery / 格挡—斜劈—收势**: correct shoulder/wrist rotation, guard volume and hit window.
- **Pivot → evade → return / 转身—闪避—回架**: foot pivot, hip orientation and recovery balance.

Every motion has phases: telegraph, startup, active hit window, recovery and cancel/interrupt rules. Separate authored animation data from hit detection and collider authority. Surface trail visual effects must follow a physically plausible blade path; a randomly rotated arc is not a sword technique.

**Acceptance contract:** stroke name recognized by blinded viewers; correct weapon grip and blade world pose; no mesh-through-hand, no knee inversion, stable planted foot during stance, target alignment with allowed angular error, sensible hitbox activation only in the active phase.

### C — Fix walking before trying learning-based locomotion / 行走贴地优先级高于模型炫技

Use stable physical root velocity, animation speed derived from authored stride length, stance/swing foot states, ground raycast on **collision** geometry, clamped two-bone IK and pelvis correction. Add frame interpolation only after fixed-step simulation is stable. For a production test rig with world units in meters, start with a measurable target of **less than 3 cm planted-foot drift per stance**, then calibrate against real footage and gameplay camera distance. This is a **proposed acceptance threshold**, not an observed quality result.

Motion matching or generated transitions may be tested only after the rig, ground contact and animation semantics pass. Otherwise the motion generator is forced to compensate for structurally broken input.

### D — Match decision mechanism to actual gameplay / 按需求选 AI

| Scenario | First candidate / 首选技术 | Reason / 理由 | Validate / 测试 |
|---|---|---|---|
| 3-state enemy alert/chase/attack | FSM / HFSM | Fast, debuggable | Correct interrupts, recover after target loss |
| Boss attack chain and phase transitions | Behavior tree + action timeline | Designer-directed priority and timing | Cancel, telegraph and stance consistency |
| RTS unit target/retreat/resource choice | Utility AI | Score several competing targets | Explainable score breakdown, stable target changes |
| Multi-step tactics or worker actions | GOAP or HTN after simpler baseline fails | Explicit goals, preconditions and action chains | Plan validity, bounded search CPU and replanning |
| Squads/territory strategy | Influence map + pathfinding | Spatial threat and risk fields | Avoid stuck units, compare path alternatives |

**Anti-pattern / 禁止：** Switching to GOAP for every enemy because it sounds more intelligent. A strategy that cannot be explained, debugged or reproduced is not a production win.

## 4. Proposed five parallel experiments / 五线可验证原创实验

| Independent experiment / 分线 | Synthetic input / 原创输入 | Hard outcome / 真实验收 |
|---|---|---|
| **1. Skeleton/Grip Audit** | Original humanoid rig + right-hand test sword | Left-right transforms, grip orientation, knee pole and missing-joint errors reported |
| **2. Foot IK and Locomotion** | Original 4-step walk cycle + uneven slope fixture | Planted-foot distance, knee joint limits, root displacement and fixed-step consistency |
| **3. Combat choreography** | Three original named sword techniques + target dummy | Trajectory, hit windows, pose recognition, no hand/weapon penetration |
| **4. AI tactics arena** | Original two-unit/worker arena with deterministic world states | FSM/BT/Utility/GOAP outcomes, search budget, trace logs, consistent victory and failures |
| **5. Large-world traversal** | Deterministic terrain patches + collision/navmesh | Seam gaps, slope/step collisions, replan correctness and real GPU pass p95 |

The five results can be developed independently after shared contracts for units, handedness, frame coordinates, rig semantics and test fixtures are agreed. / 共用接口一致即可五线并行，不需要所有工作互相等待。

## 5. Licensing, maturity and reproducibility / 授权、成熟度和真实证据

The new catalog batch reports live GitHub licenseInfo for **14 separately checked repositories**, including MIT, Apache-2.0, GPL-3.0 and Zlib. This metadata does not certify source quality or determine rights to every bundled character model, sound, training dataset or artwork. A repository labeled "experimental" is an input to a controlled test rather than a reliable product dependency.

Other discovered candidates were **not** added as production-ready records: [Roboticela/Animator](https://github.com/Roboticela/Animator) was marked archived and AGPL-3.0 by GitHub; [ekza-space/ekza-studio](https://github.com/ekza-space/ekza-studio) and [chiuta/osatura](https://github.com/chiuta/osatura) yielded licenseInfo NOASSERTION, requiring manual inspection before claiming an SPDX license. They may be revisited for research but must not be silently treated as unrestricted.

Only original engineering notes, links and fixture designs are published here. A GDC speaker description is not evidence that private proprietary trained motion models have been released, nor that our sword-animation problems have already been repaired.

## 6. Priority / 下一步优先级

**P0:** Original right-hand weapon/rig diagnostic scene, planted-foot locomotion fixture and deterministic two-agent tactical comparison. These directly address visible faults in real RPG/RTS tests.

**P1:** Motion-matching A/B against conventional blending, licensed-asset workflow and a dedicated game AI observability panel. Compare actual behavior with identical gameplay conditions.

**P2:** Learned physical locomotion on representative hardware only when P0 test rigs and contact metrics are already stable; otherwise cost and model complexity obscure basic motion errors.

**No production deployment or game-side animation repair is claimed in this research batch. / 本批是研究成果和验收标准，尚未表示对应私有游戏功能已上线。**
