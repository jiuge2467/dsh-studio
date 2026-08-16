/**
 * @module dsh-better-sidebar-mcp/client/components/ToolItem
 * @description 单个 MCP 工具展示项与调试触发器
 */

import React from 'react'
import type { McpToolInfo } from '../../types.ts'
import { IconZap } from './Icons.tsx'

interface ToolItemProps {
  tool: McpToolInfo
  onTest: (tool: McpToolInfo) => void
}

export function ToolItem({ tool, onTest }: ToolItemProps) {
  const paramKeys = Object.keys(tool.inputSchema?.properties || {})
  const requiredKeys = tool.inputSchema?.required || []

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        padding: '7px 9px',
        borderRadius: 6,
        backgroundColor: 'var(--dsw-alias-bg-subtle, rgba(125, 125, 125, 0.04))',
        border: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.1))',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '11.5px', color: '#2563eb' }}>
            {tool.name}
          </span>
          {paramKeys.length > 0 && (
            <span style={{ fontSize: '10px', color: '#64748b', background: 'rgba(0,0,0,0.04)', padding: '0 4px', borderRadius: 4 }}>
              {paramKeys.length} 个参数
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onTest(tool)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            padding: '2px 7px',
            borderRadius: 4,
            border: 'none',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            color: '#2563eb',
            fontSize: '11px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
          title="在线调试该工具"
        >
          <IconZap size={11} />
          <span>调试</span>
        </button>
      </div>

      {tool.description && (
        <div style={{ fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #64748b)', lineHeight: 1.35 }}>
          {tool.description}
        </div>
      )}

      {paramKeys.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
          {paramKeys.map((p) => {
            const isReq = requiredKeys.includes(p)
            return (
              <span
                key={p}
                style={{
                  fontSize: '9.5px',
                  fontFamily: 'monospace',
                  padding: '1px 4px',
                  borderRadius: 3,
                  backgroundColor: isReq ? 'rgba(239, 68, 68, 0.08)' : 'rgba(100, 116, 139, 0.08)',
                  color: isReq ? '#ef4444' : '#64748b',
                  border: `1px solid ${isReq ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.15)'}`,
                }}
              >
                {p}{isReq ? '*' : ''}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
