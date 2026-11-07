# 微信、QQ 账号接入

网页已具备授权、回调和账号绑定。正式域名和平台凭据配齐后，每个渠道可以独立启用。目前生产部署仅配置了数据库连接。安卓、iOS 原生应用上架时要另行申请移动应用，接对应的官方 SDK。

## 申请与配置

1. 确定供玩家长期访问的 HTTPS 域名。记作 `<host>`。在 Vercel 的 Neuro Trace 项目下绑定并验证域名。把 `NEUROTRACE_AUTH_ORIGIN` 设为 `https://<host>`，末尾不带斜杠。
2. 微信开放平台进入管理中心，注册符合项目实际主体的网站应用，申请网站应用微信登录。授权回调域填 `<host>`。站点实际接收回调的地址是 `https://<host>/api/oauth-wechat`。应用获准后，在 Vercel 的 Production 环境设置 `NEUROTRACE_WECHAT_APP_ID` 和敏感变量 `NEUROTRACE_WECHAT_APP_SECRET`。[微信开放平台](https://open.weixin.qq.com/) · [微信网站应用开发指南](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html) · [腾讯云开发的回调域说明](https://docs.cloudbase.net/recipes/add-auth-web-with-cloudbase-sdk)
3. QQ 互联进入「应用管理 → 创建应用 → 网站应用」，按实际产品形态提交材料。网站回调地址按 `https://<host>/api/oauth-qq` 填写。QQ 的境内网站常规审核要求网站和回调备案信息一致。其审核规范亦将在线游戏列入暂不合作，申请前请携带 Neuro Trace 的实际研究标注和游戏化界面向平台确认资格；国际域名接入有单独的申请渠道。渠道启用时登录入口使用官方小图标。按实际功能及腾讯的最新前端规范完成送审和回跳测试。取得应用授权后，在 Production 环境设置 `NEUROTRACE_QQ_APP_ID` 和敏感变量 `NEUROTRACE_QQ_APP_KEY`。[申请入口](https://connect.qq.com/manage.html#/) · [审核规范](https://wiki.connect.qq.com/网站审核规范/) · [国际域名接入](https://wiki.connect.qq.com/开发者反馈/)
4. 服务端项目重新部署。在最终接入域名打开 `/api/identity?view=providers`，对应平台的 `available` 应为 `true`。该检查只验证本地配置和请求域名。真实审核状态、应用密钥有效性及扫码回跳仍要通过一次本人授权来验证。密钥只在平台控制台和部署环境中保管。

## 绑定四七和小王

每人先用自己的开发者登录密钥进入对应账号。首次激活流程见《开发者账号》。在「个人中心 → 微信／QQ 关联」选择一个已开放渠道，用本人的微信或 QQ 完成官方授权。返回后应看到对应渠道「已关联」。退出，再从该渠道登录，核对账号名、角色、余额、已通过章节，并与群星总榜对照。两位开发者分别验证。

从登录页直接使用一个尚未关联的外部身份会建立普通观测员账号。关联只允许当前已验证的账号操作；若该外部身份已有归属，系统拒绝变更，不转移其积分与角色。绑定时仅存储平台、应用及 OpenID 的摘要。授权令牌不持久保存。积分和章节都以 Neuro Trace 自身账号 ID 为键。

## 回调验收

- 用户拒绝、授权过期、会话已撤销、跨设备回调、重新播放已用回调均不能创建有效登录或改变账号关系。
- 同一微信或 QQ 再次登录返回原账号。只有经本人登录后建立的绑定能进入四七或小王的开发者角色。
- 未配置凭据、域名与申请不符、预览域名等情况下显示「待开放」。有配置而平台拒绝授权的情况显示失败，保留原关联。
