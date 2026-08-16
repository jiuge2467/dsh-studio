import { describe, it, expect } from 'vitest'
import { MCP_PRESETS } from '../src/scanner/marketplace.ts'

describe('MCP Marketplace Presets', () => {
  it('should have valid preset definitions', () => {
    expect(MCP_PRESETS.length).toBeGreaterThanOrEqual(6)

    for (const preset of MCP_PRESETS) {
      expect(preset.id).toBeTruthy()
      expect(preset.name).toBeTruthy()
      expect(preset.description).toBeTruthy()
      expect(['developer', 'data', 'web', 'system']).toContain(preset.category)
      expect(['stdio', 'streamable-http', 'sse']).toContain(preset.transport)
    }
  })

  it('should contain essential presets (github, sqlite, brave, fetch)', () => {
    const ids = MCP_PRESETS.map((p) => p.id)
    expect(ids).toContain('github')
    expect(ids).toContain('sqlite')
    expect(ids).toContain('fetch')
    expect(ids).toContain('brave-search')
  })
})
