<p align="center">
  <img src="assets/readme/banner.svg" alt="DSH Studio Banner" width="100%" />
</p>

<p align="center">
  <strong>🔥 现代化 DeepSeek Harness 全栈增强工作台 · 多源 MCP 可视化调试中枢 · 视觉思考引擎 · 灵动极客伴侣</strong>
</p>

<p align="center">
  <a href="README.md">简体中文</a> •
  <a href="README.en.md">English</a> •
  <a href="#-为什么选择-dsh-studio">核心优势</a> •
  <a href="#-竞品多维对比矩阵">竞品对比</a> •
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

## 💡 为什么选择 DSH Studio？

**DSH Studio**（DeepSeek Harness Studio）是为下一代 AI 开发者与 Agent 极客打造的**全栈增强工作台与插件套件**。它不仅打破了传统 Agent 客户端配置繁琐、调试黑盒的局限，更将工业级开发工具流、CoT 视觉思考流与高情绪价值的二次元桌宠完美融合：

* 🔌 **首创 MCP 在线沙箱**：无需呼叫 AI 消耗 Token，单工具一键自动填充入参、真实 RPC 握手执行与毫秒级延迟测速；
* 🧠 **CoT 视觉思考穿透**：流式捕获带深度思考多模态模型（如 Xiaomi MiMo 等）的 `reasoning_content`，杜绝传统 UI 的白屏与丢弃思考链；
* 🐬 **小鲸鱼姬 2.0 极客桌宠**：3 套高精立绘无缝换装、650ms 四级盲打刷题、零食投喂 CD 体系、极客解压微游戏厅与全站持久化 Token 总账本；
* 🧰 **工业级全功能侧边栏**：资源管理器代码预览、Git 可视化提交历史与 Diff 对比、嵌入式 ConPTY/PTY 持久化终端。

---

## 📊 竞品多维对比矩阵

| 对比维度 | 传统 Agent 客户端<br>*(Claude Desktop)* | 主流 Web 对话面板<br>*(LobeChat / Dify)* | AI 代码编辑器<br>*(Cursor / Continue)* | 🌟 **DSH-Studio**<br>*(本项目)* |
| :--- | :--- | :--- | :--- | :--- |
| **🔌 MCP 扫描聚合** | ❌ 仅支持手工改单 JSON | ⚠️ 依赖后端插件或复杂配置 | ⚠️ 仅限本地单配置 | ✅ **全域多源自动扫描** (`.vscode`, Cursor, Claude, Antigravity 一键聚合) |
| **🧪 MCP 在线沙箱** | ❌ 无，必须提问大模型触发 | ❌ 无单工具隔离调试能力 | ❌ 无单工具调试界面 | ✅ **Tool Tester 独立沙箱** (Schema 动态表单、一键填参、0 Token 毫秒测速) |
| **🧠 视觉思考 (CoT)** | ❌ 无法解析视觉思考链 | ⚠️ 部分模型易白屏或丢失 | ❌ 仅支持通用图片输入 | ✅ **独创 CoT 视觉引擎** (流式捕获 `reasoning_content`，思维链无损透传) |
| **🐬 极客陪伴与桌宠** | ❌ 严肃冷感界面 | ❌ 无伴侣系统 | ❌ 无伴侣系统 | ✅ **小鲸鱼姬 2.0** (3套高精立绘 + 状态共情 + 投喂CD + 极客解压游戏) |
| **⚡ 极速空隙利用** | ❌ 生成时只能干等 | ❌ 无 | ❌ 无 | ✅ **四级极速刷词** (650ms 自动跳题、A/B/C/D 全键盘盲打，碎片时间背词) |
| **💰 计费与预算透明** | ❌ 无全局统计 | ⚠️ 仅当前会话粗略统计 | ⚠️ 仅显示额度百分比 | ✅ **全站持久化总账本 (All-Time Ledger)** + 实时 Token 探针与月度预算条 |
| **🧰 一体化开发闭环** | ❌ 无侧边栏与终端 | ❌ 仅限纯 Chat 交互 | ⚠️ 编辑器内置但与 Agent 隔离 | ✅ **工业级极客侧边栏** (Explorer 文件预览 + Git Diff 可视化 + PTY 终端) |

---

