# dsh-better-sidebar-mcp

> Model Context Protocol (MCP) Multi-Source Server Manager & Interactive Tool Sandbox for DeepSeek Harness

## ✨ 核心特性

- 🔍 **多源自动探测**：聚合扫描当前工作区 (`./mcp.json`, `.vscode/mcp.json`, `.cursor/mcp.json`, `.agents/mcp_config.json`) 与全局环境（Claude Desktop, Cursor, Antigravity, Global DSH）。
- 🎨 **DSH 原生 UI**：纯矢量 SVG 统一图标规范，完美适配主题自适应色彩与暗色模式。
- ⚡ **在线调试沙箱**：单工具入参 Schema 可视化解析、参数模板一键重置、真实 RPC 握手执行与毫秒级延迟测速。
- 📦 **快捷预设中心**：内置 GitHub、SQLite、Brave Search、Fetch、Puppeteer、PostgreSQL、Memory 等热门预设，一键填入配置。
- 📥 **批量 JSON 导入**：支持直接粘贴任意 `mcpServers` 代码块快速合并入库。
- 🛡️ **安全状态切换**：可视化开关启用/禁用，无损更新。

## 🚀 安装与加载

```bash
cd ~/.dsh && dsh plugin --profile web add dsh-better-sidebar-mcp
```
