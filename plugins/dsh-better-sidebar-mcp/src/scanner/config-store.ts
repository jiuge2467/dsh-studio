/**
 * @module dsh-better-sidebar-mcp/scanner/config-store
 * @description MCP 服务配置持久化与原子读写操作
 */

import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import type { McpServerConfig, McpSource } from '../types.ts'

interface RawMcpFile {
  mcpServers?: Record<string, any>
  [key: string]: unknown
}

async function readJsonFile(filePath: string): Promise<RawMcpFile> {
  try {
    const text = await readFile(filePath, 'utf8')
    return JSON.parse(text) as RawMcpFile
  } catch {
    return { mcpServers: {} }
  }
}

async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true })
  const tmpPath = `${filePath}.dsh-tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const jsonStr = JSON.stringify(data, null, 2) + '\n'
  try {
    await writeFile(tmpPath, jsonStr, 'utf8')
    await rename(tmpPath, filePath)
  } catch (err) {
    await rm(tmpPath, { force: true }).catch(() => {})
    throw err
  }
}

/** 获取目标配置文件路径 */
export function resolveTargetConfigPath(cwd: string, source?: McpSource): string {
  if (source === 'vscode') return join(cwd, '.vscode', 'mcp.json')
  if (source === 'cursor') return join(cwd, '.cursor', 'mcp.json')
  if (source === 'gemini') return join(cwd, '.agents', 'mcp_config.json')
  return join(cwd, 'mcp.json')
}

/**
 * 保存或更新一个 MCP 服务
 */
export async function saveServerConfig(
  cwd: string,
  server: Partial<McpServerConfig>,
  targetSource: McpSource = 'workspace',
): Promise<{ ok: boolean; id: string; error?: string }> {
  if (!server.serverName || server.serverName.trim() === '') {
    return { ok: false, id: '', error: '服务名称不能为空' }
  }

  const name = server.serverName.trim()
  const targetPath = server.configPath && server.configPath.trim() !== ''
    ? resolve(server.configPath)
    : resolveTargetConfigPath(cwd, targetSource)

  try {
    const raw = await readJsonFile(targetPath)
    if (!raw.mcpServers || typeof raw.mcpServers !== 'object') {
      raw.mcpServers = {}
    }

    const isHttp = server.transport === 'streamable-http' || server.transport === 'sse' || !!server.url
    const item: Record<string, unknown> = {}

    if (isHttp) {
      item.url = server.url?.trim()
      if (server.transport === 'sse') item.transport = 'sse'
      if (server.headers && Object.keys(server.headers).length > 0) {
        item.headers = server.headers
      }
    } else {
      item.command = server.command?.trim() || 'npx'
      if (server.args && server.args.length > 0) {
        item.args = server.args
      }
      if (server.env && Object.keys(server.env).length > 0) {
        item.env = server.env
      }
      if (server.cwd && server.cwd.trim() !== '') {
        item.cwd = server.cwd.trim()
      }
    }

    if (server.enabled === false) {
      item.disabled = true
    }

    raw.mcpServers[name] = item
    await writeJsonAtomic(targetPath, raw)

    return { ok: true, id: `${targetSource}:${name}:${targetPath}` }
  } catch (err: any) {
    return { ok: false, id: '', error: err?.message || String(err) }
  }
}

/**
 * 删除指定 MCP 服务
 */
export async function deleteServerConfig(
  cwd: string,
  serverName: string,
  configPath?: string,
): Promise<{ ok: boolean; error?: string }> {
  const targetPath = configPath && configPath.trim() !== ''
    ? resolve(configPath)
    : resolveTargetConfigPath(cwd, 'workspace')

  try {
    const raw = await readJsonFile(targetPath)
    if (raw.mcpServers && typeof raw.mcpServers === 'object') {
      if (serverName in raw.mcpServers) {
        delete raw.mcpServers[serverName]
        await writeJsonAtomic(targetPath, raw)
        return { ok: true }
      }
    }
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) }
  }
}

/**
 * 切换启用/禁用状态
 */
export async function toggleServerConfig(
  cwd: string,
  serverName: string,
  configPath: string,
  enabled: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const targetPath = configPath && configPath.trim() !== ''
    ? resolve(configPath)
    : resolveTargetConfigPath(cwd, 'workspace')

  try {
    const raw = await readJsonFile(targetPath)
    if (raw.mcpServers && typeof raw.mcpServers === 'object' && serverName in raw.mcpServers) {
      if (enabled) {
        delete raw.mcpServers[serverName].disabled
      } else {
        raw.mcpServers[serverName].disabled = true
      }
      await writeJsonAtomic(targetPath, raw)
      return { ok: true }
    }
    return { ok: false, error: `未在 ${targetPath} 中找到服务 "${serverName}"` }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) }
  }
}

/**
 * 批量导入 JSON 配置代码块
 */
export async function importJsonBlock(
  cwd: string,
  rawJson: string,
  targetSource: McpSource = 'workspace',
): Promise<{ ok: boolean; importedCount: number; error?: string }> {
  let parsed: any
  try {
    parsed = JSON.parse(rawJson)
  } catch (err: any) {
    return { ok: false, importedCount: 0, error: `JSON 格式解析失败: ${err?.message}` }
  }

  const serversDict = parsed.mcpServers ?? parsed.servers ?? parsed
  if (!serversDict || typeof serversDict !== 'object') {
    return { ok: false, importedCount: 0, error: '未能识别出有效的 mcpServers 配置字典' }
  }

  const targetPath = resolveTargetConfigPath(cwd, targetSource)
  try {
    const current = await readJsonFile(targetPath)
    if (!current.mcpServers || typeof current.mcpServers !== 'object') {
      current.mcpServers = {}
    }

    let count = 0
    for (const [name, item] of Object.entries(serversDict)) {
      if (item && typeof item === 'object') {
        current.mcpServers[name] = item
        count++
      }
    }

    await writeJsonAtomic(targetPath, current)
    return { ok: true, importedCount: count }
  } catch (err: any) {
    return { ok: false, importedCount: 0, error: err?.message || String(err) }
  }
}
