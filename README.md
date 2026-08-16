<p align="center">
  <img src="assets/readme/banner.svg" alt="DSH Studio Banner" width="100%" />
</p>

<p align="center">
  <strong>🔥 现代化 DeepSeek Harness 全栈增强工作台 · 远程 SSH 极客侧边栏 · 多源 MCP 可视化调试中枢 · 视觉思考引擎 · 灵动伴侣</strong>
</p>

<p align="center">
  <a href="README.md">简体中文</a> •
  <a href="README.en.md">English</a> •
  <a href="#-与原生-deepseek-harness-dsh-对比我们增加了什么">与原生对比</a> •
  <a href="#-真实实机界面一览-real-ui-showcase">实机展示</a> •
  <a href="#-核心功能图文深度矩阵">功能矩阵</a> •
  <a href="#-30-秒极速上手">快速开始</a>
</p>

<p align="center">
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/topic-dsh--plugin-blueviolet?style=flat-square&logo=github" alt="dsh-plugin" /></a>
  <a href="https://github.com/topics/dsh-better-sidebar"><img src="https://img.shields.io/badge/topic-dsh--better--sidebar-blue?style=flat-square&logo=github" alt="dsh-better-sidebar" /></a>
  <a href="https://github.com/topics/model-context-protocol"><img src="https://img.shields.io/badge/topic-MCP%20Hub-emerald?style=flat-square" alt="MCP Hub" /></a>
  <a href="https://github.com/topics/deepseek"><img src="https://img.shields.io/badge/topic-deepseek-ff69b4?style=flat-square" alt="DeepSeek" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" /></a>
  <img src="https://img.shields.io/badge/Tests-19%2F19%20PASS%20(100%25)-success?style=flat-square" alt="Tests" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D22-blue?style=flat-square&logo=node.js" alt="Node" />
</p>

---

## 🖥️ 真实实机界面一览 (Real UI Showcase)

<p align="center">
  <img src="assets/readme/real-ui-hero-main.png" alt="DSH Studio Real UI Main Workbench" width="100%" style="border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);" />
  <br />
  <em>▲ DSH Studio 真实全栈工作台主界面：集成多模型对话、增强极客侧边栏、小鲸鱼姬桌宠与实时 Token 探针</em>
</p>

---

## 🆚 与原生 DeepSeek Harness (DSH) 对比：我们增加了什么？

官方原生 **DeepSeek Harness (DSH)** 是一个底层的 Agent 运行时内核，侧重于核心 Loop 与基础 CLI。而 **DSH Studio** 是在上游基础上的**全栈工业级增强工作台与微前端生态**：

| 功能模块 | 原生 DeepSeek Harness (DSH) | 🌟 **DSH Studio (本项目真实特性)** |
| :--- | :--- | :--- |
| **🌐 远程 SSH & PTY 终端** | ❌ 仅支持基础本地子进程，无持久化终端，无法直连远程服务器 | ✅ **集成完整远程 SSH 主机直连 & ConPTY / PTY 终端**，支持多终端 Tab 与 **8 套 Agent 终端工具直连操控** |
| **🧰 IDE 级开发工作流** | ❌ 仅限纯 Chat 会话面板，无法浏览代码与 Git 变更 | ✅ **工业级全功能侧边栏**：Explorer 代码高亮预览与搜索、Git 分支切换、可视化提交历史与 Diff 差异对比 |
| **🔌 MCP 管理与发现** | ❌ 仅支持后台手动编辑单个 JSON，极易格式出错 | ✅ **全域多源自动扫描** (`.vscode`, Cursor, Claude, Antigravity 聚合) + 10+ 官方热门预设横向卡片流 |
| **🧪 MCP 在线沙箱调试** | ❌ 无，必须提问大模型消耗 Token 触发 | ✅ **Tool Tester 独立沙箱** (Schema 动态表单、一键 Mock 填参、真实 RPC 握手与 **0 Token 毫秒级测速**) |
| **🧠 视觉思考 (CoT) 穿透** | ❌ 无法流式解析多模态 `reasoning_content`，易白屏 | ✅ **独创 CoT 视觉引擎** (流式穿透 Xiaomi MiMo 等深度思考链，支持折叠与连通性测速) |
| **🐬 极客桌宠与碎片利用** | ❌ 无伴侣系统，等待模型长生成枯燥漫长 | ✅ **小鲸鱼姬 2.0** (3 套高精立绘 + **650ms 四级盲打背词** + 零食投喂 CD 体系 + 极客解压微游戏厅) |
| **💰 计费与账本透明度** | ⚠️ 仅单次会话粗略统计，刷新页面即全部丢失 | ✅ **全站持久化总账本 (All-Time Ledger)** + 实时底栏 Token 探针 + 月度预算动态进度条 |
| **🧩 架构与装配模式** | 单一整体静态装配 | **微前端热插拔插件群** + 侧边栏卡片自由拖拽排序与独立启停 |

