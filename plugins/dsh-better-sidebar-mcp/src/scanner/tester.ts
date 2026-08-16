/**
 * @module dsh-better-sidebar-mcp/scanner/tester
 * @description MCP 服务连通性探测 (Healthcheck) 与单工具在线执行沙箱
 */

import { spawn } from 'node:child_process'
import type { McpServerConfig, McpToolInfo } from '../types.ts'

interface JsonRpcMessage {
  jsonrpc: string
  id?: number | string
  method?: string
  params?: unknown
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

/** 运行轻量 RPC 对 stdio MCP 服务进行初始化和自省 */
async function probeStdioServer(
  command: string,
  args: string[] = [],
  env: Record<string, string> = {},
  cwd?: string,
  timeoutMs: number = 4000,
  toolCall?: { name: string; args?: Record<string, unknown> },
): Promise<{ ok: boolean; latencyMs: number; tools: McpToolInfo[]; result?: unknown; error?: string }> {
  const startTime = Date.now()

  return new Promise((resolvePromise) => {
    let resolved = false
    const tools: McpToolInfo[] = []
    let callResult: unknown = undefined
    let rawBuffer = ''

    // 合并环境变量并处理 PATH
    const mergedEnv = {
      ...process.env,
      ...env,
      NO_COLOR: '1',
      FORCE_COLOR: '0',
    }

    let child: any = null
    try {
      child = spawn(command, args, {
        cwd: cwd || process.cwd(),
        env: mergedEnv,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: process.platform === 'win32',
      })
    } catch (err: any) {
      return resolvePromise({
        ok: false,
        latencyMs: Date.now() - startTime,
        tools: [],
        error: `启动子进程失败: ${err?.message || err}`,
      })
    }

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true
        try { child.kill() } catch { /* ignore */ }
        resolvePromise({
          ok: false,
          latencyMs: Date.now() - startTime,
          tools: [],
          error: `MCP 响应超时 (>${timeoutMs}ms)`,
        })
      }
    }, timeoutMs)

    const finish = (ok: boolean, errMessage?: string) => {
      if (resolved) return
      resolved = true
      clearTimeout(timer)
      try { child.kill() } catch { /* ignore */ }
      resolvePromise({
        ok,
        latencyMs: Date.now() - startTime,
        tools,
        result: callResult,
        error: errMessage,
      })
    }

    child.on('error', (err: Error) => {
      finish(false, `进程通信异常: ${err.message}`)
    })

    child.stderr?.on('data', () => {
      // 记录部分 stderr 用于调试
    })

    child.stdout?.on('data', (chunk: Buffer) => {
      rawBuffer += chunk.toString('utf8')
      const lines = rawBuffer.split('\n')
      rawBuffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('{')) continue

        try {
          const msg = JSON.parse(trimmed) as JsonRpcMessage
          // 收到初始化响应，接着发 tools/list 或 tools/call
          if (msg.id === 1 && msg.result) {
            if (toolCall) {
              const callMsg = {
                jsonrpc: '2.0',
                id: 2,
                method: 'tools/call',
                params: {
                  name: toolCall.name,
                  arguments: toolCall.args || {},
                },
              }
              child.stdin?.write(JSON.stringify(callMsg) + '\n')
            } else {
              const listMsg = {
                jsonrpc: '2.0',
                id: 2,
                method: 'tools/list',
                params: {},
              }
              child.stdin?.write(JSON.stringify(listMsg) + '\n')
            }
          }

          // 收到 tools/list 或 tools/call 响应
          if (msg.id === 2) {
            if (msg.error) {
              finish(false, msg.error.message || `RPC Error (${msg.error.code})`)
              return
            }

            if (toolCall) {
              callResult = msg.result
              finish(true)
              return
            }

            const rawTools = (msg.result as any)?.tools
            if (Array.isArray(rawTools)) {
              for (const t of rawTools) {
                if (t && typeof t.name === 'string') {
                  tools.push({
                    name: t.name,
                    rawName: t.name,
                    description: t.description || '',
                    inputSchema: t.inputSchema || {},
                  })
                }
              }
            }
            finish(true)
            return
          }
        } catch { /* ignore non-json line */ }
      }
    })

    // 发起 initialize 握手
    const initMsg = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'dsh-mcp-manager',
          version: '0.1.0',
        },
      },
    }
    child.stdin?.write(JSON.stringify(initMsg) + '\n')
  })
}

