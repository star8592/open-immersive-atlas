# Contributing / 贡献指南

We welcome original, bilingual, evidence-backed entries about outstanding Web3D experiences, engines, shaders, physics libraries, DCC and AI 3D pipelines. / 欢迎为卓越的 3D 网站、引擎、Shader、物理工具、DCC 和 AI 三维工厂提交可追溯的中英双语条目。

## Minimum entry / 最小条目

Add a record to `data/projects.json` (see an adjacent example). Required: unique kebab-case `id`, name, category (`experiences`, `pipelines`, `engines`, `infrastructure`), original website, evidence level, rights statement, three bilingual fields: `summary`, `strength`, `learning`, and a `reviewed_on` date. Cite original author pages and original GitHub repositories. / 必须填原作者官方链接、证据等级、授权状态、中英简介、技术亮点和具体学习价值。

Evidence values: `source-code` = source actually public; `creator-notes` = author firsthand engineering notes; `creator-article` = author technical article; `official-product` = official product page only; `official-site` = experience/site observed but no source verified. / 不要以官方宣传推断未披露的具体 Shader、引擎或性能。

## Review checklist / 审稿清单

- Is the claimed mechanism supported by a primary source? / 技术陈述是否有一手依据？
- Are claims clearly separated from our proposed experiments? / 是否区分事实与建议？
- Are both languages complete and informative? / 中英两种语言都完整吗？
- Did you correctly distinguish software license from model, texture, video, music and platform terms? / 是否区分源码与资产的各自许可？
- Did you exclude credentials, private notes, unlicensed screenshots or copied text? / 是否排除了凭证、私有材料、未授权截图和大段复制？
- Have you run `python3 scripts/validate_catalog.py` then `python3 scripts/build_catalog.py`? / 是否通过验证并重建目录？

For new entries please use GitHub issues or pull requests. Avoid bulk links without meaningful technical analysis; five curated, verifiable references beat fifty speculative ones. / 不接受只有链接、没有技术机制的简单堆砌。
