# 运行、检查与构建

## 当前结构

根 `index.html` 和同目录 JS／CSS 为原交付的 V2.3 前端；`scene3d.js` 是有效几何入口。`api/` 是 Vercel Node Functions，`lib/` 提供服务端辅助代码。`review/` 和 `compare/` 提供共享回看／对比；`history/` 保存冻结前端。`db/` 和 `tests/` 是维护资料，不属于公开静态站点。

运行与普通测试使用 Python 标准库和 Node 内置模块，不需要 npm 安装。当前本地验证 Python 3.11.5、Node 24.14.1；Vercel 返回 Node 26.x，本轮未更换运行时。原始发布没有 npm 包管理清单，因此不伪造历史 lockfile。天文美术重建另需 `tools/requirements-art.in` 中的库与三张原摄影文件；原依赖锁和输入 JPEG 未恢复。

## 无云端写入的检查

在项目根目录运行：

```text
node --test tests/*.cjs
python -X utf8 tools/check_engineering.py
python -X utf8 tests/verify_release_lifecycle23.py
```

`check_engineering.py` 调用严格历史校验和 24 版资源引用校验，检查素材、恢复源、迁移与种子校验值，并做高置信度秘密检查。原发布生命周期测试在系统临时目录创建虚拟版本，绝不修改本工程的版本和 tag。Node 测试使用模拟网络；维护环境不设置真实 `NEUROTRACE_DATABASE_URL`。

`verify_v16.py` 是遗留浏览器脚本，依赖未找到的 `standalone.html`；早期教程中的 `verify_v09.py`／`verify_v12.py` 也未随本轮资料恢复。SQL 集成测试需另行指定和批准隔离目标，本轮不执行。

## 本地构建与预览

```text
python -X utf8 tools/build_local.py
node tools/preview_local.cjs build/<工具输出目录>/public 8766
```

构建使用原 `public_manifest.py` 的源文件白名单，复制同一组字节到新的本机构建目录，写出校验清单与本地用途说明。没有编译框架；构建的意义是验证完整输入、依赖引用和部署边界。输出不进入 Git。它含本机私有覆盖／许可待确认的媒体时只能在本机验证，不能当作已准许公开的交付包。

仅从公共 Git 克隆时，私信服务与音轨因保管边界不会自动取得；先读恢复清单和缺口表，从负责人的受控保管副本取得获准的本地覆盖。构建会对缺少的恢复输入报错，避免把不完整仓库冒充完整部署工程。不要把整个仓库根目录直接上传为静态站点。

预览工具只绑定 `127.0.0.1`，阻止 API 写入和私有服务源码读取；启动时自行读取本机版本清单验证可访问性，不连接云端。浏览器使用全新本地 origin 试玩，不继承正式账号 Cookie。验证桌面、窄屏、流程栏、版本下拉、固定历史链接、并排对照和游戏操作；关闭本轮创建的本地预览进程后再结束工作。

## 未来部署的准备

当前 Vercel 项目 ID 与域名见 [证据](evidence-2026-11-07.json)。仓库 URL 过滤未返回关联项目；不要把 GitHub push 等同当前已部署。未来关联 GitHub 可能改变自动部署行为，需要独立计划与授权。

在允许发布之前：补齐素材／私有输入保管和许可、为当前架构准备一致的隔离测试库、完成认证和账本的具体验收、保存当前可回退部署与迁移记录。服务端环境变量按 `.env.example` 名称配置，值只放受控控制台；确认 Production 与 Preview 各指向正确受限角色和数据库分支。不要在一般构建中执行迁移或拉取生产密钥。

本轮没有执行 `vercel deploy`、Git push、Git tag、GitHub Release、数据库初始化或任何服务配置变更。部署命令继续保留在旧教程作为历史说明，不能据此推定本轮执行授权。
