/**
 * @module dsh-better-sidebar-mcp/client/components/ServerCard
 * @description 单个 MCP 服务卡片组件（含状态展示、工具折叠树与操作工具栏）
 */

import React, { useState } from 'react'
import type { McpServerConfig, McpToolInfo } from '../../types.ts'
import { mcpApi } from '../api.ts'
import {
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconRefresh,
  IconTrash,
} from './Icons.tsx'
import { ToolItem } from './ToolItem.tsx'

interface ServerCardProps {
  server: McpServerConfig
  cwd?: string
  onEdit: (server: McpServerConfig) => void
  onDelete: (server: McpServerConfig) => void
  onToggle: (server: McpServerConfig, enabled: boolean) => void
  onTestTool: (server: McpServerConfig, tool: McpToolInfo) => void
}

export function ServerCard({
  server,
  cwd,
  onEdit,
  onDelete,
  onToggle,
  onTestTool,
}: ServerCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [probing, setProbing] = useState(false)
  const [tools, setTools] = useState<McpToolInfo[]>(server.tools || [])
  const [liveStatus, setLiveStatus] = useState(server.status)
  const [liveError, setLiveError] = useState(server.error)
  const [latency, setLatency] = useState<number | null>(null)

  const handleProbe = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setProbing(true)
    try {
      const res = await mcpApi.healthcheck(server, cwd)
      setLatency(res.latencyMs)
      if (res.ok) {
        setLiveStatus('connected')
        setLiveError(undefined)
        setTools(res.tools)
        setExpanded(true)
      } else {
        setLiveStatus('error')
        setLiveError(res.error)
      }
    } catch (err: any) {
      setLiveStatus('error')
      setLiveError(err?.message || String(err))
    } finally {
      setProbing(false)
    }
  }

  // 状态点样式
  let statusColor = '#10b981' // connected
  if (!server.enabled || liveStatus === 'disabled') statusColor = '#94a3b8'
  else if (liveStatus === 'error') statusColor = '#ef4444'

  // 来源标签样式
  const sourceLabels: Record<string, { label: string; bg: string; color: string }> = {
    workspace: { label: 'Workspace', bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' },
    vscode: { label: 'VSCode', bg: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' },
    cursor: { label: 'Cursor', bg: 'rgba(168, 85, 247, 0.12)', color: '#9333ea' },
    claude: { label: 'Claude Desktop', bg: 'rgba(249, 115, 22, 0.12)', color: '#ea580c' },
    gemini: { label: 'Antigravity', bg: 'rgba(16, 185, 129, 0.12)', color: '#059669' },
    global: { label: 'Global', bg: 'rgba(100, 116, 139, 0.12)', color: '#475569' },
  }
  const sTag = sourceLabels[server.source] || sourceLabels.workspace

  return (
    <div
      style={{
        borderRadius: 8,
        border: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.15))',
        backgroundColor: 'var(--dsw-alias-bg-layer-1, rgba(125, 125, 125, 0.04))',
        overflow: 'hidden',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
          <div style={{ color: 'var(--dsw-alias-label-secondary, #64748b)', display: 'flex', alignItems: 'center' }}>
            {expanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
          </div>

          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: statusColor,
              flexShrink: 0,
              boxShadow: server.enabled && liveStatus === 'connected' ? `0 0 6px ${statusColor}` : 'none',
            }}
          />

          <span
            style={{
              fontWeight: 600,
              fontSize: '12.5px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: server.enabled ? 'inherit' : 'var(--dsw-alias-label-tertiary, #94a3b8)',
            }}
          >
            {server.serverName}
          </span>

          <span
            style={{
              fontSize: '9.5px',
              fontFamily: 'monospace',
              padding: '1px 5px',
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              color: 'var(--dsw-alias-label-secondary, #64748b)',
            }}
          >
            {server.transport}
          </span>

          <span
            style={{
              fontSize: '9.5px',
              fontWeight: 500,
              padding: '1px 5px',
              borderRadius: 4,
              backgroundColor: sTag.bg,
              color: sTag.color,
            }}
          >
            {sTag.label}
          </span>
        </div>

        {/* Actions Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleProbe}
            disabled={probing}
            style={{
              background: 'none',
              border: 'none',
              padding: '3px 4px',
              cursor: probing ? 'not-allowed' : 'pointer',
              color: 'var(--dsw-alias-label-secondary, #64748b)',
              display: 'flex',
              borderRadius: 4,
            }}
            title="探测连通性并获取工具列表"
          >
            <IconRefresh size={12} className={probing ? 'spin' : ''} />
          </button>

          <button
            type="button"
            onClick={() => onEdit(server)}
            style={{
              background: 'none',
              border: 'none',
              padding: '3px 4px',
              cursor: 'pointer',
              color: 'var(--dsw-alias-label-secondary, #64748b)',
              display: 'flex',
              borderRadius: 4,
            }}
            title="编辑配置"
          >
            <IconEdit size={12} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(server)}
            style={{
              background: 'none',
              border: 'none',
              padding: '3px 4px',
              cursor: 'pointer',
              color: '#ef4444',
              display: 'flex',
              borderRadius: 4,
            }}
            title="删除配置"
          >
            <IconTrash size={12} />
          </button>

          {/* Switch 开关 */}
          <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', marginLeft: 4 }}>
            <input
              type="checkbox"
              checked={server.enabled}
              onChange={(e) => onToggle(server, e.target.checked)}
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: 28,
                height: 15,
                borderRadius: 15,
                backgroundColor: server.enabled ? '#2563eb' : '#cbd5e1',
                position: 'relative',
                transition: 'background 0.15s ease',
              }}
            >
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  position: 'absolute',
                  top: 2,
                  left: server.enabled ? 15 : 2,
                  transition: 'left 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Command / URL Preview */}
      <div
        style={{
          padding: '0 10px 6px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: 'var(--dsw-alias-label-tertiary, #94a3b8)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {server.transport === 'stdio'
          ? `${server.command || ''} ${(server.args || []).join(' ')}`
          : server.url}
      </div>

      {/* Error Banner */}
      {liveError && (
        <div
          style={{
            margin: '0 10px 6px',
            padding: '4px 8px',
            borderRadius: 4,
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#dc2626',
            fontSize: '11px',
            wordBreak: 'break-all',
          }}
        >
          {liveError}
        </div>
      )}

      {/* Latency badge */}
      {latency !== null && (
        <div style={{ padding: '0 10px 4px', fontSize: '10.5px', color: '#10b981', fontFamily: 'monospace' }}>
          ⚡ 响应延迟: {latency}ms
        </div>
      )}

      {/* Collapsible Tools List */}
      {expanded && (
        <div
          style={{
            padding: '6px 10px 8px',
            borderTop: '1px dashed var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.15))',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 600 }}>
            <span>已导出工具 ({tools.length})</span>
            {tools.length === 0 && (
              <button
                type="button"
                onClick={handleProbe}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '10.5px',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                点击探测自省工具
              </button>
            )}
          </div>

          {tools.length === 0 ? (
            <div style={{ fontSize: '11px', color: '#94a3b8', padding: '4px 0', textAlign: 'center' }}>
              暂未自省工具列表，可点击右上角【🔄】探测加载
            </div>
          ) : (
            tools.map((t) => (
              <ToolItem
                key={t.name}
                tool={t}
                onTest={(selectedTool) => onTestTool(server, selectedTool)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
