<p align="center">
  <img src="assets/readme/banner.svg" alt="DSH Studio Banner" width="100%" />
</p>

<p align="center">
  <strong>🔥 Modern DeepSeek Harness Full-Stack Workbench · Multi-Source MCP Debugging Hub · CoT Vision Engine · Geek Mascot Companion</strong>
</p>

<p align="center">
  <a href="README.md">简体中文</a> •
  <a href="README.en.md">English</a> •
  <a href="#-why-dsh-studio">Highlights</a> •
  <a href="#-competitive-matrix">Comparison</a> •
  <a href="#-core-feature-matrix">Features</a> •
  <a href="#-quick-start">Quick Start</a>
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

## 💡 Why DSH Studio?

**DSH Studio** (DeepSeek Harness Studio) is a **next-generation full-stack enhanced workbench and plugin suite** built for AI developers and agent geeks. It overcomes the complex configuration and black-box debugging bottlenecks of traditional agent clients, integrating industrial-grade developer workflows, CoT visual reasoning streams, and an interactive anime mascot companion:

* 🔌 **Pioneering MCP Online Sandbox**: Zero token cost. Automatically parses JSON Schema parameters, initiates real JSON-RPC handshakes, and provides millisecond latency benchmarks without invoking LLMs.
* 🧠 **CoT Visual Reasoning Stream Penetration**: Captures `reasoning_content` from multimodal vision models with deep thinking (e.g., Xiaomi MiMo), preventing blank screens and dropped reasoning chains common in traditional UI frameworks.
* 🐬 **Little Whale Maid 2.0 Geek Mascot**: 3 high-definition skin sets, 650ms CET-4 blind-typing flashcards, snack feeding cooldown (CD) system, retro mini-arcade, and persistent all-time token billing ledger.
* 🧰 **Industrial-Grade Enhanced Sidebar**: Code syntax highlighting explorer, visual Git commit history and diff inspection, embedded persistent ConPTY/PTY terminal.

---

## 📊 Competitive Matrix

| Dimension | Traditional Agent Client<br>*(Claude Desktop)* | Web Chat UI<br>*(LobeChat / Dify)* | AI Code Editor<br>*(Cursor / Continue)* | 🌟 **DSH-Studio**<br>*(Ours)* |
| :--- | :--- | :--- | :--- | :--- |
| **🔌 MCP Discovery** | ❌ Manual JSON file edits only | ⚠️ Heavy backend plugin setup | ⚠️ Single local config only | ✅ **All-Source Auto Discovery** (`.vscode`, Cursor, Claude, Antigravity) |
| **🧪 MCP Online Sandbox** | ❌ None, requires prompting LLM | ❌ No isolated tool tester | ❌ No single-tool testing UI | ✅ **Tool Tester Sandbox** (Schema form generation, 1-click test data, 0 token latency probe) |
| **🧠 Visual CoT Reasoning** | ❌ Cannot stream reasoning | ⚠️ Prone to blank screen/dropped tokens | ❌ General image input only | ✅ **Native CoT Vision Engine** (Stream-captures `reasoning_content` seamlessly) |
| **🐬 Mascot Companion** | ❌ Cold, static interface | ❌ None | ❌ None | ✅ **Little Whale Maid 2.0** (3 skins + empathy states + feeding CD + mini-games) |
| **⚡ Inference Downtime** | ❌ Idle waiting | ❌ None | ❌ None | ✅ **650ms Word Flashcards** (A/B/C/D keyboard blind-typing during generation gaps) |
| **💰 Cost Transparency** | ❌ No global ledger | ⚠️ Session-only estimation | ⚠️ Quota percentage only | ✅ **All-Time Billing Ledger** + Real-time token probes & monthly budget progress |
| **🧰 All-in-One IDE Workflow** | ❌ No sidebar / terminal | ❌ Chat-only interface | ⚠️ Editor-bound, detached agent | ✅ **Industrial Sidebar** (Explorer preview + Git Diff + PTY Terminal) |

