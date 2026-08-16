/**
 * @module dsh-better-sidebar-mcp/types
 * @description MCP 管理中心数据结构契约定义
 */

export type McpSource = 'workspace' | 'vscode' | 'cursor' | 'claude' | 'gemini' | 'global'

export type McpTransport = 'stdio' | 'streamable-http' | 'sse'

export type McpStatus = 'connected' | 'error' | 'disabled'

export interface McpToolParamSchema {
  type?: string
  properties?: Record<string, {
    type?: string
    description?: string
    enum?: string[]
    default?: unknown
  }>
  required?: string[]
  description?: string
}

export interface McpToolInfo {
  name: string
  rawName: string
  description?: string
  inputSchema?: McpToolParamSchema
}

export interface McpServerConfig {
  id: string
  serverName: string
  source: McpSource
  configPath: string
  enabled: boolean
  transport: McpTransport
  command?: string
  args?: string[]
  env?: Record<string, string>
  cwd?: string
  url?: string
  headers?: Record<string, string>
  status: McpStatus
  error?: string
  toolsCount: number
  tools?: McpToolInfo[]
}

export interface McpMarketplacePreset {
  id: string
  name: string
  description: string
  category: 'developer' | 'data' | 'web' | 'system'
  transport: McpTransport
  command?: string
  args?: string[]
  envTemplate?: Record<string, string>
  urlTemplate?: string
  docUrl?: string
}

/* ── API 请求与响应结构 ── */

export interface McpListRequest {
  sessionId?: string
  cwd?: string
  includeGlobal?: boolean
}

export interface McpListResponse {
  ok: boolean
  servers: McpServerConfig[]
  error?: string
}

export interface McpHealthcheckRequest {
  server: Partial<McpServerConfig>
  cwd?: string
}

export interface McpHealthcheckResponse {
  ok: boolean
  latencyMs: number
  tools: McpToolInfo[]
  error?: string
}

export interface McpTestToolRequest {
  server: Partial<McpServerConfig>
  toolName: string
  arguments?: Record<string, unknown>
  cwd?: string
}

export interface McpTestToolResponse {
  ok: boolean
  latencyMs: number
  result?: unknown
  error?: string
}

export interface McpSaveServerRequest {
  server: Partial<McpServerConfig>
  targetSource?: McpSource
  cwd?: string
}

export interface McpSaveServerResponse {
  ok: boolean
  id?: string
  error?: string
}

export interface McpDeleteServerRequest {
  serverId: string
  configPath: string
  cwd?: string
}

export interface McpDeleteServerResponse {
  ok: boolean
  error?: string
}

export interface McpToggleServerRequest {
  serverId: string
  configPath: string
  enabled: boolean
  cwd?: string
}

export interface McpToggleServerResponse {
  ok: boolean
  error?: string
}

export interface McpImportConfigRequest {
  rawJson: string
  targetSource?: McpSource
  cwd?: string
}

export interface McpImportConfigResponse {
  ok: boolean
  importedCount: number
  error?: string
}
