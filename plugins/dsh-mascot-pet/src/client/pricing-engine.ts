/**
 * @module dsh-mascot-pet/client/pricing-engine
 * @description Token 计费换算引擎：根据 DeepSeek 官方标准价格表，
 *   结合 TokenUsage 或节点级 Token 数据精确计算 CNY 费用，并维护全站历史累计总账本。
 */

export interface TokenUsageLike {
  uncachedInputTokens?: number
  cacheReadTokens?: number
  cacheWriteTokens?: number
  outputTokens?: number
}

/** 模型费率配置（单位：元 / 百万 tokens） */
export interface ModelPricing {
  /** 未命中缓存的输入单价 (¥/1M) */
  promptUncachedPerMillion: number
  /** 命中缓存的输入单价 (¥/1M) */
  promptCacheReadPerMillion: number
  /** 输出/生成单价 (¥/1M) */
  completionPerMillion: number
}

/** 官方标准模型定价表（CNY） */
export const PRICING_TABLE: Record<string, ModelPricing> = {
  'deepseek-chat': {
    promptUncachedPerMillion: 1.0,
    promptCacheReadPerMillion: 0.1,
    completionPerMillion: 2.0,
  },
  'deepseek-reasoner': {
    promptUncachedPerMillion: 4.0,
    promptCacheReadPerMillion: 1.0,
    completionPerMillion: 16.0,
  },
  'default': {
    promptUncachedPerMillion: 1.0,
    promptCacheReadPerMillion: 0.1,
    completionPerMillion: 2.0,
  },
}

export interface TokenCostResult {
  costCny: number
  costFormatted: string
  totalTokens: number
  uncachedCost: number
  cacheReadCost: number
  outputCost: number
  uncachedInput: number
  cacheRead: number
  outputTokens: number
  cacheHitPercent: number | null
}

export interface SessionBillingEntry {
  sessionId: string
  costCny: number
  totalTokens: number
  uncachedInput: number
  cacheRead: number
  outputTokens: number
  lastUpdated: number
}

export interface BillingLedger {
  allTimeTotalCostCny: number
  allTimeTotalTokens: number
  monthlyCostCny: number
  sessions: Record<string, SessionBillingEntry>
}

const LEDGER_STORAGE_KEY = 'dsh_billing_ledger_v2'

/** 计算 Token 使用的花费（CNY） */
export function calculateTokenCost(
  usage: TokenUsageLike | undefined,
  fallbackInput = 0,
  fallbackOutput = 0,
  fallbackCacheHit = 0.8,
  modelId = 'deepseek-chat',
): TokenCostResult {
  const pricing = PRICING_TABLE[modelId] ?? PRICING_TABLE['default'] ?? {
    promptUncachedPerMillion: 1.0,
    promptCacheReadPerMillion: 0.1,
    completionPerMillion: 2.0,
  }

  let uncachedInput = usage?.uncachedInputTokens ?? 0
  let cacheRead = usage?.cacheReadTokens ?? 0
  const cacheWrite = usage?.cacheWriteTokens ?? 0
  let output = usage?.outputTokens ?? 0

  // 若 usage 未就绪但存在 fallback 节点输入输出（如已产生的消息流）
  if (uncachedInput === 0 && cacheRead === 0 && output === 0 && (fallbackInput > 0 || fallbackOutput > 0)) {
    cacheRead = Math.round(fallbackInput * fallbackCacheHit)
    uncachedInput = fallbackInput - cacheRead
    output = fallbackOutput
  }

  const uncachedCost = ((uncachedInput + cacheWrite) / 1_000_000) * pricing.promptUncachedPerMillion
  const cacheReadCost = (cacheRead / 1_000_000) * pricing.promptCacheReadPerMillion
  const outputCost = (output / 1_000_000) * pricing.completionPerMillion
  const costCny = uncachedCost + cacheReadCost + outputCost

  const totalTokens = uncachedInput + cacheRead + cacheWrite + output
  const totalInput = uncachedInput + cacheRead + cacheWrite
  const cacheHitPercent = totalInput > 0 ? Math.round((cacheRead / totalInput) * 100) : null

  return {
    costCny,
    costFormatted: costCny >= 1 ? `¥${costCny.toFixed(2)}` : `¥${costCny.toFixed(4)}`,
    totalTokens,
    uncachedCost,
    cacheReadCost,
    outputCost,
    uncachedInput,
    cacheRead,
    outputTokens: output,
    cacheHitPercent,
  }
}

