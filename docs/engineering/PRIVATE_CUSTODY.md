# 私信模板与原始资料的独立私有保管

2026-11-07：四份已有资料已复制到独立的 Vercel Blob 私有档案库，并完成重新下载、哈希比对和实际恢复。主保管位置不再依附游戏数据库或预览分支。旧 Neon 保管副本、下载原件和本地资料均保留。

## 实际位置

| 用途 | 位置与状态 |
| --- | --- |
| 长期主保管 | Vercel 团队 `team_8p2UchCd10odjkArWG7L0sEC`，`neurotrace-private-archive`，store `store_1JC9tZvU20AfIzbz`，SIN1，实际 access 为 private |
| 管理入口 | [私有档案库](https://vercel.com/superming96-9947/~/stores/blob/store_1JC9tZvU20AfIzbz/manage-blobs)，需要已有获准的 Vercel 登录 |
| 独立性 | 服务端读回确认连接项目数为 0；未连接游戏应用、注入游戏环境变量、创建数据库或更改账号权限。删除／重置游戏预览分支不会删除本库 |
| 保留的旧云端副本 | Neon 项目 `patient-heart-34552041`，`br-aged-union-aorlespe`／`preview-1-8`，bucket `neurotrace-engineering-vault`，仍为 private。旧索引另存 [历史副本记录](private-custody-preview-replica-20261107.json) |
| 本机保管 | 仓库之外 `../private-vault/custody-20261107/`，目录访问控制核对为当前 Windows 用户及 SYSTEM；原件未移动或覆盖 |

独立存储仍受现有 Vercel 团队的管理、计费和服务生命周期影响。没有对象锁／WORM 或已验证自动保留任务；管理员仍能删除对象。因此保留本机和旧服务副本，不能只依赖单一云端位置。

## 四份保管包

| 新库对象 key | 内容与来源 | 字节数 |
| --- | --- | ---: |
| private-overlay.zip | 原 `api/letters.js`、正文测试、从现有源码提取的独立 templates.json；2 个里程碑、4 份私信模板与内部校验清单 | 6,548 |
| available-original-art.zip | 既有 V1.8 图集／概念图、V1.7／V1.8 预览、原 V1.8 设计 ZIP 和设计说明，共 6 个文件 | 1,728,886 |
| NeuroTrace_V2.3.zip | 从原 ChatGPT 交付取回的完整原包，含私人服务和许可待确认音轨，仅私有封存 | 43,598,009 |
| NeuroTrace_V05_Figma_OneShot.zip | 本机找到的早期 Figma 交付候选，保持原样；与最早生成母图的对应关系待原对话确认 | 18,378 |

合计 **45,351,821 字节**。新库使用上表的原文件名，完整 SHA-256 与旧内容哈希 key 的映射见 [当前索引](private-custody-index.json)。主库对象名与旧库不同，恢复时不要混用。以后新资料使用新的日期／内容哈希路径，不覆盖本批对象；本次没有修改任何原包内容。

## 验收证据

- 管理接口读回：private，4 个对象，45,351,821 字节，0 个连接项目。
- 从新库认证下载全部 4 份；每份大小、SHA-256 与迁移前原件完全一致。4 次匿名 GET 均返回 403。
- 下载恢复不读取原件路径；只需要公开索引、已有获准的管理认证和新的本机目录。
- 从新下载的 private-overlay.zip 恢复 3 个文件，内部清单全部通过；从新下载的 available-original-art.zip 恢复 6 个设计文件，内部清单全部通过。
- 恢复演练使用仓库之外的全新目录，未覆盖游戏源码或生产文件。损坏内容和已有恢复目录的拒绝检查有单独记录。

机器可读结果见 [独立迁移验收](independent-custody-verification.json)。旧云端记录继续保留其历史含义，不能拿旧库验收替代新库恢复结果。

## 日常找回方法

1. 用原有 Vercel 登录打开上面的档案库管理入口，按当前索引选取文件。不要为找回资料把库改成 public，也不必连接游戏项目。
2. 可在管理页下载；批量校验可运行 `python -X utf8 tools/blob_vault.py`。工具通过隐藏输入接收 JSON，字段为 `token`（本库已有的管理读取凭据）和 `destination`（仓库之外、尚不存在的新目录）。凭据从本库 Quickstart 的 `.env.local`／Show secret 临时读取，不创建新凭据，不写进命令行、文件、聊天或 Git。自动化只能经受控标准输入传递。
3. 工具仅对固定私有域名发出读取请求，拒绝重定向；检查索引内 4 份文件的大小、SHA-256 和匿名拒绝状态，并写不含凭据的 recovery-receipt.json。源码不需要安装 SDK。认证方式依据 [Vercel 私有存储官方文档](https://vercel.com/docs/vercel-blob/private-storage#accessing-without-the-sdk)。
4. 私信包：`python -X utf8 tools/private_vault.py restore <已校验的私信ZIP> <全新私有恢复目录>`。
5. 素材包：`python -X utf8 tools/private_vault.py restore-art <已校验的素材ZIP> <另一个全新恢复目录>`。两个恢复命令先校验所有内部成员再写出，拒绝覆盖和目录逃逸。完整 V2.3 与旧 Figma 原包先核对外层哈希，再在新的私有目录查看，不直接覆盖开发或生产。

本机 ZIP 由目录访问控制保护，未额外加密。云端由 private 存储及现有管理认证保护；这不表示团队管理员无法读取。运行中的私信仍采用原有代码，本次保管没有把 templates.json 改成生产配置。

旧 Neon 副本可按历史索引和 `tools/vault_transfer.py` 的短期签名流程找回；该工具只服务旧副本，不能用于新 Blob 库。

## 后续资产对齐

已确认的原 ChatGPT 对话、V2.1／V2.2／V2.3 交付及 V2.2 美术预览入口列于 [资料来源对齐](SOURCE_ALIGNMENT.md)。早期母图、逐图提示词和原摄影输入尚未逐一取回，属于继续从原对话索引的资料，不等于已经丢失，也不阻挡使用现有素材推进普通界面迭代。只在实际使用需要该原件时取回，不重画后冒充历史原件。

删除任何旧副本属于单独决定；本次没有清理或删除授权。未来迁移主保管服务时，先复制、核对全部哈希、恢复私信与设计包，再更新索引与负责人记录。
