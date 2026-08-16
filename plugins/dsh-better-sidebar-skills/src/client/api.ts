import type {
  AgentSkill,
  AgentSource,
  SkillCreateRequest,
  SkillCreateResponse,
  SkillsListResponse,
  SkillToggleRequest,
  SkillToggleResponse,
} from '../types.ts'
import { parseSkillMarkdown } from '../scanner/parser.ts'
import { TEMPLATES } from '../scanner/templates.ts'

interface FsEntry {
  name: string
  path: string
  isDir: boolean
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  const json = await res.json()
  if (json.ok === false) {
    throw new Error(json.error?.message || json.error || 'Request failed')
  }
  return json.value !== undefined ? json.value : json
}

/**
 * Scan workspace via better-sidebar's built-in /sidebar/api/fs.* routes.
 * 100% reliable in browser sandbox without requiring host plugins.
 */
async function scanViaSidebarFs(sessionId: string, cwd?: string): Promise<SkillsListResponse> {
  const skills: AgentSkill[] = []

  const tryListTree = async (path: string): Promise<FsEntry[]> => {
    try {
      const resp = await postJson<{ entries: FsEntry[] }>('/sidebar/api/fs.tree', {
        sessionId,
        ...(cwd ? { cwd } : {}),
        path,
      })
      return resp.entries || []
    } catch {
      return []
    }
  }

  const tryReadFile = async (path: string): Promise<string | null> => {
    try {
      const resp = await postJson<{ kind: string; content?: string }>('/sidebar/api/fs.read', {
        sessionId,
        ...(cwd ? { cwd } : {}),
        path,
      })
      return resp.content || null
    } catch {
      return null
    }
  }

  // 1. Antigravity: .agents/skills and .agents/rules
  const agySkills = await tryListTree('.agents/skills')
  for (const entry of agySkills) {
    if (entry.isDir) {
      const skillPath = `.agents/skills/${entry.name}/SKILL.md`
      const content = await tryReadFile(skillPath)
      if (content) {
        const parsed = parseSkillMarkdown(content, entry.name.replace(/\.disabled$/, ''))
        skills.push({
          id: `antigravity:workspace:${entry.name}`,
          name: parsed.name || entry.name,
          description: parsed.description || '',
          source: 'antigravity',
          scope: 'workspace',
          filePath: skillPath,
          fullPath: skillPath,
          dirPath: `.agents/skills/${entry.name}`,
          disabled: entry.name.endsWith('.disabled'),
          metadata: parsed.metadata,
          content: parsed.content,
        })
      }
    }
  }

  const agyRules = await tryListTree('.agents/rules')
  for (const entry of agyRules) {
    if (!entry.isDir && entry.name.endsWith('.md')) {
      const rulePath = `.agents/rules/${entry.name}`
      const content = await tryReadFile(rulePath)
      if (content) {
        const rawName = entry.name.replace(/\.md$/, '')
        const parsed = parseSkillMarkdown(content, rawName)
        skills.push({
          id: `antigravity:workspace:rule:${entry.name}`,
          name: parsed.name || rawName,
          description: parsed.description || 'Antigravity Workspace Rule',
          source: 'antigravity',
          scope: 'workspace',
          filePath: rulePath,
          fullPath: rulePath,
          dirPath: '.agents/rules',
          disabled: entry.name.endsWith('.disabled'),
          metadata: { ...parsed.metadata, tags: [...(parsed.metadata.tags || []), 'rule'] },
          content: parsed.content,
        })
      }
    }
  }

  // 2. Claude: .claude/skills, .claude/rules, CLAUDE.md
  const claudeSkills = await tryListTree('.claude/skills')
  for (const entry of claudeSkills) {
    if (entry.isDir) {
      const skillPath = `.claude/skills/${entry.name}/SKILL.md`
      const content = await tryReadFile(skillPath)
      if (content) {
        const parsed = parseSkillMarkdown(content, entry.name.replace(/\.disabled$/, ''))
        skills.push({
          id: `claude:workspace:${entry.name}`,
          name: parsed.name || entry.name,
          description: parsed.description || '',
          source: 'claude',
          scope: 'workspace',
          filePath: skillPath,
          fullPath: skillPath,
          dirPath: `.claude/skills/${entry.name}`,
          disabled: entry.name.endsWith('.disabled'),
          metadata: parsed.metadata,
          content: parsed.content,
        })
      }
    }
  }

  const claudeMd = await tryReadFile('CLAUDE.md')
  if (claudeMd) {
    const parsed = parseSkillMarkdown(claudeMd, 'CLAUDE.md')
    skills.push({
      id: 'claude:workspace:file:CLAUDE.md',
      name: 'CLAUDE.md',
      description: parsed.description || 'Claude Code Project Instructions',
      source: 'claude',
      scope: 'workspace',
      filePath: 'CLAUDE.md',
      fullPath: 'CLAUDE.md',
      dirPath: '.',
      disabled: false,
      metadata: { ...parsed.metadata, tags: ['core-rule'] },
      content: parsed.content,
    })
  }

  // 3. Codex: .codex/skills
  const codexSkills = await tryListTree('.codex/skills')
  for (const entry of codexSkills) {
    if (entry.isDir) {
      const skillPath = `.codex/skills/${entry.name}/SKILL.md`
      const content = await tryReadFile(skillPath)
      if (content) {
        const parsed = parseSkillMarkdown(content, entry.name.replace(/\.disabled$/, ''))
        skills.push({
          id: `codex:workspace:${entry.name}`,
          name: parsed.name || entry.name,
          description: parsed.description || '',
          source: 'codex',
          scope: 'workspace',
          filePath: skillPath,
          fullPath: skillPath,
          dirPath: `.codex/skills/${entry.name}`,
          disabled: entry.name.endsWith('.disabled'),
          metadata: parsed.metadata,
          content: parsed.content,
        })
      }
    }
  }

  // 4. Cursor / General: .cursorrules, .cursor/rules, AGENTS.md
  const cursorRules = await tryListTree('.cursor/rules')
  for (const entry of cursorRules) {
    if (!entry.isDir && (entry.name.endsWith('.md') || entry.name.endsWith('.mdc'))) {
      const rulePath = `.cursor/rules/${entry.name}`
      const content = await tryReadFile(rulePath)
      if (content) {
        const rawName = entry.name.replace(/\.mdc?$/, '')
        const parsed = parseSkillMarkdown(content, rawName)
        skills.push({
          id: `cursor:workspace:rule:${entry.name}`,
          name: parsed.name || rawName,
          description: parsed.description || 'Cursor Project Rule',
          source: 'cursor',
          scope: 'workspace',
          filePath: rulePath,
          fullPath: rulePath,
          dirPath: '.cursor/rules',
          disabled: entry.name.endsWith('.disabled'),
          metadata: { ...parsed.metadata, tags: ['cursor-rule'] },
          content: parsed.content,
        })
      }
    }
  }

  const agentsMd = await tryReadFile('AGENTS.md')
  if (agentsMd) {
    const parsed = parseSkillMarkdown(agentsMd, 'AGENTS.md')
    skills.push({
      id: 'antigravity:workspace:file:AGENTS.md',
      name: 'AGENTS.md',
      description: parsed.description || 'Project Agents Specifications & Instructions',
      source: 'antigravity',
      scope: 'workspace',
      filePath: 'AGENTS.md',
      fullPath: 'AGENTS.md',
      dirPath: '.',
      disabled: false,
      metadata: { ...parsed.metadata, tags: ['core-spec'] },
      content: parsed.content,
    })
  }

  const cursorRulesFile = await tryReadFile('.cursorrules')
  if (cursorRulesFile) {
    const parsed = parseSkillMarkdown(cursorRulesFile, '.cursorrules')
    skills.push({
      id: 'cursor:workspace:file:.cursorrules',
      name: '.cursorrules',
      description: parsed.description || 'Cursor Project Rules',
      source: 'cursor',
      scope: 'workspace',
      filePath: '.cursorrules',
      fullPath: '.cursorrules',
      dirPath: '.',
      disabled: false,
      metadata: { ...parsed.metadata, tags: ['cursor-rule'] },
      content: parsed.content,
    })
  }

  const stats: Record<AgentSource, number> = {
    antigravity: 0,
    claude: 0,
    codex: 0,
    cursor: 0,
    custom: 0,
  }

  for (const s of skills) {
    if (stats[s.source] !== undefined) stats[s.source]++
    else stats.custom++
  }

  return {
    skills,
    total: skills.length,
    stats,
  }
}

