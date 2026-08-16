import type { ReactNode } from 'react'
import { useState } from 'react'

const DEFAULT_FOODS = [
  '黄焖鸡米饭 🍗',
  '疯狂星期四 KFC 🍟',
  '自选麻辣烫 🍲',
  '轻食减脂沙拉 🥗',
  '麦当劳双层吉士 🍔',
  '深井烧鹅/猪脚饭 🍖',
  '肥宅水加炒饭 🍛',
  '豪华日料/下馆子 🍣',
] as const

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
] as const

export function FoodWheel(): ReactNode {
  const [foods] = useState<string[]>([...DEFAULT_FOODS])
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedFood, setSelectedFood] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)

  const handleSpin = () => {
    if (isSpinning) return
    setIsSpinning(true)
    setSelectedFood(null)
    // 随机旋转圈数 (5 ~ 8 圈) + 随机角度
    const extraRounds = Math.floor(Math.random() * 3) + 5
    const randomDeg = Math.floor(Math.random() * 360)
    const totalDeg = rotation + extraRounds * 360 + randomDeg
    setRotation(totalDeg)
    setTimeout(() => {
      setIsSpinning(false)
      // 计算选中的项目 (指针在顶部 270 deg)
      const normalizedDeg = (360 - (totalDeg % 360)) % 360
      const segmentSize = 360 / foods.length
      const index = Math.floor(normalizedDeg / segmentSize) % foods.length
      setSelectedFood(foods[index] ?? foods[0] ?? '')
    }, 3200)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, fontSize: 13 }}>
      <div style={{ fontSize: 12, color: 'var(--dsw-alias-label-secondary)' }}>
        程序员的终极难题：今天吃什么？交给小鲸鱼姬转盘来决定！
      </div>

      <div style={{ position: 'relative', width: 170, height: 170, margin: '8px 0' }}>
        {/* 指针 */}
        <div style={{
          position: 'absolute',
          top: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '16px solid #ef4444',
          zIndex: 10,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
        }} />

        {/* 转盘 */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 0 16px rgba(0,0,0,0.4), inset 0 0 8px rgba(255,255,255,0.2)',
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 3.2s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
        }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            {foods.map((food, i) => {
              const angle = 360 / foods.length
              const startAngle = i * angle
              const endAngle = startAngle + angle
              const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180)
              const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180)
              const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180)
              const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180)
              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`
              return (
                <path
                  key={food}
                  d={pathData}
                  fill={COLORS[i % COLORS.length]}
                  opacity={0.88}
                  stroke="#ffffff"
                  strokeWidth="0.5"
                />
              )
            })}
          </svg>
        </div>

        {/* 中心按钮 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          zIndex: 5,
        }}>
          🍱
        </div>
      </div>

      {selectedFood && (
        <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontWeight: 600 }}>
          🎉 小鲸鱼姬推荐：{selectedFood}！
        </div>
      )}

      <button
        type="button"
        onClick={handleSpin}
        disabled={isSpinning}
        style={{
          padding: '8px 24px',
          borderRadius: 20,
          background: isSpinning ? '#4b5563' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
          color: '#ffffff',
          border: 'none',
          fontWeight: 600,
          cursor: isSpinning ? 'default' : 'pointer',
          boxShadow: isSpinning ? 'none' : '0 2px 10px rgba(239, 68, 68, 0.4)',
          transition: 'all 0.15s ease',
        }}
      >
        {isSpinning ? '正在命运抉择中...' : '🎲 启动美食转盘！'}
      </button>
    </div>
  )
}
