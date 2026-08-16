/**
 * @module dsh-mascot-pet/client/modules/FeedingCenter
 * @description 零食投喂互动与好感度亲密度成长中心（支持动态 CD 倒计时、饱腹度预警与进食动画）
 */

import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import {
  MascotAffectionStore,
  MASCOT_FOODS,
  type FoodItem,
  type MascotProfileState,
} from '../engines/MascotAffectionStore.js'

export interface FeedingCenterProps {
  onFeedSuccess?: (food: FoodItem, phrase: string) => void
}

export function FeedingCenter({ onFeedSuccess }: FeedingCenterProps): ReactNode {
  const store = MascotAffectionStore.get()
  const [profile, setProfile] = useState<MascotProfileState>(() => store.getState())
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const [isErrorMsg, setIsErrorMsg] = useState(false)
  const [eatingFoodId, setEatingFoodId] = useState<string | null>(null)
  const [nowTime, setNowTime] = useState(() => Date.now())

  // 定时刷新倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now())
      setProfile(store.getState())
    }, 1000)
    return () => clearInterval(timer)
  }, [store])

  const handleFeed = (food: FoodItem) => {
    const res = store.feed(food.id)
    setProfile(store.getState())

    if (res.ok) {
      setIsErrorMsg(false)
      setEatingFoodId(food.id)
      setLastMessage(`🎉 ${res.message}`)
      if (onFeedSuccess) {
        onFeedSuccess(food, res.message)
      }
      setTimeout(() => {
        setEatingFoodId(null)
      }, 1200)
    } else {
      setIsErrorMsg(true)
      setLastMessage(res.message)
    }
  }

  const hungerPercent = profile.hunger
  const affectionPercent = Math.min(100, Math.round((profile.affection / 1000) * 100))
  const moodStatus = store.getMoodStatus()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
      {/* 亲密度与饱腹感成长卡片 */}
      <div
        style={{
          background: 'var(--dsw-alias-bg-hover, rgba(0,0,0,0.04))',
          borderRadius: 10,
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          border: '1px solid var(--dsw-alias-border-subtle, rgba(255,255,255,0.08))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>💖</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>好感度 Lv.{profile.level}</span>
            <span
              style={{
                fontSize: 11,
                padding: '1px 6px',
                borderRadius: 99,
                background: 'rgba(236, 72, 153, 0.15)',
                color: '#ec4899',
                fontWeight: 600,
              }}
            >
              {profile.title}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--dsw-alias-text-secondary, #888)' }}>
            {profile.affection}/1000
          </span>
        </div>

        {/* 好感度进度条 */}
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: 'var(--dsw-alias-border-subtle, rgba(0,0,0,0.1))',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${affectionPercent}%`,
              background: 'linear-gradient(90deg, #f472b6, #ec4899)',
              borderRadius: 3,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* 饱腹感状态 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>🍔</span>
            <span style={{ fontSize: 12, color: 'var(--dsw-alias-text-secondary, #888)' }}>饱腹感</span>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: hungerPercent < 30 ? '#ef4444' : hungerPercent >= 100 ? '#38bdf8' : '#10b981',
            }}
          >
            {hungerPercent}%{' '}
            {hungerPercent < 20
              ? '(快饿扁啦 🌧️)'
              : hungerPercent < 30
                ? '(肚子咕咕叫)'
                : hungerPercent >= 100
                  ? '(饱饱哒 ✨)'
                  : '(活力充沛)'}
          </span>
        </div>
      </div>

      {/* 饥饿低落警报条 */}
      {moodStatus.isDepressed && (
        <div
          style={{
            fontSize: 11,
            padding: '6px 10px',
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>🌧️</span>
          <span>{moodStatus.alertMessage}</span>
        </div>
      )}

      {/* 投喂提示语 */}
      {lastMessage && (
        <div
          style={{
            fontSize: 12,
            padding: '6px 10px',
            borderRadius: 8,
            background: isErrorMsg ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            color: isErrorMsg ? '#ef4444' : '#10b981',
            border: isErrorMsg ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {lastMessage}
        </div>
      )}

      {/* 美食投喂选择网格 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {MASCOT_FOODS.map((food) => {
          const status = store.getFoodStatus(food.id)
          const isEating = eatingFoodId === food.id
          const isFull = hungerPercent >= 100
          const disabled = status.isCooling || isEating || isFull

          return (
            <button
              key={food.id}
              onClick={() => handleFeed(food)}
              disabled={disabled}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 8,
                border: status.isCooling
                  ? '1px dashed var(--dsw-alias-border-subtle, rgba(255,255,255,0.1))'
                  : '1px solid var(--dsw-alias-border-subtle, rgba(255,255,255,0.08))',
                background: isEating
                  ? 'rgba(236, 72, 153, 0.2)'
                  : status.isCooling
                    ? 'rgba(0, 0, 0, 0.08)'
                    : 'var(--dsw-alias-bg-surface, rgba(255,255,255,0.04))',
                cursor: disabled ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                opacity: disabled && !isEating ? 0.65 : 1,
                transition: 'all 0.15s ease',
                transform: isEating ? 'scale(0.96)' : 'none',
              }}
              title={
                status.isCooling
                  ? `冷却中：还需 ${status.remainingSeconds} 秒`
                  : isFull
                    ? '饱腹感已满 100%'
                    : `投喂 ${food.name} (基础 CD: ${food.baseCdSeconds}s)`
              }
            >
              <span style={{ fontSize: 24, filter: status.isCooling ? 'grayscale(0.5)' : 'none' }}>{food.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-text-primary, #fff)' }}>
                    {food.name}
                  </span>
                  {status.isCooling && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#f59e0b',
                        background: 'rgba(245, 158, 11, 0.15)',
                        padding: '1px 4px',
                        borderRadius: 4,
                      }}
                    >
                      ⏳ {status.remainingSeconds}s
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 10, color: 'var(--dsw-alias-text-secondary, #888)', marginTop: 2 }}>
                  饱+{food.hungerBonus} · 好+{food.affectionBonus}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
