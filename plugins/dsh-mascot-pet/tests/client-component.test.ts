import { describe, it, expect } from 'vitest'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { MascotBubble } from '../src/client/MascotBubble.js'
import { MascotDashboard } from '../src/client/MascotDashboard.js'

describe('Client Components', () => {
  it('should render MascotBubble when thinking is true', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    root.render(
      React.createElement(MascotBubble, {
        thinking: true,
        costFormatted: '¥0.0050',
        tokensFormatted: '1.5K tok',
      })
    )

    // 等待微任务更新 DOM
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(container.textContent).toContain('正在思考')
        expect(container.textContent).toContain('¥0.0050')
        expect(container.textContent).toContain('1.5K tok')
        root.unmount()
        container.remove()
        resolve()
      }, 50)
    })
  })

  it('should not render MascotBubble when thinking is false', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    root.render(
      React.createElement(MascotBubble, {
        thinking: false,
        costFormatted: '¥0.0050',
        tokensFormatted: '1.5K tok',
      })
    )

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(container.firstChild).toBeNull()
        root.unmount()
        container.remove()
        resolve()
      }, 50)
    })
  })

  it('should render MascotDashboard with 6 tabs', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    root.render(
      React.createElement(MascotDashboard, {
        open: true,
        onClose: () => {},
        costFormatted: '¥0.0120',
        currentSessionCostCny: 0.012,
        totalTokens: 12000,
        uncachedTokens: 2000,
        cacheReadTokens: 8000,
        outputTokens: 2000,
        cacheHitPercent: 80,
        speedFormatted: '110 tok/s',
        thinking: false,
      })
    )

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(container.textContent).toContain('DeepSeek 小鲸鱼姬')
        expect(container.textContent).toContain('用量账单')
        expect(container.textContent).toContain('零食投喂')
        expect(container.textContent).toContain('背单词')
        expect(container.textContent).toContain('摸鱼挑战')
        expect(container.textContent).toContain('美食转盘')
        expect(container.textContent).toContain('极客段子')
        root.unmount()
        container.remove()
        resolve()
      }, 50)
    })
  })
})
