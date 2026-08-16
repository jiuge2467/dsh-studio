# dsh-studio · DSH Studio

中文 | [English](README.en.md)

<p align="center">
  <strong>🔥 现代化 DeepSeek Harness 全栈增强工作台 · 多源 MCP 可视化调试中枢 · 视觉思考引擎 · 灵动极客伴侣</strong>
</p>

<p align="center">
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/topic-dsh--plugin-blueviolet?style=flat-square&logo=github" alt="dsh-plugin" /></a>
  <a href="https://github.com/topics/dsh-better-sidebar"><img src="https://img.shields.io/badge/topic-dsh--better--sidebar-blue?style=flat-square&logo=github" alt="dsh-better-sidebar" /></a>
  <a href="https://github.com/topics/model-context-protocol"><img src="https://img.shields.io/badge/topic-MCP%20Hub-emerald?style=flat-square" alt="MCP Hub" /></a>
  <a href="https://github.com/topics/deepseek"><img src="https://img.shields.io/badge/topic-deepseek-ff69b4?style=flat-square" alt="DeepSeek" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" /></a>
</p>

**dsh-studio** 是 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 的现代化全栈增强工作台与插件套件：集成多源 MCP 可视化管理与在线沙箱、CoT 视觉深度思考引擎、小鲸鱼姬 2.0 灵动桌宠（四级极速背单词）、以及全功能增强侧边栏。

---

## 🌟 核心功能矩阵

### 🔌 MCP 多源可视化管理中心 (`dsh-better-sidebar-mcp`)

在侧边栏点击「MCP 管理」进入。系统提供全自动的多源配置扫描、可视化生命周期管理与单工具在线沙箱调试：

* **多源自动扫描聚合**：自动识别当前工作区（`./mcp.json`, `.vscode/mcp.json`, `.cursor/mcp.json`, `.agents/mcp_config.json`）与全局环境（Claude Desktop, Cursor, Antigravity/Gemini, `~/.dsh/mcp.json`）；
* **单工具在线调试沙箱 (Tool Tester Modal)**：入参 JSON Schema 可视化呈现、一键填充默认测试参数，支持真实 RPC 握手执行与毫秒级延迟测速；
* **10 款官方精选热门预设**：内置 GitHub, SQLite, Web Fetch, Brave Search, Puppeteer, PostgreSQL, Memory, Filesystem, Everything, Git 等常用预设，**支持鼠标滚轮横向丝滑滑动与 ‹ › 快速切换**；
* **批量 JSON 导入与无损启停**：支持直接粘贴任意 `mcpServers` JSON 代码块快速解析入库，可视化开关实时启用/禁用。

---

### 🧠 视觉多模态与深度思考 (CoT) 引擎 (`dsh-tool-describe-image`)

为纯文本及视觉大模型提供强大的多模态看图与思考链穿透能力：

* **思考链 (CoT Reasoning) 智能兼容**：深度适配带深度思考的多模态视觉模型（如 Xiaomi MiMo 等），即使模型前期流式 `content` 为空，也能无缝解析 `reasoning_content`，输出完整思考过程；
* **图形化连通性测试与模型探测**：支持一键测试接口连通性、测算延迟，并自动解析模型厂商导出的模型列表。

---

### 🐬 小鲸鱼姬 2.0 灵动极客桌宠 (`dsh-mascot-pet`)

常驻开发界面的灵动桌宠伴侣，将极客刷题、名梗互动与开发状态共情深度融合：

* **3 套高精无痕立绘**：常服、机甲、水着皮肤秒级平滑无缝切换；
* **四级背单词沉浸式极速刷题**：紧凑单屏零滚动视口适配、**650ms 答对自动下一题 (Auto-Advance)** 与 **A/B/C/D 全键盘极速盲打**；
* **极客彩蛋与状态共情**：内置每日极客名梗互动，随模型思考与生成状态切换情绪与动画。

---

### 🧰 增强型极客侧边栏 (`dsh-better-sidebar`)

为 DSH Web 端提供工业级一体化侧边栏套件：

* **资源管理器 (Explorer)**：文件树浏览、搜索定位、多格式文件与代码预览；
* **源代码管理 (Git)**：分支切换、可视化提交历史、Diff 差异对比与撤销；
* **嵌入式持久化终端 (Terminal)**：集成 ConPTY / PTY 终端会话，支持模型通过 Agent 工具直连操作；
* **侧边卡片按需装配**：在「设置 > 侧边卡片」中自由拖拽排序与独立启停各项 Tab 页面。

---

## 🚀 安装与使用

### 方式一：从 GitHub 仓库安装完整工作台（推荐）

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
# 1. 安装 MCP 可视化管理中心
cd ~/.dsh && dsh plugin --profile web add dsh-better-sidebar-mcp

# 2. 安装增强侧边栏
cd ~/.dsh && dsh plugin --profile web add dsh-better-sidebar

# 3. 安装小鲸鱼姬桌宠
cd ~/.dsh && dsh plugin --profile web add dsh-mascot-pet
```

安装后重启 `dsh web` 即可生效。

---

## 🏗️ 代码库分层架构

```
dsh-studio/
├── packages/
│   ├── core/                   # DSH 核心 Agent Loop 与 Session 运行时
│   ├── llm/                    # 多模型 Provider 与流式推理适配
│   └── host/                   # WebServer 与前置网关
├── dsh-better-sidebar/         # 增强侧边栏微前端容器 (Explorer, Git, Terminal)
├── dsh-better-sidebar-mcp/     # MCP 多源扫描、预设与在线 RPC 调试沙箱
├── dsh-mascot-pet/             # 灵动桌宠、极客背单词与状态仪表盘
├── dsh-tool-describe-image/    # 多模态看图与 CoT 视觉客户端
└── docs/                       # 架构设计、PRD 与自动化测试报告
```

---

## 🧪 自动化测试

本项目拥有严密的单元测试与端到端测试套件保障：

```bash
# 运行全量单元测试
pnpm test

# 运行 MCP 插件单元测试
pnpm --filter dsh-better-sidebar-mcp test
```

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交代码更改 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 🏷️ GitHub Topics

`dsh-plugin` · `dsh-better-sidebar` · `deepseek-harness` · `model-context-protocol` · `mcp-manager` · `deepseek` · `agent-workbench`

---

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 协议开源。
