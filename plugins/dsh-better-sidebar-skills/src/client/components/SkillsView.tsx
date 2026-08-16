import React, { useEffect, useMemo, useState } from 'react'
import type { AgentSkill, AgentSource } from '../../types.ts'
import { skillsApi } from '../api.ts'
import { styles } from '../styles.ts'
import { FilterBar } from './FilterBar.tsx'
import { PluginIcon, PlusIcon, RefreshIcon } from './Icons.tsx'
import { NewSkillModal } from './NewSkillModal.tsx'
import { SkillCard } from './SkillCard.tsx'
import { SkillDetailModal } from './SkillDetailModal.tsx'

interface SkillsViewProps {
  sessionId: string
  cwd?: string
  visible?: boolean
  onOpenFile?: (path: string) => void
}

export function SkillsView({ sessionId, cwd, visible = true, onOpenFile }: SkillsViewProps) {
  const [skills, setSkills] = useState<AgentSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<'all' | AgentSource>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<AgentSkill | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  const loadSkills = async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await skillsApi.listSkills(sessionId, cwd, true)
      setSkills(resp.skills || [])
    } catch (err: any) {
      setError(err?.message || '无法加载技能列表')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      loadSkills()
    }
  }, [sessionId, cwd, visible])

  const stats = useMemo(() => {
    const s: Record<AgentSource, number> = {
      antigravity: 0,
      claude: 0,
      codex: 0,
      cursor: 0,
      custom: 0,
    }
    for (const skill of skills) {
      if (s[skill.source] !== undefined) s[skill.source]++
      else s.custom++
    }
    return s
  }, [skills])

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      if (activeCategory !== 'all' && skill.source !== activeCategory) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = skill.name.toLowerCase().includes(q)
        const matchDesc = (skill.description || '').toLowerCase().includes(q)
        const matchTag = (skill.metadata.tags || []).some(t => t.toLowerCase().includes(q))
        return matchName || matchDesc || matchTag
      }
      return true
    })
  }, [skills, activeCategory, searchQuery])

  const handleToggleDisabled = async (skill: AgentSkill) => {
    try {
      await skillsApi.toggleSkill({
        sessionId,
        cwd,
        skillId: skill.id,
        disabled: !skill.disabled,
      })
      await loadSkills()
    } catch (err: any) {
      alert(`启停失败: ${err?.message || err}`)
    }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <PluginIcon size={16} />
          <span>Agent 技能管理</span>
          <span style={styles.badge}>{skills.length}</span>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            title="刷新技能"
            onClick={loadSkills}
            style={styles.iconButton}
          >
            <RefreshIcon size={13} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreatingNew(true)}
            style={styles.primaryButton}
          >
            <PlusIcon size={12} />
            <span>新建</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <FilterBar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        stats={stats}
        total={skills.length}
      />

      {/* Main List */}
      <div style={styles.listContent}>
        {loading && skills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--dsw-alias-label-secondary, #6b7280)' }}>
            正在扫描 Agent 技能与规则...
          </div>
        ) : error ? (
          <div style={{ padding: '10px 12px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '12px' }}>
            {error}
          </div>
        ) : filteredSkills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--dsw-alias-label-secondary, #6b7280)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', opacity: 0.5 }}>
              <PluginIcon size={28} />
            </div>
            <div style={{ fontWeight: 500, marginBottom: '4px', color: 'var(--dsw-alias-label-primary, inherit)' }}>未找到匹配的技能</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>点击右上角【+ 新建】快速创建 Agent 技能</div>
          </div>
        ) : (
          filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onSelect={setSelectedSkill}
              onOpenFile={onOpenFile}
              onToggleDisabled={handleToggleDisabled}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {selectedSkill && (
        <SkillDetailModal
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          onOpenFile={onOpenFile}
          onToggleDisabled={handleToggleDisabled}
        />
      )}

      {isCreatingNew && (
        <NewSkillModal
          sessionId={sessionId}
          cwd={cwd}
          onClose={() => setIsCreatingNew(false)}
          onCreated={(newSkill) => {
            setSkills(prev => [newSkill, ...prev])
            setSelectedSkill(newSkill)
          }}
        />
      )}
    </div>
  )
}
