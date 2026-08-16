/**
 * @module dsh-better-sidebar-mcp/client/components/McpView
 * @description MCP 侧边栏主面板视图
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { McpMarketplacePreset, McpServerConfig, McpToolInfo } from '../../types.ts'
import { mcpApi } from '../api.ts'
import { styles } from '../styles.ts'
import {
  IconChevronDown,
  IconChevronRight,
  IconImport,
  IconMcpPlugin,
  IconPlus,
  IconRefresh,
  IconSearch,
} from './Icons.tsx'
import { ServerCard } from './ServerCard.tsx'
import { AddServerModal } from './AddServerModal.tsx'
import { ImportConfigModal } from './ImportConfigModal.tsx'
import { ToolTesterModal } from './ToolTesterModal.tsx'

interface McpViewProps {
  sessionId: string
  cwd?: string
  visible?: boolean
}

export function McpView({ sessionId, cwd, visible = true }: McpViewProps) {
  const [servers, setServers] = useState<McpServerConfig[]>([])
  const [presets, setPresets] = useState<McpMarketplacePreset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const presetScrollRef = useRef<HTMLDivElement>(null)

  // Modals state
  const [isAdding, setIsAdding] = useState(false)
  const [editingServer, setEditingServer] = useState<McpServerConfig | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<McpMarketplacePreset | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [testingTool, setTestingTool] = useState<{ server: McpServerConfig; tool: McpToolInfo } | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [serversRes, presetsRes] = await Promise.all([
        mcpApi.listServers(sessionId, cwd, true),
        mcpApi.getMarketplace().catch(() => ({ ok: true, presets: [] })),
      ])
      if (serversRes.ok) {
        setServers(serversRes.servers || [])
      } else {
        setError(serversRes.error || '加载 MCP 服务列表失败')
      }
      if (presetsRes.ok) {
        setPresets(presetsRes.presets || [])
      }
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      loadData()
    }
  }, [sessionId, cwd, visible])

  const filteredServers = useMemo(() => {
    if (!searchQuery.trim()) return servers
    const q = searchQuery.toLowerCase().trim()
    return servers.filter((s) => {
      const matchName = s.serverName.toLowerCase().includes(q)
      const matchCmd = (s.command || '').toLowerCase().includes(q)
      const matchUrl = (s.url || '').toLowerCase().includes(q)
      const matchTool = (s.tools || []).some(
        (t) => t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q),
      )
      return matchName || matchCmd || matchUrl || matchTool
    })
  }, [servers, searchQuery])

  const activeCount = servers.filter((s) => s.enabled).length

  const handleToggle = async (server: McpServerConfig, enabled: boolean) => {
    try {
      await mcpApi.toggleServer(server.serverName, server.configPath, enabled, cwd)
      await loadData()
    } catch (err: any) {
      alert(`切换开关失败: ${err?.message || err}`)
    }
  }

  const handleDelete = async (server: McpServerConfig) => {
    if (!window.confirm(`确定要从配置文件中移除 MCP 服务 "${server.serverName}" 吗？`)) {
      return
    }
    try {
      await mcpApi.deleteServer(server.serverName, server.configPath, cwd)
      await loadData()
    } catch (err: any) {
      alert(`删除失败: ${err?.message || err}`)
    }
  }

  const handleSelectPreset = (preset: McpMarketplacePreset) => {
    setSelectedPreset(preset)
    setEditingServer(null)
    setIsAdding(true)
  }

  const scrollPresets = (direction: 'left' | 'right') => {
    if (presetScrollRef.current) {
      const offset = direction === 'left' ? -150 : 150
      presetScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const handlePresetWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0 && presetScrollRef.current) {
      presetScrollRef.current.scrollLeft += e.deltaY
      e.stopPropagation()
    }
  }

  return (
    <div style={styles.container}>
      {/* 顶部 Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <IconMcpPlugin size={16} style={{ color: '#2563eb' }} />
          <span>MCP 管理</span>
          <span style={styles.badge}>{servers.length}</span>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            style={styles.iconButton}
            onClick={loadData}
            title="刷新与重新扫描"
          >
            <IconRefresh size={13} className={loading ? 'spin' : ''} />
          </button>

          <button
            type="button"
            style={{ ...styles.iconButton, width: 'auto', padding: '0 6px', gap: 3, fontSize: '11px' }}
            onClick={() => setIsImporting(true)}
            title="批量导入配置 JSON"
          >
            <IconImport size={13} />
            <span>导入</span>
          </button>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => {
              setEditingServer(null)
              setSelectedPreset(null)
              setIsAdding(true)
            }}
          >
            <IconPlus size={12} />
            <span>添加</span>
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      <div style={styles.searchBar}>
        <IconSearch size={13} style={{ color: 'var(--dsw-alias-label-tertiary, #94a3b8)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索 MCP 服务名称、命令或工具..."
          style={styles.searchInput}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#94a3b8' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* 状态统计 */}
      <div style={styles.statsBar}>
        <span>
          🟢 {activeCount} 个活跃 · ⚪ {servers.length - activeCount} 个禁用
        </span>
        <span>已自动聚合多源配置</span>
      </div>

      {/* 热门预设快捷栏（支持滚轮滑动与左右按键翻滚） */}
      {presets.length > 0 && (
        <div style={styles.presetContainer}>
          <span style={{ fontSize: '10.5px', color: 'var(--dsw-alias-label-tertiary, #94a3b8)', flexShrink: 0, marginRight: 2 }}>
            热门预设:
          </span>

          <button
            type="button"
            onClick={() => scrollPresets('left')}
            style={styles.presetNavBtn}
            title="向左滚动预设"
          >
            ‹
          </button>

          <div
            ref={presetScrollRef}
            style={styles.presetScroll}
            onWheel={handlePresetWheel}
          >
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                style={styles.presetChip}
                title={`${p.name}: ${p.description}`}
              >
                <span>+ {p.name}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollPresets('right')}
            style={styles.presetNavBtn}
            title="向右滚动预设"
          >
            ›
          </button>
        </div>
      )}

      {/* 服务列表内容 */}
      <div style={styles.contentList}>
        {error && (
          <div
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#dc2626',
              fontSize: '11.5px',
            }}
          >
            {error}
          </div>
        )}

        {filteredServers.length === 0 && !loading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '36px 16px',
              color: 'var(--dsw-alias-label-tertiary, #94a3b8)',
              gap: 8,
              textAlign: 'center',
            }}
          >
            <IconMcpPlugin size={32} style={{ opacity: 0.4 }} />
            <div style={{ fontSize: '12.5px', fontWeight: 600 }}>暂未发现 MCP 服务</div>
            <div style={{ fontSize: '11.5px', maxWidth: 220, lineHeight: 1.4 }}>
              系统已自动扫描当前工作区与 Claude/Cursor/Global 配置。点击上方【添加】或【导入】开始使用。
            </div>
          </div>
        )}

        {filteredServers.map((server) => (
          <ServerCard
            key={server.id}
            server={server}
            cwd={cwd}
            onEdit={(s) => {
              setEditingServer(s)
              setSelectedPreset(null)
              setIsAdding(true)
            }}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onTestTool={(s, tool) => setTestingTool({ server: s, tool })}
          />
        ))}
      </div>

      {/* 新增/编辑弹窗 */}
      {isAdding && (
        <AddServerModal
          initialServer={editingServer}
          preset={selectedPreset}
          cwd={cwd}
          onClose={() => {
            setIsAdding(false)
            setEditingServer(null)
            setSelectedPreset(null)
          }}
          onSaved={() => {
            setIsAdding(false)
            setEditingServer(null)
            setSelectedPreset(null)
            loadData()
          }}
        />
      )}

      {/* 批量导入弹窗 */}
      {isImporting && (
        <ImportConfigModal
          cwd={cwd}
          onClose={() => setIsImporting(false)}
          onImported={() => {
            setIsImporting(false)
            loadData()
          }}
        />
      )}

      {/* 单工具在线执行沙箱调试弹窗 */}
      {testingTool && (
        <ToolTesterModal
          server={testingTool.server}
          tool={testingTool.tool}
          cwd={cwd}
          onClose={() => setTestingTool(null)}
        />
      )}
    </div>
  )
}
