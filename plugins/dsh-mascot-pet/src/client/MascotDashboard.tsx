/**
 * @module dsh-mascot-pet/client/MascotDashboard
 * @description 小鲸鱼姬程序员多功能桌面伴侣与摸鱼中心面板（支持全站历史累计总账本与单会话双重视图）
 */
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { VocabGame } from './modules/VocabGame.js'
import { GameCenter } from './modules/GameCenter.js'
import { FoodWheel } from './modules/FoodWheel.js'
import { JokeTeller } from './modules/JokeTeller.js'
import { FeedingCenter } from './modules/FeedingCenter.js'
import type { FoodItem } from './engines/MascotAffectionStore.js'
import { getBillingLedger } from './pricing-engine.js'
import css from './MascotPet.module.css'

export type MascotTabType = 'stats' | 'feed' | 'vocab' | 'game' | 'food' | 'joke'

export interface MascotDashboardProps {
  open: boolean
  onClose: () => void
  initialTab?: MascotTabType
  style?: React.CSSProperties
  costFormatted: string
  currentSessionCostCny: number
  localMonthlyCost?: number
  allTimeTotalCostCny?: number
  allTimeTotalTokens?: number
  totalTokens: number
  uncachedTokens: number
  cacheReadTokens: number
  outputTokens: number
  cacheHitPercent: number | null
  speedFormatted: string
  thinking: boolean
  onFeedSuccess?: (food: FoodItem, phrase: string) => void
}

