# 回到 ChatGPT 开启下一轮迭代

这轮 Codex 工作是工程整理与资料对齐。下一轮产品设计和功能迭代继续在原 ChatGPT 对话中进行，按用户的新需求执行。

## 交给 ChatGPT 的材料

1. 附上 `NeuroTrace_engineering_handoff_20261107.zip`。它是整理后的公开工程快照，包含当前源码、24 版历史、设计资料、工程文档、截图和逐文件校验清单；不是新产品 Release。压缩包根部 `HANDOFF_README.txt` 说明提交身份与入口，`SNAPSHOT_MANIFEST.json` 记录具体 SHA-256。
2. 优先回到 [完善 NeuroTrace V21](https://chatgpt.com/c/6aee4242-4bb8-83ee-8f4a-169a30b796f4)。在原对话中接续可利用已有设计与交付上下文；如果换对话，仍应附上本工程包和本说明。
3. 普通界面／交互迭代无需把私信原包或音轨重新上传。若确实需要完整既有后端，负责人可从原对话的 V2.3 交付或独立私有保管库按需恢复，不把密钥、私信正文、账号 PIN 或授权卡贴进公共内容。
4. 在下面提示词末尾追加本次具体要求，以及本次希望“仅交付方案／可运行文件／同时上线”的范围。工程整理阶段的禁发要求不会自动变成以后永不发布的限制。

GitHub：[SuperMing24/neurotrace-ui-workflow](https://github.com/SuperMing24/neurotrace-ui-workflow)。先读工程包中的本文件、`docs/PROJECT_STATUS.md`、`docs/engineering/SOURCE_ALIGNMENT.md`，需要详细工程信息时再读其余入口。

## 可直接复制的接续提示词

继续处理 NeuroTrace，请依据本消息末尾的新要求开展下一轮产品迭代。我已经完成一轮工程整理，附件是整理后的工程接续包；请先读取它，再结合本对话已有设计资料和原交付继续工作。

请先读附件内 HANDOFF_README.txt、docs/CHATGPT_NEXT_ITERATION.md、docs/PROJECT_STATUS.md 和 docs/engineering/SOURCE_ALIGNMENT.md。当前产品基线是既有 V2.3（release.json 为 2.3.0），本次工程整理没有产生新版本；GitHub 仓库是 SuperMing24/neurotrace-ui-workflow。具体工程提交和逐文件哈希以 SNAPSHOT_MANIFEST.json 为准，历史资料和已有版本继续保留。

已有一项界面整理需要接入下一轮成果：“版本回看”已在 review/shell.js 和 review/shell.css 中移入左侧“从设计到上线”的流程栏目，条目同宽、同间距，窄屏也统一归入该入口；中央实时交互原型、右侧交互状态保持为主要动态内容。请沿用附件内整理后的外壳，不要从线上旧外壳覆盖回去。桌面和手机验收截图在 docs/engineering/evidence/。

当前正式站 https://neurotrace-ui-demo.vercel.app 仍运行工程整理前的既有 V2.3，所以上面这项左栏改动尚未上线。Vercel 项目为 neurotrace-ui-demo，目前未连接此 GitHub 仓库；vercel.json 的 git.deploymentEnabled 为 false。工程同步与实际部署是两件事。下一轮若我要求上线，请把上述整理也带入实际发布输入，并按我的当轮要求处理版本与发布。

设计原图、提示词和旧交付可以继续从本对话／原 ChatGPT 资料库查找，已确认入口在 SOURCE_ALIGNMENT.md。不要把“尚未纳入本地索引”视为素材已丢失，也不要因与本次需求无关的历史母图或旧预览数据库差异停住普通 UI 迭代。需要具体原件时说明那一项输入并取回，保留已有文件，不虚构原稿或历史。

私信模板与原始交付已另外保存在独立的私有档案库 neurotrace-private-archive，不再依附预览分支；4 份文件的哈希、恢复方法和保留副本见 docs/engineering/PRIVATE_CUSTODY.md。公开工程包有意排除了私人服务正文、对应测试、密钥和许可未确认音轨。若本次只改界面，直接使用现有可用素材推进；不要因为缺少私人覆盖而重建或覆盖原有私信服务。需要私人后端时按原件恢复，保持私有。

此前“不发新版本、不部署、不改版本号”针对的是已经结束的工程整理轮次。下一轮以我在本消息中的新要求为准；涉及生产数据库内容、积分账本、认证或账号权限的高风险变更，先说明具体影响并取得相应授权。请先用简短文字确认读到的基线、会沿用的工程改动和本次真正相关的依赖，然后执行我的要求、验证结果，并交付可接续的文件与变更说明；不要只停留在计划。

我本轮的新要求如下：
（在这里补充具体功能、界面或体验要求，并说明本轮是否需要上线。）

## 本工程包的实际边界

公共工程包可支持阅读、现有前端迭代和历史对比，不等同含私人覆盖的完整生产部署包。只从公共快照执行完整构建／私人测试时，工具会提示缺少相应本地输入。UI 工作可直接读取 HTML/CSS/JS 和已有图片；完整生产打包需要负责人提供获准的私人覆盖，并处理实际使用范围内的许可及后端验证。

不要求 ChatGPT 自动获得其他对话、GitHub、Vercel 或私有存储的访问权；只能依据本轮实际可读的附件和连接继续。附件打不开时具体指出文件，不能声称已经读过。
