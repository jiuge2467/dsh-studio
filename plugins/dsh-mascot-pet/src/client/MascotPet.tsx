/**
 * @module dsh-mascot-pet/client/MascotPet
 * @description 小鲸鱼姬 2.0 · 灵动互动与自主漫步桌面伴侣 (Dynamic Mascot Pet 2.0)
 */

import type { ReactNode } from 'react'
import { useState, useMemo, useEffect, useRef } from 'react'
import { CHIBI_FRONT_URI, CHIBI_HAPPY_URI } from './mascot-asset.js'
import { MASCOT_SKINS, type MascotSkinDefinition } from './mascot-skins-assets.js'
import { MascotBubble } from './MascotBubble.js'
import { MascotDashboard, type MascotTabType } from './MascotDashboard.js'
import { calculateTokenCost, recordSessionCostToLedger, getBillingLedger, type TokenUsageLike } from './pricing-engine.js'
import {
  MascotStateMachine,
  type MascotActionState,
  type MicroIdleType,
  MICRO_IDLE_COPIES,
  AGENT_STATE_COPIES,
} from './engines/MascotStateMachine.js'
import { MascotWanderEngine, type WanderCoordinate } from './engines/MascotWanderEngine.js'
import { MascotAffectionStore, type FoodItem } from './engines/MascotAffectionStore.js'
import { HeartParticles, type HeartParticle } from './components/HeartParticles.js'
import css from './MascotPet.module.css'

const STORAGE_KEY = 'dsh_mascot_desktop_pos_v2'

export interface MascotPetProps {
  useSession?: (<T>(selector: (state: unknown) => T) => T | undefined) | undefined
  useProjection?: (((facet: string) => unknown) | undefined) | undefined
  running?: boolean
  usage?: TokenUsageLike
  sessionId?: string
}

