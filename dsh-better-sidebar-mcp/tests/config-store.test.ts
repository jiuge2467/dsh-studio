import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdir, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  deleteServerConfig,
  importJsonBlock,
  saveServerConfig,
  toggleServerConfig,
} from '../src/scanner/config-store.ts'

describe('MCP Config Store', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = join(tmpdir(), `dsh-mcp-store-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`)
    await mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should save a new stdio server to mcp.json', async () => {
    const res = await saveServerConfig(
      testDir,
      {
        serverName: 'test-server',
        transport: 'stdio',
        command: 'npx',
        args: ['-y', 'my-mcp'],
        env: { KEY: 'val' },
        enabled: true,
      },
      'workspace',
    )

    expect(res.ok).toBe(true)
    const saved = JSON.parse(await readFile(join(testDir, 'mcp.json'), 'utf8'))
    expect(saved.mcpServers['test-server']).toBeDefined()
    expect(saved.mcpServers['test-server'].command).toBe('npx')
    expect(saved.mcpServers['test-server'].args).toEqual(['-y', 'my-mcp'])
    expect(saved.mcpServers['test-server'].env).toEqual({ KEY: 'val' })
  })

  it('should toggle server enabled state', async () => {
    await saveServerConfig(
      testDir,
      {
        serverName: 'toggle-me',
        command: 'node',
      },
      'workspace',
    )

    const targetPath = join(testDir, 'mcp.json')
    const toggleRes = await toggleServerConfig(testDir, 'toggle-me', targetPath, false)
    expect(toggleRes.ok).toBe(true)

    const disabledData = JSON.parse(await readFile(targetPath, 'utf8'))
    expect(disabledData.mcpServers['toggle-me'].disabled).toBe(true)

    const enableRes = await toggleServerConfig(testDir, 'toggle-me', targetPath, true)
    expect(enableRes.ok).toBe(true)

    const enabledData = JSON.parse(await readFile(targetPath, 'utf8'))
    expect(enabledData.mcpServers['toggle-me'].disabled).toBeUndefined()
  })

  it('should delete a server from config', async () => {
    await saveServerConfig(
      testDir,
      {
        serverName: 'delete-me',
        command: 'node',
      },
      'workspace',
    )

    const targetPath = join(testDir, 'mcp.json')
    const delRes = await deleteServerConfig(testDir, 'delete-me', targetPath)
    expect(delRes.ok).toBe(true)

    const updated = JSON.parse(await readFile(targetPath, 'utf8'))
    expect(updated.mcpServers['delete-me']).toBeUndefined()
  })

  it('should import raw JSON block', async () => {
    const rawJson = JSON.stringify({
      mcpServers: {
        s1: { command: 'node', args: ['1.js'] },
        s2: { url: 'https://example.com/mcp' },
      },
    })

    const res = await importJsonBlock(testDir, rawJson, 'workspace')
    expect(res.ok).toBe(true)
    expect(res.importedCount).toBe(2)

    const saved = JSON.parse(await readFile(join(testDir, 'mcp.json'), 'utf8'))
    expect(saved.mcpServers['s1']).toBeDefined()
    expect(saved.mcpServers['s2']).toBeDefined()
  })
})
