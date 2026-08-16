import React, { useState } from 'react'
import type { AgentSkill } from '../../types.ts'
import { styles } from '../styles.ts'
import { CheckIcon, CloseIcon, CopyIcon, FileCodeIcon } from './Icons.tsx'

interface SkillDetailModalProps {
  skill: AgentSkill
  onClose: () => void
  onOpenFile?: (path: string) => void
  onToggleDisabled?: (skill: AgentSkill) => void
}

export function SkillDetailModal({
  skill,
  onClose,
  onOpenFile,
  onToggleDisabled,
}: SkillDetailModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(skill.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={onClose}
    >
      <div
        style={{
          marginTop: 'auto',
          maxHeight: '85%',
          backgroundColor: 'var(--dsw-alias-bg-surface, var(--bg-surface, #ffffff))',
          color: 'var(--dsw-alias-label-primary, inherit)',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          border: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.2))',
          boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.15)',
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
            padding: '12px 16px',
            borderBottom: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.15))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>{skill.name}</span>
            <span style={styles.tagPill}>{skill.source.toUpperCase()}</span>
            <span style={styles.tagPill}>{skill.scope}</span>
          </div>
          <button type="button" onClick={onClose} style={styles.iconButton}>
            <CloseIcon size={14} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #6b7280)', marginBottom: '4px' }}>描述</div>
            <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{skill.description || '无'}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #6b7280)', marginBottom: '4px' }}>文件路径</div>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#3b82f6', wordBreak: 'break-all' }}>
              {skill.filePath}
            </div>
          </div>

          {skill.metadata.parameters && Object.keys(skill.metadata.parameters).length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #6b7280)', marginBottom: '4px' }}>参数定义 (Parameters)</div>
              <div style={{ backgroundColor: 'var(--dsw-alias-bg-subtle, rgba(125, 125, 125, 0.06))', borderRadius: '6px', padding: '8px', border: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.1))' }}>
                {Object.entries(skill.metadata.parameters).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                    <code style={{ color: '#ea580c' }}>{k}:</code>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #6b7280)' }}>Markdown 文档预览</span>
              <button
                type="button"
                onClick={handleCopy}
                style={{ ...styles.iconButton, width: 'auto', padding: '2px 8px', gap: '4px', fontSize: '11px' }}
              >
                {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                <span>{copied ? '已复制' : '复制全文'}</span>
              </button>
            </div>
            <pre
              style={{
                backgroundColor: 'var(--dsw-alias-bg-subtle, rgba(125, 125, 125, 0.05))',
                color: 'inherit',
                border: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.12))',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: 'monospace',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
                lineHeight: 1.4,
              }}
            >
              {skill.content}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.15))',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            backgroundColor: 'var(--dsw-alias-bg-subtle, rgba(125, 125, 125, 0.03))',
          }}
        >
          {onToggleDisabled && (
            <button
              type="button"
              onClick={() => {
                onToggleDisabled(skill)
                onClose()
              }}
              style={{
                ...styles.primaryButton,
                backgroundColor: skill.disabled ? '#22c55e' : '#ef4444',
              }}
            >
              {skill.disabled ? '启用此技能' : '禁用此技能'}
            </button>
          )}

          {onOpenFile && (
            <button
              type="button"
              onClick={() => {
                onOpenFile(skill.filePath)
                onClose()
              }}
              style={styles.primaryButton}
            >
              <FileCodeIcon size={13} />
              <span>在编辑器中打开</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
