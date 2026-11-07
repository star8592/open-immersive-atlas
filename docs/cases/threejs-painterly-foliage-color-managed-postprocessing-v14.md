# Three.js 林间植被后处理：透明混色、色彩空间与验收方法
# Color-Safe Painterly Foliage Postprocessing in Three.js

Date / 研究日期：2026-11-07  
Keywords: Three.js 0.180.0, WebGL2, alpha transparency, foliage, OutputPass, EffectComposer, ACES, sRGB, painterly forest, visual QA

## Why this matters / 为什么关键

优秀的水彩森林依赖真实树叶形态、正确植被叠色和自然景深。添加新的后处理效果不是单纯的代码开关：即使着色器编译成功、零异常、浏览器维持 60Hz，画面也可能明显变灰、变亮或变暗。

A zero-strength effect should not be presented as a successful visual filter if output colors differ materially. The art review must compare screenshots at a fixed camera and paused scene clock, not just visually inspect an arbitrary running frame.

## The official pipeline / 官方后处理结构

Three.js official docs describe:

- EffectComposer(renderer)
- RenderPass(scene, camera)
- Optional custom ShaderPass (performed in linear working color when applicable)
- OutputPass() — applies final tone mapping and output display color transform, typically sRGB

Primary source: https://threejs.org/manual/pages/how-to-use-post-processing.html

Important exception: for some image-space effects that specifically expect encoded sRGB input (e.g. FXAA), effects may need to run after output conversion. Do not assume that arbitrarily adding an sRGB fragment chunk to a shader fixes a working-space mismatch.

WebGLRenderer can blend transparent surfaces directly in display sRGB, while composer workflows blend more correctly in scene-linear light. An alpha-heavy forest with many overlapping foliage cards may therefore show very different results between the two, despite both being internally valid GPU paths. This is particularly relevant to mobile forests with hundreds of thousands of grass and leaf-card fragments.

Three.js forum discussion: https://discourse.threejs.org/t/color-differences-in-tsl-for-an-alpha-material/77693  
Three.js OutputPass documentation: https://threejs.org/docs/pages/OutputPass.html

## Real case study: Forest Courier V14 / 真实实验

The scene uses authentic glTF models, multiple transparent leaf meshes, physically placed grass and a foliage-heavy camera view. The experiment built a pinned official Three.js 0.180.0 EffectComposer -> RenderPass -> ShaderPass -> OutputPass stack with locally vendored modules and verified WebGL2 shader compilation.

Real Chrome 157, NVIDIA RTX 5070 Ti, fixed 1280×720 frame:

| Condition | Measured observation |
|---|---|
| Original direct WebGLRenderer | Mean RGB approximately (78.1, 104.4, 61.1) |
| Composer with blur strength exactly 0 | Mean RGB approximately (99.1, 124.3, 86.0) |
| Full-frame mean absolute RGB difference at zero blur | About 22.54/255 |
| Exposure calibration 0.55 to 1.10 at a lower forest camera | Best tested MAE about 12.78/255, still not color-neutral |
| Shader/WebGL/HTTP errors | Zero (therefore technical pass but **visual FAIL**) |

**Decision:** the candidate postprocessor was **rejected and removed from the shipping HTML**. The experimental code/measurements remain only in a private development research folder; no copyrighted reference-game shader or visual assets are copied here.

## Separate art technique that DID pass / 成功的替代路线

Rather than adjusting the entire 2D screen, original physically located tree-leaf materials received a very restrained optional emissive/backlight response and a weak real directional sky-fill light. Under one fixed low forest camera, the mean RGB changed from (51.5,75.0,44.4) to (58.8,86.2,50.4); turning the optional effect off restored the original scene **pixel for pixel (MAE 0.0)**. This verifies the change is reversible and the scene is not destructively recolored.

This is a meaningful technical look-development milestone, but **does not establish premium source-art watercolor parity**. Professional original botanical atlases, physically believable canopy profiles, color-matched terrain, varied glade composition and independent artist review are still required.

## Suggested reusable acceptance tests / 建议进入图形研发标准

1. Freeze the same camera, same GLB state, same renderer dimensions and dynamic time before comparison.
2. Snapshot the direct baseline, zero-strength post, target strength post and restored direct baseline.
3. Compute RGB mean, absolute error, center-vs-edge distribution and screenshot difference. Reject significant zero-strength color changes unless they are explicitly an intentional alternate render-style redesign.
4. Verify real WebGL2 or WebGPU hardware device, import requests HTTP 200, model/textures loaded, no shader errors, and screenshot is actually produced from live 3D.
5. Keep a complete standalone packaged runtime plus independent clean ZIP extraction QA, so success does not depend on a developer's machine-local or parent-directory asset paths.
6. Test a full keyboard-driven game route and physically relevant collisions separately from art view, and do not confuse requestAnimationFrame intervals with direct GPU hardware frame-time samples.

## Source / copyright boundaries

This entry contains original measurement conclusions and public links only. It does not mirror proprietary game code, screenshots or paid Unity vegetation packs. Check the source and license of every asset before adapting it. The original inspiration Tiny Delivery is an artistic case study, not a source of reusable copyrighted meshes.

**Conclusion / 总结:** 画面优先，色彩一致性优先。一次正确且可回退的 GLB 叶片和光照改造，胜过一个虽然能运行却破坏整个森林色彩的后处理效果。
