# ChatGPT、GitHub、本地与 Vercel 的资料对齐

核对日期：2026-11-07。此次工程整理用于 GitHub 同步、既有历史保留、本地资料对齐和下一轮 ChatGPT 接续；没有创建产品新版本。

## 四处资料分别负责什么

| 位置 | 当前事实 | 下一轮如何使用 |
| --- | --- | --- |
| GitHub main／本机工程 | 已恢复既有 V2.3 和 24 版历史，补齐工程文档；共享评审外壳含左栏调整。`release.json` 保持原包 2.3.0 | 作为下一轮可维护源码与工程文档基线；以实际提交和交接 ZIP 清单为准 |
| Vercel 正式站 | 当前仍为 `dpl_3NGqNE2yX9JdYkjVahPA4Vdku779` 的既有 V2.3；605 个原部署源文件已与取回原包对齐 | 用于观察原线上行为。当前线上不含左栏工程调整；不能仅下载线上壳文件覆盖整理后的源码 |
| ChatGPT 原设计／交付对话 | 保留设计意图、生成素材上下文、旧交付与预览链接；本轮确认了下列入口 | 优先回到原迭代对话继续；需要具体原件时从原附件／资料库取回，未读取的不声称已取得 |
| 独立私有档案库及本地原件 | 已封存四份原包并实际恢复；不再依赖预览分支 | 私人模板、完整原交付按需私下恢复。公共源码包不含这些私人覆盖和音轨 |

## 为什么 Vercel 还没有左栏调整

“版本回看”移入“从设计到上线”的改动在 `review/shell.js` 与 `review/shell.css`，已经在本地实际浏览器验收并同步 GitHub。历史页面通过共享外壳获得整理后的导航，冻结的 `history/**` 字节没有改写。

本轮一直要求不部署，所以正式站继续服务原部署。Vercel 管理页显示 Connect Git Repository，未连接这个 GitHub 仓库；仓库同时设置 `git.deploymentEnabled: false`，GitHub 也没有部署工作流。因此工程 push 不会让线上自动出现改动。

下一轮 ChatGPT 必须沿用这两份整理后的共享外壳；当用户在新的迭代要求中授权上线时，把它们一并放入实际部署输入。此前“本轮不部署／不改版本”是本次工程任务的范围，不能永久套用为今后不推进产品的理由。未来版本、打包和发布以用户当轮要求决定。

## 本轮确认过的 ChatGPT 来源

以下均为用户自己的原对话／资料库定位，附件访问仍需相应账号。确认入口不代表已下载每一个旧包。

| 原对话／资料 | 定位 | 本轮状态 |
| --- | --- | --- |
| 完善 NeuroTrace V21 | [原对话](https://chatgpt.com/c/6aee4242-4bb8-83ee-8f4a-169a30b796f4) | 读取了可用的近期交付上下文，确认 V2.1／V2.2／V2.3 链接 |
| V2.3 原交付 | [资料库原包](https://chatgpt.com/library?file_id=libfile_fe4833e5016881918c356bf9ebd56c38&account_id=personal) | 已取回并封存；SHA-256 `5339ee367ed4f3b634b15e4e3e235e0561dafe4c0e3b4c195a91204e965864b0` |
| V2.2 交付 | [资料库入口](https://chatgpt.com/library?file_id=libfile_cb4eba23cb088191ad147276feca8674&account_id=personal) | 已确认链接，尚未将独立旧包另行导入档案库；V2.2 冻结前端已在 V2.3 原包中恢复 |
| V2.2 美术对照预览 | [资料库入口](https://chatgpt.com/library?file_id=libfile_1e0e295e539c8191b3e20d05f421f6b7&account_id=personal) | 已确认入口；预览不能自动等同逐图生成母版 |
| V2.1 交付 | [资料库入口](https://chatgpt.com/library?file_id=libfile_850446fbbc4c8191bba6eb43dc4b3704&account_id=personal) | 已确认链接，独立旧包尚未另行导入 |
| 完善 NeuroTrace | [原对话](https://chatgpt.com/c/6aecf94e-5084-83ec-be46-c7de4a886e8d) | 近期上下文确认 V2.0 和 V1.9 交付链接 |
| V2.0／V1.9 交付 | 文件 ID 分别为 `libfile_ef5e9c246ac88191aaaddfc1d0517b29`、`libfile_f07871cf2ba08191b5f203e7b12f3862` | 已确认原对话中的定位；历史前端已恢复，独立包未另行取回 |
| AI UI 设计工作流 | [早期原对话](https://chatgpt.com/c/6ae56454-db74-83ee-8b1e-6400d1c8e7f3) | 早期视觉与裁切资料的继续查找入口；有限上下文中未出现附件不代表原件丢失 |
| 完善工程文档 | [工程请求原对话](https://chatgpt.com/c/6aee6c22-67f4-83ec-b83c-2678101990c7) | 本次工程整理的需求来源 |

不把私人正文、账号 PIN、授权卡、数据库连接串或临时签名地址抄入这些工程文档。对话链接是来源线索，不是公开下载凭证。

## 已有资料如何接续

完整步骤和可复制提示词见 [ChatGPT 下一轮接续](../CHATGPT_NEXT_ITERATION.md)。普通 UI／交互迭代可直接使用现有公开素材和整理后的共享外壳；只有某项具体要求需要母图、许可或私人后端时，才处理对应输入。旧预览数据库与生产的结构差异也不应阻挡纯前端工作，更不能借此自动改库。
