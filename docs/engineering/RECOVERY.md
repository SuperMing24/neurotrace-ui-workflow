# 既有交付恢复记录

## 基线与原件

- GitHub：[SuperMing24/neurotrace-ui-workflow](https://github.com/SuperMing24/neurotrace-ui-workflow)，默认分支 `main`，基线提交 `afda85250f14ee7c8bd2fec26691c13bc3464fc9`，37 个提交，无 tag、无 GitHub Release。可见性是 public；旧文档中的 private 已过时。
- GitHub 基线 `release.json` 实际是 `1.8.0`，项目状态文档写 V1.5，提交中有 V1.6。编号落后来自多个记录不同步，不能据此认定历史版本丢失或没有开发。
- 从既有 ChatGPT 交付 [NeuroTrace_V2.3.zip](https://chatgpt.com/library?file_id=libfile_fe4833e5016881918c356bf9ebd56c38&account_id=personal) 取回原件，共 644 个文件条目。SHA-256：`5339ee367ed4f3b634b15e4e3e235e0561dafe4c0e3b4c195a91204e965864b0`。
- 原 ZIP 和只读解压参照放在工作区仓库旁的 `reference-materials/`，不打进公共 Git。不修改参照副本。库内 [逐文件恢复清单](recovery-manifest.json) 保留大小、SHA-256、来源和保管类别。
- `release.json` 恢复为原交付已有的 `2.3.0`，未生成新编号。UI 的 V2.3、版本目录和既有清单都来自同一交付。

## 与 Vercel 对照

生产项目为 `prj_rltLMiGve1xnjVgoXp2XALNvcspx`，最新生产部署 `dpl_3NGqNE2yX9JdYkjVahPA4Vdku779`，状态 READY，域名 [neurotrace-ui-demo.vercel.app](https://neurotrace-ui-demo.vercel.app)。API 返回的部署 Git metadata 为空，未返回 gitSource；按仓库 URL 过滤项目得到 0 个匹配，符合旧资料中的手工 API 发布方式。没有新建项目、关联仓库或改自动部署设置。

部署源清单含 `src/` 的 605 个文件，另有 6 个 `out/api` 构建输出。逐字节对照结果写入恢复清单。`out/api` 是生成物，不拿它替代源代码。原包另提供数据库迁移、工具与测试等未部署的工程材料。

## 历史保留

`history/` 中 24 版清单及字节不变；共享回看界面位于 `review/`，因此本轮可以调整评审区域而不覆盖旧游戏画面。归档原先已有的私信剥离、离线网络隔离和公开榜单快照均按原交付保留，不声称原封不动还原了当时的线上数据库。

GitHub 旧 README、状态／接手说明保存到 `docs/history/github-afda852/`。V1.6 合成数据保存在其 `data/` 子目录；当前 8 个样本以 `scene3d.js` 为准。原有设计 ZIP、预览图、早期说明及 `src/scene3d.js` 均保留。所有 Git 提交历史保留，不重写、清理或补造 tag。

私信服务文件和它的正文测试作为本机私有覆盖保留，音乐作为许可待确认的本机素材保留；它们有哈希登记但被 Git 忽略。当前公共 Git 单独克隆并不包含这部分完整部署输入，见 [缺口表](GAPS.md)。
