/**
 * @module dsh-better-sidebar-mcp/client/components/ImportConfigModal
 * @description 批量导入 Claude / Cursor / Antigravity JSON 配置弹窗
 */

import React, { useState } from 'react'
import type { McpSource } from '../../types.ts'
import { mcpApi } from '../api.ts'
import { IconClose, IconImport } from './Icons.tsx'

interface ImportConfigModalProps {
  cwd?: string
  onClose: () => void
  onImported: () => void
}

const EXAMPLE_JSON = `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "./data.db"]
    }
  }
}`

export function ImportConfigModal({ cwd, onClose, onImported }: ImportConfigModalProps) {
  const [jsonText, setJsonText] = useState('')
  const [targetSource, setTargetSource] = useState<McpSource>('workspace')
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    if (!jsonText.trim()) {
      setError('请粘贴有效的 JSON 配置代码')
      return
    }
    setImporting(true)
    setError(null)
    try {
      const res = await mcpApi.importConfig(jsonText, targetSource, cwd)
      if (res.ok) {
        onImported()
      } else {
        setError(res.error || '导入失败')
      }
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setImporting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: 'var(--dsw-alias-bg-surface, #ffffff)',
          color: 'var(--dsw-alias-label-primary, #1e293b)',
          borderRadius: 12,
          border: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.2))',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderBottom: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.15))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconImport size={15} style={{ color: '#2563eb' }} />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>批量导入 MCP JSON 配置</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--dsw-alias-label-secondary, #64748b)',
              display: 'flex',
              padding: 2,
            }}
          >
            <IconClose size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
            支持直接粘贴 Claude Desktop、Cursor、Gemini 或标准 <code>mcpServers</code> JSON 配置块，系统将自动解析并写入目标配置文件。
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: 3 }}>导入目标配置文件:</label>
            <select
              value={targetSource}
              onChange={(e) => setTargetSource(e.target.value as McpSource)}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid var(--dsw-alias-border-subtle, #cbd5e1)',
                backgroundColor: 'var(--dsw-alias-bg-subtle, #f8fafc)',
                color: 'inherit',
                fontSize: '12px',
                outline: 'none',
              }}
            >
              <option value="workspace">当前工作区 (mcp.json)</option>
              <option value="vscode">VSCode 配置 (.vscode/mcp.json)</option>
              <option value="cursor">Cursor 配置 (.cursor/mcp.json)</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
              <label style={{ fontSize: '11.5px', fontWeight: 600 }}>JSON 配置内容:</label>
              <button
                type="button"
                onClick={() => setJsonText(EXAMPLE_JSON)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                填入示例
              </button>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={8}
              placeholder={EXAMPLE_JSON}
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '11.5px',
                padding: '8px',
                borderRadius: 6,
                border: '1px solid var(--dsw-alias-border-subtle, #cbd5e1)',
                backgroundColor: 'var(--dsw-alias-bg-subtle, #f8fafc)',
                color: 'inherit',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '11.5px' }}>{error}</div>}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 8,
            padding: '10px 14px',
            borderTop: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.15))',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              border: '1px solid var(--dsw-alias-border-subtle, #cbd5e1)',
              backgroundColor: 'transparent',
              color: 'inherit',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            取消
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            style={{
              padding: '5px 14px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '12px',
              cursor: importing ? 'not-allowed' : 'pointer',
            }}
          >
            {importing ? '正在解析导入...' : '确认导入'}
          </button>
        </div>
      </div>
    </div>
  )
}
