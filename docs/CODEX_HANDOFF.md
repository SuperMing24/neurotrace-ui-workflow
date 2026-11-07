# 工程接手说明

基线：GitHub `main` 的 `afda85250f14ee7c8bd2fec26691c13bc3464fc9`，已恢复既有 V2.3 原包。本轮本地改动未提交、未推送、未发布，未打 tag。不要从旧状态文档推断生产仍是 V1.5 或尚无数据库。

1. 先读 [工程入口](engineering/README.md)、[恢复清单](engineering/recovery-manifest.json)、[本轮验证](engineering/VALIDATION.md) 和 [缺口](engineering/GAPS.md)，再查看实际工作区差异。
2. 根 `scene3d.js` 为运行入口；`src/scene3d.js` 是历史副本。`review/shell.*` 是本轮界面修改；`history/`、`review/catalog.json`、`release.json` 与既有交付字节一致。
3. `api/`、`lib/` 是取回的既有服务端源码，本轮未改行为。私人信件文件和测试、音轨是被忽略的本机覆盖，来源与哈希有登记。公共 Git 并不足以独立重建完整生产服务，不要绕过这个缺口公开原包。
4. 实际数据库为 Neon `patient-heart-34552041`／`neurotrace`。生产与旧预览结构不同。只读列快照不代表完整迁移验收；不自动执行 001–009，不改积分／认证来“补齐环境”。
5. 按 [构建说明](engineering/BUILD_AND_DEPLOY.md) 做本地检查。现有历史冻结工具禁止覆盖编号，当前整理不需要新版本。
6. 后续 GitHub 同步、对象存储、模板外置、迁移和正式发布分别制定具体方案。推送可能触发部署，必须先确认关联与授权。

素材和科学数据边界仍按 [权利说明](RIGHTS_AND_BOUNDARIES.md)、[资产政策](engineering/ASSET_POLICY.md)、[第三方署名](../THIRD_PARTY_NOTICES.md) 执行；真实科研入口需要获准影像、坐标、标注和独立验收。
