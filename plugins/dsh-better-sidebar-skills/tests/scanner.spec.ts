import { describe, expect, it } from 'vitest'
import { scanAgentSkills } from '../src/scanner/scanner.ts'
import { TEMPLATES } from '../src/scanner/templates.ts'

describe('scanner & templates', () => {
  it('generates standard template content for each agent ecosystem', () => {
    const agy = TEMPLATES.antigravity.generateContent('my-skill', 'desc', 'prompt')
    expect(agy).toContain('name: my-skill')
    expect(agy).toContain('description: desc')

    const claude = TEMPLATES.claude.generateContent('claude-tool', 'desc')
    expect(claude).toContain('name: claude-tool')

    const codex = TEMPLATES.codex.generateContent('codex-tool', 'desc')
    expect(codex).toContain('name: codex-tool')

    const cursor = TEMPLATES.cursor.generateContent('cursor-rule', 'desc')
    expect(cursor).toContain('globs: *')
  })

  it('scans current workspace without errors', async () => {
    const result = await scanAgentSkills(process.cwd(), true)
    expect(result).toBeDefined()
    expect(Array.isArray(result.skills)).toBe(true)
    expect(typeof result.total).toBe('number')
    expect(result.stats).toBeDefined()
    expect(result.total).toBeGreaterThanOrEqual(0)
  })
})