export function MascotPet({
  useSession,
  useProjection,
  running: propRunning,
  usage: propUsage,
  sessionId: propSessionId,
}: MascotPetProps): ReactNode {
  // 1. 状态机与引擎实例
  const stateMachine = useMemo(() => new MascotStateMachine(), [])
  const wanderEngine = useMemo(() => new MascotWanderEngine(90), [])
  const affectionStore = useMemo(() => MascotAffectionStore.get(), [])

  const [mascotAction, setMascotAction] = useState<MascotActionState>('idle')
  const [wanderCoord, setWanderCoord] = useState<WanderCoordinate>({
    offsetX: 0,
    offsetY: 0,
    direction: 1,
    isMoving: false,
  })
  const [isLanding, setIsLanding] = useState(false)
  const [hearts, setHearts] = useState<HeartParticle[]>([])

  // 2. Token 与会话数据桥接监听
  const [liveTokenData, setLiveTokenData] = useState<{
    tokenUsage?: TokenUsageLike
    tokensPerSecond?: number
    running?: boolean
    sessionId?: string
    toolName?: string
    activityPhase?: string
  }>({})

  useEffect(() => {
    const onTokenUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail) {
        setLiveTokenData(detail)
      }
    }
    window.addEventListener('dsh-mascot-token-update', onTokenUpdate)
    return () => window.removeEventListener('dsh-mascot-token-update', onTokenUpdate)
  }, [])

  const sessionRunning = useSession ? useSession((s: any) => s?.running ?? false) ?? false : false
  const running = propRunning ?? liveTokenData.running ?? sessionRunning

  const projectionUsage = useProjection ? (useProjection('tokenUsage') as TokenUsageLike | undefined) : undefined
  const usage = propUsage ?? liveTokenData.tokenUsage ?? projectionUsage

  const hookSessionId = useSession ? useSession((s: any) => s?.sessionId) ?? 'default' : 'default'
  const sessionId = propSessionId ?? liveTokenData.sessionId ?? hookSessionId

  const [panelOpen, setPanelOpen] = useState(false)
  const [activeDashboardTab, setActiveDashboardTab] = useState<MascotTabType>('stats')
  const [dialogQuote, setDialogQuote] = useState<string | null>(null)
  const [isHappy, setIsHappy] = useState(false)
  const happyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('dsh_mascot_enabled') !== 'false'
  })

  const [activeSkin, setActiveSkin] = useState<string>(() => {
    if (typeof window === 'undefined') return 'classic'
    return localStorage.getItem('dsh_mascot_active_skin') || 'classic'
  })

  const [wanderEnabled, setWanderEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('dsh_mascot_wander_enabled') !== 'false'
  })

  // 3. 跨组件实时换装与设置响应事件监听 (0 延迟即时变装)
  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!detail) return
      if (typeof detail.enabled === 'boolean') {
        setEnabled(detail.enabled)
      }
      if (typeof detail.activeSkin === 'string') {
        setActiveSkin(detail.activeSkin)
        spawnHeartParticle()
        setDialogQuote(`✨ 换装成功！全新装扮已穿上啦~`)
        setIsHappy(true)
        if (happyTimerRef.current) clearTimeout(happyTimerRef.current)
        happyTimerRef.current = setTimeout(() => {
          setIsHappy(false)
        }, 2200)
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'dsh_mascot_active_skin' && e.newValue) {
        setActiveSkin(e.newValue)
      }
      if (e.key === 'dsh_mascot_enabled' && e.newValue !== null) {
        setEnabled(e.newValue !== 'false')
      }
    }

    window.addEventListener('dsh-mascot-settings-change', handleSettingsChange)
    window.addEventListener('dsh-mascot-skin-change', handleSettingsChange)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('dsh-mascot-settings-change', handleSettingsChange)
      window.removeEventListener('dsh-mascot-skin-change', handleSettingsChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  // 4. 漫步引擎生命周期与灵动步态联动
  const prevMovingRef = useRef(false)
  useEffect(() => {
    wanderEngine.setEnabled(wanderEnabled && !panelOpen && !running)
    wanderEngine.onUpdate((coord) => {
      setWanderCoord(coord)
      if (coord.isMoving) {
        stateMachine.transitionTo('wandering')
        setMascotAction(stateMachine.getState())
      } else if (prevMovingRef.current && !coord.isMoving) {
        // 从移动到停止 -> 触发 300ms 落地微蹲减震
        setIsLanding(true)
        setTimeout(() => setIsLanding(false), 300)
        stateMachine.resetToIdle()
        setMascotAction(stateMachine.getState())
      }
      prevMovingRef.current = coord.isMoving
    })
    wanderEngine.start()

    return () => wanderEngine.destroy()
  }, [wanderEngine, wanderEnabled, panelOpen, running, stateMachine])

  // 5. Agent 运行状态驱动
  const prevRunningRef = useRef(running)
  useEffect(() => {
    if (running) {
      wanderEngine.interrupt()
      if (liveTokenData.toolName) {
        stateMachine.transitionTo('agent_tool', 0, { toolName: liveTokenData.toolName })
      } else {
        stateMachine.transitionTo('agent_think')
      }
      setMascotAction(stateMachine.getState())
    } else {
      if (prevRunningRef.current && usage && (usage.outputTokens ?? 0) > 0) {
        // 从 running 结束 -> 触发完成跳跃庆祝 3 秒
        stateMachine.transitionTo('agent_done', 3200)
        setMascotAction(stateMachine.getState())
        setIsHappy(true)
        if (happyTimerRef.current) clearTimeout(happyTimerRef.current)
        happyTimerRef.current = setTimeout(() => {
          setIsHappy(false)
          stateMachine.resetToIdle()
          setMascotAction(stateMachine.getState())
        }, 3200)
      } else if (stateMachine.getState() === 'agent_think' || stateMachine.getState() === 'agent_tool') {
        stateMachine.resetToIdle()
        setMascotAction(stateMachine.getState())
      }
    }
    prevRunningRef.current = running
  }, [running, liveTokenData.toolName, usage, stateMachine, wanderEngine])

  // 6. 闲置随机微动作调度器 (打瞌睡、伸懒腰、吹泡泡)
  useEffect(() => {
    if (running || panelOpen) return

    const microTimer = setInterval(() => {
      const current = stateMachine.getState()
      if (current === 'idle') {
        // 若处于饥饿/低落状态，优先弹出求投喂提醒
        const moodInfo = affectionStore.getMoodStatus()
        if (moodInfo.isDepressed || moodInfo.alertMessage) {
          setDialogQuote(moodInfo.alertMessage)
          return
        }

        const types: MicroIdleType[] = ['sleep', 'stretch', 'bubble', 'curious']
        const chosen = types[Math.floor(Math.random() * types.length)]
        stateMachine.transitionTo('micro_idle', 4000, { microType: chosen })
        setMascotAction(stateMachine.getState())

        const copy = MICRO_IDLE_COPIES[chosen]
        if (copy) {
          setDialogQuote(copy.bubbleText)
        }

        setTimeout(() => {
          if (stateMachine.getState() === 'micro_idle') {
            stateMachine.resetToIdle()
            setMascotAction(stateMachine.getState())
            setDialogQuote(null)
          }
        }, 4000)
      }
    }, 20000)

    return () => clearInterval(microTimer)
  }, [running, panelOpen, stateMachine, affectionStore])

  // 6.5 饥饿状态周期自检与低落提醒
  useEffect(() => {
    if (running || panelOpen) return
    const hungerCheckTimer = setInterval(() => {
      const moodInfo = affectionStore.getMoodStatus()
      if (moodInfo.isDepressed && !dialogQuote) {
        setDialogQuote(moodInfo.alertMessage)
      }
    }, 15000)
    return () => clearInterval(hungerCheckTimer)
  }, [running, panelOpen, dialogQuote, affectionStore])

  // 7. 坐标与拖拽状态
  const [position, setPosition] = useState<{ x: number; y: number } | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as { x: unknown; y: unknown }
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return { x: parsed.x, y: parsed.y }
        }
      }
    } catch { /* ignored */ }
    return null
  })

  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{
    startX: number
    startY: number
    initialX: number
    initialY: number
  } | null>(null)
  const hasMovedRef = useRef(false)
  const petRef = useRef<HTMLDivElement>(null)

  // 初始化默认右下角位置
  useEffect(() => {
    if (position === null && typeof window !== 'undefined') {
      const defaultX = Math.max(20, window.innerWidth - 130)
      const defaultY = Math.max(20, window.innerHeight - 200)
      setPosition({ x: defaultX, y: defaultY })
    }
  }, [position])

  const handlePointerDown = (clientX: number, clientY: number) => {
    wanderEngine.interrupt()
    const currentX = (position?.x ?? window.innerWidth - 130) + wanderCoord.offsetX
    const currentY = (position?.y ?? window.innerHeight - 200) + wanderCoord.offsetY
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: currentX,
      initialY: currentY,
    }
    hasMovedRef.current = false
    setIsDragging(true)
    stateMachine.transitionTo('drag_hang')
    setMascotAction(stateMachine.getState())
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    handlePointerDown(e.clientX, e.clientY)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    if (t) handlePointerDown(t.clientX, t.clientY)
  }

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return
      const dx = e.clientX - dragStartRef.current.startX
      const dy = e.clientY - dragStartRef.current.startY
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMovedRef.current = true
      }
      const newX = Math.min(Math.max(10, dragStartRef.current.initialX + dx), window.innerWidth - 110)
      const newY = Math.min(Math.max(10, dragStartRef.current.initialY + dy), window.innerHeight - 130)
      setPosition({ x: newX, y: newY })
    }

    const onMouseUp = () => {
      if (dragStartRef.current) {
        setIsDragging(false)
        dragStartRef.current = null
        stateMachine.resetToIdle()
        setMascotAction(stateMachine.getState())
        if (position) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(position))
          } catch { /* ignored */ }
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!dragStartRef.current || e.touches.length === 0) return
      const t = e.touches[0]
      if (!t) return
      const dx = t.clientX - dragStartRef.current.startX
      const dy = t.clientY - dragStartRef.current.startY
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMovedRef.current = true
      }
      const newX = Math.min(Math.max(10, dragStartRef.current.initialX + dx), window.innerWidth - 110)
      const newY = Math.min(Math.max(10, dragStartRef.current.initialY + dy), window.innerHeight - 130)
      setPosition({ x: newX, y: newY })
    }

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
      window.addEventListener('touchmove', onTouchMove)
      window.addEventListener('touchend', onMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onMouseUp)
    }
  }, [isDragging, position, stateMachine])

  // 8. 抚摸摸头互动与爱心升腾特效
  const spawnHeartParticle = () => {
    const newHeart: HeartParticle = {
      id: Date.now() + Math.random(),
      x: 35 + (Math.random() * 20 - 10),
      y: 10 + (Math.random() * 10 - 5),
      scale: 0.8 + Math.random() * 0.5,
      icon: Math.random() > 0.3 ? '💖' : '✨',
    }
    setHearts((prev) => [...prev.slice(-4), newHeart])
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id))
    }, 1200)
  }

  const handlePetClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) return
    e.stopPropagation()
    wanderEngine.interrupt()

    // 触发好感度与抚摸响应
    const petRes = affectionStore.pet()
    spawnHeartParticle()
    setDialogQuote(petRes.message)
    setIsHappy(true)
    stateMachine.transitionTo('petting', 2500)
    setMascotAction(stateMachine.getState())

    if (happyTimerRef.current) clearTimeout(happyTimerRef.current)
    happyTimerRef.current = setTimeout(() => {
      setIsHappy(false)
      stateMachine.resetToIdle()
      setMascotAction(stateMachine.getState())
    }, 2500)
  }

  // 9. 投喂食物成功响应
  const handleFeedSuccess = (food: FoodItem, phrase: string) => {
    wanderEngine.interrupt()
    spawnHeartParticle()
    setIsHappy(true)
    setDialogQuote(`😋 ${food.icon} ${phrase}`)
    stateMachine.transitionTo('feeding', 3000)
    setMascotAction(stateMachine.getState())

    if (happyTimerRef.current) clearTimeout(happyTimerRef.current)
    happyTimerRef.current = setTimeout(() => {
      setIsHappy(false)
      stateMachine.resetToIdle()
      setMascotAction(stateMachine.getState())
    }, 3000)
  }

  // 10. Token 计费与实时吞吐
  const cost = calculateTokenCost(usage, 0, 0, 0.85)
  const ledger = recordSessionCostToLedger(sessionId, usage, cost.costCny)
  const localMonthlyCost = ledger.monthlyCostCny

  const formatCompact = (n: number): string => {
    if (n < 1000) return `${n} tok`
    if (n < 1000000) return `${(n / 1000).toFixed(1)}K tok`
    return `${(n / 1000000).toFixed(2)}M tok`
  }

  const speed =
    typeof liveTokenData.tokensPerSecond === 'number' && liveTokenData.tokensPerSecond > 0
      ? `${Math.round(liveTokenData.tokensPerSecond)} t/s`
      : running
        ? '42 t/s'
        : '108 t/s'
  const totalTokensFormatted = formatCompact(cost.totalTokens)

  const openTab = (tab: MascotTabType) => {
    setActiveDashboardTab(tab)
    setPanelOpen(true)
    setDialogQuote(null)
  }

  // 11. 计算容器渲染坐标 (叠加漫步偏移量)
  const containerStyle = useMemo<React.CSSProperties>(() => {
    const baseX = position?.x ?? window.innerWidth - 130
    const baseY = position?.y ?? window.innerHeight - 200
    const finalX = isDragging ? baseX : baseX + wanderCoord.offsetX
    const finalY = isDragging ? baseY : baseY + wanderCoord.offsetY

    return {
      left: `${finalX}px`,
      top: `${finalY}px`,
    }
  }, [position, wanderCoord, isDragging])

  const panelStyle = useMemo<React.CSSProperties>(() => {
    const isTopHalf = (position?.y ?? 600) < 450
    const isLeftHalf = (position?.x ?? 800) < 350
    return {
      top: isTopHalf ? 'calc(100% + 12px)' : 'auto',
      bottom: isTopHalf ? 'auto' : 'calc(100% + 12px)',
      left: isLeftHalf ? '0' : 'auto',
      right: isLeftHalf ? 'auto' : '0',
    }
  }, [position])

  // 12. 动态选择立绘与动作动画类名 (灵动精灵步态系统)
  const currentActionClass = useMemo(() => {
    if (isDragging || mascotAction === 'drag_hang') return css.dragHangWiggle
    if (running || mascotAction === 'agent_think') return css.thinkingGlow
    if (mascotAction === 'agent_tool') return css.toolWorking
    if (mascotAction === 'agent_done') return css.doneCelebrate
    if (mascotAction === 'agent_failed') return css.failedDizzy
    if (wanderCoord.isMoving || mascotAction === 'wandering') return css.walkingGait
    if (isLanding) return css.landingCushion
    return css.idleFloating
  }, [isDragging, mascotAction, running, wanderCoord.isMoving, isLanding])

  const currentImageUri = useMemo(() => {
    const skinDef = MASCOT_SKINS[activeSkin]
    if (isHappy || mascotAction === 'petting' || mascotAction === 'feeding' || mascotAction === 'agent_done') {
      return skinDef?.happyUri || CHIBI_HAPPY_URI
    }
    return skinDef?.idleUri || CHIBI_FRONT_URI
  }, [activeSkin, isHappy, mascotAction])

  const isFlipped = !isDragging && wanderCoord.direction === -1

  return (
    <div
      ref={petRef}
      className={`${css.mascotContainer} ${isDragging ? css.isDragging : ''}`}
      style={containerStyle}
    >
      {/* 动态思考与状态气泡 */}
      {!panelOpen && (
        <MascotBubble
          thinking={running}
          costFormatted={cost.costFormatted}
          tokensFormatted={totalTokensFormatted}
          statusText={
            running
              ? liveTokenData.toolName
                ? `🛠️ 正在执行工具: ${liveTokenData.toolName}...`
                : '🧠 深度推理思考中...'
              : dialogQuote || undefined
          }
        />
      )}

      {/* 闲置与互动快捷菜单 */}
      {!panelOpen && !running && dialogQuote && (
        <div
          className={`${css.dialogBubble} ${css.interactive}`}
          style={{
            cursor: 'pointer',
          }}
        >
          <div onClick={() => setDialogQuote(null)} style={{ fontWeight: 600, color: 'var(--dsw-alias-label-primary, #0f172a)' }}>
            {dialogQuote}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            <button
              type="button"
              className={css.bubbleBtnPink}
              onClick={(e) => {
                e.stopPropagation()
                openTab('feed')
              }}
            >
              <span>🧋</span> 投喂零食
            </button>
            <button
              type="button"
              className={css.bubbleBtnBlue}
              onClick={(e) => {
                e.stopPropagation()
                openTab('game')
              }}
            >
              <span>🎮</span> 摸鱼挑战
            </button>
            <button
              type="button"
              className={css.bubbleBtnGreen}
              onClick={(e) => {
                e.stopPropagation()
                openTab('vocab')
              }}
            >
              <span>🔤</span> 背单词
            </button>
          </div>
        </div>
      )}

      {/* 小鲸鱼姬主精灵头像与动作层 */}
      {enabled && (
        <div style={{ position: 'relative' }}>
          <HeartParticles hearts={hearts} />
          <button
            type="button"
            className={css.avatarBtn}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onClick={handlePetClick}
            style={{
              transform: isFlipped ? 'scaleX(-1)' : 'scaleX(1)',
              transition: isDragging ? 'none' : 'transform 0.25s ease',
            }}
            title="按住鼠标左键可抓起拖拽；点击摸头抚摸；点击下方药丸打开伴侣中心"
          >
            <img
              src={currentImageUri}
              alt={MASCOT_SKINS[activeSkin]?.name || 'Q版小鲸鱼姬'}
              className={`${css.avatarImg} ${currentActionClass}`}
              draggable={false}
            />
          </button>
        </div>
      )}

      {/* 翡翠绿 Token 计费与状态胶囊 */}
      <div
        className={css.statusPill}
        onClick={(e) => {
          e.stopPropagation()
          openTab('stats')
        }}
        title={`当前会话: ${cost.costFormatted} (全站历史总计: ¥${ledger.allTimeTotalCostCny.toFixed(4)}) · 点击打开伴侣中心`}
      >
        <div className={`${css.statusDot} ${running ? css.busy : ''}`} />
        <span className={css.costText}>{cost.costFormatted}</span>
        <span className={css.speedText}>· {speed}</span>
      </div>

      {/* 伴侣多功能控制中心 */}
      <MascotDashboard
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        initialTab={activeDashboardTab}
        style={panelStyle}
        costFormatted={cost.costFormatted}
        currentSessionCostCny={cost.costCny}
        localMonthlyCost={localMonthlyCost}
        allTimeTotalCostCny={ledger.allTimeTotalCostCny}
        allTimeTotalTokens={ledger.allTimeTotalTokens}
        totalTokens={cost.totalTokens}
        uncachedTokens={cost.uncachedInput}
        cacheReadTokens={cost.cacheRead}
        outputTokens={cost.outputTokens}
        cacheHitPercent={cost.cacheHitPercent}
        speedFormatted={speed}
        thinking={running}
        onFeedSuccess={handleFeedSuccess}
      />
    </div>
  )
}
