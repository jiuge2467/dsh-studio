/**
 * @module dsh-better-sidebar-mcp
 * @description MCP 管理中心后端 Cordis 服务与 HTTP 路由注册
 */

import { isAbsolute } from 'node:path'
import type { Context } from 'cordis'
import { scanAllMcpServers } from './scanner/scanner.ts'
import {
  deleteServerConfig,
  importJsonBlock,
  saveServerConfig,
  toggleServerConfig,
} from './scanner/config-store.ts'
import { executeMcpTool, healthcheckServer } from './scanner/tester.ts'
import { MCP_PRESETS } from './scanner/marketplace.ts'
import type {
  McpDeleteServerRequest,
  McpHealthcheckRequest,
  McpImportConfigRequest,
  McpListRequest,
  McpSaveServerRequest,
  McpTestToolRequest,
  McpToggleServerRequest,
} from './types.ts'

export const name = 'dsh-better-sidebar-mcp'
export const inject = ['webServer', 'sessions']

interface HttpRequest {
  url?: string
  method?: string
  headers: Record<string, string | string[] | undefined>
  [Symbol.asyncIterator](): AsyncIterator<string | Uint8Array>
}

interface HttpResponse {
  statusCode: number
  writeHead(status: number, headers?: Record<string, string>): void
  end(body?: string | Uint8Array): void
}

async function readJson<T>(req: HttpRequest): Promise<T> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk))
  }
  const body = Buffer.concat(chunks).toString('utf8')
  return JSON.parse(body || '{}') as T
}

function writeJson(res: HttpResponse, status: number, data: unknown): void {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
  })
  res.end(JSON.stringify(data))
}

function resolveCwd(ctx: any, sessionId?: string, requestedCwd?: string): string {
  if (requestedCwd && isAbsolute(requestedCwd)) return requestedCwd
  if (sessionId && ctx.sessions) {
    const session = ctx.sessions.get(sessionId)
    if (session?.header?.cwd) return session.header.cwd
  }
  return process.cwd()
}

export function apply(ctx: Context): void {
  const webServer = (ctx as any).webServer
  if (!webServer) return

  const handleRoute = async (req: HttpRequest, res: HttpResponse) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST, GET, OPTIONS',
        'access-control-allow-headers': 'content-type',
      })
      res.end()
      return
    }

    if (req.method !== 'POST') {
      writeJson(res, 405, { ok: false, error: 'Method not allowed' })
      return
    }

    const pathname = new URL(req.url ?? '/', 'http://dsh.internal').pathname
    const methodName = pathname.replace(/^\/mcp-manager\/api\/?/, '')

    try {
      // 1. 获取所有 MCP 服务与状态
      if (methodName === 'list' || methodName === 'servers.list') {
        const body = await readJson<McpListRequest>(req)
        const cwd = resolveCwd(ctx, body.sessionId, body.cwd)
        const servers = await scanAllMcpServers(cwd, body.includeGlobal ?? true)
        writeJson(res, 200, { ok: true, servers })
        return
      }

      // 2. 健康度探测与工具自省
      if (methodName === 'healthcheck' || methodName === 'servers.healthcheck') {
        const body = await readJson<McpHealthcheckRequest>(req)
        const cwd = resolveCwd(ctx, undefined, body.cwd)
        const result = await healthcheckServer(body.server, cwd)
        writeJson(res, 200, result)
        return
      }

      // 3. 在线执行/调试单工具
      if (methodName === 'test-tool' || methodName === 'tools.test') {
        const body = await readJson<McpTestToolRequest>(req)
        const cwd = resolveCwd(ctx, undefined, body.cwd)
        const result = await executeMcpTool(body.server, body.toolName, body.arguments || {}, cwd)
        writeJson(res, 200, result)
        return
      }

      // 4. 保存服务配置
      if (methodName === 'save-server' || methodName === 'servers.save') {
        const body = await readJson<McpSaveServerRequest>(req)
        const cwd = resolveCwd(ctx, undefined, body.cwd)
        const result = await saveServerConfig(cwd, body.server, body.targetSource || 'workspace')
        writeJson(res, 200, result)
        return
      }

      // 5. 删除服务配置
      if (methodName === 'delete-server' || methodName === 'servers.delete') {
        const body = await readJson<McpDeleteServerRequest>(req)
        const cwd = resolveCwd(ctx, undefined, body.cwd)
        const result = await deleteServerConfig(cwd, body.serverId, body.configPath)
        writeJson(res, 200, result)
        return
      }

      // 6. 切换服务开关
      if (methodName === 'toggle-server' || methodName === 'servers.toggle') {
        const body = await readJson<McpToggleServerRequest>(req)
        const cwd = resolveCwd(ctx, undefined, body.cwd)
        const result = await toggleServerConfig(cwd, body.serverId, body.configPath, body.enabled)
        writeJson(res, 200, result)
        return
      }

      // 7. 批量导入配置 JSON
      if (methodName === 'import-config' || methodName === 'config.import') {
        const body = await readJson<McpImportConfigRequest>(req)
        const cwd = resolveCwd(ctx, undefined, body.cwd)
        const result = await importJsonBlock(cwd, body.rawJson, body.targetSource || 'workspace')
        writeJson(res, 200, result)
        return
      }

      // 8. 预设市场列表
      if (methodName === 'marketplace' || methodName === 'presets.list') {
        writeJson(res, 200, { ok: true, presets: MCP_PRESETS })
        return
      }

      writeJson(res, 404, { ok: false, error: `Unknown method "${methodName}"` })
    } catch (error: any) {
      writeJson(res, 500, { ok: false, error: error?.message || String(error) })
    }
  }

  // 挂载前缀路由
  ctx.effect(
    () =>
      webServer.register({
        kind: 'prefix',
        path: '/mcp-manager/api',
        handler: handleRoute,
      }),
    'dsh-better-sidebar-mcp: /mcp-manager/api routes',
  )
}