/** 读取全站历史账本数据 */
export function getBillingLedger(): BillingLedger {
  if (typeof window === 'undefined') {
    return { allTimeTotalCostCny: 0, allTimeTotalTokens: 0, monthlyCostCny: 0, sessions: {} }
  }

  try {
    const raw = localStorage.getItem(LEDGER_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as BillingLedger
      return {
        allTimeTotalCostCny: Number(parsed.allTimeTotalCostCny || 0),
        allTimeTotalTokens: Number(parsed.allTimeTotalTokens || 0),
        monthlyCostCny: Number(parsed.monthlyCostCny || 0),
        sessions: parsed.sessions || {},
      }
    }
  } catch { /* ignore */ }

  return { allTimeTotalCostCny: 0, allTimeTotalTokens: 0, monthlyCostCny: 0, sessions: {} }
}

/** 记录当前会话的 Token 用量与消费至全局账本 */
export function recordSessionCostToLedger(
  sessionId: string,
  usage: TokenUsageLike | undefined,
  fallbackCost?: number,
  modelId = 'deepseek-chat',
): BillingLedger {
  if (typeof window === 'undefined' || !sessionId) {
    return getBillingLedger()
  }

  const costRes = calculateTokenCost(usage, 0, 0, 0.85, modelId)
  const currentCost = typeof fallbackCost === 'number' && fallbackCost > costRes.costCny ? fallbackCost : costRes.costCny
  const currentTokens = costRes.totalTokens

  const ledger = getBillingLedger()
  const prevSession = ledger.sessions[sessionId]
  const prevCost = prevSession?.costCny ?? 0
  const prevTokens = prevSession?.totalTokens ?? 0

  if (currentCost > prevCost || currentTokens > prevTokens || !prevSession) {
    const deltaCost = Math.max(0, currentCost - prevCost)
    const deltaTokens = Math.max(0, currentTokens - prevTokens)

    ledger.allTimeTotalCostCny = Number((ledger.allTimeTotalCostCny + deltaCost).toFixed(4))
    ledger.allTimeTotalTokens = Math.round(ledger.allTimeTotalTokens + deltaTokens)
    ledger.monthlyCostCny = Number((ledger.monthlyCostCny + deltaCost).toFixed(4))

    ledger.sessions[sessionId] = {
      sessionId,
      costCny: Number(currentCost.toFixed(4)),
      totalTokens: currentTokens,
      uncachedInput: costRes.uncachedInput,
      cacheRead: costRes.cacheRead,
      outputTokens: costRes.outputTokens,
      lastUpdated: Date.now(),
    }

    try {
      localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledger))
      // 同时维护旧版月度存储以保持兼容
      recordSessionCostToLocal(sessionId, currentCost)
    } catch { /* ignore */ }
  }

  return ledger
}

/** 同步当月消费到本地 storage（向后兼容接口） */
export function recordSessionCostToLocal(sessionId: string, costCny: number): number {
  if (typeof window === 'undefined') return 0
  const month = new Date().toISOString().slice(0, 7)
  const storageKey = `dsh_monthly_cost_${month}`
  try {
    const raw = localStorage.getItem(storageKey)
    const store: { total: number; sessions: Record<string, number> } = raw
      ? JSON.parse(raw)
      : { total: 0, sessions: {} }
    const prevSessionCost = store.sessions[sessionId] ?? 0
    if (costCny > prevSessionCost) {
      const delta = costCny - prevSessionCost
      store.total = (store.total || 0) + delta
      store.sessions[sessionId] = costCny
      localStorage.setItem(storageKey, JSON.stringify(store))
    }
    return Number(store.total.toFixed(4))
  } catch {
    return 0
  }
}

/** 获取当月本地累计消费（向后兼容接口） */
export function getLocalMonthlyCost(): number {
  if (typeof window === 'undefined') return 0
  const month = new Date().toISOString().slice(0, 7)
  const storageKey = `dsh_monthly_cost_${month}`
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return 0
    const store = JSON.parse(raw) as { total?: number }
    return Number((store.total || 0).toFixed(4))
  } catch {
    return 0
  }
}
