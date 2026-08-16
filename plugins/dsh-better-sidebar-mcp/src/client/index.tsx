/**
 * @module dsh-better-sidebar-mcp/client
 * @description MCP 管理中心前端入口与 BetterSidebar Tab 注册
 */

import { createElement } from 'react'
import type {} from 'dsh-better-sidebar'
import type { Context } from 'cordis'
import { McpView } from './components/McpView.tsx'
import { IconMcpPlugin } from './components/Icons.tsx'

export const inject = ['betterSidebar']

export function apply(ctx: Context): void {
  if (!ctx.betterSidebar) return

  // 在 betterSidebar 中注册 MCP 服务管理 Tab
  ctx.effect(() =>
    ctx.betterSidebar.registerTab({
      id: 'dsh-mcp:manager',
      title: () => 'MCP 管理',
      icon: (size) => createElement(IconMcpPlugin, { size: typeof size === 'number' ? size : 16 }),
      order: 46,
      single: true,
      settings: {
        pluginToggles: [
          {
            key: 'includeGlobal',
            title: () => '扫描全局 MCP 配置',
            desc: () => '包含 Claude Desktop、Cursor、Antigravity/Gemini 及 ~/.dsh 中的 MCP 服务',
            type: 'switch',
          },
        ],
      },
      component: ({ scope, visible }) =>
        createElement(McpView, {
          sessionId: scope.sessionId,
          cwd: scope.cwd,
          visible,
        }),
    })
  )
}
