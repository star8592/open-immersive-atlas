# OIA Spatial Labs · 原创技术实验室

These experiments are original educational implementations with reproducible controls and documented limitations. They are **not** copies of private game source or third-party models. / 这些实验为原创公开教学代码，具有可重复的交互和测试约定，不含私有游戏源码或第三方模型。

| Lab / 实验 | Technology / 技术 | Validation / 验收 |
|---|---|---|
| [Spatial Lab 01 — Terrain LOD](terrain-lod/) | WebGL2; 49 terrain chunks; distance LOD; procedural granular material / 真实地形与距离精细度 | Browser smoke test passed under independent headless Chrome with software GL; not a GPU performance target / 软件 GL 功能验收通过，非 GPU 性能声明 |

Run locally / 本地打开：from the repository root, run "python3 -m http.server 8000" and visit http://localhost:8000/labs/terrain-lod/.

Every new lab must include source, a bilingual technical note, non-specialist controls, explicit known limitations, and a test script or objective repeatable test instructions. / 每个新实验必须包含源码、双语说明、交互操作、已知限制与验收方法。
