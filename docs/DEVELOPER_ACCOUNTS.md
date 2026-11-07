# 云端开发者账号

进入[游戏的系统设置](https://neurotrace-ui-demo.vercel.app)，在「开发者账号」区域激活或登录。验证成功后，游戏会切换到对应的正式账户。试玩存档与正式账户分开保存。账号激活后，在其他设备上可用同一登录密钥再次登录。

| 云端账号 | 稳定标识 | 称号 | 应用角色 |
| --- | --- | --- | --- |
| 四七 | siqi | 破壁人 | developer_admin |
| 小王 | xiaowang | 面壁者 | developer_admin |

后台区分玩家、复核员、开发者管理员三种应用角色。开发者管理员可以查看账号启用状态、有效会话数和撤销指定账号的会话。应用权限与数据库管理权限独立。公开榜单从积分事件账本读取。周榜和月榜按上海自然周、自然月计算期间净增积分。已登录的正式账号按服务端教学答案校验首通。通关入账与模拟兑换扣分记录在同一份云端账本中，本机试玩账本独立。每章只发奖一次，同一兑换请求重试不会重复扣分。兑换记录仅为游戏演示，不安排配送。

## 四位密码的设备授权

登录页的两张名牌对应已有的正式云端账号。首次授权从每个账号自己的私人 PDF 卡片进入。入口中的一次性凭证保存在 URL 片段里，页面读取后立即清除。成功时服务器仅将浏览器设备凭证写入 Secure、HttpOnly Cookie。换到新浏览器或清除 Cookie 后需要新的授权。008 迁移在正式账号上增加独立凭证和验证函数；构建包不含真实密码、私人入口或可用的凭证。

## 由项目负责人签发首次激活码

1. 登录 [Neon 项目](https://console.neon.tech/app/projects/patient-heart-34552041)。进入 **SQL Editor**，选择 **production** 分支、**neurotrace** 数据库和所有者角色 **neurotrace_owner**。
2. 核实领取人的身份。要给四七签发，运行下面的第一条 SQL。给小王签发时，单独运行第二条。每次只处理一人。

```sql
SELECT nt_identity.issue_activation('siqi');
```

```sql
SELECT nt_identity.issue_activation('xiaowang');
```

3. 将查询结果中完整的激活码通过已确认的私密渠道交给对应的人。有效期为 30 分钟，重新签发会覆盖同一账号尚未使用的旧码。生产码只能用在正式站。
4. 领取人在系统设置中点「首次激活」，先复制并妥善保存页面生成的个人登录密钥，再填入激活码并提交。新的激活在一次数据库事务中消费激活码、绑定个人密钥并撤销这个账号在所有设备上的旧会话。服务端仅保存密钥和激活码的摘要。
5. 之后在「开发者登录」输入个人登录密钥。浏览器会话凭证保存在最长四小时的 Secure、HttpOnly、SameSite=Strict Cookie 中。登录密钥遗失后，可请项目负责人重新核验身份并签发激活码替换旧密钥。若怀疑旧密钥已泄露，立即在同一 SQL Editor 中执行下面的两步停用，而后再签发。

```sql
BEGIN;
UPDATE nt_identity.accounts SET login_hash=NULL,activation_hash=NULL,activation_expiry=NULL WHERE handle='siqi';
DELETE FROM nt_identity.sessions WHERE account_id=(SELECT id FROM nt_identity.accounts WHERE handle='siqi');
COMMIT;
```

示例使用 siqi，为小王处理时替换为 xiaowang。控制台「退出该账号全部设备」只结束会话，长期登录密钥仍可继续使用。

## 部署和核验

- 按序应用 `db/migrations/003_cloud_accounts.sql` 和 `db/migrations/004_training_ledger.sql`。生产和预览使用独立分支。Vercel 环境变量 `NEUROTRACE_DATABASE_URL` 的数据库角色只能执行限定的应用函数，没有基础表访问或签发激活码的权限。
- `GET /api/identity?view=roster` 为公开账号目录，`GET /api/identity` 读取实际云端会话，`GET /api/identity?view=admin` 仅供已认证开发者。更新操作必须是同源 JSON POST，拒绝客户端传入角色进行提权。
- 可定期在 Neon SQL Editor 核查 `nt_identity.admin_events`。记录包含激活和撤销操作涉及的内部账号 ID 及时间，不含激活码、个人登录密钥或会话凭证。
