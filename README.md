# NeuroTrace V1.2 — Synthetic 3D Multi-task UI Workflow

这是一个**独立的、可公开分享的模拟交互原型**，不是同门真实神经连接 APP，也不包含真实神经显微影像、准确连接标签、服务端存储或多人账号。

## 在线体验

生产地址：https://neurotrace-ui-demo.vercel.app
教程：https://neurotrace-ui-demo.vercel.app/workflow.html

## 本版能力

- 五个具有不同 XYZ 线段分布的合成场景：主干断点、分叉、多深度投影交叉、弱信号、高密度。
- 每个场景 6 个以上候选末端，末端位置来自相应 3D segment 的起止顶点。
- 在同一场景中可多次新增任意候选连接，独立保存 user-created edges；同一对端点不允许重复添加。
- 点击新增连边中段可选中，点击删除移除；撤回最近一次编辑；切换任务不丢失已有连边。
- 浏览器 `localStorage` 演示存储：**每个浏览器本地**恢复任务与连接；无跨设备同步，无服务器，不是数据库。
- 可旋转/缩放/平移的透视 Canvas 三维查看器；正面/侧面/俯视三种镜头重置；五套配色与可调对比度。
- 任务专属帮助和全局帮助分离。
- 桌面与移动端 Playwright 交互测试。

## 文件

`index.html`  主页面；`scene3d.js` 合成 3D 数据与相机/线段投影拾取；`assets/` 前期 AI 视觉素材与贴图；`data/synthetic_tasks.json` 数据示例；`docs/CODEX_HANDOFF_V12.md` 实施交接；`docs/GRAPH_DATA_CONTRACT_V12.md` 数据模型；`tests/verify_v12.py` 浏览器测试；`workflow.html` 可公开的流程教程；`standalone.html` 所有前端资源内嵌的单文件部署版。

## 本地使用

```bash
cd NeuroTrace_UI_v1.2
python -m http.server 8000
# 打开 http://127.0.0.1:8000
python -m pip install playwright
python -m playwright install chromium
python tests/verify_v12.py
```

如环境已安装系统 Chromium，测试脚本优先使用其可执行文件。

## UI 工作流与项目边界

需求审查 → 整页高保真概念生图 → GUI 资产单独生成 → Pillow/WebP 裁切 → HTML/CSS/SVG/Canvas 组合 → Playwright 视觉+功能测试 → Vercel 部署 → Codex 真实 APP 迁移。

正式项目的节点、线段、图像、候选连接规则和科学标注验证**必须来源于真实获授权数据与项目业务接口**，不能以本 Demo 合成示例替代。

## Git 项目维护入口

- **跨对话接续：** `docs/PROJECT_STATUS.md` 和 `docs/PROJECT_HANDOFF.md`。
- **GitHub 自动化：** `.github/workflows/validate.yml`（PR/主分支检查）。
- **云数据方案：** `docs/PERSISTENCE_PLAN.md`（**尚未开通数据库**）。
- **权限边界：** `docs/RIGHTS_AND_BOUNDARIES.md`。
- **基线标签：** `v1.2.0-demo`。

### 手动首次推送（在 GitHub 上创建不带 README 的空私有仓库后）
```bash
git remote add origin https://github.com/SuperMing24/neurotrace-ui-workflow.git
git push -u origin main
git push origin v1.2.0-demo
```