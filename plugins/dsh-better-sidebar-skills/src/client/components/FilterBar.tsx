import React from 'react'
import type { AgentSource } from '../../types.ts'
import { styles } from '../styles.ts'
import { AntigravityIcon, ClaudeIcon, CodexIcon, CursorIcon, PluginIcon, SearchIcon, CloseIcon } from './Icons.tsx'

interface FilterBarProps {
  activeCategory: 'all' | AgentSource
  onSelectCategory: (category: 'all' | AgentSource) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  stats: Record<AgentSource, number>
  total: number
}

export function FilterBar({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  stats,
  total,
}: FilterBarProps) {
  const categories: { id: 'all' | AgentSource; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'all', label: '全部', icon: <PluginIcon size={12} />, count: total },
    { id: 'antigravity', label: 'Antigravity', icon: <AntigravityIcon size={12} />, count: stats.antigravity || 0 },
    { id: 'claude', label: 'Claude', icon: <ClaudeIcon size={12} />, count: stats.claude || 0 },
    { id: 'codex', label: 'Codex', icon: <CodexIcon size={12} />, count: stats.codex || 0 },
    { id: 'cursor', label: 'Cursor', icon: <CursorIcon size={12} />, count: stats.cursor || 0 },
  ]

  return (
    <div>
      <div style={styles.searchBar}>
        <SearchIcon size={13} />
        <input
          type="text"
          placeholder="搜索技能名称、描述或标签..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={styles.searchInput}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            style={{ ...styles.iconButton, width: '18px', height: '18px', border: 'none' }}
          >
            <CloseIcon size={12} />
          </button>
        )}
      </div>

      <div style={styles.categoryBar}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              style={{
                ...styles.categoryChip,
                ...(isActive ? styles.categoryChipActive : {}),
              }}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span style={{ opacity: 0.7, fontSize: '10px' }}>({cat.count})</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
