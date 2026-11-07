# 工程整理同步到 GitHub

2026-11-07，用户明确授权将本轮工程整理提交并同步 GitHub，继续禁止发布新版本、修改既有版本号和打 tag。

## 推送前核对与防护

- 目标：`SuperMing24/neurotrace-ui-workflow` 的 `main`；原基线 `afda85250f14ee7c8bd2fec26691c13bc3464fc9`。不强推、不重写历史。
- 按 GitHub 仓库 ID `1442204806` 查询所属 Vercel 团队，返回零个关联项目；已知项目仍是 `neurotrace-ui-demo`。
- 当前仓库没有 `.github/workflows`。完整待提交文件清单还需进行私信／秘密／媒体检查。
- `vercel.json` 明确设置 `git.deploymentEnabled: false`，禁止所有分支的 Git 自动部署。依据 [Vercel 官方 Git 配置](https://vercel.com/docs/project-configuration/git-configuration#turning-off-all-automatic-deployments)。这不暂停或替换现有线上部署。
- 推送后核对远端提交和 Vercel 部署列表，结果在本次聊天交付中给出；不调用发布、迁移或权限变更操作。

## 本次提交前验收

索引包含 693 个文件，审查了 633 个新增／修改文件：私信正文匹配、真实秘密和音轨／嵌入音频均为零；私信服务及正文测试不在索引中。32 项 Node 检查、24 份历史归档、450 个历史资源引用及工程清单检查通过。

完整暂存差异检查提示原交付的 6 处历史 JS 行尾空格，以及 006 迁移文件末尾空行。这些原始字节按历史完整性要求保留；除此之外的待提交内容通过差异格式检查。没有为消除格式提示而修改冻结归档或历史迁移。

## 保管边界

`api/letters.js`、`tests/verify_private20.cjs` 和根／历史目录中的音轨被 Git 忽略；它们只保存在本机与原交付参照中。密钥、授权卡、数据库备份和构建目录不提交。现有 Git 历史和既有资料保留。

`release.json` 保持上一轮已经恢复的原包 `2.3.0`，本次同步不再改动它。相对旧 GitHub 基线的版本差异来自既有 V2.3 资料恢复，不是本次发布新版本。24 份历史清单不变。

此前文档中的“未提交／未推送”描述对应首轮本地整理阶段，作为历史验收记录保留。本次 GitHub 同步是后续获得授权的独立动作；线上界面仍使用原部署。
