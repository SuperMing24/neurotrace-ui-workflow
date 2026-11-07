# 设计与阶段交付盘点

这份表是 2026-11-07 对已有材料的盘点和当前实现梳理，不是补造过去的设计审批或交付。新增原 ChatGPT 对话／附件定位见 [资料对齐](SOURCE_ALIGNMENT.md)，下一轮见 [ChatGPT 接续](../CHATGPT_NEXT_ITERATION.md)。未逐一取回的旧母图不等于已经丢失。

| 阶段 | 找到的材料 | 当前安排与缺口 |
| --- | --- | --- |
| 需求／信息架构 | 历史对话、`workflow.html` 的七阶段说明、`history/` 各版画面 | 新建 [当前设计说明](../DESIGN_BRIEF.md)，标注本轮整理时间；最初 brief 和验收签收原件未找到 |
| 视觉方案 | `docs/NeuroTrace_V17_preview.jpg`、`NeuroTrace_V18_preview.jpg`、`echo18-artboard.webp`、`echo18-ui-concept.webp` | 原文件保留；早期三张完整生图与皮肤母图缺失 |
| 档案设计 | `docs/NeuroTrace_V18_Archive_Design.zip`、[V1.8 档案说明](../ECHO_ARCHIVE_V18.md) | 保留原 ZIP 与提示词；ZIP 属既有设计交付，不自动更新其中内容 |
| 素材生产 | `assets/*.webp`、`assets/atlas19-ccf.svg`、`tools/render_sky.py`、`tools/crop_sky.py`、`docs/TAURUS_SKY.html` | 建立哈希／来源清单；教程提到的 `assets/source-*.png`、`skin-manifest.json`、`tools/build_skin_assets_reference.py` 未找到 |
| 网页实现 | 根 `index.html`、各版本名 JS/CSS、`api/`、`lib/` | V2.3 原交付恢复；`src/scene3d.js` 是旧存档，运行入口是根文件，不能把二者当两个有效实现 |
| 测试 | 32 项 Node 检查、归档与发布生命周期 Python 检查、SQL 集成脚本 | 见 [验证记录](VALIDATION.md)；`tests/verify_v16.py` 依赖缺失的 `standalone.html`，不声称本轮运行；早期教程 `verify_v09.py`／`verify_v12.py` 未找到 |
| 数据库／后端 | 001–009 SQL、OAuth／账号／评分／榜单接口 | 001、002 为旧提案；003–009 为恢复的实现。只读结构对比不能代替完整迁移日志 |
| 发布与版本 | 原 `release.json`、24 份 manifest、`review/catalog.json`、`tools/freeze_release.py`、`tools/public_manifest.py` | 分清归档、Git 提交、tag、Release 和部署；工程已同步 GitHub，产品未新发版或部署 |
| 下一阶段交接 | 新 [接手说明](../CODEX_HANDOFF.md)、[贡献规范](../../CONTRIBUTING.md)、本轮验收记录 | 用具体文件和证据交接；真实科研影像、实验标注、专家答案和真实商店履约尚不属于该演示工程 |

V1.3、V1.4、V1.5、V1.5.1 的原发布说明，V1.6 的实现说明，以及旧 `PROJECT_STATUS.md` 的归档均保留。当前文档优先读工程入口，历史说明按其日期解读。
