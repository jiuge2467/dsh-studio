/**
 * @module dsh-mascot-pet/client/modules/Aurora2048
 * @description 2048 极光版 - 原生 React 高性能霓虹主题小游戏
 */

import type { ReactNode } from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { MascotSound } from '../engines/MascotSoundEngine.js'

export interface Aurora2048Props {
  onGameEnd?: (score: number) => void
}

type Board = number[][]

const SIZE = 4
const BEST_SCORE_KEY = 'dsh_mascot_2048_best'

function getEmptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function addRandomTile(board: Board): { board: Board; added: boolean } {
  const emptyCells: [number, number][] = []
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) emptyCells.push([r, c])
    }
  }
  if (emptyCells.length === 0) return { board, added: false }

  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  const newBoard = board.map(r => [...r])
  newBoard[row][col] = Math.random() < 0.9 ? 2 : 4
  return { board: newBoard, added: true }
}

function slideRow(row: number[]): { newRow: number[]; scoreGained: number; mergedValues: number[] } {
  const filtered = row.filter(v => v !== 0)
  const newRow: number[] = []
  let scoreGained = 0
  const mergedValues: number[] = []

  let skip = false
  for (let i = 0; i < filtered.length; i++) {
    if (skip) {
      skip = false
      continue
    }
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      const mergedVal = filtered[i] * 2
      newRow.push(mergedVal)
      scoreGained += mergedVal
      mergedValues.push(mergedVal)
      skip = true
    } else {
      newRow.push(filtered[i])
    }
  }

  while (newRow.length < SIZE) {
    newRow.push(0)
  }

  return { newRow, scoreGained, mergedValues }
}

function rotateLeft(board: Board): Board {
  const res = getEmptyBoard()
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      res[SIZE - 1 - c][r] = board[r][c]
    }
  }
  return res
}

function rotateRight(board: Board): Board {
  const res = getEmptyBoard()
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      res[c][SIZE - 1 - r] = board[r][c]
    }
  }
  return res
}

function move(board: Board, direction: 'left' | 'right' | 'up' | 'down'): {
  board: Board
  scoreGained: number
  mergedValues: number[]
  changed: boolean
} {
  let rotated = board
  let rotations = 0

  if (direction === 'up') {
    rotated = rotateLeft(board)
    rotations = 1
  } else if (direction === 'right') {
    rotated = rotateLeft(rotateLeft(board))
    rotations = 2
  } else if (direction === 'down') {
    rotated = rotateRight(board)
    rotations = 3
  }

  let totalScoreGained = 0
  const allMergedValues: number[] = []
  const newRotated: Board = []

  for (let r = 0; r < SIZE; r++) {
    const { newRow, scoreGained, mergedValues } = slideRow(rotated[r])
    newRotated.push(newRow)
    totalScoreGained += scoreGained
    allMergedValues.push(...mergedValues)
  }

  let finalBoard = newRotated
  if (rotations === 1) {
    finalBoard = rotateRight(newRotated)
  } else if (rotations === 2) {
    finalBoard = rotateRight(rotateRight(newRotated))
  } else if (rotations === 3) {
    finalBoard = rotateLeft(newRotated)
  }

  let changed = false
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== finalBoard[r][c]) {
        changed = true
        break
      }
    }
  }

  return { board: finalBoard, scoreGained: totalScoreGained, mergedValues: allMergedValues, changed }
}

function checkGameOver(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return false
      if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return false
      if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return false
    }
  }
  return true
}

const TILE_STYLES: Record<number, { bg: string; color: string; shadow?: string; font?: string }> = {
  0: { bg: 'rgba(255, 255, 255, 0.04)', color: 'transparent' },
  2: { bg: 'rgba(30, 41, 59, 0.85)', color: '#94a3b8' },
  4: { bg: 'rgba(2, 132, 199, 0.45)', color: '#38bdf8' },
  8: { bg: 'rgba(14, 165, 233, 0.65)', color: '#e0f2fe', shadow: '0 0 10px rgba(14,165,233,0.5)' },
  16: { bg: 'rgba(16, 185, 129, 0.7)', color: '#ecfdf5', shadow: '0 0 12px rgba(16,185,129,0.6)' },
  32: { bg: 'rgba(245, 158, 11, 0.8)', color: '#fffbeb', shadow: '0 0 14px rgba(245,158,11,0.6)' },
  64: { bg: 'rgba(249, 115, 22, 0.85)', color: '#fff7ed', shadow: '0 0 16px rgba(249,115,22,0.7)' },
  128: { bg: 'rgba(239, 68, 68, 0.9)', color: '#fef2f2', shadow: '0 0 18px rgba(239,68,68,0.7)', font: '13px' },
  256: { bg: 'rgba(236, 72, 153, 0.9)', color: '#fdf2f8', shadow: '0 0 20px rgba(236,72,153,0.8)', font: '13px' },
  512: { bg: 'rgba(139, 92, 246, 0.95)', color: '#faf5ff', shadow: '0 0 22px rgba(139,92,246,0.8)', font: '13px' },
  1024: { bg: 'rgba(99, 102, 241, 0.95)', color: '#eef2ff', shadow: '0 0 24px rgba(99,102,241,0.9)', font: '11px' },
  2048: { bg: 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)', color: '#ffffff', shadow: '0 0 28px rgba(236,72,153,1)', font: '11px' },
}

