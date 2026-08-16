/**
 * @module dsh-mascot-pet/client/modules/GameCenter
 * @description 摸鱼游戏中心：聚合 戳水泡、2048 极光、霓虹打砖块，并支持音效控制与好感度结算
 */

import type { ReactNode } from 'react'
import { useState } from 'react'
import { BubbleGame } from './BubbleGame.js'
import { Aurora2048 } from './Aurora2048.js'
import { NeonBreakout } from './NeonBreakout.js'
import { MascotSound } from '../engines/MascotSoundEngine.js'
import { MascotAffectionStore } from '../engines/MascotAffectionStore.js'

export function GameCenter(): ReactNode {
  const [activeGame, setActiveGame] = useState<'bubble' | '2048' | 'breakout'>('bubble')
  const [muted, setMuted] = useState<boolean>(() => MascotSound.isMuted())
  const [rewardMsg, setRewardMsg] = useState<string | null>(null)

  const toggleSound = () => {
    const nextMuted = MascotSound.toggleMute()
    setMuted(nextMuted)
  }

  const handleGameEnd = (score: number, type: 'bubble' | '2048' | 'breakout') => {
    if (score <= 0) return
    const res = MascotAffectionStore.get().rewardGameScore(type, score)
    setRewardMsg(`💖 ${res.message} (当前Lv.${res.newLevel})`)
    setTimeout(() => {
      setRewardMsg(null)
    }, 4000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* 顶部子栏目与音效开关 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ display: 'flex', gap: 4, flex: 1, background: 'rgba(0,0,0,0.25)', padding: 3, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setActiveGame('bubble')}
            style={{
              flex: 1,
              padding: '4px 6px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 6,
              background: activeGame === 'bubble' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              border: activeGame === 'bubble' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              color: activeGame === 'bubble' ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🫧 戳水泡
          </button>
          <button
            type="button"
            onClick={() => setActiveGame('2048')}
            style={{
              flex: 1,
              padding: '4px 6px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 6,
              background: activeGame === '2048' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              border: activeGame === '2048' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              color: activeGame === '2048' ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🔢 2048 极光
          </button>
          <button
            type="button"
            onClick={() => setActiveGame('breakout')}
            style={{
              flex: 1,
              padding: '4px 6px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 6,
              background: activeGame === 'breakout' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              border: activeGame === 'breakout' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              color: activeGame === 'breakout' ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🧱 霓虹打砖块
          </button>
        </div>

        <button
          type="button"
          onClick={toggleSound}
          title={muted ? '开启游戏音效' : '静音'}
          style={{
            padding: '4px 8px',
            fontSize: 12,
            borderRadius: 6,
            background: muted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: muted ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            color: muted ? '#f87171' : '#34d399',
            cursor: 'pointer',
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* 好感度结算奖励提示条 */}
      {rewardMsg && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(59,130,246,0.2))',
            border: '1px solid rgba(236,72,153,0.4)',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 11,
            fontWeight: 600,
            color: '#f472b6',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {rewardMsg}
        </div>
      )}

      {/* 激活游戏视图 */}
      {activeGame === 'bubble' && <BubbleGame onGameEnd={(score) => handleGameEnd(score, 'bubble')} />}
      {activeGame === '2048' && <Aurora2048 onGameEnd={(score) => handleGameEnd(score, '2048')} />}
      {activeGame === 'breakout' && <NeonBreakout onGameEnd={(score) => handleGameEnd(score, 'breakout')} />}
    </div>
  )
}
