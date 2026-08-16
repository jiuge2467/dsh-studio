import yaml from 'js-yaml'
import type { SkillMetadata } from '../types.ts'

export interface ParsedSkillContent {
  name?: string
  description?: string
  metadata: SkillMetadata
  content: string
}

/**
 * Parse frontmatter and body from Markdown files.
 * Fallbacks to title/paragraphs if frontmatter is missing or invalid.
 */
export function parseSkillMarkdown(raw: string, fallbackName: string): ParsedSkillContent {
  const normalized = raw.replace(/\r\n/g, '\n')
  const metadata: SkillMetadata = {}

  let name = fallbackName
  let description = ''
  let content = normalized

  // Try parsing frontmatter --- ... ---
  if (normalized.startsWith('---')) {
    const secondFence = normalized.indexOf('\n---', 3)
    if (secondFence !== -1) {
      const frontmatterText = normalized.slice(3, secondFence).trim()
      content = normalized.slice(secondFence + 4).trim()

      try {
        const parsed = yaml.load(frontmatterText) as Record<string, unknown>
        if (parsed && typeof parsed === 'object') {
          if (typeof parsed.name === 'string' && parsed.name.trim()) {
            name = parsed.name.trim()
          }
          if (typeof parsed.description === 'string') {
            description = parsed.description.trim()
          }
          if (Array.isArray(parsed.tags)) {
            metadata.tags = parsed.tags.filter((t): t is string => typeof t === 'string')
          }
          if (typeof parsed.icon === 'string') {
            metadata.icon = parsed.icon
          }
          if (typeof parsed.author === 'string') {
            metadata.author = parsed.author
          }
          if (typeof parsed.version === 'string' || typeof parsed.version === 'number') {
            metadata.version = String(parsed.version)
          }
          if (typeof parsed.parameters === 'object' && parsed.parameters !== null) {
            metadata.parameters = parsed.parameters as Record<string, string>
          }
        }
      } catch {
        // Frontmatter parsing error: fallback to plain text parsing
      }
    }
  }

  // If description is still empty, extract first non-header line or intro paragraph
  if (!description && content) {
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean)
    for (const line of lines) {
      if (!line.startsWith('#') && !line.startsWith('>') && !line.startsWith('-')) {
        description = line.slice(0, 150)
        break
      }
    }
  }

  return {
    name,
    description,
    metadata,
    content,
  }
}
