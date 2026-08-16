import React, { useState } from 'react'
import type { AgentSkill, AgentSource } from '../../types.ts'
import { styles } from '../styles.ts'
import {
  AntigravityIcon,
  CheckIcon,
  ClaudeIcon,
  CodexIcon,
  CopyIcon,
  CursorIcon,
  EditIcon,
  FileCodeIcon,
  PluginIcon,
} from './Icons.tsx'

interface SkillCardProps {
  skill: AgentSkill
  onSelect: (skill: AgentSkill) => void
  onOpenFile?: (path: string) => void
  onToggleDisabled?: (skill: AgentSkill) => void
}

function getSourceIcon(source: AgentSource) {
  switch (source) {
    case 'antigravity':
      return <AntigravityIcon size={14} />
    case 'claude':
      return <ClaudeIcon size={14} />
    case 'codex':
      return <CodexIcon size={14} />
    case 'cursor':
      return <CursorIcon size={14} />
    default:
      return <PluginIcon size={14} />
  }
}

function getSourceColor(source: AgentSource): string {
  switch (source) {
    case 'antigravity':
      return '#818cf8'
    case 'claude':
      return '#fb923c'
    case 'codex':
      return '#34d399'
    case 'cursor':
      return '#38bdf8'
    default:
      return '#a1a1aa'
  }
}

export function SkillCard({ skill, onSelect, onOpenFile, onToggleDisabled }: SkillCardProps) {
  const [copied, setCopied] = useState(false)
  const sourceColor = getSourceColor(skill.source)

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation()
    const textToCopy = skill.metadata.triggerPrompt || `/${skill.name}`
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const handleOpenFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onOpenFile) {
      onOpenFile(skill.filePath)
    }
  }

  return (
    <div
      style={{
        ...styles.card,
        opacity: skill.disabled ? 0.6 : 1,
        borderLeft: `3px solid ${sourceColor}`,
      }}
      onClick={() => onSelect(skill)}
    >
      <div style={styles.cardHeader}>
        <div style={styles.cardTitleRow}>
          <span style={{ color: sourceColor, display: 'flex', alignItems: 'center' }}>
            {getSourceIcon(skill.source)}
          </span>
          <span style={{ color: skill.disabled ? 'var(--text-muted)' : 'inherit' }}>
            {skill.name}
          </span>
          {skill.disabled && (
            <span style={{ ...styles.tagPill, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              已禁用
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={styles.tagPill}>
            {skill.scope === 'workspace' ? 'Workspace' : 'Global'}
          </span>
        </div>
      </div>

      <div style={styles.cardDesc}>
        {skill.description || '暂无详细描述'}
      </div>

      {skill.metadata.tags && skill.metadata.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
          {skill.metadata.tags.map((tag) => (
            <span key={tag} style={styles.tagPill}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div style={styles.cardActions}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {skill.filePath.split('/').pop()}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            title="复制技能调用指令"
            onClick={handleCopyPrompt}
            style={styles.iconButton}
          >
            {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
          </button>

          {onOpenFile && (
            <button
              type="button"
              title="在侧边栏编辑器中打开"
              onClick={handleOpenFile}
              style={styles.iconButton}
            >
              <FileCodeIcon size={12} />
            </button>
          )}

          <button
            type="button"
            title="查看详情"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(skill)
            }}
            style={{
              ...styles.iconButton,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-normal)',
            }}
          >
            <EditIcon size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
