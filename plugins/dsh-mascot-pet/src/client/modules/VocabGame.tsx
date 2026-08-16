/**
 * @module @deepseek-ai/dsh-client-ui-conversation/pet/modules/VocabGame
 * @description 英语四级 (CET-4) 乱序词汇闯关与每日打卡系统
 */

import type { ReactNode } from 'react'
import { useState, useEffect, useRef } from 'react'
import { generateCet4Quiz } from '../cet4-vocab-data.js'

const CHECKIN_KEY = 'dsh_cet4_daily_checkin_record_v1'

interface CheckinRecord {
  lastCheckinDate: string // YYYY-MM-DD
  streakDays: number
  totalDays: number
}

function getTodayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadCheckinRecord(): CheckinRecord {
  if (typeof window === 'undefined') {
    return { lastCheckinDate: '', streakDays: 0, totalDays: 0 }
  }
  try {
    const raw = localStorage.getItem(CHECKIN_KEY)
    if (raw) {
      return JSON.parse(raw) as CheckinRecord
    }
  } catch { /* ignore */ }
  return { lastCheckinDate: '', streakDays: 0, totalDays: 0 }
}

function saveCheckinRecord(record: CheckinRecord): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(record))
  } catch { /* ignore */ }
}

export function VocabGame(): ReactNode {
  // 题目列表（20题）
  const [quizList, setQuizList] = useState(() => generateCet4Quiz(20))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  const [checkin, setCheckin] = useState<CheckinRecord>(loadCheckinRecord)
  const [justCheckedIn, setJustCheckedIn] = useState(false)

  // 自动进入下一题的定时器
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const todayStr = getTodayString()
  const isTodayChecked = checkin.lastCheckinDate === todayStr

  // 清理定时器
  useEffect(() => {
    return () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current)
    }
  }, [])

  // 重新开始一组 20 题闯关
  const restartQuiz = () => {
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current)
      nextTimerRef.current = null
    }
    setQuizList(generateCet4Quiz(20))
    setCurrentIndex(0)
    setScore(0)
    setStreak(0)
    setCorrectCount(0)
    setSelectedOption(null)
    setIsFinished(false)
    setJustCheckedIn(false)
  }

  const current = quizList[currentIndex]

  // 下一题或结算（供定时器和手动点击调用）
  const handleNextDirect = () => {
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current)
      nextTimerRef.current = null
    }
    if (currentIndex < quizList.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedOption(null)
    } else {
      setIsFinished(true)
    }
  }

  // 处理选项点击
  const handleSelect = (opt: string) => {
    if (selectedOption !== null || !current) return
    setSelectedOption(opt)

    const isCorrect = opt === current.meaning
    if (isCorrect) {
      const newStreak = streak + 1
      const addedScore = 10 + newStreak * 2
      setScore(s => s + addedScore)
      setStreak(newStreak)
      setCorrectCount(c => c + 1)

      // 答对时：650ms 高亮反馈后自动切换到下一题，无需用户手动滑屏点击！
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current)
      nextTimerRef.current = setTimeout(() => {
        handleNextDirect()
      }, 650)
    } else {
      setStreak(0)
    }
  }

  // 全局键盘极速刷题快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      if (isFinished) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          restartQuiz()
        }
        return
      }

      if (!current) return

      if (selectedOption === null) {
        const key = e.key.toUpperCase()
        let selectedIdx = -1
        if (key === 'A' || key === '1') selectedIdx = 0
        else if (key === 'B' || key === '2') selectedIdx = 1
        else if (key === 'C' || key === '3') selectedIdx = 2
        else if (key === 'D' || key === '4') selectedIdx = 3

        if (selectedIdx >= 0 && selectedIdx < current.options.length) {
          e.preventDefault()
          handleSelect(current.options[selectedIdx])
        }
      } else {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          handleNextDirect()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedOption, current, isFinished, quizList.length, currentIndex])

  // 结算时自动打卡检查
  useEffect(() => {
    if (isFinished) {
      const accuracy = (correctCount / quizList.length) * 100
      if (accuracy >= 60) {
        const today = getTodayString()
        const currentRecord = loadCheckinRecord()
        if (currentRecord.lastCheckinDate !== today) {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yestStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

          const newStreak = currentRecord.lastCheckinDate === yestStr ? currentRecord.streakDays + 1 : 1
          const newRecord: CheckinRecord = {
            lastCheckinDate: today,
            streakDays: newStreak,
            totalDays: (currentRecord.totalDays || 0) + 1,
          }
          saveCheckinRecord(newRecord)
          setCheckin(newRecord)
          setJustCheckedIn(true)
        }
      }
    }
  }, [isFinished, correctCount, quizList.length])

  // 结算卡片视图
  if (isFinished) {
    const accuracy = Math.round((correctCount / quizList.length) * 100)
    const isPassed = accuracy >= 60

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '2px 0', alignItems: 'center' }}>
        <div style={{ fontSize: 32 }}>{isPassed ? '🏆' : '💪'}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: isPassed ? '#10b981' : '#f59e0b' }}>
          {isPassed ? 'CET-4 四级闯关大获全胜！' : '四级单词闯关完成，继续加油！'}
        </div>

        {/* 打卡状态横幅 */}
        <div
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            background: isPassed ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
            border: `1px solid ${isPassed ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: isPassed ? '#059669' : '#d97706' }}>
              {isPassed ? (justCheckedIn || isTodayChecked ? '📅 今日四级打卡已完成！' : '📅 今日已成功打卡！') : '⚠️ 正确率需达到 60% 即可完成打卡'}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
              连续打卡 <strong style={{ color: '#ec4899' }}>{checkin.streakDays}</strong> 天 · 累计打卡 <strong>{checkin.totalDays}</strong> 天
            </div>
          </div>
          <div style={{ fontSize: 22 }}>{isPassed ? '🎖️' : '⏳'}</div>
        </div>

        {/* 成绩明细 */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 6,
            textAlign: 'center',
          }}
        >
          <div style={{ padding: '6px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 10.5, color: '#64748b' }}>总得分</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#6366f1' }}>{score}</div>
          </div>
          <div style={{ padding: '6px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 10.5, color: '#64748b' }}>答对题数</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{correctCount} / 20</div>
          </div>
          <div style={{ padding: '6px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 10.5, color: '#64748b' }}>准确率</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: accuracy >= 60 ? '#10b981' : '#ef4444' }}>{accuracy}%</div>
          </div>
        </div>

        <button
          type="button"
          onClick={restartQuiz}
          style={{
            marginTop: 4,
            width: '100%',
            padding: '9px 0',
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          }}
        >
          🔄 再来一组 CET-4 乱序 20 题 (Enter)
        </button>
      </div>
    )
  }

  if (!current) return null

  const isCurrentCorrect = selectedOption !== null && selectedOption === current.meaning

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '1px 0' }}>
      {/* 顶部状态与打卡指示 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>
            🎯 积分: <strong style={{ color: '#10b981' }}>{score}</strong>
          </span>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>
            🔥 连对: <strong style={{ color: '#f59e0b' }}>{streak}</strong>
          </span>
          {checkin.streakDays > 0 && (
            <span style={{ fontSize: 10.5, background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0px 5px', borderRadius: 8 }}>
              📅 连续{checkin.streakDays}天
            </span>
          )}
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#6366f1', background: '#eef2ff', padding: '1px 7px', borderRadius: 10 }}>
          第 {currentIndex + 1} / {quizList.length} 题
        </span>
      </div>

      {/* 进度条 */}
      <div style={{ width: '100%', height: 3, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            width: `${((currentIndex + 1) / quizList.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #6366f1, #10b981)',
            transition: 'width 0.25s ease',
          }}
        />
      </div>

      {/* 单词卡片 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
          borderRadius: 8,
          padding: '8px 12px',
          border: '1px solid #dbeafe',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 19, fontWeight: 700, color: '#1e40af', letterSpacing: '-0.02em' }}>
            {current.word}
          </span>
          <span style={{ fontSize: 11.5, color: '#64748b', fontFamily: 'monospace' }}>
            {current.phonetic}
          </span>
          <span style={{ fontSize: 11.5, color: '#8b5cf6', fontStyle: 'italic' }}>
            {current.pos}
          </span>
        </div>
        {selectedOption !== null && (
          <div style={{ marginTop: 4, fontSize: 11, color: '#475569', lineHeight: 1.35, borderTop: '1px dashed #cbd5e1', paddingTop: 4 }}>
            <span style={{ fontWeight: 600, color: '#6366f1' }}>例: </span>
            {current.example}
          </div>
        )}
      </div>

      {/* 四个选项 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {current.options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx)
          const isSelected = selectedOption === opt
          const isCorrect = opt === current.meaning
          const showAnswer = selectedOption !== null

          let bg = '#ffffff'
          let border = '#e2e8f0'
          let textColor = '#1e293b'

          if (showAnswer) {
            if (isCorrect) {
              bg = '#ecfdf5'
              border = '#10b981'
              textColor = '#047857'
            } else if (isSelected) {
              bg = '#fef2f2'
              border = '#ef4444'
              textColor = '#b91c1c'
            }
          }

          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              disabled={selectedOption !== null}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 11px',
                borderRadius: 7,
                background: bg,
                border: `1.5px solid ${border}`,
                color: textColor,
                fontSize: 12.5,
                lineHeight: 1.3,
                cursor: selectedOption !== null ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.12s ease',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <strong style={{ marginRight: 6, color: isCorrect && showAnswer ? '#10b981' : '#64748b', fontSize: 12 }}>
                  {letter}.
                </strong>
                {opt}
              </span>
              {showAnswer && isCorrect && <span style={{ color: '#10b981', fontWeight: 'bold', marginLeft: 4 }}>✓</span>}
              {showAnswer && isSelected && !isCorrect && <span style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: 4 }}>✕</span>}
            </button>
          )
        })}
      </div>

      {/* 下一步操作与快捷键指引 */}
      {selectedOption !== null ? (
        <button
          type="button"
          onClick={handleNextDirect}
          style={{
            marginTop: 2,
            padding: '7px 0',
            borderRadius: 7,
            border: 'none',
            background: isCurrentCorrect
              ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
              : '#0f172a',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            boxShadow: isCurrentCorrect ? '0 2px 8px rgba(16,185,129,0.25)' : 'none',
            transition: 'background 0.2s',
          }}
        >
          {isCurrentCorrect
            ? (currentIndex < quizList.length - 1 ? '✓ 答对了！0.6s 自动下一题 (点击立即跳过 ⚡)' : '✓ 答对了！查看结算与打卡 🏆')
            : (currentIndex < quizList.length - 1 ? '下一题 (按空格/Enter) →' : '查看闯关结算与打卡 🏆')}
        </button>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 10.5, color: '#94a3b8', marginTop: 1 }}>
          💡 支持按键盘 <strong>A / B / C / D</strong> 或 <strong>1 / 2 / 3 / 4</strong> 极速答题
        </div>
      )}
    </div>
  )
}
