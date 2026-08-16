/**
 * @module dsh-mascot-pet/client/modules/NeonBreakout
 * @description 霓虹打砖块 - 基于 HTML5 Canvas 60FPS 原生物理弹球与粒子碰撞游戏
 */

import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { MascotSound } from '../engines/MascotSoundEngine.js'

export interface NeonBreakoutProps {
  onGameEnd?: (score: number) => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  alpha: number
  life: number
}

interface PowerUp {
  x: number
  y: number
  type: 'wide' | 'life'
  color: string
}

interface Brick {
  x: number
  y: number
  w: number
  h: number
  color: string
  points: number
  alive: boolean
}

export function NeonBreakout({ onGameEnd }: NeonBreakoutProps): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [victory, setVictory] = useState(false)

  // Game state stored in ref for 60FPS RAF loop
  const stateRef = useRef({
    score: 0,
    lives: 3,
    paddleX: 115,
    paddleW: 60,
    paddleH: 8,
    ballX: 145,
    ballY: 170,
    ballVx: 2.2,
    ballVy: -2.2,
    ballRadius: 4,
    bricks: [] as Brick[],
    particles: [] as Particle[],
    powerups: [] as PowerUp[],
    active: false,
    animId: 0,
  })

  const CANVAS_WIDTH = 290
  const CANVAS_HEIGHT = 200

  const initBricks = (): Brick[] => {
    const rows = 4
    const cols = 7
    const padding = 5
    const offsetTop = 25
    const offsetLeft = 10
    const w = (CANVAS_WIDTH - offsetLeft * 2 - (cols - 1) * padding) / cols
    const h = 10
    const colors = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981']
    const points = [40, 30, 20, 10]

    const list: Brick[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({
          x: offsetLeft + c * (w + padding),
          y: offsetTop + r * (h + padding),
          w,
          h,
          color: colors[r],
          points: points[r],
          alive: true,
        })
      }
    }
    return list
  }

  const startGame = () => {
    const s = stateRef.current
    s.score = 0
    s.lives = 3
    s.paddleX = 115
    s.paddleW = 60
    s.ballX = 145
    s.ballY = 160
    s.ballVx = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random())
    s.ballVy = -2.5
    s.bricks = initBricks()
    s.particles = []
    s.powerups = []
    s.active = true

    setScore(0)
    setLives(3)
    setGameOver(false)
    setVictory(false)
    setIsPlaying(true)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const loop = () => {
      const s = stateRef.current
      if (s.active) {
        // Update Ball
        s.ballX += s.ballVx
        s.ballY += s.ballVy

        // Wall collisions
        if (s.ballX - s.ballRadius < 0) {
          s.ballX = s.ballRadius
          s.ballVx = -s.ballVx
          MascotSound.playPaddleHit()
        } else if (s.ballX + s.ballRadius > CANVAS_WIDTH) {
          s.ballX = CANVAS_WIDTH - s.ballRadius
          s.ballVx = -s.ballVx
          MascotSound.playPaddleHit()
        }
        if (s.ballY - s.ballRadius < 0) {
          s.ballY = s.ballRadius
          s.ballVy = -s.ballVy
          MascotSound.playPaddleHit()
        }

        // Paddle collision
        const paddleTop = CANVAS_HEIGHT - 18
        if (
          s.ballY + s.ballRadius >= paddleTop &&
          s.ballY - s.ballRadius <= paddleTop + s.paddleH &&
          s.ballX >= s.paddleX &&
          s.ballX <= s.paddleX + s.paddleW &&
          s.ballVy > 0
        ) {
          s.ballVy = -Math.abs(s.ballVy)
          // Hit position relative to paddle center determines rebound angle
          const hitOffset = (s.ballX - (s.paddleX + s.paddleW / 2)) / (s.paddleW / 2)
          s.ballVx = hitOffset * 3.5
          MascotSound.playPaddleHit()
        }

        // Brick collision
        let remainingBricks = 0
        s.bricks.forEach((b) => {
          if (!b.alive) return
          remainingBricks++
          if (
            s.ballX + s.ballRadius > b.x &&
            s.ballX - s.ballRadius < b.x + b.w &&
            s.ballY + s.ballRadius > b.y &&
            s.ballY - s.ballRadius < b.y + b.h
          ) {
            b.alive = false
            s.ballVy = -s.ballVy
            s.score += b.points
            setScore(s.score)
            MascotSound.playBrickBreak()

            // Spawn particles
            for (let i = 0; i < 8; i++) {
              s.particles.push({
                x: b.x + b.w / 2,
                y: b.y + b.h / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: b.color,
                alpha: 1,
                life: 20,
              })
            }

            // Powerup drop chance
            if (Math.random() < 0.2) {
              s.powerups.push({
                x: b.x + b.w / 2,
                y: b.y + b.h / 2,
                type: Math.random() < 0.5 ? 'wide' : 'life',
                color: '#38bdf8',
              })
            }
          }
        })

        // Check Victory
        if (remainingBricks === 0) {
          s.active = false
          setVictory(true)
          setIsPlaying(false)
          MascotSound.playVictory()
          onGameEnd?.(s.score)
        }

        // Ball falls off screen
        if (s.ballY > CANVAS_HEIGHT) {
          s.lives -= 1
          setLives(s.lives)
          if (s.lives <= 0) {
            s.active = false
            setGameOver(true)
            setIsPlaying(false)
            MascotSound.playGameOver()
            onGameEnd?.(s.score)
          } else {
            // Reset ball to paddle
            s.ballX = s.paddleX + s.paddleW / 2
            s.ballY = paddleTop - 10
            s.ballVy = -2.5
            s.ballVx = 2
          }
        }

        // Update powerups
        s.powerups = s.powerups.filter((p) => {
          p.y += 1.2
          // Catch powerup
          if (
            p.y >= paddleTop &&
            p.y <= paddleTop + s.paddleH + 5 &&
            p.x >= s.paddleX &&
            p.x <= s.paddleX + s.paddleW
          ) {
            MascotSound.playPowerup()
            if (p.type === 'wide') {
              s.paddleW = Math.min(100, s.paddleW + 20)
              setTimeout(() => {
                s.paddleW = 60
              }, 8000)
            } else if (p.type === 'life') {
              s.lives = Math.min(5, s.lives + 1)
              setLives(s.lives)
            }
            return false
          }
          return p.y < CANVAS_HEIGHT
        })

        // Update particles
        s.particles.forEach((p) => {
          p.x += p.vx
          p.y += p.vy
          p.life -= 1
          p.alpha = Math.max(0, p.life / 20)
        })
        s.particles = s.particles.filter((p) => p.life > 0)
      }

      // Draw
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
      bgGrad.addColorStop(0, '#090d16')
      bgGrad.addColorStop(1, '#020617')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw Bricks
      s.bricks.forEach((b) => {
        if (!b.alive) return
        ctx.shadowColor = b.color
        ctx.shadowBlur = 6
        ctx.fillStyle = b.color
        ctx.beginPath()
        ctx.roundRect(b.x, b.y, b.w, b.h, 3)
        ctx.fill()
      })
      ctx.shadowBlur = 0

      // Draw Powerups
      s.powerups.forEach((p) => {
        ctx.fillStyle = p.color
        ctx.font = '12px sans-serif'
        ctx.fillText(p.type === 'wide' ? '⭐' : '❤️', p.x - 6, p.y + 6)
      })

      // Draw Particles
      s.particles.forEach((p) => {
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, 2, 2)
      })
      ctx.globalAlpha = 1.0

      // Draw Paddle
      const paddleTop = CANVAS_HEIGHT - 18
      const padGrad = ctx.createLinearGradient(s.paddleX, 0, s.paddleX + s.paddleW, 0)
      padGrad.addColorStop(0, '#38bdf8')
      padGrad.addColorStop(1, '#818cf8')
      ctx.shadowColor = '#38bdf8'
      ctx.shadowBlur = 8
      ctx.fillStyle = padGrad
      ctx.beginPath()
      ctx.roundRect(s.paddleX, paddleTop, s.paddleW, s.paddleH, 4)
      ctx.fill()
      ctx.shadowBlur = 0

      // Draw Ball
      if (s.active || !gameOver) {
        ctx.shadowColor = '#38bdf8'
        ctx.shadowBlur = 10
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(s.ballX, s.ballY, s.ballRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      s.animId = requestAnimationFrame(loop)
    }

    s_animId_init: {
      stateRef.current.animId = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(stateRef.current.animId)
    }
  }, [gameOver, onGameEnd])

  // Mouse & Touch tracking on Canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const mouseX = e.clientX - rect.left
    stateRef.current.paddleX = Math.max(0, Math.min(CANVAS_WIDTH - stateRef.current.paddleW, mouseX - stateRef.current.paddleW / 2))
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect || e.touches.length === 0) return
    const touchX = e.touches[0].clientX - rect.left
    stateRef.current.paddleX = Math.max(0, Math.min(CANVAS_WIDTH - stateRef.current.paddleW, touchX - stateRef.current.paddleW / 2))
  }

  const movePaddle = (dir: -1 | 1) => {
    stateRef.current.paddleX = Math.max(
      0,
      Math.min(CANVAS_WIDTH - stateRef.current.paddleW, stateRef.current.paddleX + dir * 25)
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span>🏆 得分: <strong style={{ color: '#38bdf8' }}>{score}</strong></span>
          <span>❤️ 生命: {'❤️'.repeat(Math.max(0, lives))}</span>
        </div>
        <button
          type="button"
          onClick={startGame}
          style={{
            padding: '4px 10px',
            fontSize: 11,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {isPlaying ? '重玩 🔄' : '开始 🚀'}
        </button>
      </div>

      {/* Canvas */}
      <div style={{ position: 'relative', width: CANVAS_WIDTH, height: CANVAS_HEIGHT, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          style={{ display: 'block', cursor: 'ew-resize' }}
        />

        {!isPlaying && !gameOver && !victory && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 28 }}>🧱✨</span>
            <div style={{ color: '#ffffff', fontWeight: 600, fontSize: 13 }}>霓虹打砖块</div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>滑动鼠标或触控挡板，击碎所有方块！</div>
            <button
              type="button"
              onClick={startGame}
              style={{
                marginTop: 6,
                padding: '6px 16px',
                borderRadius: 20,
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              开始游戏 🎮
            </button>
          </div>
        )}

        {gameOver && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 24 }}>💥</span>
            <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 14 }}>游戏结束</div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>最终得分: {score}</div>
            <button
              type="button"
              onClick={startGame}
              style={{
                marginTop: 4,
                padding: '5px 14px',
                borderRadius: 16,
                background: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              再试一次 🔄
            </button>
          </div>
        )}

        {victory && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 24 }}>🎉</span>
            <div style={{ color: '#10b981', fontWeight: 700, fontSize: 14 }}>恭喜通关！</div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>完美清屏！得分: {score}</div>
            <button
              type="button"
              onClick={startGame}
              style={{
                marginTop: 4,
                padding: '5px 14px',
                borderRadius: 16,
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              继续挑战 🚀
            </button>
          </div>
        )}
      </div>

      {/* Touch/button controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => movePaddle(-1)}
          style={{ padding: '4px 18px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', cursor: 'pointer', fontSize: 14 }}
        >
          ◀ 左移
        </button>
        <button
          type="button"
          onClick={() => movePaddle(1)}
          style={{ padding: '4px 18px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', cursor: 'pointer', fontSize: 14 }}
        >
          右移 ▶
        </button>
      </div>
    </div>
  )
}
