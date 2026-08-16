/**
 * @module dsh-better-sidebar-mcp/client/components/AddServerModal
 * @description 添加或编辑 MCP 服务配置表单弹窗
 */

import React, { useState } from 'react'
import type { McpMarketplacePreset, McpServerConfig, McpSource, McpTransport } from '../../types.ts'
import { mcpApi } from '../api.ts'
import { IconClose, IconMcpPlugin, IconRefresh } from './Icons.tsx'

interface AddServerModalProps {
  initialServer?: Partial<McpServerConfig> | null
  preset?: McpMarketplacePreset | null
  cwd?: string
  onClose: () => void
  onSaved: () => void
}

export function AddServerModal({ initialServer, preset, cwd, onClose, onSaved }: AddServerModalProps) {
  const [serverName, setServerName] = useState(initialServer?.serverName || preset?.id || '')
  const [transport, setTransport] = useState<McpTransport>(initialServer?.transport || preset?.transport || 'stdio')
  const [targetSource, setTargetSource] = useState<McpSource>(initialServer?.source || 'workspace')
  const [command, setCommand] = useState(initialServer?.command || preset?.command || 'npx')
  const [argsStr, setArgsStr] = useState(() => (initialServer?.args || preset?.args || []).join(' '))
  const [envJson, setEnvJson] = useState(() => JSON.stringify(initialServer?.env || preset?.envTemplate || {}, null, 2))
  const [url, setUrl] = useState(initialServer?.url || preset?.urlTemplate || '')
  const [headersJson, setHeadersJson] = useState(() => JSON.stringify(initialServer?.headers || {}, null, 2))

  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; toolsCount?: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buildPayload = () => {
    let envObj: Record<string, string> = {}
    try {
      if (envJson.trim()) envObj = JSON.parse(envJson)
    } catch { /* ignore */ }

    let headersObj: Record<string, string> = {}
    try {
      if (headersJson.trim()) headersObj = JSON.parse(headersJson)
    } catch { /* ignore */ }

    const argsList = argsStr.trim() ? argsStr.trim().split(/\s+/) : []

    return {
      serverName: serverName.trim(),
      transport,
      command: command.trim(),
      args: argsList,
      env: envObj,
      url: url.trim(),
      headers: headersObj,
      enabled: initialServer?.enabled !== false,
      configPath: initialServer?.configPath,
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    setError(null)
    const payload = buildPayload()
    try {
      const res = await mcpApi.healthcheck(payload, cwd)
      if (res.ok) {
        setTestResult({
          ok: true,
          message: `连接成功 (耗时: ${res.latencyMs}ms)`,
          toolsCount: res.tools.length,
        })
      } else {
        setTestResult({
          ok: false,
          message: res.error || '连通性测试失败',
        })
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err?.message || String(err),
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!serverName.trim()) {
      setError('请输入服务名称')
      return
    }
    setSaving(true)
    setError(null)
    const payload = buildPayload()
    try {
      const res = await mcpApi.saveServer(payload, targetSource, cwd)
      if (res.ok) {
        onSaved()
      } else {
        setError(res.error || '保存失败')
      }
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setSaving(false)
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
          maxWidth: '480px',
          maxHeight: '88vh',
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
            <IconMcpPlugin size={16} style={{ color: '#2563eb' }} />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>
              {initialServer?.serverName ? `编辑 MCP: ${initialServer.serverName}` : '添加新的 MCP 服务'}
            </span>
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

        {/* Form Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* 服务名称 */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: 3 }}>服务名称 (ID):</label>
            <input
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="例如: github, sqlite, brave-search"
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
            />
          </div>

          {/* 传输协议与保存源 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: 3 }}>传输协议:</label>
              <select
                value={transport}
                onChange={(e) => setTransport(e.target.value as McpTransport)}
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
                <option value="stdio">stdio (本地命令)</option>
                <option value="streamable-http">streamable-http (HTTP 网关)</option>
                <option value="sse">sse (Server-Sent Events)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: 3 }}>保存目标位置:</label>
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
          </div>

          {/* Stdio 表单 */}
          {transport === 'stdio' ? (
            <>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: 3 }}>执行命令 (Command):</label>
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="例如: npx, python, node, docker"
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
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: 3 }}>命令行参数 (Args):</label>
                <input
                  type="text"
                  value={argsStr}
                  onChange={(e) => setArgsStr(e.target.value)}
                  placeholder="例如: -y @modelcontextprotocol/server-github"
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
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: 3 }}>环境变量 (Env JSON):</label>
                <textarea
                  value={envJson}
                  onChange={(e) => setEnvJson(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: '11.5px',
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--dsw-alias-border-subtle, #cbd5e1)',
                    backgroundColor: 'var(--dsw-alias-bg-subtle, #f8fafc)',
                    color: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                  placeholder='{ "TOKEN": "..." }'
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: 3 }}>服务 URL (Endpoint):</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="例如: http://localhost:8000/sse 或 /mcp"
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
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: 3 }}>请求头 (Headers JSON):</label>
                <textarea
                  value={headersJson}
                  onChange={(e) => setHeadersJson(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: '11.5px',
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--dsw-alias-border-subtle, #cbd5e1)',
                    backgroundColor: 'var(--dsw-alias-bg-subtle, #f8fafc)',
                    color: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                  placeholder='{ "Authorization": "Bearer ..." }'
                />
              </div>
            </>
          )}

          {/* 探测反馈 */}
          {testResult && (
            <div
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                backgroundColor: testResult.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${testResult.ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: testResult.ok ? '#059669' : '#dc2626',
                fontSize: '11.5px',
              }}
            >
              {testResult.ok ? `🟢 ${testResult.message} · 发现 ${testResult.toolsCount} 个工具` : `🔴 ${testResult.message}`}
            </div>
          )}

          {error && (
            <div style={{ color: '#ef4444', fontSize: '11.5px' }}>{error}</div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderTop: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.15))',
          }}
        >
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid var(--dsw-alias-border-subtle, #cbd5e1)',
              backgroundColor: 'transparent',
              color: 'inherit',
              fontSize: '12px',
              cursor: testing ? 'not-allowed' : 'pointer',
            }}
          >
            <IconRefresh size={12} className={testing ? 'spin' : ''} />
            <span>{testing ? '测试中...' : '测试连通性'}</span>
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
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
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '5px 14px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '12px',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? '保存中...' : '保存配置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
