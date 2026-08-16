# Release & SOP Guide: DSH Agent 技能与规则工作台 (dsh-better-sidebar-skills)

> **发布版本**：v0.1.0-alpha  
> **责任角色**：🚀 OPS（DevOps 工程师）  
> **集成基座**：`DSH-better-sidebar` (v0.12.2+)  
> **服务地址**：[http://127.0.0.1:3080](http://127.0.0.1:3080)  

---

## 1. 插件概述与核心能力

**`dsh-better-sidebar-skills`** 是专为 DeepSeek Harness 与 `better-sidebar` 打造的 **AI Agent 技能、规则与指令全景工作台**。

它完美继承了 better-sidebar 的视觉与交互规范，支持对当前工作区与全局环境中各大主流 AI Agent 框架的技能资产进行一站式探测与管理：

- ⚡ **Antigravity (Google AGY)**：自动嗅探 `.agents/skills/*/SKILL.md`、`.agents/rules/*.md` 及 `~/.gemini/config/skills/`
- 🟠 **Claude Code**：自动嗅探 `.claude/skills/*/SKILL.md`、`.claude/rules/*.md` 及项目根目录 `CLAUDE.md`
- 🟢 **Codex / OpenAI**：自动嗅探 `.codex/skills/*/SKILL.md`、`.codex/rules/*.md`
- 🔵 **Cursor / 通用规则**：自动嗅探 `.cursorrules`、`.cursor/rules/*.mdc` 及 `AGENTS.md`

---

## 2. 核心功能操作指引 (Standard Operating Procedure - SOP)

### 2.1 访问技能工作台
1. 打开浏览器访问：**[http://127.0.0.1:3080](http://127.0.0.1:3080)**。
2. 首次加载或更新后，按 **`Ctrl + Shift + R`（或 `Cmd + Shift + R`）** 强制刷新。
3. 点击右侧栏或底部面板的 `+` 菜单，选择 **`Agent 技能` (dsh-skills:manager)**。
4. 顶部 Tab 栏将常驻显示 `Agent 技能` 图标与当前已就绪的技能总数徽标（Badge）。

---

### 2.2 浏览、搜索与分类筛选
- **分类筛选**：点击顶部的分类 Chip（`全部`、`Antigravity`、`Claude`、`Codex`、`Cursor`），按 Agent 生态快速过滤。
- **实时搜索**：在搜索栏输入关键词，支持按技能名称、描述、YAML 标签（Tags）即时过滤。

---

### 2.3 快速复制与侧边栏编辑器联动
- **复制 Prompt**：点击卡片右下角的 📋 图标，直接将技能调用指令复制到剪贴板。
- **在线编辑**：点击卡片右下角的 📝 图标，直接在 better-sidebar 内置的 CodeMirror 代码编辑器中打开该 `SKILL.md`，编辑保存后即时生效。
- **查看详情**：点击卡片任意区域打开抽屉详情，查看入参参数表、作者、版本及 Markdown 全文。

---

### 2.4 一键创建新技能 (Scaffold Wizard)
1. 点击右上角 **【+ 新建】** 按钮。
2. 选择目标 Agent 生态（Antigravity / Claude / Codex / Cursor）。
3. 输入技能名称（如 `data-analyzer`）和功能说明。
4. 点击 **【立即创建】**，系统将自动在项目对应目录中脚手架生成规范的 `SKILL.md` 文件并自动高亮打开。

---

## 3. 运维与插件管理命令

```bash
# 1. 在 web profile 中重新编译与验证
cd dsh-better-sidebar-skills
pnpm build
pnpm test

# 2. 将插件挂载到 DSH Web Profile
pnpm dsh plugin --profile web add ./dsh-better-sidebar-skills

# 3. 启动/重启 DSH Web 服务
pnpm dsh web
```