---

## 🌟 核心功能图文深度矩阵

### 🧰 1. 工业级极客增强侧边栏与远程 SSH 终端 (`dsh-better-sidebar`)

为 DSH Web 端提供面向工业级全栈开发与运维的**一体化侧边栏套件**：

<p align="center">
  <img src="assets/readme/real-ui-right-panel.png" alt="DSH Real Sidebar and Tool Panels" width="90%" style="border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.3);" />
  <br />
  <em>▲ 真实实机截图：多功能增强侧边栏面板、任务管理与工作流面板</em>
</p>

* **🌐 远程 SSH 会话直连与持久化 PTY 终端**：
  - 支持多 Tab 会话管理（本地 Bash / PowerShell / WSL / **远程 SSH 主机免密直连**）；
  - 支持断线重连与全屏极客终端沉浸模式；
  - **内置 8 套专用 Agent 终端控制工具**：
    `terminal_create`, `terminal_send`, `terminal_read`, `terminal_wait_for`, `terminal_resize`, `terminal_signal`, `terminal_close`, `terminal_list`，
    赋予 AI Agent 直接操控远程服务器与本地终端执行自动化运维任务的强大能力。
* **📁 资源管理器 (Explorer) 与代码高亮预览**：
  - 工业级树状工程文件浏览、秒级文件名搜索定位；
  - 集成代码语法高亮即时预览（支持 Rust, Go, Python, TypeScript, C++, SQL, YAML, JSON 等 15+ 语言）。
* **🌿 源代码管理 (Git) 与可视化提交对比**：
  - 实时分支切换与状态追踪；
  - 可视化提交历史记录、工作区变更文件 Diff 差异对比高亮与一键撤销。

---

### 🔌 2. MCP 多源可视化管理中枢与在线调试沙箱 (`dsh-better-sidebar-mcp`)

在侧边栏点击「MCP 管理」即可进入。系统提供全自动的多源配置嗅探、10+ 官方热门预设轮播与独立的 **Tool Tester 在线沙箱**：

<p align="center">
  <img src="assets/readme/real-ui-mcp-plugins.png" alt="DSH Real MCP and Plugins Management UI" width="90%" style="border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.3);" />
  <br />
  <em>▲ 真实实机截图：多源 MCP 与插件可视化管理中枢、一键启停与在线状态检测</em>
</p>

* **多源自动扫描聚合**：自动识别工作区（`./mcp.json`, `.vscode/mcp.json`, `.cursor/mcp.json`, `.agents/mcp_config.json`）与全局环境（Claude Desktop, Cursor, Antigravity/Gemini, `~/.dsh/mcp.json`）；
* **单工具在线调试沙箱 (Tool Tester Modal)**：自动解析 Tool 的 JSON Schema 动态生成参数表单，支持一键填入 Mock 测试数据，**直接发起底层真实 JSON-RPC 握手**，毫秒级测速与结果可视化，**无需调用大模型即可 0 成本排错**；
* **10+ 官方热门预设卡片流**：内置 GitHub, SQLite, Web Fetch, Brave Search, Puppeteer, PostgreSQL, Memory, Filesystem, Everything, Git 等常用预设，**支持鼠标滚轮横向丝滑滑动与 ‹ › 快速切换**；
* **批量 JSON 导入与无损启停**：支持直接粘贴任意 `mcpServers` JSON 代码块快速解析入库，可视化开关实时启用/禁用。

