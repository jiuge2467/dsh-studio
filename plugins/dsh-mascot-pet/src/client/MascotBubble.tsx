/**
 * @module dsh-mascot-pet/client/MascotBubble
 * @description 思考状态实时浮动气泡：展示正在思考秒数与当前消耗金额。
 */
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import css from './MascotPet.module.css'

export interface MascotBubbleProps {
  /** 是否处于思考/生成中 */
  thinking: boolean
  /** 格式化的费用字符串（如 ¥0.0042） */
  costFormatted: string
  /** 格式化的 token 字符串（如 1.2K tok） */
  tokensFormatted: string
  /** 状态提示文本 */
  statusText?: string
}

export function MascotBubble({ thinking, costFormatted, tokensFormatted }: MascotBubbleProps): ReactNode {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!thinking) {
      setSeconds(0)
      return
    }
    setSeconds(1)
    const timer = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)
    return () => { clearInterval(timer) }
  }, [thinking])

  if (!thinking) return null

  return (
    <div className={`${css.thinkingBubble} ${css.interactive}`}>
      <span className={css.thinkingDot} />
      <span>正在思考 {seconds}s</span>
      <span className={css.bubbleCost}>{costFormatted}</span>
      <span className={css.bubbleTokens}>({tokensFormatted})</span>
    </div>
  )
}
