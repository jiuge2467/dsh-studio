import type { AgentSource } from '../types.ts'

export interface SkillTemplate {
  source: AgentSource
  targetDir: string
  fileName: string
  generateContent(name: string, description: string, prompt?: string): string
}

export const TEMPLATES: Record<AgentSource, SkillTemplate> = {
  antigravity: {
    source: 'antigravity',
    targetDir: '.agents/skills',
    fileName: 'SKILL.md',
    generateContent: (name, description, prompt) => `---
name: ${name}
description: ${description || 'Agent skill description'}
---

# ${name}

${description}

## Usage

${prompt || 'When the user asks for this capability, execute the steps below.'}

## Instructions

1. Identify the input parameters.
2. Execute the required actions sequentially.
3. Validate the results and report back to the user.
`,
  },
  claude: {
    source: 'claude',
    targetDir: '.claude/skills',
    fileName: 'SKILL.md',
    generateContent: (name, description, prompt) => `---
name: ${name}
description: ${description || 'Claude Code skill'}
---

# ${name}

${description}

${prompt || 'Prompt and instructions for Claude Code.'}
`,
  },
  codex: {
    source: 'codex',
    targetDir: '.codex/skills',
    fileName: 'SKILL.md',
    generateContent: (name, description, prompt) => `---
name: ${name}
description: ${description || 'Codex Agent skill'}
---

# ${name}

${description}

${prompt || 'Instructions for OpenAI Codex.'}
`,
  },
  cursor: {
    source: 'cursor',
    targetDir: '.cursor/rules',
    fileName: 'RULE.mdc',
    generateContent: (name, description, prompt) => `---
description: ${description || 'Cursor project rule'}
globs: *
---

# ${name}

${description}

${prompt || 'Rules and constraints to follow.'}
`,
  },
  custom: {
    source: 'custom',
    targetDir: '.agents/skills',
    fileName: 'SKILL.md',
    generateContent: (name, description, prompt) => `---
name: ${name}
description: ${description}
---

# ${name}

${prompt || description}
`,
  },
}
