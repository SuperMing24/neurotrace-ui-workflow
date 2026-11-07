# NeuroTrace 当前工程状态

观察日期：2026-11-07（北京时间）。当前本地整理基线是已存在的 V2.3，不是新版本。

后续状态：用户已授权将这轮工程整理提交并同步 GitHub。本次同步提交包含 `git.deploymentEnabled: false`，禁止 Git 自动部署；不变更版本、tag 或现有生产服务。原审计基线与首次本地验收记录保留在下表，实际最新提交以 GitHub／Git 日志为准。见 [同步核对与保管边界](engineering/GITHUB_SYNC.md)。

| 项目 | 实际证据 |
| --- | --- |
| GitHub | public 仓库 `SuperMing24/neurotrace-ui-workflow`，main 基线 `afda85250f14ee7c8bd2fec26691c13bc3464fc9`，37 个提交，无 tag、无 GitHub Release |
| 版本恢复 | 原 GitHub release.json 是 1.8.0；现从既有原包恢复 2.3.0 和 24 版前端归档，本轮不 bump |
| 当前生产 | Vercel `neurotrace-ui-demo`，部署 `dpl_3NGqNE2yX9JdYkjVahPA4Vdku779`，READY；605 个部署源文件与恢复原包匹配 |
| Git 关联 | 部署 Git metadata 为空、未返回 gitSource；按仓库 URL 过滤未找到关联。未更改设置或建立自动部署 |
| 数据库 | Neon 项目 `patient-heart-34552041`，数据库 `neurotrace`；production 11 表／59 列，preview-1-8 8 表／39 列，只读列快照 |
| 工作区 | 已恢复源码并补工程资料，review/shell.* 调整版本工具归属；未提交／推送／发布，未新增 tag |
| 私有／媒体边界 | 私信服务模板与对应测试、音轨保留本机且忽略；未改认证、权限、积分、私信逻辑或数据库内容 |

旧“V1.5、仓库 private、尚未开通 Neon”的状态文档已保存为 [历史快照](history/github-afda852/PROJECT_STATUS.md)，不再作为当前结论。

实际来源、剩余缺口与验收请依次读 [工程入口](engineering/README.md)、[只读证据](engineering/evidence-2026-11-07.json)、[验证记录](engineering/VALIDATION.md)、[缺口表](engineering/GAPS.md)。当前只读结构不构成完整迁移／认证／生产服务验收。
