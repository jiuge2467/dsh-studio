import { readdir, readFile, stat } from 'node:fs/promises'
import { join, basename, relative, resolve } from 'node:path'
import os from 'node:os'
import type { AgentSkill, AgentSource, SkillScope, SkillsListResponse } from '../types.ts'
import { parseSkillMarkdown } from './parser.ts'

interface ScanTarget {
  source: AgentSource
  scope: SkillScope
  baseDir: string
  patternType: 'skill-dir' | 'rule-dir' | 'single-file'
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

/**
 * Scan a directory for skills formatted as <skill_name>/SKILL.md or <skill_name>.md
 */
async function scanSkillDir(
  source: AgentSource,
  scope: SkillScope,
  baseDir: string,
  rootWorkspace: string
): Promise<AgentSkill[]> {
  const skills: AgentSkill[] = []
  if (!(await exists(baseDir))) return skills

  try {
    const entries = await readdir(baseDir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dirName = entry.name
        const isDisabled = dirName.endsWith('.disabled')
        const skillDirPath = join(baseDir, dirName)
        const skillMdPath = join(skillDirPath, 'SKILL.md')

        if (await exists(skillMdPath)) {
          try {
            const rawContent = await readFile(skillMdPath, 'utf8')
            const parsed = parseSkillMarkdown(rawContent, dirName.replace(/\.disabled$/, ''))
            const relPath = relative(rootWorkspace, skillMdPath).replace(/\\/g, '/')
            const relDir = relative(rootWorkspace, skillDirPath).replace(/\\/g, '/')

            skills.push({
              id: `${source}:${scope}:${dirName}`,
              name: parsed.name || dirName,
              description: parsed.description || '',
              source,
              scope,
              filePath: scope === 'workspace' ? relPath : skillMdPath.replace(/\\/g, '/'),
              fullPath: resolve(skillMdPath),
              dirPath: scope === 'workspace' ? relDir : skillDirPath.replace(/\\/g, '/'),
              disabled: isDisabled,
              metadata: parsed.metadata,
              content: parsed.content,
            })
          } catch {
            // Ignore unreadable individual files
          }
        }
      }
    }
  } catch {
    // Ignore unreadable directories
  }

  return skills
}

/**
 * Scan a rules directory (e.g. .agents/rules/*.md or .cursor/rules/*.mdc)
 */
async function scanRuleDir(
  source: AgentSource,
  scope: SkillScope,
  baseDir: string,
  rootWorkspace: string
): Promise<AgentSkill[]> {
  const skills: AgentSkill[] = []
  if (!(await exists(baseDir))) return skills

  try {
    const entries = await readdir(baseDir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdc'))) {
        const filePath = join(baseDir, entry.name)
        const rawName = basename(entry.name, entry.name.endsWith('.mdc') ? '.mdc' : '.md')
        const isDisabled = entry.name.endsWith('.disabled')

        try {
          const rawContent = await readFile(filePath, 'utf8')
          const parsed = parseSkillMarkdown(rawContent, rawName)
          const relPath = relative(rootWorkspace, filePath).replace(/\\/g, '/')

          skills.push({
            id: `${source}:${scope}:rule:${entry.name}`,
            name: parsed.name || rawName,
            description: parsed.description || `${source} rule configuration`,
            source,
            scope,
            filePath: scope === 'workspace' ? relPath : filePath.replace(/\\/g, '/'),
            fullPath: resolve(filePath),
            dirPath: relative(rootWorkspace, baseDir).replace(/\\/g, '/'),
            disabled: isDisabled,
            metadata: { ...parsed.metadata, tags: [...(parsed.metadata.tags || []), 'rule'] },
            content: parsed.content,
          })
        } catch {
          // Ignore
        }
      }
    }
  } catch {
    // Ignore
  }

  return skills
}

/**
 * Scan a single special rule file (like CLAUDE.md or AGENTS.md)
 */
