# 工程接手说明

这轮工程整理已经进入 GitHub，产品仍为既有 V2.3。下一轮产品迭代继续交由原 ChatGPT 对话；直接使用 [ChatGPT 接续说明](CHATGPT_NEXT_ITERATION.md) 和工程接续包。

1. 当前事实以 [项目状态](PROJECT_STATUS.md)、[来源对齐](engineering/SOURCE_ALIGNMENT.md) 和实际 Git／交接包提交为准。`afda852` 只代表最初审计起点。
2. 根 `scene3d.js` 为运行入口；`src/scene3d.js` 是旧副本。`review/shell.js` 与 `review/shell.css` 已把版本回看并入左侧流程栏；这项改动尚未部署，下一轮成果要沿用。
3. `history/`、`review/catalog.json`、`release.json` 保持既有 V2.3 交付的历史字节。`api/`、`lib/` 的运行行为本轮未改；私信服务及正文测试、音轨属于被忽略的私人覆盖。
4. [独立私有保管](engineering/PRIVATE_CUSTODY.md) 已完成 4 包回下载与 3 份私信文件／6 份设计文件恢复。新库不依附预览分支，旧云端副本及本地原件全部保留。公共源码包不含私人正文与音轨。
5. [工程检查](engineering/BUILD_AND_DEPLOY.md) 在本地运行；普通 UI 迭代直接使用现有 HTML/CSS/JS 和素材。完整服务端打包才需要获准的私人覆盖与对应后端验收。
6. GitHub 工程同步已获用户授权；当前 Git 自动部署关闭且项目未连 Git。本轮不发布、不变版本、不打 tag。未来迭代的版本／交付／发布按用户当轮要求执行，不把本轮范围变为永久禁令。
7. 生产数据库内容、认证／账号权限、积分账本等变更先说明具体影响并取得相应授权。旧预览结构差异不应阻挡纯前端工作，也不构成自动修库授权。

素材与数据继续按 [资产政策](engineering/ASSET_POLICY.md)、[第三方署名](../THIRD_PARTY_NOTICES.md) 和 [权利说明](RIGHTS_AND_BOUNDARIES.md) 保留来源与用途边界。