---

## 🌟 Core Feature Matrix

### 🔌 1. MCP Multi-Source Management & Online RPC Testing Sandbox (`dsh-better-sidebar-mcp`)

Click "MCP Management" in the sidebar to access full-suite configuration sniffing, 10+ official presets carousel, and the isolated **Tool Tester Online Sandbox**:

<p align="center">
  <img src="assets/readme/mcp-flow.svg" alt="MCP Multi-source Scanning and Tool Tester Sandbox" width="100%" />
</p>

* **Multi-Source Auto-Aggregation**: Automatically scans and detects workspace configs (`./mcp.json`, `.vscode/mcp.json`, `.cursor/mcp.json`, `.agents/mcp_config.json`) and global environments (Claude Desktop, Cursor, Antigravity/Gemini, `~/.dsh/mcp.json`).
* **Single Tool Online Testing Sandbox (Tool Tester Modal)**: Renders dynamic parameter forms from JSON Schema, populates default mock data with one click, **executes real JSON-RPC handshakes**, and displays millisecond latency and structured returns **with zero LLM token cost**.
* **10+ Curated Official Presets Carousel**: Built-in GitHub, SQLite, Web Fetch, Brave Search, Puppeteer, PostgreSQL, Memory, Filesystem, Everything, Git presets with horizontal scroll and quick switches.
* **Bulk JSON Import & Live Toggles**: Paste raw `mcpServers` JSON snippets for instant parsing and toggle servers on/off non-destructively.

---

### 🧠 2. CoT Visual Reasoning Stream Penetration Engine (`dsh-tool-describe-image`)

Engineered for multimodal vision models with deep thinking, unlocking loss-free reasoning chain streaming and network benchmarking:

<p align="center">
  <img src="assets/readme/cot-architecture.svg" alt="CoT Vision Reasoning Stream Architecture" width="100%" />
</p>

* **Chain of Thought (CoT) Compatibility**: Tailored for models with deep reasoning (e.g., Xiaomi MiMo). Even when initial stream `content` is empty, it parses `reasoning_content` without latency or timeout.
* **Graphical Connectivity Probing**: Measure endpoint round-trip times and automatically probe and list provider models.

---

### 🐬 3. Little Whale Maid 2.0 Geek Mascot & Companion (`dsh-mascot-pet`)

An interactive desktop companion docked to your workspace, fusing flashcard study, geek memes, snack feeding, and global billing ledgers:

#### 👗 3 High-Definition Seamless Skins
<table>
  <tr>
    <td align="center" width="33%">
      <img src="assets/readme/mascot-skin-maid.png" width="180px" /><br />
      <b>Classic Maid Outfit</b><br />
      <sub>Gentle &amp; Healing Companion</sub>
    </td>
    <td align="center" width="33%">
      <img src="assets/readme/mascot-skin-hacker.png" width="180px" /><br />
      <b>Cyber Geek Mecha</b><br />
      <sub>Neon &amp; Hardcore Futuristic</sub>
    </td>
    <td align="center" width="33%">
      <img src="assets/readme/mascot-skin-sailor.png" width="180px" /><br />
      <b>Summer Sailor Swimsuit</b><br />
      <sub>Refreshing &amp; Energetic Vibes</sub>
    </td>
  </tr>
</table>

* **CET-4 Vocabulary Speed Rush**:
  - Single-screen zero-scroll layout to maximize code generation downtime.
  - **650ms Auto-Advance on correct answers** with **A / B / C / D full keyboard blind-typing** and combo streaks.
* **Snack Feeding CD System & Hunger Empathy**:
  - 4 distinct snacks (Iced Cola, Hot Coffee, Donut, Energy Bar) with dynamic cooldowns (30s ~ 120s).
  - Affection score discounts + natural fullness decay (1 point every 2 minutes).
  - Fullness under 25% triggers hunger state and reminder dialogue bubbles.