async function scanSingleFile(
  source: AgentSource,
  scope: SkillScope,
  filePath: string,
  rootWorkspace: string
): Promise<AgentSkill | null> {
  if (!(await exists(filePath))) return null

  try {
    const fileName = basename(filePath)
    const rawContent = await readFile(filePath, 'utf8')
    const parsed = parseSkillMarkdown(rawContent, fileName)
    const relPath = relative(rootWorkspace, filePath).replace(/\\/g, '/')

    return {
      id: `${source}:${scope}:file:${fileName}`,
      name: parsed.name || fileName,
      description: parsed.description || `${source} root rules & instructions`,
      source,
      scope,
      filePath: relPath,
      fullPath: resolve(filePath),
      dirPath: '.',
      disabled: false,
      metadata: { ...parsed.metadata, tags: ['core-rule'] },
      content: parsed.content,
    }
  } catch {
    return null
  }
}

/**
 * Main scanner function that scans all workspace and global Agent skills.
 */
export async function scanAgentSkills(
  workspaceCwd: string,
  includeGlobal = true
): Promise<SkillsListResponse> {
  const root = resolve(workspaceCwd)
  const home = os.homedir()
  const allSkills: AgentSkill[] = []

  const targets: ScanTarget[] = [
    // Workspace targets
    { source: 'antigravity', scope: 'workspace', baseDir: join(root, '.agents', 'skills'), patternType: 'skill-dir' },
    { source: 'antigravity', scope: 'workspace', baseDir: join(root, '.agents', 'rules'), patternType: 'rule-dir' },
    { source: 'claude', scope: 'workspace', baseDir: join(root, '.claude', 'skills'), patternType: 'skill-dir' },
    { source: 'claude', scope: 'workspace', baseDir: join(root, '.claude', 'rules'), patternType: 'rule-dir' },
    { source: 'codex', scope: 'workspace', baseDir: join(root, '.codex', 'skills'), patternType: 'skill-dir' },
    { source: 'codex', scope: 'workspace', baseDir: join(root, '.codex', 'rules'), patternType: 'rule-dir' },
    { source: 'cursor', scope: 'workspace', baseDir: join(root, '.cursor', 'rules'), patternType: 'rule-dir' },
  ]

  // Execute workspace directory scans in parallel
  const scanPromises = targets.map(async (target) => {
    if (target.patternType === 'skill-dir') {
      return scanSkillDir(target.source, target.scope, target.baseDir, root)
    } else {
      return scanRuleDir(target.source, target.scope, target.baseDir, root)
    }
  })

  // Scan single files (CLAUDE.md, AGENTS.md, .cursorrules)
  const singleFilePromises = [
    scanSingleFile('claude', 'workspace', join(root, 'CLAUDE.md'), root),
    scanSingleFile('antigravity', 'workspace', join(root, 'AGENTS.md'), root),
    scanSingleFile('cursor', 'workspace', join(root, '.cursorrules'), root),
  ]

  // Global home directory targets
  if (includeGlobal) {
    const globalTargets: ScanTarget[] = [
      { source: 'antigravity', scope: 'global', baseDir: join(home, '.gemini', 'config', 'skills'), patternType: 'skill-dir' },
      { source: 'antigravity', scope: 'global', baseDir: join(home, '.gemini', 'config', 'rules'), patternType: 'rule-dir' },
      { source: 'claude', scope: 'global', baseDir: join(home, '.claude', 'skills'), patternType: 'skill-dir' },
      { source: 'codex', scope: 'global', baseDir: join(home, '.codex', 'skills'), patternType: 'skill-dir' },
    ]

    for (const gt of globalTargets) {
      scanPromises.push(
        gt.patternType === 'skill-dir'
          ? scanSkillDir(gt.source, gt.scope, gt.baseDir, root)
          : scanRuleDir(gt.source, gt.scope, gt.baseDir, root)
      )
    }
  }

  const [dirResults, ...singleResults] = await Promise.all([
    Promise.all(scanPromises),
    ...singleFilePromises,
  ])

  for (const list of dirResults) {
    allSkills.push(...list)
  }

  for (const item of singleResults) {
    if (item) allSkills.push(item)
  }

  // Calculate statistics
  const stats: Record<AgentSource, number> = {
    antigravity: 0,
    claude: 0,
    codex: 0,
    cursor: 0,
    custom: 0,
  }

  for (const skill of allSkills) {
    if (stats[skill.source] !== undefined) {
      stats[skill.source]++
    } else {
      stats.custom++
    }
  }

  return {
    skills: allSkills,
    total: allSkills.length,
    stats,
  }
}
