# PRD & 架构设计方案：MCP (Model Context Protocol) 可视化管理中心

> **文档版本**：v1.0.0 (Phase 1 PRD & Phase 2 ARCH)
> **适用模块**：`dsh-better-sidebar-mcp` (DeepSeek Harness 侧边栏与设置集成插件)
> **核心目标**：提供开箱即用、全自动发现、可视化调试、一键安装的现代化 MCP 管理平台。

---

## 1. Phase 1: PRD & 需求范围 (PM 视角)

### 1.1 需求四问
1. **目标用户**：使用 DeepSeek Harness 进行全栈开发、自动化工作流、工具调用的开发者与高级 Agent 用户。
2. **核心场景**：
   - **自动发现**：用户在本地（Claude Desktop、Cursor、Gemini CLI、Antigravity、VSCode、DSH）已经配置了多个 MCP 服务，打开侧边栏能一键识别并统一监控。
   - **可视化新增与编辑**：无需手动手写或查找 JSON 语法，通过表单界面（Stdio / HTTP-SSE）快速添加并校验 MCP 服务。
   - **健康检测与工具调试**：实时探测 MCP 服务连通状态，展开查看其暴露的所有 Tools、Resources 与 Prompts，并提供在线调试控制台（输入参数即时测试）。
   - **预设市场（Marketplace）**：一键安装主流热门 MCP（如 GitHub、SQLite、Brave Search、Fetch、Puppeteer 等）。
3. **解决痛点**：
   - 痛点 1：各个客户端的 MCP 配置文件分散在 `~/.claude/`、`.cursor/`、`mcp_config.json` 等多处，无法统一查看和管理。
   - 痛点 2：编写 `args`、`env` 时容易语法出错，服务崩了无法即时感知是哪个工具挂了。
   - 痛点 3：缺乏单工具测试调试手段，每次验证必须通过给大模型发消息间接调用。
4. **业界优秀参考**：
   - **Cherry Studio**（原生图形化 MCP 配置中心）
   - **MCP Server Manager / MCPSM**（全客户端配置自动导入与健康探测）
   - **Cline & Roo Code**（集中式 MCP 状态监控与开关）

---

### 1.2 功能矩阵 (P0 / P1 / Out of Scope)

