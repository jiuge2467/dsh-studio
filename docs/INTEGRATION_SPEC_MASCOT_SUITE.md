# DeepSeek Harness 功能融合与模块整合清单说明书 (Integration Spec)

> **文档性质**：模块整合决策与架构适配规范 (Module Inventory & Integration Specification)
> **涉及仓库**：
> - 1. `E:\ccode\vscode_code\个人项目\dsh-web-ui`（生产力工具、皮肤中心与系统监控）
> - 2. `E:\ccode\vscode_code\个人项目\dsh-mascot-pet`（Q版小鲸鱼姬桌宠与摸鱼中心）
> - 3. `E:\ccode\vscode_code\个人项目\deepseek-harness-master\DSH-better-sidebar`（现已运行的高级多功能侧边栏）

---

## 1. 模块整合与取舍决策表 (Module Inventory)

遵循 **“保留我们独有的 Q 版形象与小游戏 + 直接使用 dsh-web-ui 成熟能力 + 不修改他人核心代码 + 剔除冗余冲突功能”** 的原则，整合清单如下：

| 模块名称 | 来源包 (Package) | 决策 | 取舍依据与详细说明 |
| :--- | :--- | :---: | :--- |
| **🐳 Q版小鲸鱼姬桌宠** | `dsh-mascot-pet` | **✅ 保留 (核心)** | **100% 保留 Q 版高保真女仆小鲸鱼姬形象**（`CHIBI_FRONT_URI`、`CHIBI_HAPPY_URI`）、四态呼吸/思考/活跃表情，取代 dsh-web-ui 的低清像素贴图。 |
| **🎮 摸鱼解压小游戏** | `dsh-mascot-pet` | **✅ 保留 (核心)** | **100% 保留全部摸鱼互动**：四级单词背诵挑战（CET4）、美食大转盘、消消乐气泡、程序员笑话集。 |
| **⚙️ 小鲸鱼姬专属设置** | `dsh-mascot-pet` | **✅ 保留 (核心)** | 在 DSH 设置弹窗左侧导航常驻「🐳 小鲸鱼姬」卡片，提供换装预设、显隐开关、气泡频率配置。 |
| **⚡ 实时令牌与吞吐 (Live Stats)** | `dsh-live-stats` | **✅ 采纳 (直接使用)** | 直接使用 dsh-web-ui 经过严格压测的实时 TPS 速率、LLM 耗时、准确 Token 计数与缓存命中率，**彻底解决原小鲸鱼姬本地 token 计费不准的问题**。 |
| **🌟 梁神模式 (Liangshen)** | `dsh-liangshen` | **✅ 采纳 (直接使用)** | 包含深思考能力与特色智能体预设，直接加载。 |
| **📋 任务看板 (Task Board)** | `dsh-task-board` | **✅ 采纳 (直接使用)** | 5 列任务流转、真实 Agent 会话派发执行、Cron 表达式定时任务自动化巡检。 |
| **📱 移动端远程连接** | `dsh-remote-web-ui` | **✅ 采纳 (直接使用)** | 局域网/公网扫码配对，手机随时随地远程控制 DSH 桌面工作区。 |
| **🖥️ SSH 远程运维面板** | `dsh-ssh` | **✅ 采纳 (直接使用)** | 远程服务器管理、Web xterm 终端、SFTP 文件传输。 |
| **👁️ 图像理解工具** | `dsh-tool-describe-image`| **✅ 采纳 (直接使用)** | 接入外部多模态视觉端点，为纯文本模型赋予识图理解能力。 |
| **🎨 皮肤中心与 10 款主题** | `dsh-skins` + `dsh-client-ui-skin-center` | **✅ 采纳 (直接使用)** | Windows XP (Luna)、Cyberpunk、Mac Retro、Blue Fantasy 等 10 款主题，即时试穿与一键换肤。 |
| **⚙️ Web UI 插件配置中心** | `dsh-web-ui-settings` | **✅ 采纳 (直接使用)** | 在设置页中提供统一的 Web UI 插件管理入口与社区插件列表。 |
| **❌ Git 图谱 (Git Graph)** | `dsh-git-graph` | **🚫 剔除 (不要)** | 当前项目已具备 Git 分支与日志能力，且依用户要求不引入以避免输入框顶栏视觉杂乱。 |
| **❌ 旧版右侧面板 (AionUI Panel)** | `dsh-aionui-panel` | **🚫 剔除 (不要)** | 当前系统已运行更高级的 `DSH-better-sidebar`（支持多标签、终端、代码编辑与 Agent 技能工作台），剔除旧版面板以避免双侧边栏重叠冲突。 |

---

## 2. 零侵入适配架构 (Zero-Core-Modification Strategy)

为了**不破坏 `dsh-web-ui` 的核心源码**，同时实现与本工程的最佳适配，采用 **Cordis Bundle 补丁聚合层 (Patch-Layer Composition)**：