export const skillsApi = {
  async listSkills(sessionId: string, cwd?: string, includeGlobal = true): Promise<SkillsListResponse> {
    try {
      // First try host endpoint
      return await postJson<SkillsListResponse>('/agent-skills/api/list', {
        sessionId,
        cwd,
        includeGlobal,
      })
    } catch {
      // Fallback to direct client-side scanning through /sidebar/api/fs.*
      return await scanViaSidebarFs(sessionId, cwd)
    }
  },

  async createSkill(req: SkillCreateRequest): Promise<SkillCreateResponse> {
    try {
      return await postJson<SkillCreateResponse>('/agent-skills/api/create', req)
    } catch {
      // Fallback create using /sidebar/api/fs.write
      const template = TEMPLATES[req.source] || TEMPLATES.custom
      const sanitizedName = req.name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
      const targetFile = `${template.targetDir}/${sanitizedName}/${template.fileName}`
      const content = template.generateContent(sanitizedName, req.description, req.prompt)

      await postJson('/sidebar/api/fs.write', {
        sessionId: req.sessionId,
        ...(req.cwd ? { cwd: req.cwd } : {}),
        path: targetFile,
        content,
      })

      const createdSkill: AgentSkill = {
        id: `${req.source}:workspace:${sanitizedName}`,
        name: sanitizedName,
        description: req.description,
        source: req.source,
        scope: 'workspace',
        filePath: targetFile,
        fullPath: targetFile,
        dirPath: `${template.targetDir}/${sanitizedName}`,
        disabled: false,
        metadata: { tags: [req.source] },
        content,
      }

      return {
        filePath: targetFile,
        skill: createdSkill,
      }
    }
  },

  async toggleSkill(req: SkillToggleRequest): Promise<SkillToggleResponse> {
    return await postJson<SkillToggleResponse>('/agent-skills/api/toggle', req)
  },
}
