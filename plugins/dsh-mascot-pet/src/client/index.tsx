import type { Context } from '@deepseek-ai/cordis'
import type { ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MascotPet } from './MascotPet.js'
import { MascotSettingsSection } from './MascotSettingsSection.js'
import { MascotTokenBridge } from './MascotTokenBridge.js'

export const inject = ['slots']

let mountedDomRoot: Root | null = null
let containerEl: HTMLElement | null = null

/** 在原生 DOM 中直接挂载小鲸鱼姬桌宠浮层 */
function mountPetToDom(): () => void {
  if (typeof document === 'undefined') return () => {}

  if (document.getElementById('dsh-mascot-pet-host')) {
    return () => {}
  }

  containerEl = document.createElement('div')
  containerEl.id = 'dsh-mascot-pet-host'
  containerEl.style.position = 'fixed'
  containerEl.style.zIndex = '9999'
  containerEl.style.pointerEvents = 'none'
  containerEl.style.bottom = '0'
  containerEl.style.right = '0'
  document.body.appendChild(containerEl)

  try {
    mountedDomRoot = createRoot(containerEl)
    mountedDomRoot.render(<MascotPet />)
  } catch (err) {
    console.warn('[dsh-mascot-pet] React DOM 挂载失败：', err)
  }

  return () => {
    if (mountedDomRoot) {
      try {
        mountedDomRoot.unmount()
      } catch {
        /* ignore */
      }
      mountedDomRoot = null
    }
    if (containerEl && containerEl.parentNode) {
      containerEl.parentNode.removeChild(containerEl)
      containerEl = null
    }
  }
}

/** Cordis Client 插件入口 */
export function apply(ctx: Context): () => void {
  const disposers: Array<() => void> = []

  // 1. 始终挂载 DOM 桌面萌宠浮层
  const disposeDom = mountPetToDom()
  if (typeof disposeDom === 'function') {
    disposers.push(disposeDom)
  }

  const slots = (ctx as any).slots
  if (slots && typeof slots.inject === 'function') {
    // 2. 注册 DSH 设置弹窗左侧【🐳 小鲸鱼姬】专属分区 (采用 slots.inject 延迟就绪模式)
    try {
      slots.inject('settings.section', () => {
        return slots.register(
          {
            name: 'settings.section',
            id: 'mascot-pet',
            order: 110,
            label: () => '小鲸鱼姬',
            inject: () => ({}),
          },
          MascotSettingsSection
        )
      })
    } catch (err) {
      console.warn('[dsh-mascot-pet] settings.section 注册失败：', err)
    }

    // 3. 注册会话 Token 数据探针 (采用 slots.inject 挂载在 conversation.composer.dock 常驻底栏)
    try {
      slots.inject('conversation.composer.dock', () => {
        return slots.register(
          {
            name: 'conversation.composer.dock',
            id: 'mascot-token-bridge',
            order: 150,
          },
          (props: any) => <MascotTokenBridge useProjection={props.useProjection} useSession={props.useSession} />
        )
      })
    } catch (err) {
      console.warn('[dsh-mascot-pet] token bridge 注册失败：', err)
    }
  }

  return () => {
    for (const dispose of disposers) {
      try {
        dispose()
      } catch {
        /* ignore */
      }
    }
  }
}
