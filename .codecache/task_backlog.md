# Task Backlog: MCP Manager Plugin & Sidebar Hub

## Phase 1: PRD & Scope (PM) - [DONE]
- [x] 深度调研 GitHub 与业界优秀 MCP 管理工具（Cherry Studio, Cline, Roo Code, MCPSM, McpHub）
- [x] 提炼核心场景：多源自动识别（Claude Desktop / Cursor / VSCode / Workspace）、可视化增删改查、状态监控、单工具在线测试调试
- [x] 制定功能矩阵（P0 自动扫描/多源聚合/开关切换/连通性探测/单工具在线调试，P1 市场预设/JSON导入导出）
- [x] 产出 `docs/PRD_MCP_MANAGER.md` 并获得确认

## Phase 2: Architecture & Spec (ARCH) - [DONE]
- [x] 规划多源探测器（Scanner）层级与优先序（Workspace > VSCode/Cursor > Claude > Global）
- [x] 锁定 `/mcp-manager/api/*` 接口契约（`list`, `healthcheck`, `test-tool`, `save-server`, `delete-server`, `toggle-server`, `import-config`, `marketplace`）
- [x] 规划侧边栏 Tab 插件装配方案（`betterSidebar.registerTab` 与设置页面的“侧边卡片”联动）
- [x] 规划工具调试交互沙箱（参数 Schema 动态输入 + 实时调用反馈）

## Phase 3: Coding & Implementation (DEV) - [DONE]
- [x] 创建 `dsh-better-sidebar-mcp` 插件工程与目录骨架
- [x] 实现多源扫描引擎 `src/scanner/scanner.ts`
- [x] 实现配置原子读写与管理 `src/scanner/config-store.ts`
- [x] 实现健康探测与单工具调试沙箱 `src/scanner/tester.ts`
- [x] 实现官方精选热门预设库 `src/scanner/marketplace.ts`
- [x] 实现后端 HTTP 前缀路由 `src/index.ts`
- [x] 实现纯矢量 DSH 风格 SVG 图标集 `src/client/components/Icons.tsx`
- [x] 实现 React 侧边栏界面 `McpView.tsx`, `ServerCard.tsx`, `ToolItem.tsx`, `ToolTesterModal.tsx`, `AddServerModal.tsx`, `ImportConfigModal.tsx`
- [x] 注册 BetterSidebar Tab (`id: 'dsh-mcp:manager'`)

## Phase 4: Test & Verify (QA) - [DONE]
- [x] 编写 `tests/scanner.test.ts`、`tests/config-store.test.ts`、`tests/marketplace.test.ts`
- [x] Vitest 单元测试 10/10 全绿通过
- [x] 编写 Scratch 脚本完成完整端到端流程验证（List -> Save -> Toggle -> Delete）

## Phase 5 & 6: Release & DevOps (OPS) - [DONE]
- [x] 链接插件至 DSH Web Profile (`~/.dsh/profiles/web`)
- [x] 重启服务并绑定 `0.0.0.0:3080`
- [x] 浏览器实机自动化操作验证（添加服务、探测连通性、查看工具树）
