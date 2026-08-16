import { describe, it, expect, beforeEach } from 'vitest'
import {
  calculateTokenCost,
  recordSessionCostToLocal,
  getLocalMonthlyCost,
  recordSessionCostToLedger,
  getBillingLedger,
  PRICING_TABLE,
} from '../src/client/pricing-engine.js'

describe('pricing-engine', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should calculate cost accurately based on standard pricing table', () => {
    const res = calculateTokenCost(
      {
        uncachedInputTokens: 1_000_000,
        cacheReadTokens: 1_000_000,
        cacheWriteTokens: 0,
        outputTokens: 1_000_000,
      },
      0,
      0,
      0,
      'deepseek-chat'
    )

    // deepseek-chat: 1M uncached (1.0) + 1M cached (0.1) + 1M output (2.0) = 3.1 CNY
    expect(res.costCny).toBeCloseTo(3.1, 4)
    expect(res.costFormatted).toBe('¥3.10')
    expect(res.totalTokens).toBe(3_000_000)
    expect(res.cacheHitPercent).toBe(50)
  })

  it('should fallback properly when usage is empty', () => {
    const res = calculateTokenCost(undefined, 1000, 500, 0.8)
    expect(res.totalTokens).toBe(1500)
    expect(res.uncachedInput).toBe(200)
    expect(res.cacheRead).toBe(800)
    expect(res.outputTokens).toBe(500)
  })

  it('should record session cost to local storage', () => {
    const total1 = recordSessionCostToLocal('sess-1', 0.5)
    expect(total1).toBe(0.5)

    const total2 = recordSessionCostToLocal('sess-2', 0.3)
    expect(total2).toBe(0.8)

    // 更新 sess-1 费用增长
    const total3 = recordSessionCostToLocal('sess-1', 0.7)
    expect(total3).toBe(1.0)

    expect(getLocalMonthlyCost()).toBe(1.0)
  })

  it('should manage all-time ledger with multiple sessions accurately', () => {
    // 1. 记录会话 1
    const ledger1 = recordSessionCostToLedger('session-alpha', {
      uncachedInputTokens: 500_000,
      cacheReadTokens: 500_000,
      outputTokens: 100_000,
    })
    // 0.5M uncached (0.50) + 0.5M cached (0.05) + 0.1M output (0.20) = 0.75 CNY, totalTokens = 1.1M
    expect(ledger1.allTimeTotalCostCny).toBeCloseTo(0.75, 4)
    expect(ledger1.allTimeTotalTokens).toBe(1_100_000)
    expect(ledger1.sessions['session-alpha'].costCny).toBeCloseTo(0.75, 4)

    // 2. 记录会话 2（全站累计应增加）
    const ledger2 = recordSessionCostToLedger('session-beta', {
      uncachedInputTokens: 100_000,
      cacheReadTokens: 0,
      outputTokens: 50_000,
    })
    // 0.1M uncached (0.10) + 0.05M output (0.10) = 0.20 CNY, totalTokens = 150_000
    // Total cost = 0.75 + 0.20 = 0.95 CNY
    expect(ledger2.allTimeTotalCostCny).toBeCloseTo(0.95, 4)
    expect(ledger2.allTimeTotalTokens).toBe(1_250_000)
    expect(ledger2.sessions['session-beta'].costCny).toBeCloseTo(0.20, 4)

    // 3. 会话 1 继续产生消耗（只增加增量）
    const ledger3 = recordSessionCostToLedger('session-alpha', {
      uncachedInputTokens: 600_000,
      cacheReadTokens: 500_000,
      outputTokens: 100_000,
    })
    // 会话 1 增加了 0.1M uncached (0.10 CNY)
    expect(ledger3.allTimeTotalCostCny).toBeCloseTo(1.05, 4)
    expect(ledger3.allTimeTotalTokens).toBe(1_350_000)

    // 4. 验证 getBillingLedger() 获取持久化数据一致
    const stored = getBillingLedger()
    expect(stored.allTimeTotalCostCny).toBeCloseTo(1.05, 4)
    expect(stored.allTimeTotalTokens).toBe(1_350_000)
    expect(Object.keys(stored.sessions)).toHaveLength(2)
  })
})
