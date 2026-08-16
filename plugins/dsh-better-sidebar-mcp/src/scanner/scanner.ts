/**
 * @module dsh-better-sidebar-mcp/scanner/scanner
 * @description 多源 MCP 配置文件自动扫描与聚合引擎
 */

import { readFile, readdir, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import type { McpServerConfig, McpSource, McpStatus, McpTransport } from '../types.ts'

interface RawMcpServerItem {
  command?: string
  args?: string[]
  env?: Record<string, string>
  cwd?: string
  url?: string
  headers?: Record<string, string>
  disabled?: boolean
  transport?: string
  serverName?: string
  name?: string
  type?: string
}

interface RawConfigFile {
  mcpServers?: Record<string, RawMcpServerItem>
  servers?: Record<string, RawMcpServerItem> | RawMcpServerItem[]
  [key: string]: unknown
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const s = await stat(filePath)
    return s.isFile()
  } catch {
    return false
  }
}

async function dirExists(dirPath: string): Promise<boolean> {
  try {
    const s = await stat(dirPath)
    return s.isDirectory()
  } catch {
    return false
  }
}

/** 探测并读取单个 JSON 配置文件 */
async function parseConfigFile(filePath: string): Promise<RawConfigFile | null> {
  try {
    const text = await readFile(filePath, 'utf8')
    return JSON.parse(text) as RawConfigFile
  } catch {
    return null
  }
}

/** 将原始配置结构转换为规范的 McpServerConfig 列表 */
function normalizeServers(
  raw: RawConfigFile,
  configPath: string,
  source: McpSource,
): McpServerConfig[] {
  const result: McpServerConfig[] = []

  // 1. 标准 mcpServers 字典形式 (Claude / Cursor / DSH 标准)
  const dict = raw.mcpServers ?? (typeof raw.servers === 'object' && !Array.isArray(raw.servers) ? raw.servers : undefined)
  if (dict && typeof dict === 'object') {
    for (const [key, item] of Object.entries(dict)) {
      if (!item || typeof item !== 'object') continue

      const isHttp = !!item.url || item.transport === 'streamable-http' || item.transport === 'sse'
      const transport: McpTransport = isHttp ? (item.transport === 'sse' ? 'sse' : 'streamable-http') : 'stdio'
      const enabled = item.disabled !== true
      const status: McpStatus = enabled ? 'connected' : 'disabled'

      result.push({
        id: `${source}:${key}:${configPath}`,
        serverName: key,
        source,
        configPath,
        enabled,
        transport,
        command: item.command,
        args: Array.isArray(item.args) ? item.args : undefined,
        env: item.env && typeof item.env === 'object' ? item.env : undefined,
        cwd: item.cwd,
        url: item.url,
        headers: item.headers && typeof item.headers === 'object' ? item.headers : undefined,
        status,
        toolsCount: 0,
      })
    }
  }

  // 2. 数组形式 (部分扩展使用)
  if (Array.isArray(raw.servers)) {
    for (const item of raw.servers) {
      if (!item || typeof item !== 'object') continue
      const name = item.serverName || item.name || 'unnamed'
      const isHttp = !!item.url || item.transport === 'streamable-http' || item.transport === 'sse'
      const transport: McpTransport = isHttp ? (item.transport === 'sse' ? 'sse' : 'streamable-http') : 'stdio'
      const enabled = item.disabled !== true
      const status: McpStatus = enabled ? 'connected' : 'disabled'

      result.push({
        id: `${source}:${name}:${configPath}`,
        serverName: name,
        source,
        configPath,
        enabled,
        transport,
        command: item.command,
        args: Array.isArray(item.args) ? item.args : undefined,
        env: item.env && typeof item.env === 'object' ? item.env : undefined,
        cwd: item.cwd,
        url: item.url,
        headers: item.headers && typeof item.headers === 'object' ? item.headers : undefined,
        status,
        toolsCount: 0,
      })
    }
  }

  return result
}

/** 扫描 Antigravity/Gemini 自定义目录中的 MCP 配置 */
async function scanAntigravityMcpDir(dirPath: string): Promise<McpServerConfig[]> {
  const result: McpServerConfig[] = []
  if (!(await dirExists(dirPath))) return result

  try {
    const entries = await readdir(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subConfigPath = join(dirPath, entry.name, 'config.json')
        if (await fileExists(subConfigPath)) {
          const raw = await parseConfigFile(subConfigPath)
          if (raw) {
            result.push(...normalizeServers(raw, subConfigPath, 'gemini'))
          }
        }
      }
    }
  } catch { /* ignore */ }

  return result
}

