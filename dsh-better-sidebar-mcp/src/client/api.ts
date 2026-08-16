/**
 * @module dsh-better-sidebar-mcp/client/api
 * @description 前端与 MCP 后端 RPC 路由通信客户端
 */

import type {
  McpDeleteServerRequest,
  McpDeleteServerResponse,
  McpHealthcheckRequest,
  McpHealthcheckResponse,
  McpImportConfigRequest,
  McpImportConfigResponse,
  McpListRequest,
  McpListResponse,
  McpMarketplacePreset,
  McpSaveServerRequest,
  McpSaveServerResponse,
  McpTestToolRequest,
  McpTestToolResponse,
  McpToggleServerRequest,
  McpToggleServerResponse,
} from '../types.ts'

async function postJson<TReq, TRes>(url: string, body: TReq): Promise<TRes> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<TRes>
}

export const mcpApi = {
  async listServers(sessionId?: string, cwd?: string, includeGlobal: boolean = true): Promise<McpListResponse> {
    return postJson<McpListRequest, McpListResponse>('/mcp-manager/api/list', { sessionId, cwd, includeGlobal })
  },

  async healthcheck(server: any, cwd?: string): Promise<McpHealthcheckResponse> {
    return postJson<McpHealthcheckRequest, McpHealthcheckResponse>('/mcp-manager/api/healthcheck', { server, cwd })
  },

  async testTool(server: any, toolName: string, args: Record<string, unknown> = {}, cwd?: string): Promise<McpTestToolResponse> {
    return postJson<McpTestToolRequest, McpTestToolResponse>('/mcp-manager/api/test-tool', { server, toolName, arguments: args, cwd })
  },

  async saveServer(server: any, targetSource?: any, cwd?: string): Promise<McpSaveServerResponse> {
    return postJson<McpSaveServerRequest, McpSaveServerResponse>('/mcp-manager/api/save-server', { server, targetSource, cwd })
  },

  async deleteServer(serverId: string, configPath: string, cwd?: string): Promise<McpDeleteServerResponse> {
    return postJson<McpDeleteServerRequest, McpDeleteServerResponse>('/mcp-manager/api/delete-server', { serverId, configPath, cwd })
  },

  async toggleServer(serverId: string, configPath: string, enabled: boolean, cwd?: string): Promise<McpToggleServerResponse> {
    return postJson<McpToggleServerRequest, McpToggleServerResponse>('/mcp-manager/api/toggle-server', { serverId, configPath, enabled, cwd })
  },

  async importConfig(rawJson: string, targetSource?: any, cwd?: string): Promise<McpImportConfigResponse> {
    return postJson<McpImportConfigRequest, McpImportConfigResponse>('/mcp-manager/api/import-config', { rawJson, targetSource, cwd })
  },

  async getMarketplace(): Promise<{ ok: boolean; presets: McpMarketplacePreset[] }> {
    return postJson<Record<string, never>, { ok: boolean; presets: McpMarketplacePreset[] }>('/mcp-manager/api/marketplace', {})
  },
}
