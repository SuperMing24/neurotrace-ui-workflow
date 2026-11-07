# NeuroTrace 当前工程状态

核对日期：2026-11-07。此次工作是 GitHub 工程同步、历史保留、资产保管与 ChatGPT 接续准备。产品基线保持既有 V2.3（2.3.0）；没有发布新版本。

| 项目 | 当前状态 |
| --- | --- |
| GitHub／本地 | public 仓库 `SuperMing24/neurotrace-ui-workflow`，main 已有工程恢复提交 `42b67a7` 与首批保管提交 `5d4a553`；独立保管与接续文档追加在后续工程提交中。实际当前提交以 Git 日志或交接包 SNAPSHOT_MANIFEST.json 为准 |
| 原审计起点 | `afda85250f14ee7c8bd2fec26691c13bc3464fc9`，当时 37 个提交；它是整理前快照，不再冒充当前 main |
| 产品与历史 | 从原 ChatGPT V2.3 包恢复既有 2.3.0、24 版前端与历史清单；不 bump、不新建 tag 或 GitHub Release |
| 共享界面整理 | “版本回看”已移入左侧“从设计到上线”，桌面、320px 和 390px 窄屏验证通过；`review/shell.js`／`review/shell.css` 已同步 GitHub |
| 当前正式站 | `https://neurotrace-ui-demo.vercel.app`，生产部署仍为 `dpl_3NGqNE2yX9JdYkjVahPA4Vdku779`。工程左栏调整未部署，因此线上暂时看不到 |
| Git 与部署 | Vercel 项目 `neurotrace-ui-demo` 管理页显示尚未连接 Git；仓库 `git.deploymentEnabled: false` 且无部署工作流。工程 push 不等于线上更新 |
| 独立私有保管 | Vercel Blob `neurotrace-private-archive`／`store_1JC9tZvU20AfIzbz`，private，0 个连接项目；4 份文件共 45,351,821 字节，回下载哈希及私信／设计恢复通过，旧副本全部保留 |
| 私人资料 | 私信正文、对应测试、密钥、许可未确认音轨不进入公开 Git 或工程接续包；原完整交付在独立私有库及本机保留 |
| 数据库与账号 | 既有 Neon `patient-heart-34552041`／`neurotrace`；本次没有执行 SQL、修改积分／权限／认证或生产数据。首次只读列快照记录 production 11 表／59 列、旧 preview-1-8 8 表／39 列 |

后续设计和功能迭代回到 ChatGPT，按新的当轮要求处理版本、交付和上线。先读 [接续说明与提示词](CHATGPT_NEXT_ITERATION.md)、[四处资料对齐](engineering/SOURCE_ALIGNMENT.md) 和 [工程入口](engineering/README.md)。未逐一取回的历史母图按需要从原对话继续索引，不阻挡与它无关的界面工作。

原始审计证据见 [首次只读快照](engineering/evidence-2026-11-07.json)；旧 V1.5 状态保留在 [历史快照](history/github-afda852/PROJECT_STATUS.md)。这些记录按各自时间范围解读。
