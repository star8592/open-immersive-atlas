# Tiny Delivery 森林美术：从作者原始流程到真实 CC0 植被实机验证
# Painterly Forest Art: From the Original Developer Workflow to Real Licensed-Mesh Tests

Research verified: 2026-11-07  
Tags: Three.js, WebGL2, foliage, painterly lighting, botanicals, licensed meshes, ambient art, color management

## 1. 首先核实原作者真正使用的美术来源 / What the creator actually used

Original creator: **Artem Sinica** (Tiny Delivery). Original technical breakdown published 2025-12-31:

https://medium.com/@sinitsyndev/step-by-step-environment-creation-breakdown-in-unity-4073f1a73125

This article establishes that the attractive painted woodland is not mainly built with cones and low-face-count procedural trees. It uses real third-party foliage libraries and dedicated look-development in Unity URP. The author explicitly identifies:

| Creative responsibility | Product / workflow named by the original author | Three.js transfer lesson |
|---|---|---|
| Main meadow and grass species | Meadow Environment — Stylized Pack | Professional vegetation species assets must precede grass optimization |
| Secondary forest shrubs/flowers | Fantastic Ancient Forest | Integrate several species with consistent color grading |
| Landscape shaping | Unity Terrain + Path Painter II | Physically continuous, slope-aware earth / track / waterbank meshes |
| Ground albedo editing | F-Texture Tools | Color-match the underlying terrain to actual grass/leaf materials |
| Water | Stylized Water 3 | Shore depth, color transmittance, accurate underlying geometry |
| Camera atmosphere | Artistic Tilt Shift | Deliberately calibrated miniature focus; cannot sacrifice color space |
| Texture & color workflow | Linear scene color space, HDR look development | Preserve correct linear-light shading and final display transform |
| World dressing | Rocks, fences, ruins, moss, flowering patches | Ecology and story-informed composition, not uniform scattering |

**中文总结：** 视觉精髓是素材美术的质量、种群搭配、构图、统一色彩与镜头气氛。优化面数属于之后的技术问题。仅增加程序草叶实例、使用锥形树或者调出更高 FPS，绝不等于美术进步。

## 2. CC0 三维植被 A/B 的可复现来源 / Verified model data chain

Original source author and CC0 pack:
https://quaternius.itch.io/stylized-nature-megakit

Public derivative repo:
https://github.com/anshaneja5/skyline-run/tree/main/public/assets/models

Source/credit mapping:
https://github.com/anshaneja5/skyline-run/blob/main/CREDITS.md

Tested independently downloadable GLB data from the derivative:

| Filename | Original identified model | Native triangles | Source SHA-256 prefix |
|---|---|---:|---|
| tree1.glb | CommonTree 1 | 6,257 | 6d9116dcc683ab1816 |
| tree2.glb | CommonTree 2 | 5,625 | c12c15f49f03983026 |
| tree3.glb | CommonTree 4 | 4,065 | 2e935e32bd6c4ed883 |
| bush.glb | Bush Common | 900 | b1e3074d40719adcd5 |

The above four files are derivative optimized Web-ready glTF/GLB models; they are **not** the full official MegaKit download. The official original Nature pack and the distributor's specific CREDITS provide the license chain. A generic license file shipped in the derivative repository discusses the separate Downtown City MegaKit; do not mistakenly present it as the source Nature pack's exact original legal text. Both Quaternius packs are advertised as CC0, but a file-level provenance distinction still matters.

**Actual rendering test:** Real NVIDIA RTX 5070 Ti / Chrome 157 ANGLE WebGL2 loaded all four source GLBs with original texture maps and material groups, compared 12 added source trees and 58 ecologically clustered bushes against 110 existing full-detail source trees. Original models remained fully intact. Browser toggle let reviewers switch the new models on/off without adjusting camera or terraforming. Zero script/HTTP/WebGL errors in that test, but this proves only the technical integration.

**Practical decision:** Source licensing and GLB loading are necessary but not sufficient for selecting final art. A real GLB can still be artistically too chunky or have mismatched greens. Start from licensed source, then do shader/material lookdev and side-by-side artist review. Do not claim that a generic CC0 low-poly pack equals the professionally styled pack actually used by Sinica.

## 3. What transfers faithfully to browser 3D / 如何转化为专业浏览器游戏

- Use high-detail geometry or artist-rendered botanical textures in close shots; mid/far may choose efficient instancing only after visual approval.
- Ground, foliage instance colors, mossy rocks and shallow-water bank edges must use coherent world-space masks and color families.
- Add canopy shadow, darker root color and clustered wildflowers at the correct terrain altitude, not unsupported floating vegetation.
- Keep tree and shrub root contacts exact, avoid obvious primitive silhouettes and preserve real world mesh winding/UV/material groups.
- Compose the camera: main grassline, bridge focal point, edge bushes, future interaction target and clear roads in one readable layer.
- Use real native browser screenshots and compare *same camera* on/off; include at least three camera scales and at least one screenshot with the source reference as an independent visual comparison (never packaging copyrighted source screenshots as your own original model).
- Art review and engineering metrics remain separate. Renderer 60 FPS can coexist with an ugly scene; this must not pass the art gate.

## 4. Failed experiment worth preserving / 色彩空间错误案例

The original author names Artistic Tilt Shift as part of the scene camera workflow. An original browser full-screen blur/post-pass was prototyped, but the test exposed different average brightness from direct rendering:

- Direct scene output showed mean RGB around **(78.4, 104.6, 61.4)** in one fixed Chrome camera.
- An uncorrected postprocessor had visibly overbright/washed foliage.
- Removing the output color transform over-darkened the foliage.
- A naive ACES+sRGB correction still yielded incorrect brightness in that pipeline.

**Conclusion:** A post-process is not technically done merely because it compiles and gets 60 FPS. Offscreen texture colorSpace, linear/sRGB handling and renderer tone mapping must be reconciled with the baseline screenshot in real pixels. The experiment was deliberately rejected, not shipped by default as a beauty filter. A future implementation should use the proper renderer reference color management and image-difference tests before proposing the effect as an artistic improvement.

## 5. Reuse policy / 复用和版权边界

- Link to creator references and verified openly licensed resource pages.
- Store exact asset source URLs, license claims, derivative authors and hashes.
- Do not copy/paywall-bypass the author's Unity asset-store vegetation, game textures, screenshots, source art or proprietary code into this library.
- Do not mirror a full third-party asset bundle in this public research repository; catalog and verify it instead.
- Keep original game production implementation separate from this public bilingual knowledge base.
- Choose beauty and coherence first, then independently measure GPU memory, shader latency, draw calls, grass overdraw and hardware cross-platform performance.

**Core lesson / 核心结论：** 先有美术资产与审美验收，再做性能预算。真正的森林质感来自被精心挑选和统一调性的完整植被生态，而不是几何原型数量。