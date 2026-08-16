import { describe, expect, it } from 'vitest'
import { parseSkillMarkdown } from '../src/scanner/parser.ts'

describe('parseSkillMarkdown', () => {
  it('parses valid YAML frontmatter and markdown body', () => {
    const raw = `---
name: test-skill
description: A wonderful testing skill
tags:
  - test
  - automation
author: deepseek
version: 1.0.0
parameters:
  target: string
---

# Test Skill

This is the instruction body.
`
    const parsed = parseSkillMarkdown(raw, 'fallback')
    expect(parsed.name).toBe('test-skill')
    expect(parsed.description).toBe('A wonderful testing skill')
    expect(parsed.metadata.tags).toEqual(['test', 'automation'])
    expect(parsed.metadata.author).toBe('deepseek')
    expect(parsed.metadata.version).toBe('1.0.0')
    expect(parsed.metadata.parameters).toEqual({ target: 'string' })
    expect(parsed.content).toContain('# Test Skill')
  })

  it('falls back gracefully when frontmatter is missing', () => {
    const raw = `# Plain Markdown Skill

This is the first paragraph describing the skill.

## Instructions
1. Step one
`
    const parsed = parseSkillMarkdown(raw, 'my-plain-skill')
    expect(parsed.name).toBe('my-plain-skill')
    expect(parsed.description).toBe('This is the first paragraph describing the skill.')
    expect(parsed.content).toContain('# Plain Markdown Skill')
  })

  it('handles invalid frontmatter syntax without throwing', () => {
    const raw = `---
invalid yaml : : :
---

# Fallback Content
`
    const parsed = parseSkillMarkdown(raw, 'default-name')
    expect(parsed.name).toBe('default-name')
    expect(parsed.content).toContain('# Fallback Content')
  })
})
