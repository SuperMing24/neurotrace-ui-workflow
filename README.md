# NeuroTrace V1.6 · 多模态 UI / 三维众包标注模拟

**演示站：** https://neurotrace-ui-demo.vercel.app　|　**教程：** https://neurotrace-ui-demo.vercel.app/workflow.html

本项目是为验证 AI 视觉设计、游戏 UI 和前端交互开发流程制作的独立合成示例，**不是同门实际 APP，也没有真实神经标注、服务器账户或实体商品配送**。

## 新版已实现

- 五组不同三维空间分布的合成骨架数据，手势旋转、缩放、平移，支持连续 360° 俯仰；与 V1.5.1 相比，上下拖动方向反转。
- 在每个任务中显示手工声明的边界截断虚拟端点：能点选查看但禁止新增连接；「末端」只切换提醒，不限制普通端点和线段选择；已有原始拓扑连接不能重复补线。
- 默认「四七 · 破壁人」演示账号，支持退出与重新登录。微信、QQ 入口已放置，但**未接入实际 OAuth**。
- 「探索补给站」示例兑换商店：四类原创概念商品插画、积分校验、本机模拟订单记录。商品名称、兑换价格、积分、库存都是展示数据，无实际销售或寄送服务。
- 研究、文明和群星的主导航，以及独立的个人中心、设置、档案和商店页面；延续 ImageGen 美术素材和浏览器可操作原型。

## 文件

- `index.html` + `scene3d.js`：多模态网页原型源代码
- `standalone.html`：嵌入视觉素材和三维模块的独立可部署版本（音乐需单独作为网站静态文件提供）
- `assets/shop-*.webp`：本次生成的四个商品示意图；`original-imagegen/shop-concept-board.png` 为原图
- `data/synthetic_tasks.json`：五组骨架以及 `boundaryTerminals` 手工声明
- `data/catalog_v16.json`：模拟商店商品目录
- `db/migrations/002_auth_shop_proposal.sql`：未来数据库草案，尚未应用
- `docs/V16_IMPLEMENTATION.md`：行为规则、边界与集成说明
- `tests/verify_v16.py`：桌面、移动端浏览器冒烟测试

## 运行与测试

```bash
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
python -m http.server 8000
python tests/verify_v16.py
```

如果使用系统 Chromium，测试脚本可以指定其可执行路径。测试脚本在受限自动化环境中直接加载自包含网页，并模拟浏览器本地存储，以避免 localhost 访问限制。

## 工程边界

- 所有登录和积分订单属于 **本地演示**，并非真实身份认证、云端数据库、正式支付或实物兑换；不得把本原型当作真正的可经营兑换平台。
- 微信/QQ 正式授权需通过开发者平台的应用审核、配置服务器端 OAuth 回调，并保存第三方身份关联；不得把 AppSecret 写到 HTML/JS。
- 数据库模式请见 `db/migrations/002_auth_shop_proposal.sql`，**该 SQL 目前尚未在 Neon 执行**。
- 不得把合成骨架、边界末端标签、AI 插画当成真实神经显微数据。正式 APP 数据对接需要实际边界几何和专家审核。
- 沃集鲜商品名称为公开零售商品参考；生成的商品包装是原创概念图，**非官方包装或实物照片**。