---

### 🧠 3. 视觉多模态与深度思考 (CoT) 穿透引擎 (`dsh-tool-describe-image`)

专为带深度思考能力的多模态大模型定制，提供无损的思维链流式穿透与图形化测速：

* **思考链 (CoT Reasoning) 智能兼容**：深度适配带深度思考的多模态视觉模型（如 Xiaomi MiMo 等）。即使模型前期流式 `content` 为空，也能无缝解析 `reasoning_content`，输出完整思考推导过程；
* **图形化连通性测试与模型探测**：支持一键测试接口连通性、测算网络延迟，并自动解析模型厂商导出的完整模型列表。

---

### 🐬 4. 小鲸鱼姬 2.0 灵动极客桌宠与伴侣 (`dsh-mascot-pet`)

常驻开发界面的灵动桌宠伴侣，将极客刷题、名梗互动、饱腹投喂与全站账本深度融合：

<p align="center">
  <img src="assets/readme/real-ui-pet-chat.png" alt="DSH Real Mascot Pet Chat" width="48%" style="border-radius: 8px; vertical-align: top;" />
  <img src="assets/readme/real-ui-pet-panel.png" alt="DSH Real Mascot Pet Interactive Panel" width="48%" style="border-radius: 8px; vertical-align: top;" />
  <br />
  <em>▲ 真实实机截图：左图为桌宠常驻对话与情绪状态气泡；右图为桌宠互动面板、零食投喂与功能卡片</em>
</p>

#### 👗 3 套高精无痕立绘平滑切换
<table>
  <tr>
    <td align="center" width="33%">
      <img src="assets/readme/mascot-skin-maid.png" width="180px" /><br />
      <b>经典女仆 · 常服</b><br />
      <sub>温柔陪伴 · 治愈系互动</sub>
    </td>
    <td align="center" width="33%">
      <img src="assets/readme/mascot-skin-hacker.png" width="180px" /><br />
      <b>赛博极客 · 机甲</b><br />
      <sub>极客霓虹 · 炫酷硬核</sub>
    </td>
    <td align="center" width="33%">
      <img src="assets/readme/mascot-skin-sailor.png" width="180px" /><br />
      <b>夏日水手 · 水着</b><br />
      <sub>清爽元气 · 灵动夏日</sub>
    </td>
  </tr>
</table>

* **四级背单词沉浸式极速刷题**：
  - 紧凑单屏零滚动视口适配，完美利用等待 Agent 生成代码的碎片时间；
  - **650ms 答对自动跳题 (Auto-Advance)**，支持 **A / B / C / D 全键盘极速盲打** 与连击动效。
* **零食投喂 CD 体系与饥饿情绪联动**：
  - 4 款零食（冰阔落、热咖啡、甜甜圈、能量棒）具备差异化冷却时间（30s ~ 120s）；
  - 好感度亲密折扣减免 + 饱腹感时间自然衰减（每 2 分钟衰减 1 点）；
  - 饱腹度低于 25% 触发饥饿低落心情并主动弹出求投喂提醒气泡。
* **全站历史账本 (All-Time Ledger) 与 Token 探针**：
  - 建立 `dsh_billing_ledger_v2` 全局持久化账本，跨会话隔离并累加全站总消费；
  - 实时底栏探针提供【当前会话实时消耗】、【全站历史累计计费】与【当月预算进度条】双重视图。

#### 🎮 极客解压微游戏厅
<table>
  <tr>
    <td align="center" width="33%">
      <img src="assets/readme/game-2048.png" width="220px" /><br />
      <b>极客数字 · 2048</b>
    </td>
    <td align="center" width="33%">
      <img src="assets/readme/game-breakout.png" width="220px" /><br />
      <b>经典街机 · 打砖块</b>
    </td>
    <td align="center" width="33%">
      <img src="assets/readme/game-bubble.png" width="220px" /><br />
      <b>炫彩消消乐 · 泡泡龙</b>
    </td>
  </tr>
</table>

---

## 🏗️ 系统分层解耦架构

