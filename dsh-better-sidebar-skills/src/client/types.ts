import type { AgentSkill, AgentSource, SkillScope } from '../types.ts'

export type { AgentSkill, AgentSource, SkillScope }

export interface SkillsViewState {
  skills: AgentSkill[]
  loading: boolean
  error: string | null
  activeCategory: 'all' | AgentSource
  activeScope: 'all' | SkillScope
  searchQuery: string
  selectedSkill: AgentSkill | null
  isCreatingNew: boolean
}
