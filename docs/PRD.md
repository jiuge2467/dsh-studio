# PRD: DSH Better-Sidebar Agent 技能与规则工作台插件 (dsh-better-sidebar-skills)

> **文档版本**：v1.0.0 (Phase 1: PRD & Scope)
> **责任角色**：🎯 PM（产品经理）
> **状态**：待评审 (Pending Review & Gate Approval)

---

## 1. 需求背景与目标定位

### 1.1 需求四问
1. **目标用户是谁？**
   使用 DeepSeek Harness (DSH) 进行日常编码、研发调试，同时本地积累了 Antigravity、Claude Code、Codex、Cursor 等主流 Agent 技能（Skills）、规则（Rules）与指令资产的开发者。
2. **在什么核心场景下使用？**
   在 DSH Web 工作台侧边栏中，开发者需要实时掌握当前工作区与全局环境中加载了哪些 Agent 技能，快速查看技能文档、修改入参提示词、新建常用技能模版，无需频繁在各级隐藏目录中翻找 Markdown 文件。
3. **解决什么核心痛点？**
   - **割裂分散**：不同 Agent 工具的技能规范与存放目录各异（如 `.agents/skills`、`.claude/skills`、`.cursor/rules`），缺乏统一的可视化索引。
   - **感知度低**：进入新项目或长周期协作时，用户难以快速了解“当前 AI 具备哪些特定能力/技能”。
   - **编辑不便**：调试技能 prompt 时需要手动用外部编辑器找文件修改。
4. **竞品与生态参考**：
   - GitHub Topic `dsh-better-sidebar` 生态（目前已有 Office 预览、划选提问、哨兵监控等，尚未有专门的 Skill Manager）。
   - VSCode Extensions / Cursor Rules Manager。

### 1.2 核心价值
与 `DSH-better-sidebar` 深度融合，继承其磨砂玻璃、极简现代的 UI 视觉风格，通过 `ctx.betterSidebar` 服务化机制注册原生 Tab，为 DSH 带来一站式的 **Multi-Agent 技能识别、浏览、管理与快捷使用** 能力。

---

## 2. 用户故事与使用旅程 (User Stories)

- **US-1（多源识别）**：作为一个全栈开发者，当我打开项目侧边栏时，系统能自动扫描并分类列出当前项目中包含的所有 Antigravity、Claude Code、Codex 和 Cursor 技能，让我一眼看清可用工具。
- **US-2（元数据呈现）**：作为一个 Agent 调优者，当我点击某个技能时，能看到结构化的技能名称、描述、触发条件、入参列表和正文说明。
- **US-3（快速定位与编辑）**：作为一个技能创作者，当我发现技能 prompt 需要微调时，可以一键在侧边栏 CodeMirror 编辑器中打开该 `SKILL.md` 进行修改，保存后立即生效。
- **US-4（快捷模版创建）**：作为一个新用户，我想为当前项目新增一个技能时，可以通过图形化向导一键生成符合规范的 `SKILL.md` 模板。
- **US-5（无缝体验）**：作为 DSH 用户，该插件在视觉风格、快捷键、暗色/浅色主题、角标（Badge 显示已载入技能总数）上必须与 `better-sidebar` 浑然一体。

---

## 3. 功能矩阵与范围界定 (P0 / P1 / Out-of-Scope)

| 模块 | 功能项 | 优先级 | 说明 |
| :--- | :--- | :---: | :--- |
| **识别引擎** | Antigravity 技能扫描 | **P0** | 扫描当前项目 `.agents/skills/*/SKILL.md` 及全局 `~/.gemini/config/skills/` |
| | Claude Code 技能/规则识别 | **P0** | 扫描 `.claude/skills/`、`.claude/rules/`、根目录 `CLAUDE.md` |
| | Codex / OpenAI 规范识别 | **P0** | 扫描 `.codex/skills/`、`.codex/rules/` |
| | Cursor / 常见通用规则识别 | **P0** | 扫描 `.cursorrules`、`.cursor/rules/`、`AGENTS.md` |
| | Frontmatter & Doc 解析 | **P0** | 健壮解析 YAML 头部（name, description, parameters, icon）与 Markdown 结构 |
| **侧边栏交互** | Tab 注册与图标 Badge | **P0** | 注册 `dsh-skills:manager`，实时在 Tab 栏显示技能总数徽标 |
| | 分类筛选与实时检索 | **P0** | 按来源 Agent（全部 / Antigravity / Claude / Codex / Cursor）及名称实时模糊检索 |
| | 技能详情面板 | **P0** | 抽屉式/内联卡片展示完整说明、Prompt 模板与触发指南 |
| | 编辑器联动 | **P0** | 一键调用 better-sidebar 编辑器打开物理文件 |
| **技能创作** | 技能模版新建向导 | **P1** | 弹出 Modal 输入技能名、描述，自动脚手架生成标准 `SKILL.md` |
| | 技能启用/禁用切换 | **P1** | 支持添加 `.disabled` 后缀一键启停特定技能 |
| | 快速引用/插入 Prompt | **P1** | 一键复制 Trigger prompt 或插入当前交互对话 |
| **设置与扩展**| 声明式设置项 | **P1** | 接入 `pluginToggles`，允许用户自定义扫描目录白名单/忽略路径 |
| **高级能力** | 云端市场拉取 | *OOS* | 不在 Phase 1 范围，后续迭代支持 |