| 优先级 | 功能模块 | 详细说明 | 交付形式 |
|:---|:---|:---|:---|
| **P0** | **多源自动扫描 (Auto-Discovery)** | 自动扫描当前工作区 (`.vscode/mcp.json`, `.cursor/mcp.json`, `.agents/mcp_config.json`, `mcp.json`) 与全局 (`~/.claude/claude_desktop_config.json`, `%APPDATA%\Claude\`, `~/.cursor/`, `~/.dsh/mcp.json`, Antigravity/Gemini) | 结构化列表聚合 |
| **P0** | **侧边栏 Tab 插件注册** | 在 `betterSidebar` 中注册 `dsh-mcp:manager` 专属侧边栏卡片，提供专属 MCP 矢量图标与侧边栏设置开关 | 侧边栏原生 Tab |
| **P0** | **服务状态与工具洞察** | 实时状态指示（🟢 活跃/已连通、🔴 异常/断开、⚪ 禁用），展开查看所有导出工具名、描述与参数 Schema | 列表展开折叠面板 |
| **P0** | **单键开关与配置管理** | 独立启用/禁用 MCP 服务；可视化添加/编辑/删除 Stdio（command, args, env, cwd）与 HTTP/SSE（URL, headers） | 弹窗表单 |
| **P0** | **工具在线调试沙箱 (Tool Tester)** | 在 UI 界面直接填写 JSON 参数，点击【⚡ 调试工具】即时发送 `callTool` 并展示输出与延时 | 在线运行控制台 |
| **P1** | **一键 JSON 导入导出** | 支持直接粘贴 Claude / Cursor 标准 `mcpServers` JSON 片段一键批量导入 | 快捷导入弹窗 |
| **P1** | **热门 MCP 市场预设** | 内置 GitHub、SQLite、Web Fetch、Brave Search、PostgreSQL、Memory 等官方预设模板，一键填参安装 | 预设推荐栏 |
| **Out-of-Scope** | 自建 MCP Server 容器沙箱 | 本期专注管理、连接与测试客户端，不负责在宿主机创建 Docker 容器运行 MCP | 后续迭代 |

---

### 1.3 EARS 验收标准 (Easy Approach to Requirements Syntax)
- **EARS-1 (自动扫描)**：*WHEN* 用户打开 MCP 管理侧边栏时，*THE SYSTEM SHALL* 并发扫描本地所有标准配置路径并聚合展示所有发现的 MCP 实例及来源标签（`Workspace` / `Claude` / `Cursor` / `Global`）。
- **EARS-2 (健康检测)**：*WHEN* 用户点击【🔄 刷新】或服务启动时，*THE SYSTEM SHALL* 尝试与该 MCP 建立轻量握手并获取 `tools/list`，在 < 3 秒内将状态标记为 🟢 正常或 🔴 报错（展示具体错误堆栈）。
- **EARS-3 (工具调试)**：*WHEN* 用户在某工具卡片下输入测试参数并点击【⚡ 运行】，*THE SYSTEM SHALL* 发起真实 RPC 并在界面以格式化 JSON / Markdown 呈现响应结果与耗时。
- **EARS-4 (动态保存)**：*WHEN* 用户新增、修改或切换开关时，*THE SYSTEM SHALL* 原子化写入目标配置文件并触发 DSH 运行时热加载。

---

## 2. Phase 2: 架构设计与契约锁定 (ARCH 视角)

### 2.1 系统架构与分层设计

```
┌─────────────────────────────────────────────────────────────┐
│                    DSH Web 前端 (Client)                     │
│  ┌───────────────────────┐   ┌───────────────────────────┐  │
│  │ 侧边栏 Tab: MCP 管理  │   │  设置中心: 侧边卡片开关   │  │
│  │ (McpView / ServerCard)│   │  (SettingsCard / Toggles) │  │
│  └───────────┬───────────┘   └─────────────┬─────────────┘  │
└──────────────┼─────────────────────────────┼────────────────┘
               │ HTTP / RPC                  │
┌──────────────▼─────────────────────────────▼────────────────┐
│             后端桥接与扫描引擎 (dsh-better-sidebar-mcp)      │
│  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │   多源配置扫描聚合器    │  │   MCP 客户端代理 & 调试  │  │
│  │ (Claude / Cursor / DSH) │  │   (@deepseek-ai/mcp-client)│ │
│  └────────────┬────────────┘  └────────────┬─────────────┘  │
│               │                            │                │
│  ┌────────────▼────────────────────────────▼─────────────┐  │
│  │   原子化配置读写器 (mcp.json / cordis / claude_config)│  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.2 扫描器多源探测路径矩阵 (Multi-Source Scanner)

| 探测源 (Source) | Windows 默认路径 | macOS / Linux 默认路径 | 写入策略 |
|:---|:---|:---|:---|
| **DSH Workspace** | `${cwd}/mcp.json` 或 `${cwd}/.agents/mcp_config.json` | 同左 | 优先主写源 |
| **VSCode / Cursor** | `${cwd}/.vscode/mcp.json` / `${cwd}/.cursor/mcp.json` | 同左 | 支持双向同步 |
| **Claude Desktop** | `%APPDATA%\Claude\claude_desktop_config.json` | `~/Library/Application Support/Claude/claude_desktop_config.json` | 读/写/导入 |
| **Global Agent** | `~/.gemini/antigravity-ide/mcp/` / `~/.dsh/mcp.json` | `~/.config/dsh/mcp.json` | 备用共享源 |

---

### 2.3 后端 API 接口契约 (`/mcp-manager/api/*`)

```typescript
// 1. 获取所有 MCP 服务与状态
POST /mcp-manager/api/list
Request:  { cwd?: string; sessionId?: string; includeGlobal?: boolean }
Response: {
  ok: true,
  servers: Array<{
    id: string;
    serverName: string;
    source: 'workspace' | 'claude' | 'cursor' | 'global';
    configPath: string;
    enabled: boolean;
    transport: 'stdio' | 'streamable-http' | 'sse';
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    url?: string;
    status: 'connected' | 'disconnected' | 'error' | 'disabled';
    error?: string;
    toolsCount: number;
    tools?: Array<{
      name: string;
      description?: string;
      inputSchema?: Record<string, unknown>;
    }>;
  }>;
}

// 2. 单服务连通性与工具发现 (Healthcheck & Inspect)
POST /mcp-manager/api/healthcheck
Request:  { server: McpServerConfig }
Response: {
  ok: boolean;
  latencyMs: number;
  tools: Array<McpToolDefinition>;
  error?: string;
}

// 3. 在线调试单工具 (Test Tool)
POST /mcp-manager/api/test-tool
Request:  { server: McpServerConfig; toolName: string; arguments: Record<string, unknown> }
Response: {
  ok: boolean;
  latencyMs: number;
  result: unknown;
  error?: string;
}

// 4. 保存服务配置 (新增/更新)
POST /mcp-manager/api/save-server
Request:  { server: McpServerConfig; targetSource?: 'workspace' | 'claude' | 'global' }
Response: { ok: true; id: string }

// 5. 删除服务配置
POST /mcp-manager/api/delete-server
Request:  { serverId: string; configPath: string }
Response: { ok: true }

// 6. 切换服务开关 (Enable / Disable)
POST /mcp-manager/api/toggle-server
Request:  { serverId: string; enabled: boolean }
Response: { ok: true }
```

---

### 2.4 UI 界面交互与线框图 (Sidebar Wireframe)

```
┌─────────────────────────────────────────────────────────┐
│ [🧩 MCP 管理]                          [➕ 新增] [📥 导入] │
├─────────────────────────────────────────────────────────┤
│ 🔍 搜索 MCP 服务或工具名称...                              │
│ 状态概览: 🟢 4 运行中 · ⚪ 1 已禁用 · 共 28 个可用工具      │
├─────────────────────────────────────────────────────────┤
│ ⚡ 快捷预设: [GitHub] [SQLite] [Brave] [Fetch] [Puppeteer]│
├─────────────────────────────────────────────────────────┤
│ ▼ 🟢 github-server (stdio) [Workspace]  [🔄] [✏️] [🗑️] [●]│
│   npx -y @modelcontextprotocol/server-github            │
│   ├─ 🛠️ mcp__github__create_issue      [⚡ 调试]        │
│   │   创建 GitHub Issue 议题...                           │
│   ├─ 🛠️ mcp__github__search_repositories [⚡ 调试]      │
│   └─ 🛠️ mcp__github__get_file_contents   [⚡ 调试]      │
│                                                         │
│ ▶ 🟢 playwright (stdio) [Claude Config] [🔄] [✏️] [🗑️] [●]│
│ ▶ ⚪ brave-search (http) [Global]       [🔄] [✏️] [🗑️] [○]│
└─────────────────────────────────────────────────────────┘
```

---

### 2.5 落地实施计划 (Implementation Plan)
1. **新建独立模块**：`dsh-better-sidebar-mcp`（包含前端 React 组件 + 后端多源探测路由 + 独立测试套件）。
2. **连接 DSH 原生 MCP 运行时**：复用 `@deepseek-ai/dsh-mcp-client` 的连接机制，实现真实 RPC 调试。
3. **注册至 DSH 侧边栏与设置**：在设置页面的“侧边卡片”中自动出现 `dsh-mcp:manager` 卡片，支持自由拖拽排序与开关。
