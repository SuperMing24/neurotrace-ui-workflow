# NeuroTrace · 工程入口

后续同步：本轮工程整理现按用户授权提交至 GitHub；Git 自动部署已在仓库配置中禁用。首次本地验收阶段与本次同步的边界见 [GitHub 同步说明](docs/engineering/GITHUB_SYNC.md)。不创建新版本或 tag，线上继续使用既有部署。

当前工作基线为既有 **V2.3（2.3.0）**。2026-11-07 这轮恢复工程资料、调整评审栏并补齐资产治理，尚未发布、推送或创建新版本。

[工程资料总入口](docs/engineering/README.md) · [本轮未发布变更](CHANGELOG.md) · [当前状态](docs/PROJECT_STATUS.md) · [验证结果](docs/engineering/VALIDATION.md) · [未解决缺口](docs/engineering/GAPS.md)

## 本轮整理

“版本回看”已作为折叠条目移入左侧“从设计到上线”的流程列表，同宽、同间距。桌面中间仍为实时交互原型，右侧仍为交互状态。窄屏在统一的“从设计到上线”入口展开流程与版本工具。

从原有 `NeuroTrace_V2.3.zip` 恢复 GitHub 缺失的 V2.x 源码、003–009 迁移、测试、工具和 24 版历史。605 个部署源文件已与 Vercel 源清单逐字节校验。GitHub 基线仍为 `afda85250f14ee7c8bd2fec26691c13bc3464fc9`；本轮恢复和维护改动留在本地，未自动同步到远端。

[原包与恢复来源](docs/engineering/RECOVERY.md) · [24 版索引](docs/engineering/VERSION_INDEX.md) · [版本治理](docs/engineering/VERSION_GOVERNANCE.md) · [资产保管](docs/engineering/ASSET_POLICY.md) · [设计与阶段交付](docs/engineering/DESIGN_AND_DELIVERABLES.md)

## 运行与验证

前端为静态 HTML/CSS/JavaScript，后端为 Vercel Node Functions；普通运行和测试无需 npm 包安装。

```text
node --test tests/*.cjs
python -X utf8 tools/check_engineering.py
python -X utf8 tests/verify_release_lifecycle23.py
python -X utf8 tools/build_local.py
```

本机构建输出位置由工具打印，再用只绑定 `127.0.0.1` 的静态服务器预览。详细命令、运行环境、遗留测试限制和未来部署边界见 [构建说明](docs/engineering/BUILD_AND_DEPLOY.md)。本地工具不联网部署、不跑迁移、不改版本、不打 tag。

私人服务模板及其内容测试、许可待确认的音轨是本机保管覆盖，已被 Git 忽略；公共 Git 本身尚不能重建完整生产服务。不要将原包或本机完整构建直接作为公开 Release。[恢复清单](docs/engineering/recovery-manifest.json) 记录这些文件的哈希与保管类别。

## 数据与玩法边界

根 `scene3d.js` 的八份任务是教学合成几何，六份剧情训练与两份开放观察分别处理；当前离线几何 seed 在 `db/seeds/`。真实显微数据、专家校准答案、科研贡献和实物履约不由演示页面推定。

正式服务使用 Neon Postgres；本轮只读核对了表名和列结构，发现生产与旧预览分支不同，未修库。[数据库工程说明](docs/engineering/DATABASE.md) 区分旧提案、恢复的迁移和实际观察，不提供生产自动初始化脚本。

## 资料与维护

原游戏说明保留在 [V2.3 原交付 README](docs/history/V2.3_DELIVERY_README.md)。V1.x 发布说明、概念图、原设计 ZIP、旧数据和 Git 历史继续保留。

[当前设计说明](docs/DESIGN_BRIEF.md) · [接手说明](docs/CODEX_HANDOFF.md) · [贡献规范](CONTRIBUTING.md) · [敏感资料边界](SECURITY.md) · [第三方署名与许可线索](THIRD_PARTY_NOTICES.md)

项目尚未指定整体 LICENSE；public 仓库可见性不代替授权。本轮没有修改 [现有正式站](https://neurotrace-ui-demo.vercel.app) 的服务、数据或访问权限。