* **All-Time Ledger & Real-Time Token Probes**:
  - Persistent `dsh_billing_ledger_v2` tracking cumulative usage across sessions.
  - Dual view displaying **Current Session Cost**, **All-Time Historical Total**, and **Monthly Budget Progress**.

#### 🎮 Geek Decompression Arcade
<table>
  <tr>
    <td align="center" width="33%">
      <img src="assets/readme/game-2048.png" width="220px" /><br />
      <b>Geek Math · 2048</b>
    </td>
    <td align="center" width="33%">
      <img src="assets/readme/game-breakout.png" width="220px" /><br />
      <b>Retro Arcade · Breakout</b>
    </td>
    <td align="center" width="33%">
      <img src="assets/readme/game-bubble.png" width="220px" /><br />
      <b>Color Match · Bubble Shooter</b>
    </td>
  </tr>
</table>

---

### 🧰 4. Industrial-Grade Enhanced Sidebar (`dsh-better-sidebar`)

IDE-grade feature suite integrated into DSH Web:

* **Explorer**: Workspace file tree navigation, search, and syntax-highlighted code previews.
* **Source Control (Git)**: Branch switching, visual commit logs, diff views, and one-click reverts.
* **Embedded Persistent Terminal**: Integrated ConPTY / PTY sessions supporting autonomous agent tooling commands.
* **Modular Tab Assembly**: Drag-and-drop ordering and toggles in Settings > Sidebar Cards.

---

## 🏗️ System Architecture

<p align="center">
  <img src="assets/readme/system-architecture.svg" alt="DSH Studio System Architecture" width="100%" />
</p>

```
dsh-studio/
├── packages/
│   ├── core/                   # DSH Agent Loop state machine and session runtime
│   ├── llm/                    # Multimodal LLM providers (DeepSeek / MiMo / OpenAI)
│   ├── typert/                 # Type graph generator & RPC runtime registry
│   └── host/                   # WebServer & micro-frontend host
├── plugins/                    # 🚀 Hot-pluggable micro-frontend plugins
│   ├── dsh-better-sidebar/     # Enhanced sidebar container (Explorer, Git, Terminal)
│   ├── dsh-better-sidebar-mcp/ # MCP multi-source scanner & RPC tester sandbox
│   ├── dsh-mascot-pet/         # Mascot 2.0, speed flashcards & all-time ledger
│   └── dsh-tool-describe-image/# CoT visual reasoning stream adapter
├── assets/readme/              # 📸 High-res showcase graphics & vector diagrams
└── docs/                       # Architecture specs, PRDs, and automated test reports
```

---

## 🚀 Quick Start

### Option 1: Standalone Workbench (Recommended)

Requires Node.js >= 22 and pnpm:

```bash
# 1. Clone this repository
git clone https://github.com/jiuge2467/dsh-studio.git
cd dsh-studio

# 2. Install dependencies and build
pnpm install
pnpm run build

# 3. Start Web Workbench (listens on 0.0.0.0:3080)
pnpm dsh web --host 0.0.0.0
```

Open `http://127.0.0.1:3080` in your browser to start exploring!

---

### Option 2: Add Plugins to Existing DSH Environment

```bash
# 1. Install MCP Manager & Testing Sandbox
cd ~/.dsh && dsh plugin --profile web add dsh-better-sidebar-mcp

# 2. Install Enhanced Sidebar Suite
cd ~/.dsh && dsh plugin --profile web add dsh-better-sidebar

# 3. Install Little Whale Maid Mascot Companion
cd ~/.dsh && dsh plugin --profile web add dsh-mascot-pet
```

---

## 🧪 Automated Testing & Quality Gates

```bash
# Run full unit test suite
pnpm test

# Run mascot & billing ledger tests
pnpm --filter @deepseek-ai/dsh-mascot-pet test

# Run MCP manager unit tests
pnpm --filter dsh-better-sidebar-mcp test
```

> **Quality Metrics**:
> - Unit Test Pass Rate: **19/19 PASS (100%)**
> - TypeScript Strict Mode: **`strict: true` (0 compilation errors)**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