export function MascotDashboard({
  open,
  onClose,
  initialTab,
  style,
  costFormatted,
  currentSessionCostCny,
  localMonthlyCost = 0,
  allTimeTotalCostCny: propAllTimeCost,
  allTimeTotalTokens: propAllTimeTokens,
  totalTokens,
  uncachedTokens,
  cacheReadTokens,
  outputTokens,
  cacheHitPercent,
  speedFormatted,
  thinking,
  onFeedSuccess,
}: MascotDashboardProps): ReactNode {
  const [activeTab, setActiveTab] = useState<MascotTabType>(initialTab ?? 'stats')
  const [monthly, setMonthly] = useState({
    totalCostCny: 0,
    maxBudgetCny: 100,
    overBudget: false,
  })

  // 本地账本数据
  const [ledger, setLedger] = useState(() => getBillingLedger())

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab, open])

  useEffect(() => {
    if (!open) return
    setLedger(getBillingLedger())

    const load = async () => {
      try {
        const res = await fetch('/api/studio/cost')
        if (res.ok) {
          const json = (await res.json()) as typeof monthly
          setMonthly(json)
        }
      } catch {
        /* ignored */
      }
    }
    void load()
  }, [open])

  if (!open) return null

  // 保证当前会话的花费无论何时都实时计入全站与当月消耗
  const displayAllTimeCost = Math.max(ledger.allTimeTotalCostCny, propAllTimeCost ?? 0, currentSessionCostCny)
  const displayAllTimeTokens = Math.max(ledger.allTimeTotalTokens, propAllTimeTokens ?? 0, totalTokens)
  const displayMonthlyCost = Math.max(monthly.totalCostCny, ledger.monthlyCostCny, localMonthlyCost, currentSessionCostCny)
  const budget = monthly.maxBudgetCny > 0 ? monthly.maxBudgetCny : 100
  const pct = Math.min(100, (displayMonthlyCost / budget) * 100)
  const isOver = displayMonthlyCost >= budget
  const barColor = isOver
    ? 'var(--dsw-alias-state-danger-primary, #EF4444)'
    : pct > 80
      ? 'var(--dsw-alias-state-warning-primary, #F59E0B)'
      : 'var(--dsw-alias-state-success-primary, #22C55E)'

  const tabs: { id: MascotTabType; label: string }[] = [
    { id: 'stats', label: '用量账单' },
    { id: 'feed', label: '零食投喂' },
    { id: 'vocab', label: '背单词' },
    { id: 'game', label: '摸鱼挑战' },
    { id: 'food', label: '美食转盘' },
    { id: 'joke', label: '极客段子' },
  ]

  const formatTokensCompact = (n: number): string => {
    if (n < 1000) return `${n} tok`
    if (n < 1000000) return `${(n / 1000).toFixed(1)}K tok`
    return `${(n / 1000000).toFixed(2)}M tok`
  }

  return (
    <div className={`${css.dashboardPanel} ${css.interactive}`} style={{ width: 340, maxHeight: 'min(560px, 88vh)', ...style }}>
      {/* 头部 */}
      <div className={css.panelHeader}>
        <div className={css.panelTitleGroup}>
          <span className={css.panelTitle}>DeepSeek 小鲸鱼姬</span>
          <span className={css.panelBadge}>{thinking ? '深度思考中' : '伴侣已就绪'}</span>
        </div>
        <button type="button" className={css.closeBtn} aria-label="关闭面板" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
          </svg>
        </button>
      </div>

      {/* Tab 栏 */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '4px 0 8px',
          borderBottom: '1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.08))',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '5px 8px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: activeTab === tab.id ? 600 : 500,
              color: activeTab === tab.id ? '#ffffff' : 'var(--dsw-alias-label-secondary, #a1a1aa)',
              background:
                activeTab === tab.id
                  ? 'var(--dsw-alias-brand-primary, #3964FE)'
                  : 'var(--dsw-alias-bg-module-edge, rgba(0, 0, 0, 0.04))',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 滚动内容区 */}
      <div className={css.panelBody}>
        {activeTab === 'stats' && (
          <div className={css.statsGroup}>
            {/* 核心指标 2 列网格：当前会话 vs 全站历史总累计 */}
            <div className={css.metricGrid}>
              <div className={css.metricCard}>
                <div className={css.metricLabel}>当前会话预估消费</div>
                <div className={css.metricValue} style={{ color: '#10b981' }}>
                  {costFormatted}
                </div>
                <div style={{ fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #979DA6)', marginTop: 2 }}>
                  本会话: {formatTokensCompact(totalTokens)}
                </div>
              </div>
              <div className={css.metricCard}>
                <div className={css.metricLabel}>全站历史累计总计费</div>
                <div className={css.metricValue} style={{ color: '#8b5cf6' }}>
                  ¥{displayAllTimeCost.toFixed(4)}
                </div>
                <div style={{ fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #979DA6)', marginTop: 2 }}>
                  总吞吐: {formatTokensCompact(displayAllTimeTokens)}
                </div>
              </div>
            </div>

            {/* 实时速率与缓存 */}
            <div className={css.metricGrid}>
              <div className={css.metricCard}>
                <div className={css.metricLabel}>实时生成吞吐 (TPS)</div>
                <div className={css.metricValue} style={{ color: '#38bdf8' }}>
                  {speedFormatted}
                </div>
              </div>
              <div className={css.metricCard}>
                <div className={css.metricLabel}>缓存命中率</div>
                <div className={css.metricValue} style={{ color: '#f59e0b' }}>
                  {cacheHitPercent !== null ? `${cacheHitPercent}%` : '0%'}
                </div>
              </div>
            </div>

            {/* 缓存命中率进度 */}
            <div className={css.cacheCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={css.metricLabel}>上下文缓存命中率</span>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{cacheHitPercent !== null ? `${cacheHitPercent}%` : '0%'}</span>
              </div>
              <div className={css.cacheTrack}>
                <div className={css.cacheFill} style={{ width: `${cacheHitPercent ?? 0}%` }} />
              </div>
            </div>

            {/* Token 细分明细 */}
            <div className={css.tokenBreakdown}>
              <span>总 Token: {totalTokens.toLocaleString()}</span>
              <span>未命中: {uncachedTokens.toLocaleString()}</span>
              <span>缓存读: {cacheReadTokens.toLocaleString()}</span>
              <span>输出: {outputTokens.toLocaleString()}</span>
            </div>

            {/* 当月预算进度 */}
            <div className={css.budgetSection}>
              <div className={css.budgetHeader}>
                <span style={{ color: 'var(--dsw-alias-label-secondary, #ADB2B8)' }}>当月累计预算</span>
                <span style={{ fontWeight: 600 }}>
                  ¥{displayMonthlyCost.toFixed(4)}
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--dsw-alias-label-tertiary, #979DA6)',
                      fontWeight: 400,
                      marginLeft: '4px',
                    }}
                  >
                    / ¥{budget}
                  </span>
                </span>
              </div>
              <div className={css.budgetTrack}>
                <div className={css.budgetBar} style={{ width: `${pct}%`, background: barColor }} />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'feed' && <FeedingCenter onFeedSuccess={onFeedSuccess} />}
        {activeTab === 'vocab' && <VocabGame />}
        {activeTab === 'game' && <GameCenter />}
        {activeTab === 'food' && <FoodWheel />}
        {activeTab === 'joke' && <JokeTeller />}
      </div>
    </div>
  )
}