## 🌟 核心功能图文深度矩阵

### 🔌 1. MCP 多源可视化管理中枢与在线调试沙箱 (`dsh-better-sidebar-mcp`)

在侧边栏点击「MCP 管理」即可进入。系统提供全自动的多源配置嗅探、10+ 官方热门预设轮播与独立的 **Tool Tester 在线沙箱**：

<p align="center">
  <img src="assets/readme/mcp-flow.svg" alt="MCP Multi-source Scanning and Tool Tester Sandbox" width="100%" />
</p>

* **多源自动扫描聚合**：自动识别工作区（`./mcp.json`, `.vscode/mcp.json`, `.cursor/mcp.json`, `.agents/mcp_config.json`）与全局环境（Claude Desktop, Cursor, Antigravity/Gemini, `~/.dsh/mcp.json`）；
* **单工具在线调试沙箱 (Tool Tester Modal)**：自动解析 Tool 的 JSON Schema 动态生成参数表单，支持一键填入 Mock 测试数据，**直接发起底层真实 JSON-RPC 握手**，毫秒级测速与结果可视化，**无需调用大模型即可 0 成本排错**；
* **10+ 官方热门预设卡片流**：内置 GitHub, SQLite, Web Fetch, Brave Search, Puppeteer, PostgreSQL, Memory, Filesystem, Everything, Git 等常用预设，**支持鼠标滚轮横向丝滑滑动与 ‹ › 快速切换**；
* **批量 JSON 导入与无损启停**：支持直接粘贴任意 `mcpServers` JSON 代码块快速解析入库，可视化开关实时启用/禁用。

---

### 🧠 2. 视觉多模态与深度思考 (CoT) 穿透引擎 (`dsh-tool-describe-image`)

专为带深度思考能力的多模态大模型定制，提供无损的思维链流式穿透与图形化测速：

<p align="center">
  <img src="assets/readme/cot-architecture.svg" alt="CoT Vision Reasoning Stream Architecture" width="100%" />
</p>

* **思考链 (CoT Reasoning) 智能兼容**：深度适配带深度思考的多模态视觉模型（如 Xiaomi MiMo 等）。即使模型前期流式 `content` 为空，也能无缝解析 `reasoning_content`，输出完整思考推导过程；
* **图形化连通性测试与模型探测**：支持一键测试接口连通性、测算网络延迟，并自动解析模型厂商导出的完整模型列表。

---

### 🐬 3. 小鲸鱼姬 2.0 灵动极客桌宠与伴侣 (`dsh-mascot-pet`)

常驻开发界面的灵动桌宠伴侣，将极客刷题、名梗互动、饱腹投喂与全站账本深度融合：

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

### 🧰 4. 工业级极客增强侧边栏 (`dsh-better-sidebar`)

为 DSH Web 端提供 IDE 级别的全功能侧边栏套件：

* **资源管理器 (Explorer)**：支持工程文件树浏览、文件名搜索定位、多格式文件与语法高亮代码预览；
* **源代码管理 (Git)**：实时分支切换、可视化提交历史记录、工作区变更文件 Diff 差异对比与一键撤销；
* **嵌入式持久化终端 (Terminal)**：深度集成 ConPTY / PTY 终端会话，支持模型通过 Agent 工具直连终端并执行自动化任务；
* **侧边卡片自由装配**：在「设置 > 侧边卡片」中自由拖拽排序与独立启停各项 Tab 页面。

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
│   ├── dsh-better-sidebar/     # 增强侧边栏容器 (Explorer, Git, Terminal)
│   ├── dsh-better-sidebar-mcp/ # MCP 多源扫描、预设与在线 RPC 调试沙箱
│   ├── dsh-mascot-pet/         # 小鲸鱼姬 2.0 桌宠、极速背单词与全站账本
│   └── dsh-tool-describe-image/# CoT 视觉深度思考流适配器
├── assets/readme/              # 📸 README 高清配图与矢量架构图谱
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
# 1. 安装 MCP 可视化管理与调试沙箱
cd ~/.dsh && dsh plugin --profile web add dsh-better-sidebar-mcp

# 2. 安装工业级增强侧边栏
cd ~/.dsh && dsh plugin --profile web add dsh-better-sidebar

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
