import { mkdir, rename, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import type { Context } from 'cordis'
import { scanAgentSkills } from './scanner/scanner.ts'
import { TEMPLATES } from './scanner/templates.ts'
import type {
  AgentSkill,
  SkillCreateRequest,
  SkillCreateResponse,
  SkillsListRequest,
  SkillsListResponse,
  SkillToggleRequest,
  SkillToggleResponse,
} from './types.ts'

export const name = 'dsh-better-sidebar-skills'
export const inject = ['webServer', 'sessions']

interface HttpRequest {
  url?: string
  method?: string
  headers: Record<string, string | string[] | undefined>
  [Symbol.asyncIterator](): AsyncIterator<string | Uint8Array>
}

interface HttpResponse {
  statusCode: number
  writeHead(status: number, headers?: Record<string, string>): void
  end(body?: string | Uint8Array): void
}

async function readJson<T>(req: HttpRequest): Promise<T> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk))
  }
  const body = Buffer.concat(chunks).toString('utf8')
  return JSON.parse(body || '{}') as T
}

function writeJson(res: HttpResponse, status: number, data: unknown): void {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
  })
  res.end(JSON.stringify(data))
}

function resolveCwd(ctx: any, sessionId?: string, requestedCwd?: string): string {
  if (requestedCwd && isAbsolute(requestedCwd)) return requestedCwd
  if (sessionId && ctx.sessions) {
    const session = ctx.sessions.get(sessionId)
    if (session?.header?.cwd) return session.header.cwd
  }
  return process.cwd()
}

export function apply(ctx: Context): void {
  const webServer = (ctx as any).webServer
  if (!webServer) return

  const handleRoute = async (req: HttpRequest, res: HttpResponse) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST, GET, OPTIONS',
        'access-control-allow-headers': 'content-type',
      })
      res.end()
      return
    }

    if (req.method !== 'POST') {
      writeJson(res, 405, { ok: false, error: 'Method not allowed' })
      return
    }

    const pathname = new URL(req.url ?? '/', 'http://dsh.internal').pathname
    const methodName = pathname.replace(/^\/agent-skills\/api\/?/, '')

    try {
      if (methodName === 'list' || methodName === 'skills.list') {
        const body = await readJson<SkillsListRequest>(req)
        const cwd = resolveCwd(ctx, body.sessionId, body.cwd)
        const result: SkillsListResponse = await scanAgentSkills(cwd, body.includeGlobal ?? true)
        writeJson(res, 200, { ok: true, value: result })
        return
      }

      if (methodName === 'create' || methodName === 'skills.create') {
        const body = await readJson<SkillCreateRequest>(req)
        const cwd = resolveCwd(ctx, body.sessionId, body.cwd)
        const template = TEMPLATES[body.source] || TEMPLATES.custom

        const sanitizedName = body.name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
        const targetDir = join(cwd, template.targetDir, sanitizedName)
        const targetFile = join(targetDir, template.fileName)

        await mkdir(targetDir, { recursive: true })
        const content = template.generateContent(sanitizedName, body.description, body.prompt)
        await writeFile(targetFile, content, 'utf8')

        const createdSkill: AgentSkill = {
          id: `${body.source}:workspace:${sanitizedName}`,
          name: sanitizedName,
          description: body.description,
          source: body.source,
          scope: 'workspace',
          filePath: join(template.targetDir, sanitizedName, template.fileName).replace(/\\/g, '/'),
          fullPath: resolve(targetFile),
          dirPath: join(template.targetDir, sanitizedName).replace(/\\/g, '/'),
          disabled: false,
          metadata: { tags: [body.source] },
          content,
        }

        const resp: SkillCreateResponse = {
          filePath: createdSkill.filePath,
          skill: createdSkill,
        }
        writeJson(res, 200, { ok: true, value: resp })
        return
      }

      if (methodName === 'toggle' || methodName === 'skills.toggle') {
        const body = await readJson<SkillToggleRequest>(req)
        const cwd = resolveCwd(ctx, body.sessionId, body.cwd)
        const { skills } = await scanAgentSkills(cwd, true)
        const target = skills.find(s => s.id === body.skillId)

        if (!target) {
          writeJson(res, 404, { ok: false, error: 'Skill not found' })
          return
        }

        const currentDir = target.fullPath.endsWith('SKILL.md') ? dirname(target.fullPath) : target.fullPath
        let newDir = currentDir
        if (body.disabled && !currentDir.endsWith('.disabled')) {
          newDir = `${currentDir}.disabled`
          await rename(currentDir, newDir)
        } else if (!body.disabled && currentDir.endsWith('.disabled')) {
          newDir = currentDir.replace(/\.disabled$/, '')
          await rename(currentDir, newDir)
        }

        const resp: SkillToggleResponse = {
          skillId: body.skillId,
          disabled: body.disabled,
          newPath: newDir,
        }
        writeJson(res, 200, { ok: true, value: resp })
        return
      }

      writeJson(res, 404, { ok: false, error: `Unknown method: ${methodName}` })
    } catch (err: any) {
      writeJson(res, 500, { ok: false, error: err?.message || String(err) })
    }
  }

  // Register dedicated /agent-skills/api prefix route
  ctx.effect(() => webServer.register({
    kind: 'prefix',
    path: '/agent-skills/api',
    handler: handleRoute,
  }), 'dsh-better-sidebar-skills: /agent-skills/api routes')
}