export function Aurora2048({ onGameEnd }: Aurora2048Props): ReactNode {
  const [board, setBoard] = useState<Board>(() => {
    let b = getEmptyBoard()
    b = addRandomTile(b).board
    b = addRandomTile(b).board
    return b
  })

  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(() => {
    if (typeof window === 'undefined') return 0
    return parseInt(localStorage.getItem(BEST_SCORE_KEY) || '0', 10)
  })
  const [prevSnapshot, setPrevSnapshot] = useState<{ board: Board; score: number } | null>(null)
  const [isOver, setIsOver] = useState(false)
  const [won, setWon] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleMove = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    if (isOver) return

    setBoard((currBoard) => {
      const { board: nextBoard, scoreGained, mergedValues, changed } = move(currBoard, dir)
      if (!changed) return currBoard

      setPrevSnapshot({ board: currBoard, score })
      const newScore = score + scoreGained
      setScore(newScore)

      if (newScore > bestScore) {
        setBestScore(newScore)
        if (typeof window !== 'undefined') {
          localStorage.setItem(BEST_SCORE_KEY, String(newScore))
        }
      }

      if (mergedValues.length > 0) {
        MascotSound.play2048Merge(Math.max(...mergedValues))
      } else {
        MascotSound.play2048Slide()
      }

      if (!won && mergedValues.includes(2048)) {
        setWon(true)
        MascotSound.playVictory()
      }

      const withRandom = addRandomTile(nextBoard).board

      if (checkGameOver(withRandom)) {
        setIsOver(true)
        MascotSound.playGameOver()
        onGameEnd?.(newScore)
      }

      return withRandom
    })
  }, [isOver, score, bestScore, won, onGameEnd])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault()
        handleMove('up')
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault()
        handleMove('down')
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault()
        handleMove('left')
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault()
        handleMove('right')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleMove])

  const handleRestart = () => {
    let b = getEmptyBoard()
    b = addRandomTile(b).board
    b = addRandomTile(b).board
    setBoard(b)
    setScore(0)
    setPrevSnapshot(null)
    setIsOver(false)
    setWon(false)
  }

  const handleUndo = () => {
    if (!prevSnapshot || isOver) return
    setBoard(prevSnapshot.board)
    setScore(prevSnapshot.score)
    setPrevSnapshot(null)
  }

  // Touch gesture
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)

    if (Math.max(absX, absY) > 20) {
      if (absX > absY) {
        handleMove(dx > 0 ? 'right' : 'left')
      } else {
        handleMove(dy > 0 ? 'down' : 'up')
      }
    }
    touchStartRef.current = null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      {/* Score Header */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 8, padding: '4px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>得分</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8' }}>{score}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, padding: '4px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>最高</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{bestScore}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            disabled={!prevSnapshot || isOver}
            onClick={handleUndo}
            style={{
              padding: '5px 10px',
              fontSize: 11,
              borderRadius: 6,
              background: prevSnapshot ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
              color: prevSnapshot ? '#e2e8f0' : '#475569',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: prevSnapshot ? 'pointer' : 'default',
            }}
          >
            ↩️ 悔棋
          </button>
          <button
            type="button"
            onClick={handleRestart}
            style={{
              padding: '5px 10px',
              fontSize: 11,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🔄 重开
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'relative',
          width: 260,
          height: 260,
          background: 'rgba(15, 23, 42, 0.85)',
          borderRadius: 12,
          padding: 8,
          boxSizing: 'border-box',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          gap: 6,
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        {board.map((row, r) =>
          row.map((val, c) => {
            const style = TILE_STYLES[val] || TILE_STYLES[2048]
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  fontSize: style.font || (val > 64 ? '13px' : '16px'),
                  fontWeight: 700,
                  background: style.bg,
                  color: style.color,
                  boxShadow: style.shadow || 'none',
                  transition: 'all 0.1s ease-in-out',
                }}
              >
                {val > 0 ? val : ''}
              </div>
            )
          })
        )}

        {/* Game Over Overlay */}
        {isOver && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.92)',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: 24 }}>🎮</span>
            <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 16 }}>游戏结束</div>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>最终得分: {score}</div>
            <button
              type="button"
              onClick={handleRestart}
              style={{
                marginTop: 4,
                padding: '6px 16px',
                borderRadius: 20,
                background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              再来一局 ✨
            </button>
          </div>
        )}
      </div>

      {/* D-Pad Buttons for Touch & Click */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 36px)', gap: 4, justifyContent: 'center' }}>
        <div />
        <button
          type="button"
          onClick={() => handleMove('up')}
          style={{ width: 36, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', cursor: 'pointer' }}
        >
          ▲
        </button>
        <div />
        <button
          type="button"
          onClick={() => handleMove('left')}
          style={{ width: 36, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', cursor: 'pointer' }}
        >
          ◀
        </button>
        <button
          type="button"
          onClick={() => handleMove('down')}
          style={{ width: 36, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', cursor: 'pointer' }}
        >
          ▼
        </button>
        <button
          type="button"
          onClick={() => handleMove('right')}
          style={{ width: 36, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', cursor: 'pointer' }}
        >
          ▶
        </button>
      </div>
    </div>
  )
}