---

## 4. 界面原型与交互设计 (UI Wireframes)

### 4.1 侧边栏技能主界面（VSCode 风格紧凑卡片）
```text
+----------------------------------------------------------------+
|  🧩 技能管理 (Agent Skills)                         [+ 新建]  [↻] |
+----------------------------------------------------------------+
|  🔍 搜索技能名称、描述或标签...                                    |
|  [全部(12)] [Antigravity(5)] [Claude(3)] [Codex(2)] [Cursor(2)]|
+----------------------------------------------------------------+
| ▼ Antigravity Skills (5)                                       |
|  ┌──────────────────────────────────────────────────────────┐  |
|  | ⚡ agy-customizations                     [Workspace] ⚙️ |  |
|  | 自定义系统指南与扩展规范，用于引导创建技能与规则              |  |
|  | 🏷️ system · config                        [查看] [编辑]  |  |
|  └──────────────────────────────────────────────────────────┘  |
|  ┌──────────────────────────────────────────────────────────┐  |
|  | 🔍 case-radar                             [Global] ⚙️    |  |
|  | 案例雷达：扫描生态寻找真实案例并输出 HTML 报告                  |  |
|  | 🏷️ research · html                       [查看] [编辑]  |  |
|  └──────────────────────────────────────────────────────────┘  |
| ▼ Claude Code / Codex / Rules (7)                              |
|  ┌──────────────────────────────────────────────────────────┐  |
|  | 📜 CLAUDE.md                              [Claude Code]   |  |
|  | 项目全局工程指导规则与开发规范                                |  |
|  └──────────────────────────────────────────────────────────┘  |
+----------------------------------------------------------------+
```

### 4.2 视觉与设计语言规范
- **主题适配**：使用 CSS 变量（`var(--bg-*)`, `var(--text-*)`, `var(--border-*)`）严格对齐 DSH 及 `better-sidebar` 的毛玻璃黑白灰质感。
- **微交互**：卡片悬停轻微浮起、Tag 颜色按 Agent 品牌特征区分（Antigravity 蓝紫、Claude 橙黄、Codex 翠绿、Cursor 纯黑白）。
- **零干扰**：未加载技能时显示优雅空状态插画与一键初始化推荐。

---

## 5. EARS 格式验收标准 (Acceptance Criteria)

- **AC-01 (自动发现)**：
  *WHEN* 用户在 DSH 中打开任意工作区并切换到技能侧边栏，
  *THE SYSTEM SHALL* 在 300ms 内异步扫描并解析工作区及全局 Agent 技能目录，准确呈现在卡片列表中。
- **AC-02 (健壮解析)**：
  *IF* 某个 `SKILL.md` 的 YAML Frontmatter 格式有残缺或缺失，
  *THE SYSTEM SHALL* 优雅降级提取首行标题或文件路径作为 fallback，严禁界面崩溃或白屏。
- **AC-03 (实时联动)**：
  *WHEN* 用户在技能卡片上点击【编辑】按钮，
  *THE SYSTEM SHALL* 触发 better-sidebar 的 `openFile` 机制，在内置编辑器 Tab 中准确定位并高亮该文件。
- **AC-04 (角标与通知)**：
  *WHEN* 侧边栏 Tab 栏渲染时，
  *THE SYSTEM SHALL* 通过 `badge` 钩子动态显示当前已就绪的技能有效总数。
- **AC-05 (跨平台兼容)**：
  *THE SYSTEM SHALL* 在 Windows (PowerShell/CMD)、macOS、Linux 下的路径分隔符与全局主目录（`~` / `%USERPROFILE%`）中均保持无缝解析与零报错。

---

## 6. 技术风险与规避策略

1. **跨平台路径扫描开销**：
   *风险*：全局目录或复杂大型 node_modules 深度遍历导致卡顿。
   *规避*：限制遍历深度（Depth ≤ 3），设置严格的扫描白名单与 glob 过滤器，前端使用内存缓存防抖。
2. **Better-Sidebar 纯浏览器沙箱契约**：
   *风险*：根据 better-sidebar 规范，client bundle 严禁包含 Node 原生模块依赖。
   *规避*：将文件与目录扫描逻辑封装为 Host 半后端路由（`/sidebar/api/skills.*` 或通过 `/sidebar/api/fs.read` / `fs.tree`），Client 端保持纯 React 状态流与零 Node 运行时依赖。

---

## 7. 阶段门禁检查清单 (Exit Gate Checklist)

- [x] 需求四问与痛点闭环明确
- [x] 用户故事与核心交互路径完整
- [x] P0/P1 功能边界与 EARS 验收准则量化
- [x] 遵守 better-sidebar 插件生态设计契约
- [ ] **用户显式确认本 PRD（门禁通过后推进 Phase 2：架构与契约设计）**
