# 数据库结构与迁移

## 当前只读观察

2026-11-07 使用 Neon 连接仅列项目、分支、表名及 `information_schema.columns`，未读取账号行、积分明细、Cookie、私信或凭据。项目为 `patient-heart-34552041`，数据库 `neurotrace`。

| 分支 | 标识 | `nt_identity` 结构 |
| --- | --- | --- |
| production | `br-wandering-rice-ao6o0idu` | 11 张表、59 列 |
| preview-1-8 | `br-aged-union-aorlespe` | 8 张表、39 列 |

生产独有 `practice_scores`、`practice_period_bests`、`quick_credentials`，与后续 007–009 结构对应。各列在 [只读证据](evidence-2026-11-07.json) 中；表存在不能证明函数、触发器、权限和所有迁移语句都与源码一致，也不能证明账号可登录或余额正确。预览分支未同步，本轮不修库。

## 迁移清单与规则

| 文件 | 已有用途 | 本轮结论 |
| --- | --- | --- |
| 001_demo_schema.sql | 最早合成任务／编辑记录提案 | 文件自称未应用；生产此次只见 `nt_identity`，不能按编号自动重放 |
| 002_auth_shop_proposal.sql | 旧账号、OAuth、商店和账本提案 | 与后来的 `nt_identity` 实现不是同一初始化路径，不与 003 盲目连跑 |
| 003_cloud_accounts.sql | accounts／sessions／point_events／admin_events、受限函数和角色授权 | 恢复原脚本；旧说明称曾应用，实际仅核对当前列结构 |
| 004_training_ledger.sql | 首章奖励和兑换账本 | 含账户锁、幂等键和函数授权；未在本轮重放 |
| 005_oauth.sql | 外部身份关联与 OAuth 请求 | `external_ids`／`oauth_requests` 当前存在；应用凭据与平台审核不在本轮验收范围 |
| 006_fieldwork.sql | 期初余额、观察报告、里程碑及已读状态 | 含实际积分数据语句，禁止用它作为“清空重建”或普通演示 seed |
| 007_practice_scores.sql | 独立训练评分 | 生产有对应表，旧预览没有 |
| 008_quick_login.sql | 设备绑定的短密码凭证 | 生产有对应表，未读取任何凭证行或改变认证 |
| 009_performance_rank.sql | 带周期的训练最佳分和榜单查询 | 生产有周期表；完整函数／权限校验仍需获准的隔离环境 |

[migration-inventory.json](migration-inventory.json) 记录逐文件 SHA-256 和来源。003／004 相对 GitHub 的差异是恢复后的换行字节，SQL 内容未更改；其余后续脚本从原包恢复。未来迁移只新增、不重写既有文件。尚无可信的应用日志表与逐次 apply 校验记录，不能用本轮清单冒充已执行日志。

## 初始化与种子

项目运行不需要自动初始化生产库。无凭据的本机试玩直接使用现有合成几何。`db/seeds/synthetic_tasks.json` 由 [导出工具](../../tools/export_synthetic_seed.cjs) 从当前 `scene3d.js` 的八份几何导出，不含真实账号、激活数据、会话、期初积分或私信。它是离线夹具，未作为生产 SQL 执行。

新建测试库时，需先明确一个获准的隔离目标、数据是否脱敏、所需受限角色与迁移路径；不要执行 001→009 的通配批量命令。003 依赖预先建立的 `neurotrace_web` 角色；它还含保留账号结构，必须先审阅。没有附带“建角色＋写生产初始余额”的自动脚本。

## 后续迁移操作要求

先备份并明确回滚／恢复点，审查 SQL 对账号、账本、角色、函数和锁的影响，在指定隔离库验证。维护记录至少包含目标项目／分支／数据库、迁移文件 SHA-256、执行者、授权、开始结束时间、结果、测试证据和回退方案。生产写入需对具体计划另行授权；此文档不构成执行许可。

SQL 测试脚本即便带 `BEGIN/ROLLBACK`，也可能运行受限函数、触发器和写语句；本轮没有执行。运行时受限连接放部署服务端，迁移所有者连接独立保管，不把任何连接串写进文档。