/**
 * 主扫描函数：扫描工作区与全局各客户端 MCP 配置文件
 * @param cwd 当前工作区绝对路径
 * @param includeGlobal 是否包含全局 Claude / Cursor / Gemini 路径
 */
export async function scanAllMcpServers(
  cwd: string = process.cwd(),
  includeGlobal: boolean = true,
): Promise<McpServerConfig[]> {
  const allServers: McpServerConfig[] = []
  const visitedPaths = new Set<string>()

  // 1. 扫描当前工作区文件
  const workspaceCandidates: Array<{ path: string; source: McpSource }> = [
    { path: join(cwd, 'mcp.json'), source: 'workspace' },
    { path: join(cwd, '.vscode', 'mcp.json'), source: 'vscode' },
    { path: join(cwd, '.cursor', 'mcp.json'), source: 'cursor' },
    { path: join(cwd, '.agents', 'mcp_config.json'), source: 'gemini' },
    { path: join(cwd, '.dsh', 'mcp.json'), source: 'workspace' },
  ]

  for (const item of workspaceCandidates) {
    const abs = resolve(item.path)
    if (visitedPaths.has(abs)) continue
    visitedPaths.add(abs)

    if (await fileExists(abs)) {
      const raw = await parseConfigFile(abs)
      if (raw) {
        allServers.push(...normalizeServers(raw, abs, item.source))
      }
    }
  }

  // 2. 扫描全局路径
  if (includeGlobal) {
    const home = homedir()
    const isWin = process.platform === 'win32'
    const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming')
    const localAppData = process.env.LOCALAPPDATA || join(home, 'AppData', 'Local')

    const globalCandidates: Array<{ path: string; source: McpSource }> = [
      // Claude Desktop
      {
        path: isWin
          ? join(appData, 'Claude', 'claude_desktop_config.json')
          : join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
        source: 'claude',
      },
      {
        path: isWin
          ? join(localAppData, 'Claude', 'claude_desktop_config.json')
          : join(home, '.config', 'Claude', 'claude_desktop_config.json'),
        source: 'claude',
      },
      // Global Claude CLI / Claude Code
      { path: join(home, '.claude.json'), source: 'claude' },
      { path: join(home, '.claude', 'claude_desktop_config.json'), source: 'claude' },
      // Global Cursor
      { path: join(home, '.cursor', 'mcp.json'), source: 'cursor' },
      // Global DSH
      { path: join(home, '.dsh', 'mcp.json'), source: 'global' },
      // Gemini / Antigravity CLI
      { path: join(home, '.gemini', 'config', 'mcp_config.json'), source: 'gemini' },
      { path: join(home, '.gemini', 'antigravity-ide', 'mcp_config.json'), source: 'gemini' },
    ]

    for (const item of globalCandidates) {
      const abs = resolve(item.path)
      if (visitedPaths.has(abs)) continue
      visitedPaths.add(abs)

      if (await fileExists(abs)) {
        const raw = await parseConfigFile(abs)
        if (raw) {
          allServers.push(...normalizeServers(raw, abs, item.source))
        }
      }
    }

    // Antigravity MCP Directory (`~/.gemini/antigravity-ide/mcp/`)
    const antigravityDir = join(home, '.gemini', 'antigravity-ide', 'mcp')
    const antigravityServers = await scanAntigravityMcpDir(antigravityDir)
    allServers.push(...antigravityServers)
  }

  // 3. 去重与排序：同名服务优先保留 Workspace 覆盖版本
  const uniqueMap = new Map<string, McpServerConfig>()
  for (const s of allServers) {
    const key = s.serverName.toLowerCase()
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, s)
    } else {
      const existing = uniqueMap.get(key)!
      // Workspace 优先覆盖全局
      if (existing.source !== 'workspace' && s.source === 'workspace') {
        uniqueMap.set(key, s)
      }
    }
  }

  return Array.from(uniqueMap.values()).sort((a, b) => {
    // Enabled 优先置顶
    if (a.enabled && !b.enabled) return -1
    if (!a.enabled && b.enabled) return 1
    return a.serverName.localeCompare(b.serverName)
  })
}