/** 运行 HTTP / SSE 服务的健康探测 */
async function probeHttpServer(
  url: string,
  headers: Record<string, string> = {},
  timeoutMs: number = 4000,
  toolCall?: { name: string; args?: Record<string, unknown> },
): Promise<{ ok: boolean; latencyMs: number; tools: McpToolInfo[]; result?: unknown; error?: string }> {
  const startTime = Date.now()
  try {
    const payload = toolCall
      ? {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: { name: toolCall.name, arguments: toolCall.args || {} },
        }
      : {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
          params: {},
        }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        ...headers,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    })

    const latencyMs = Date.now() - startTime
    if (!res.ok) {
      return {
        ok: false,
        latencyMs,
        tools: [],
        error: `HTTP 响应状态码: ${res.status} ${res.statusText}`,
      }
    }

    const json = (await res.json()) as JsonRpcMessage
    if (json.error) {
      return {
        ok: false,
        latencyMs,
        tools: [],
        error: json.error.message || `RPC Error ${json.error.code}`,
      }
    }

    if (toolCall) {
      return { ok: true, latencyMs, tools: [], result: json.result }
    }

    const tools: McpToolInfo[] = []
    const rawTools = (json.result as any)?.tools
    if (Array.isArray(rawTools)) {
      for (const t of rawTools) {
        if (t && typeof t.name === 'string') {
          tools.push({
            name: t.name,
            rawName: t.name,
            description: t.description || '',
            inputSchema: t.inputSchema || {},
          })
        }
      }
    }

    return { ok: true, latencyMs, tools }
  } catch (err: any) {
    return {
      ok: false,
      latencyMs: Date.now() - startTime,
      tools: [],
      error: err?.message || String(err),
    }
  }
}

/** 探测单服务健康度并获取导出的工具列表 */
export async function healthcheckServer(
  server: Partial<McpServerConfig>,
  cwd?: string,
): Promise<{ ok: boolean; latencyMs: number; tools: McpToolInfo[]; error?: string }> {
  if (server.transport === 'streamable-http' || server.transport === 'sse' || !!server.url) {
    if (!server.url) return { ok: false, latencyMs: 0, tools: [], error: '缺少有效的 URL' }
    return probeHttpServer(server.url, server.headers || {})
  }

  if (!server.command) {
    return { ok: false, latencyMs: 0, tools: [], error: '缺少有效的执行命令 (command)' }
  }

  return probeStdioServer(server.command, server.args || [], server.env || {}, server.cwd || cwd)
}

/** 在线调试执行单个 MCP 工具 */
export async function executeMcpTool(
  server: Partial<McpServerConfig>,
  toolName: string,
  toolArgs: Record<string, unknown> = {},
  cwd?: string,
): Promise<{ ok: boolean; latencyMs: number; result?: unknown; error?: string }> {
  if (server.transport === 'streamable-http' || server.transport === 'sse' || !!server.url) {
    if (!server.url) return { ok: false, latencyMs: 0, error: '缺少有效的 URL' }
    return probeHttpServer(server.url, server.headers || {}, 15000, { name: toolName, args: toolArgs })
  }

  if (!server.command) {
    return { ok: false, latencyMs: 0, error: '缺少有效的执行命令 (command)' }
  }

  return probeStdioServer(server.command, server.args || [], server.env || {}, server.cwd || cwd, 15000, {
    name: toolName,
    args: toolArgs,
  })
}
