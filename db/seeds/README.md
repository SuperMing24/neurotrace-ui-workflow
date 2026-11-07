# 离线合成种子

`synthetic_tasks.json` 从当前 `scene3d.js` 的八份已有教学几何导出，保留当前有效的端点、边界和参考几何；文件记录源 SHA-256。不是原显微数据，也不构成专家答案有效性声明。

```text
node tools/export_synthetic_seed.cjs
```

该工具只读当前本地 JS 定义并写本 JSON，不联网、不执行 SQL、不创建账号、不写积分和激活凭证。运行位置可为项目根目录。更新几何时显式重新导出并审查变化。

历史 V1.6 数据另保存在 `docs/history/github-afda852/data/synthetic_tasks.json`；不把它当作当前任务初始化。生产账号及期初积分不存在可公开、可重复重播的 seed；不能从当前库导出来补。
