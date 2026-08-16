/**
 * @module dsh-mascot-pet/client/modules/BubbleGame
 * @description 星海戳水泡 - 触感音效与连击粒子增强版
 */

import type { ReactNode } from 'react'
import { useState, useEffect, useRef } from 'react'
import { MascotSound } from '../engines/MascotSoundEngine.js'

export interface BubbleGameProps {
  onGameEnd?: (score: number) => void
}

const EMOJIS = ['🫧', '🐳', '⭐', '✨', '🐟', '💎'] as const

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  emoji: string
  points: number
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
}

export function BubbleGame({ onGameEnd }: BubbleGameProps): ReactNode {
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [popParticles, setPopParticles] = useState<Particle[]>([])
  const nextId = useRef(0)
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 倒计时
  useEffect(() => {
    if (!isPlaying) return
    if (timeLeft <= 0) {
      setIsPlaying(false)
      MascotSound.playVictory()
      onGameEnd?.(score)
      return
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isPlaying, timeLeft, score, onGameEnd])

  // 生成水泡
  useEffect(() => {
    if (!isPlaying) return
    const spawner = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length >= 7) return prev
        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)] ?? '🫧'
        const newBubble: Bubble = {
          id: ++nextId.current,
          x: Math.floor(Math.random() * 75) + 8,
          y: Math.floor(Math.random() * 65) + 12,
          size: Math.floor(Math.random() * 14) + 38,
          emoji,
          points: emoji === '💎' ? 50 : emoji === '🐳' ? 30 : 10,
        }
        return [...prev, newBubble]
      })
    }, 500)
    return () => clearInterval(spawner)
  }, [isPlaying])

  const handleStart = () => {
    setScore(0)
    setCombo(0)
    setTimeLeft(20)
    setBubbles([])
    setPopParticles([])
    setIsPlaying(true)
  }

  const handlePop = (id: number, pts: number, x: number, y: number, emoji: string) => {
    if (emoji === '💎' || emoji === '🐳') {
      MascotSound.playGemCatch()
    } else {
      MascotSound.playBubblePop(400 + combo * 40)
    }

    const currentCombo = combo + 1
    setCombo(currentCombo)
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current)
    comboTimerRef.current = setTimeout(() => setCombo(0), 1200)

    const gained = pts * (currentCombo > 3 ? 2 : 1)
    setScore((s) => s + gained)
    setBubbles((prev) => prev.filter((b) => b.id !== id))

    // Particle
    const particleId = Date.now() + Math.random()
    setPopParticles((prev) => [...prev, { id: particleId, x, y, color: emoji === '💎' ? '#38bdf8' : '#ec4899' }])
    setTimeout(() => {
      setPopParticles((prev) => prev.filter((p) => p.id !== particleId))
    }, 600)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', padding: '6px 12px', borderRadius: 8 }}>
        <span>🏆 得分: <strong style={{ color: '#38bdf8' }}>{score}</strong></span>
        {combo > 1 && (
          <span style={{ color: '#f59e0b', fontWeight: 700, animation: 'pulse 0.5s infinite' }}>
            🔥 {combo} COMBO!
          </span>
        )}
        <span>⏱️ 倒计时: <strong style={{ color: timeLeft <= 5 ? '#ef4444' : '#10b981' }}>{timeLeft}s</strong></span>
      </div>

      <div
        style={{
          position: 'relative',
          height: 230,
          background: 'radial-gradient(ellipse at bottom, #0f172a 0%, #020617 100%)',
          borderRadius: 10,
          border: '1px solid rgba(56, 189, 248, 0.3)',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {!isPlaying ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
            <span style={{ fontSize: 32 }}>🐳🫧</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', textShadow: '0 0 10px rgba(56, 189, 248, 0.5)' }}>
              星海小水泡反应大作战
            </span>
            <span style={{ fontSize: 11, color: '#94a3b8', padding: '0 16px', textAlign: 'center' }}>
              点击冒出的水泡与宝藏，20秒挑战手速极限！
            </span>
            <button
              type="button"
              onClick={handleStart}
              style={{
                marginTop: 4,
                padding: '6px 20px',
                borderRadius: 20,
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(56, 189, 248, 0.4)',
              }}
            >
              {timeLeft <= 0 ? '再玩一局 🎮' : '开始摸鱼 🎮'}
            </button>
          </div>
        ) : (
          <>
            {bubbles.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => handlePop(b.id, b.points, b.x, b.y, b.emoji)}
                style={{
                  position: 'absolute',
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: b.size,
                  height: b.size,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 0 15px rgba(56, 189, 248, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: b.size * 0.55,
                  cursor: 'pointer',
                  transform: 'translate(-50%, -50%)',
                  transition: 'transform 0.1s ease',
                }}
              >
                {b.emoji}
              </button>
            ))}
            {popParticles.map((p) => (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: 'translate(-50%, -50%)',
                  color: p.color,
                  fontSize: 18,
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                }}
              >
                ✨
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
