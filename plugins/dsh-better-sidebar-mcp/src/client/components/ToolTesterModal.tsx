/**
 * @module dsh-better-sidebar-mcp/client/components/ToolTesterModal
 * @description MCP 单工具在线执行与 JSON 参数调试沙箱弹窗
 */

import React, { useState } from 'react'
import type { McpServerConfig, McpToolInfo } from '../../types.ts'
import { mcpApi } from '../api.ts'
import { IconClose, IconZap } from './Icons.tsx'

interface ToolTesterModalProps {
  server: McpServerConfig
  tool: McpToolInfo
  cwd?: string
  onClose: () => void
}

export function ToolTesterModal({ server, tool, cwd, onClose }: ToolTesterModalProps) {
  // 生成默认测试参数模板
  const defaultParams: Record<string, unknown> = {}
  if (tool.inputSchema?.properties) {
    for (const [key, val] of Object.entries(tool.inputSchema.properties)) {
      if (val.default !== undefined) {
        defaultParams[key] = val.default
      } else if (val.type === 'string') {
        defaultParams[key] = ''
      } else if (val.type === 'number' || val.type === 'integer') {
        defaultParams[key] = 0
      } else if (val.type === 'boolean') {
        defaultParams[key] = false
      } else if (val.type === 'array') {
        defaultParams[key] = []
      } else {
        defaultParams[key] = null
      }
    }
  }

  const [argsJson, setArgsJson] = useState(() => JSON.stringify(defaultParams, null, 2))
  const [running, setRunning] = useState(false)
  const [resultData, setResultData] = useState<any>(null)
  const [latency, setLatency] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleRun = async () => {
    let parsedArgs: Record<string, unknown> = {}
    if (argsJson.trim()) {
      try {
        parsedArgs = JSON.parse(argsJson)
      } catch (err: any) {
        setErrorMsg(`JSON 语法解析错误: ${err?.message}`)
        return
      }
    }

    setRunning(true)
    setErrorMsg(null)
    setResultData(null)
    setLatency(null)

    try {
      const res = await mcpApi.testTool(server, tool.rawName || tool.name, parsedArgs, cwd)
      setLatency(res.latencyMs)
      if (res.ok) {
        setResultData(res.result)
      } else {
        setErrorMsg(res.error || '执行失败')
      }
    } catch (err: any) {
      setErrorMsg(err?.message || String(err))
    } finally {
      setRunning(false)
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
          maxWidth: '520px',
          maxHeight: '85vh',
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
            <IconZap size={15} style={{ color: '#f59e0b' }} />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>调试工具: {tool.name}</span>
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tool.description && (
            <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
              {tool.description}
            </div>
          )}

          {/* 参数输入 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ fontSize: '11.5px', fontWeight: 600 }}>输入参数 (JSON):</label>
              <button
                type="button"
                onClick={() => setArgsJson(JSON.stringify(defaultParams, null, 2))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                重置默认参数
              </button>
            </div>
            <textarea
              value={argsJson}
              onChange={(e) => setArgsJson(e.target.value)}
              rows={6}
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '12px',
                padding: '8px',
                borderRadius: 6,
                border: '1px solid var(--dsw-alias-border-subtle, #cbd5e1)',
                backgroundColor: 'var(--dsw-alias-bg-subtle, #f8fafc)',
                color: 'inherit',
                outline: 'none',
                resize: 'vertical',
              }}
              placeholder="{}"
            />
          </div>

          {/* 执行按钮 */}
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 0',
              borderRadius: 6,
              border: 'none',
              backgroundColor: running ? '#93c5fd' : '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '13px',
              cursor: running ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <IconZap size={13} />
            <span>{running ? '正在调用 MCP 服务...' : '⚡ 运行调试 (Execute RPC)'}</span>
          </button>

          {/* 响应输出控制台 */}
          {(resultData !== null || errorMsg !== null) && (
            <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px' }}>
                <span style={{ fontWeight: 600 }}>调用结果:</span>
                {latency !== null && (
                  <span style={{ color: '#10b981', fontFamily: 'monospace' }}>耗时: {latency}ms</span>
                )}
              </div>

              {errorMsg ? (
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: '11.5px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {errorMsg}
                </div>
              ) : (
                <pre
                  style={{
                    margin: 0,
                    padding: '8px 10px',
                    borderRadius: 6,
                    backgroundColor: 'var(--dsw-alias-bg-subtle, #f8fafc)',
                    border: '1px solid var(--dsw-alias-border-subtle, #cbd5e1)',
                    fontSize: '11.5px',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(resultData, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
