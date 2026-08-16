export type AgentSource = 'antigravity' | 'claude' | 'codex' | 'cursor' | 'custom'

export type SkillScope = 'workspace' | 'global'

export interface SkillMetadata {
  tags?: string[]
  parameters?: Record<string, string>
  triggerPrompt?: string
  icon?: string
  author?: string
  version?: string
  modelSelection?: string
}

export interface AgentSkill {
  id: string
  name: string
  description: string
  source: AgentSource
  scope: SkillScope
  filePath: string
  fullPath: string
  dirPath: string
  disabled: boolean
  metadata: SkillMetadata
  content: string
}

export interface SkillsListRequest {
  sessionId: string
  cwd?: string
  includeGlobal?: boolean
}

export interface SkillsListResponse {
  skills: AgentSkill[]
  total: number
  stats: Record<AgentSource, number>
}

export interface SkillCreateRequest {
  sessionId: string
  cwd?: string
  name: string
  source: AgentSource
  description: string
  prompt?: string
  scope?: SkillScope
}

export interface SkillCreateResponse {
  filePath: string
  skill: AgentSkill
}

export interface SkillToggleRequest {
  sessionId: string
  cwd?: string
  skillId: string
  disabled: boolean
}

export interface SkillToggleResponse {
  skillId: string
  disabled: boolean
  newPath: string
}