```
                      ┌────────────────────────────────────────────────────────┐
                      │          DeepSeek Harness Web Profile (运行时)          │
                      └───────────────────────────┬────────────────────────────┘
                                                  │
             ┌────────────────────────────────────┴───────────────────────────────────┐
             │       dsh-mascot-suite / dsh-web-ui-all (聚合 Manifest & Bundle)       │
             └────────┬───────────────────────────────────────────────┬───────────────┘
                      │                                               │
    ┌─────────────────┴─────────────────┐           ┌─────────────────┴─────────────────┐
    │  🐳 Q版小鲸鱼姬伴侣与摸鱼中心      │           │  🛠️ dsh-web-ui 原生核心功能模块   │
    │  (来自 dsh-mascot-pet 原装代码)   │           │  (直接引入，100% 保持原装逻辑)     │
    ├───────────────────────────────────┤           ├───────────────────────────────────┤
    │ • 高清 Q 版女仆形象与表情动画     │           │ • dsh-live-stats (精准 TPS 监控)   │
    │ • 单词/美食/游戏/笑话摸鱼模块     │           │ • dsh-task-board (任务看板与 Cron)│
    │ • 设置页「🐳 小鲸鱼姬」专属分区   │           │ • dsh-remote-web-ui (移动端远程)  │
    │ • 继承 live-stats 的准确 Token 数 │           │ • dsh-ssh (SSH 远程运维)          │
    │                                   │           │ • dsh-tool-describe-image (视觉)  │
    │                                   │           │ • dsh-liangshen (梁神模式)        │
    │                                   │           │ • dsh-skins (10款皮肤与皮肤中心)  │
    │                                   │           │ • dsh-web-ui-settings (配置中心)  │
    └───────────────────────────────────┘           └───────────────────────────────────┘
```

### 聚合补丁层定义 (`cordis.patch.yml`)
在打包聚合入口中，精确声明要挂载的子插件，跳过 `dsh-aionui-panel` 与 `dsh-git-graph`：

```yaml
# dsh-mascot-suite 聚合补丁定义
- insert:
    # 1. 我们的 Q 版小鲸鱼姬桌宠与摸鱼中心
    - id: mascot-pet
      name: 'dsh-mascot-pet'
    # 2. dsh-web-ui 生产力模块 (原装直引)
    - id: live-stats
      name: '@linxin666/dsh-live-stats'
    - id: ui-task-board
      name: '@linxin666/dsh-client-ui-task-board'
    - id: remote-web-ui
      name: '@linxin666/dsh-remote-web-ui'
    - id: ssh
      name: '@linxin666/dsh-ssh'
    - id: describe-image
      name: '@linxin666/dsh-tool-describe-image'
    - id: liangshen
      name: '@linxin666/dsh-liangshen'
    - id: ui-skin-center
      name: '@linxin666/dsh-client-ui-skin-center'
    - id: ui-web-ui-settings
      name: '@linxin666/dsh-client-ui-web-ui-settings'
```

---

## 3. 设置弹窗与交互分区规划

进入 DSH 左下角【设置】弹窗后，左侧导航栏的分布秩序：

```
+-----------------------------------------------------------------------------------+
| 设置                                                                [打开配置] (X)|
+-------------------+---------------------------------------------------------------+
| ⚙️ 通用设置        |                                                               |
| 🤖 模型           |                                                               |
| 🧩 插件           |                                                               |
| 🪄 Agent 预设      |                                                               |
| 🗂️ 侧边卡片        |  (由 DSH-better-sidebar 驱动: 管理终端、编辑器与 Agent技能Tab) |
| 🐳 小鲸鱼姬 <-----+  (由 dsh-mascot-pet 驱动: 桌宠显隐、换装预设卡片、摸鱼偏好)     |
| 🎨 皮肤中心        |  (由 dsh-skins 驱动: 10款经典皮肤即时试穿与切换)               |
| 🛠️ Web UI 插件     |  (由 dsh-web-ui-settings 驱动: 任务看板/SSH/远程连接等参数)    |
+-------------------+---------------------------------------------------------------+
```

---

## 4. 实施与验证步骤 (SOP)

1. **Step 1: 依赖就绪与小鲸鱼姬适配**：
   - 将 `dsh-mascot-pet` 中的 Token 计费展示与 `dsh-live-stats` 挂钩，保持 Q 版外表与四态表情。
   - 确保 `dsh-mascot-pet` 的 `settings.section` 正常注册。
2. **Step 2: 聚合包编译构建**：
   - 在 `dsh-web-ui` 仓库中执行编译，确保排除项（Git Graph、AionUI Panel）安全剔除，保留项正常打包。
3. **Step 3: Web Profile 挂载**：
   - 执行 `pnpm dsh plugin --profile web add ...`，将插件套件一键注入 DSH。
4. **Step 4: 实机端到端全量验证**：
   - 重启 DSH Web 服务并在浏览器中通过自动化测试验证：Q 版小鲸鱼姬、摸鱼小游戏、实时 TPS、任务看板、SSH、皮肤中心等逐一测试。
