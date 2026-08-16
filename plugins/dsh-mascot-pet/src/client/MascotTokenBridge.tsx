import { memo, useEffect } from 'react'
import {
  calculateTokenCost,
  recordSessionCostToLedger,
  type TokenUsageLike,
} from './pricing-engine.js'

export interface MascotTokenBridgeProps {
  useProjection?: (name: string) => any
  useSession?: (selector?: (s: any) => any) => any
}

/**
 * 会话 Token 与 Agent 动作数据桥接器：
 * 挂载在 conversation.composer.dock 常驻底栏插槽中，提取 DSH 会话的真实 TokenUsage、SessionStats 与活动事件，
 * 实时同步全局账本并广播至 window 全局事件，驱动小鲸鱼姬桌宠与计费面板动态刷新。
 */
export const MascotTokenBridge = memo(function MascotTokenBridge(props: MascotTokenBridgeProps) {
  const { useProjection, useSession } = props

  // 1. 读取官方 Token 消耗、会话统计与实时 TPS 投影
  const tokenUsage = useProjection ? (useProjection('tokenUsage') as TokenUsageLike | undefined) : undefined
  const sessionStats = useProjection ? (useProjection('sessionStats') as any) : undefined
  const liveUsage = useProjection ? (useProjection('liveTokenUsage') as any) : undefined
  const activity = useProjection ? (useProjection('activity') as any) : undefined

  // 2. 读取会话状态、Session ID、活跃工具与节点列表
  const sessionRunning = useSession ? useSession((s: any) => s?.running ?? false) ?? false : false
  const sessionId = useSession ? useSession((s: any) => s?.sessionId) ?? 'default' : 'default'
  const activeToolName = useSession
    ? useSession((s: any) => s?.runningCalls?.[0]?.toolName ?? s?.runningCalls?.[0]?.name)
    : undefined
  const settledNodes = useSession ? useSession((s: any) => s?.nodes ?? s?.chat?.legacy?.nodes) : undefined

  useEffect(() => {
    let toolName: string | undefined = activeToolName
    if (!toolName && activity && typeof activity === 'object') {
      if (activity.phase === 'tool' && typeof activity.toolName === 'string') {
        toolName = activity.toolName
      }
    }

    // 计算实时 TPS 速率
    let calculatedTps: number | undefined
    if (typeof liveUsage?.tokensPerSecond === 'number' && liveUsage.tokensPerSecond > 0) {
      calculatedTps = liveUsage.tokensPerSecond
    } else if (sessionStats && sessionStats.decodeMs > 0 && sessionStats.decodeTokens > 0) {
      calculatedTps = sessionStats.decodeTokens / (sessionStats.decodeMs / 1000)
    }

    // 兜底从节点流提取输出 Token
    let fallbackOutput = 0
    let fallbackInput = 0
    if (Array.isArray(settledNodes)) {
      for (const node of settledNodes) {
        if (node && typeof node === 'object') {
          if (node.reading && typeof node.reading.outputTokens === 'number') {
            fallbackOutput += node.reading.outputTokens
          }
          if (node.reading && typeof node.reading.inputTokens === 'number') {
            fallbackInput += node.reading.inputTokens
          }
        }
      }
    }

    // 计算并同步至全局账本
    const finalUsage = tokenUsage ?? (fallbackOutput > 0 || fallbackInput > 0 ? {
      uncachedInputTokens: Math.round(fallbackInput * 0.2),
      cacheReadTokens: Math.round(fallbackInput * 0.8),
      outputTokens: fallbackOutput,
    } : undefined)

    if (sessionId && sessionId !== 'default') {
      recordSessionCostToLedger(sessionId, finalUsage)
    }

    const detail = {
      tokenUsage: finalUsage,
      tokensPerSecond: calculatedTps,
      running: sessionRunning,
      sessionId,
      toolName,
      activityPhase: activity?.phase,
      sessionStats,
    }
    window.dispatchEvent(new CustomEvent('dsh-mascot-token-update', { detail }))
  }, [
    tokenUsage,
    sessionStats,
    liveUsage?.tokensPerSecond,
    activity,
    sessionRunning,
    sessionId,
    activeToolName,
    settledNodes,
  ])

  return null
})
