# OIA Spatial Labs · 原创技术实验室

These experiments are original educational implementations with reproducible controls and documented limitations. They are **not** copies of private game source or third-party models. / 这些实验为原创公开教学代码，具有可重复的交互和测试约定，不含私有游戏源码或第三方模型。

| Lab / 实验 | Technology / 技术 | Validation / 验收 |
|---|---|---|
| [Spatial Lab 01 — Terrain LOD](terrain-lod/) | WebGL2; 49 terrain chunks; distance LOD; procedural granular material / 真实地形与距离精细度 | Browser smoke test passed under independent headless Chrome with software GL; not a GPU performance target / 软件 GL 功能验收通过，非 GPU 性能声明 |

| [Spatial Lab 02 — GLB Asset Inspector](glb-inspector/) | Local glTF/GLB structural preflight; bounded parsing, bilingual findings, JSON export / 结构检查与诊断导出 | 15/15 Node core tests + independent headless Chrome upload/export/privacy smoke pass; **not** official Khronos certification / 通过结构及浏览器验收，非官方完整认证 |

| [Spatial Lab 03 — WebGPU vs WebGL2](renderer-compare/) | Identical original terrain geometry, two shader pipelines, sequential sampling and adapter fallback / 同场景双后端、顺序测试与故障回退 | 8/8 unit tests; Linux WebGL2 fallback PASS; Windows Chrome WebGPU + WebGL2 each 120 measured frames with zero graphic errors / 单测通过，Windows 双后端独立实测通过 |

| [Spatial Lab 04 — Motion & Tactics QA](motion-qa/) | Original WebGL2 3D debug rig, planted-foot contact, fixed-length two-bone IK, sword grip/three phases and inspectable NPC utility / 原创动作、足锁、握剑与 AI 战术诊断 | 38/38 deterministic unit tests + real Chrome 3D terrain/orbit/JSON/browser acceptance PASS; synthetic only / 三维功能验收通过，非真实动捕和人物模型 |

Run locally / 本地打开：from the repository root, run "python3 -m http.server 8000" and visit http://localhost:8000/labs/terrain-lod/.

Every new lab must include source, a bilingual technical note, non-specialist controls, explicit known limitations, and a test script or objective repeatable test instructions. / 每个新实验必须包含源码、双语说明、交互操作、已知限制与验收方法。
