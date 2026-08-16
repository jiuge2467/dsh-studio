import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { MASCOT_SKINS, type MascotSkinDefinition } from './mascot-skins-assets.js'

export function MascotSettingsSection(): ReactNode {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('dsh_mascot_enabled') !== 'false'
  })

  const [activeSkin, setActiveSkin] = useState<string>(() => {
    if (typeof window === 'undefined') return 'classic'
    return localStorage.getItem('dsh_mascot_active_skin') || 'classic'
  })

  const [bubbleFreq, setBubbleFreq] = useState<string>(() => {
    if (typeof window === 'undefined') return 'normal'
    return localStorage.getItem('dsh_mascot_bubble_freq') || 'normal'
  })

  const handleToggleEnabled = (val: boolean) => {
    setEnabled(val)
    localStorage.setItem('dsh_mascot_enabled', String(val))
    window.dispatchEvent(new CustomEvent('dsh-mascot-settings-change', {
      detail: { enabled: val, activeSkin, bubbleFreq },
    }))
  }

  const handleSelectSkin = (skinId: string) => {
    setActiveSkin(skinId)
    localStorage.setItem('dsh_mascot_active_skin', skinId)
    window.dispatchEvent(new CustomEvent('dsh-mascot-settings-change', {
      detail: { enabled, activeSkin: skinId, bubbleFreq },
    }))
  }

  const handleSelectFreq = (freq: string) => {
    setBubbleFreq(freq)
    localStorage.setItem('dsh_mascot_bubble_freq', freq)
    window.dispatchEvent(new CustomEvent('dsh-mascot-settings-change', {
      detail: { enabled, activeSkin, bubbleFreq: freq },
    }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '4px' }}>
      {/* 1. 总开关 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: 'var(--dsw-alias-bg-layer-1, rgba(125, 125, 125, 0.05))',
          border: '1px solid var(--dsw-alias-border-l1, rgba(125, 125, 125, 0.15))',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--dsw-alias-label-primary, inherit)' }}>
            启用小鲸鱼姬桌面伴侣
          </div>
          <div style={{ fontSize: '12px', color: 'var(--dsw-alias-label-secondary, #6b7280)', marginTop: '2px' }}>
            在右下角常驻透明 Q 版桌宠，伴随智能体思考与工作状态提供治愈反馈与摸鱼中心
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleToggleEnabled(!enabled)}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: enabled ? '#3b82f6' : 'var(--dsw-alias-bg-layer-2, rgba(125, 125, 125, 0.2))',
            color: enabled ? '#ffffff' : 'var(--dsw-alias-label-secondary, inherit)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {enabled ? '已开启' : '已关闭'}
        </button>
      </div>

      {/* 2. 换装与装扮中心 */}
      <div>
        <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px', color: 'var(--dsw-alias-label-primary, inherit)' }}>
          形象与换装中心 (Skins & Outfits)
        </div>
        <div style={{ fontSize: '12px', color: 'var(--dsw-alias-label-secondary, #6b7280)', marginBottom: '12px' }}>
          点击卡片即时为小鲸鱼姬换上全新装扮，桌面形象与点击欢呼姿态将即刻蜕变
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {Object.values(MASCOT_SKINS).map((skin: MascotSkinDefinition) => {
            const isSelected = activeSkin === skin.id
            return (
              <div
                key={skin.id}
                onClick={() => handleSelectSkin(skin.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px 12px 12px',
                  borderRadius: '10px',
                  backgroundColor: isSelected
                    ? 'var(--dsw-alias-interactive-bg-active, rgba(59, 130, 246, 0.08))'
                    : 'var(--dsw-alias-bg-layer-1, rgba(125, 125, 125, 0.04))',
                  border: isSelected
                    ? `2px solid ${skin.accentColor}`
                    : '1px solid var(--dsw-alias-border-l1, rgba(125, 125, 125, 0.15))',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* 标签 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: isSelected ? skin.accentColor : 'rgba(125, 125, 125, 0.15)',
                    color: isSelected ? '#ffffff' : 'var(--dsw-alias-label-secondary, inherit)',
                    fontWeight: 600,
                  }}
                >
                  {skin.tag}
                </div>

                {/* 立绘预览图 */}
                <div
                  style={{
                    width: '100px',
                    height: '110px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '8px 0',
                  }}
                >
                  <img
                    src={skin.idleUri}
                    alt={skin.name}
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      filter: isSelected ? 'drop-shadow(0 4px 10px rgba(59, 130, 246, 0.3))' : 'none',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </div>

                {/* 名称与介绍 */}
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px', color: 'var(--dsw-alias-label-primary, inherit)' }}>
                  {skin.name}
                </div>
                <div style={{ fontSize: '10px', color: skin.accentColor, fontWeight: 500, marginBottom: '6px' }}>
                  {skin.title}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--dsw-alias-label-secondary, #6b7280)',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    minHeight: '32px',
                    marginBottom: '10px',
                  }}
                >
                  {skin.desc}
                </div>

                {/* 状态按钮 */}
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '5px 0',
                    borderRadius: '5px',
                    border: 'none',
                    backgroundColor: isSelected ? skin.accentColor : 'var(--dsw-alias-interactive-bg-hover, rgba(125, 125, 125, 0.1))',
                    color: isSelected ? '#ffffff' : 'var(--dsw-alias-label-primary, inherit)',
                    fontSize: '11px',
                    fontWeight: isSelected ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {isSelected ? '✅ 当前使用中' : '一键换装'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. 互动与提示偏好 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: 'var(--dsw-alias-bg-layer-1, rgba(125, 125, 125, 0.05))',
          border: '1px solid var(--dsw-alias-border-l1, rgba(125, 125, 125, 0.15))',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--dsw-alias-label-primary, inherit)' }}>
          气泡台词与互动频率
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'low', label: '专注模式 (免打扰)' },
            { id: 'normal', label: '适中提示 (推荐)' },
            { id: 'high', label: '活跃陪伴' },
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectFreq(opt.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: bubbleFreq === opt.id ? '1px solid #3b82f6' : '1px solid var(--dsw-alias-border-l1, rgba(125, 125, 125, 0.15))',
                backgroundColor: bubbleFreq === opt.id ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                color: bubbleFreq === opt.id ? '#3b82f6' : 'var(--dsw-alias-label-secondary, inherit)',
                fontSize: '12px',
                fontWeight: bubbleFreq === opt.id ? 600 : 'normal',
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
