import { createElement } from 'react'
import type {} from 'dsh-better-sidebar'
import type { Context } from 'cordis'
import { SkillsView } from './components/SkillsView.tsx'
import { PluginIcon } from './components/Icons.tsx'

export const inject = ['betterSidebar']

export function apply(ctx: Context): void {
  if (!ctx.betterSidebar) return

  // Register the Agent Skills tab in better-sidebar
  ctx.effect(() =>
    ctx.betterSidebar.registerTab({
      id: 'dsh-skills:manager',
      title: () => 'Agent 技能',
      icon: (size) => createElement(PluginIcon, { size: typeof size === 'number' ? size : 16 }),
      order: 45,
      single: true,
      settings: {
        pluginToggles: [
          {
            key: 'includeGlobal',
            title: () => '扫描全局技能',
            desc: () => '包含 ~/.gemini 及 ~/.claude 等全局用户主目录中的技能',
            type: 'switch',
          },
        ],
      },
      component: ({ scope, visible, onOpenFile }) =>
        createElement(SkillsView, {
          sessionId: scope.sessionId,
          cwd: scope.cwd,
          visible,
          onOpenFile,
        }),
    })
  )
}