<p align="center">
  <img src="assets/readme/system-architecture.svg" alt="DSH Studio System Architecture" width="100%" />
</p>

```
dsh-studio/
├── packages/
│   ├── core/                   # DSH 核心 Agent Loop 状态机与 Session 运行时
│   ├── llm/                    # 多模型 Provider (DeepSeek / MiMo / OpenAI 兼容层)
│   ├── typert/                 # 类型图生成器与运行时 RPC 注册网关
│   └── host/                   # WebServer 与微前端宿主服务
├── plugins/                    # 🚀 热插拔微前端插件群
│   ├── dsh-better-sidebar/     # 工业级侧边栏容器 (SSH, ConPTY 终端, Explorer, Git)
│   ├── dsh-better-sidebar-mcp/ # MCP 多源扫描、预设与在线 RPC 调试沙箱
│   ├── dsh-mascot-pet/         # 小鲸鱼姬 2.0 桌宠、极速背单词与全站账本
│   └── dsh-tool-describe-image/# CoT 视觉深度思考流适配器
├── assets/readme/              # 📸 README 真实实机截图与矢量图谱
└── docs/                       # 架构设计、PRD 与自动化测试报告
```

---

## 🚀 30 秒极速上手

### 方式一：克隆安装完整工作台（推荐）

适合希望体验完整工作台全套功能的开发者（需要 Node.js >= 22 与 pnpm）：

```bash
# 1. 克隆本仓库
git clone https://github.com/jiuge2467/dsh-studio.git
cd dsh-studio

# 2. 安装依赖并编译构建
pnpm install
pnpm run build

# 3. 启动 Web 增强工作台（默认监听 0.0.0.0:3080）
pnpm dsh web --host 0.0.0.0
```

打开浏览器访问 `http://127.0.0.1:3080`，即可立即体验全套功能！

---

### 方式二：将子插件添加到已有的 DSH 环境

如果你已有正在运行的 DSH 环境，也可以按需将各个独立插件添加到 `web` profile 中：

```bash
# 1. 安装工业级增强侧边栏 (含 SSH 远程与终端)
cd ~/.dsh && dsh plugin --profile web add dsh-better-sidebar

# 2. 安装 MCP 可视化管理与调试沙箱
cd ~/.dsh && dsh plugin --profile web add dsh-better-sidebar-mcp

# 3. 安装小鲸鱼姬桌宠伴侣
cd ~/.dsh && dsh plugin --profile web add dsh-mascot-pet
```

---

## 🧪 自动化测试与质量保障

本项目拥有严密的自动化测试套件与类型安全保障：

```bash
# 运行全量单元测试
pnpm test

# 运行小鲸鱼姬桌宠与计费账本测试套件
pnpm --filter @deepseek-ai/dsh-mascot-pet test

# 运行 MCP 插件单元测试
pnpm --filter dsh-better-sidebar-mcp test
```

> **质量指标**：
> - 单元测试通过率：**19/19 PASS (100%)**
> - TypeScript 严格模式：**`strict: true` (0 编译错误)**

---

## 🗺️ 路线图 (Roadmap)

- [x] **工业级极客增强侧边栏（集成 SSH 远程连接、PTY 终端与 8 套 Agent 终端工具）**
- [x] **MCP 多源自动扫描与 Tool Tester 在线调试沙箱**
- [x] **CoT 视觉多模态模型流式思维链深度解析**
- [x] **小鲸鱼姬 2.0 灵动桌宠（3 套立绘 + 650ms 四级盲打刷词）**
- [x] **零食投喂 CD 体系与饥饿情绪共情**
- [x] **全站跨会话持久化 Token 账本与预算进度条**
- [x] **极客解压微游戏厅（2048 / 打砖块 / 泡泡龙）**
- [ ] 更多精美桌宠皮肤与 Live2D 动态骨骼绑定支持
- [ ] MCP Server 一键 Docker 容器化编排与部署

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！
1. Fork 本仓库并新建分支 (`git checkout -b feature/AmazingFeature`)
2. 提交代码更改 (`git commit -m 'feat: add some AmazingFeature'`)
3. 确保本地测试全绿 (`pnpm test`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起 Pull Request

---

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 协议开源。
