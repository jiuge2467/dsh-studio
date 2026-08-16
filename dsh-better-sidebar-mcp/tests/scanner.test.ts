import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { scanAllMcpServers } from '../src/scanner/scanner.ts'

describe('MCP Scanner (Multi-Source Discovery)', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = join(tmpdir(), `dsh-mcp-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`)
    await mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true }).catch(() => {})
  })

  it('should return empty list when no mcp config exists in directory', async () => {
    const servers = await scanAllMcpServers(testDir, false)
    expect(servers).toEqual([])
  })

  it('should discover workspace mcp.json servers', async () => {
    const configPath = join(testDir, 'mcp.json')
    const config = {
      mcpServers: {
        'github-tool': {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-github'],
          env: { GITHUB_TOKEN: 'test-token' },
        },
        'remote-api': {
          url: 'https://example.com/mcp',
          transport: 'streamable-http',
          headers: { Authorization: 'Bearer xxx' },
        },
      },
    }
    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf8')

    const servers = await scanAllMcpServers(testDir, false)
    expect(servers.length).toBe(2)

    const gh = servers.find((s) => s.serverName === 'github-tool')
    expect(gh).toBeDefined()
    expect(gh?.transport).toBe('stdio')
    expect(gh?.command).toBe('npx')
    expect(gh?.args).toEqual(['-y', '@modelcontextprotocol/server-github'])
    expect(gh?.source).toBe('workspace')
    expect(gh?.enabled).toBe(true)

    const remote = servers.find((s) => s.serverName === 'remote-api')
    expect(remote).toBeDefined()
    expect(remote?.transport).toBe('streamable-http')
    expect(remote?.url).toBe('https://example.com/mcp')
    expect(remote?.headers?.Authorization).toBe('Bearer xxx')
  })

  it('should discover .vscode/mcp.json and .cursor/mcp.json', async () => {
    const vscodeDir = join(testDir, '.vscode')
    await mkdir(vscodeDir, { recursive: true })
    await writeFile(
      join(vscodeDir, 'mcp.json'),
      JSON.stringify({
        mcpServers: {
          'vscode-sqlite': {
            command: 'sqlite3',
            args: ['test.db'],
          },
        },
      }),
      'utf8',
    )

    const servers = await scanAllMcpServers(testDir, false)
    expect(servers.length).toBe(1)
    expect(servers[0].serverName).toBe('vscode-sqlite')
    expect(servers[0].source).toBe('vscode')
  })

  it('should correctly prioritize workspace overrides over duplicate names', async () => {
    const vscodeDir = join(testDir, '.vscode')
    await mkdir(vscodeDir, { recursive: true })
    await writeFile(
      join(vscodeDir, 'mcp.json'),
      JSON.stringify({
        mcpServers: {
          common: { command: 'node', args: ['vscode.js'] },
        },
      }),
      'utf8',
    )

    await writeFile(
      join(testDir, 'mcp.json'),
      JSON.stringify({
        mcpServers: {
          common: { command: 'node', args: ['workspace.js'] },
        },
      }),
      'utf8',
    )

    const servers = await scanAllMcpServers(testDir, false)
    expect(servers.length).toBe(1)
    expect(servers[0].serverName).toBe('common')
    expect(servers[0].source).toBe('workspace')
    expect(servers[0].args).toEqual(['workspace.js'])
  })
})
