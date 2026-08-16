import React, { useState } from 'react'
import type { AgentSkill, AgentSource } from '../../types.ts'
import { skillsApi } from '../api.ts'
import { styles } from '../styles.ts'
import { CloseIcon, PlusIcon } from './Icons.tsx'

interface NewSkillModalProps {
  sessionId: string
  cwd?: string
  onClose: () => void
  onCreated: (skill: AgentSkill) => void
}

export function NewSkillModal({ sessionId, cwd, onClose, onCreated }: NewSkillModalProps) {
  const [source, setSource] = useState<AgentSource>('antigravity')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [prompt, setPrompt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('请输入技能名称')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const resp = await skillsApi.createSkill({
        sessionId,
        cwd,
        name: name.trim(),
        source,
        description: description.trim(),
        prompt: prompt.trim(),
      })
      onCreated(resp.skill)
      onClose()
    } catch (err: any) {
      setError(err?.message || '创建失败')
    } finally {
      setSubmitting(false)
    }
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: 'var(--dsw-alias-bg-surface, var(--bg-surface, #ffffff))',
          color: 'var(--dsw-alias-label-primary, inherit)',
          borderRadius: '10px',
          border: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.2))',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.15))',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: '14px' }}>新建 Agent 技能</span>
          <button type="button" onClick={onClose} style={styles.iconButton}>
            <CloseIcon size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {error && (
            <div style={{ padding: '6px 10px', borderRadius: '5px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '12px' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #6b7280)', display: 'block', marginBottom: '4px' }}>
              目标 Agent 生态
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {(['antigravity', 'claude', 'codex', 'cursor'] as AgentSource[]).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSource(src)}
                  style={{
                    padding: '6px',
                    borderRadius: '5px',
                    border: source === src ? '1px solid #3b82f6' : '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.15))',
                    backgroundColor: source === src ? 'rgba(59, 130, 246, 0.12)' : 'var(--dsw-alias-bg-subtle, rgba(125, 125, 125, 0.04))',
                    color: source === src ? '#3b82f6' : 'inherit',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontWeight: source === src ? 600 : 'normal',
                  }}
                >
                  {src}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #6b7280)', display: 'block', marginBottom: '4px' }}>
              技能名称 (小写字母与短横线)
            </label>
            <input
              type="text"
              placeholder="e.g. data-analyzer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ ...styles.searchInput, width: '100%', padding: '6px 8px', backgroundColor: 'var(--dsw-alias-bg-subtle, rgba(125, 125, 125, 0.06))', border: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.15))', borderRadius: '5px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #6b7280)', display: 'block', marginBottom: '4px' }}>
              简短描述
            </label>
            <input
              type="text"
              placeholder="说明此技能的主要功能与使用时机"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...styles.searchInput, width: '100%', padding: '6px 8px', backgroundColor: 'var(--dsw-alias-bg-subtle, rgba(125, 125, 125, 0.06))', border: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.15))', borderRadius: '5px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--dsw-alias-label-secondary, #6b7280)', display: 'block', marginBottom: '4px' }}>
              核心指令 / Prompt 说明 (可选)
            </label>
            <textarea
              placeholder="详细的指令步骤或使用说明..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              style={{ ...styles.searchInput, width: '100%', padding: '6px 8px', backgroundColor: 'var(--dsw-alias-bg-subtle, rgba(125, 125, 125, 0.06))', border: '1px solid var(--dsw-alias-border-subtle, rgba(125, 125, 125, 0.15))', borderRadius: '5px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" onClick={onClose} style={{ ...styles.iconButton, width: 'auto', padding: '5px 12px' }}>
              取消
            </button>
            <button type="submit" disabled={submitting} style={styles.primaryButton}>
              <PlusIcon size={12} />
              <span>{submitting ? '创建中...' : '立即创建'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
