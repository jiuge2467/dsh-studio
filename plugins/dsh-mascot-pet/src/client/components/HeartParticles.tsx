/**
 * @module dsh-mascot-pet/client/components/HeartParticles
 * @description 摸头互动粉色爱心升腾粒子特效
 */

import React, { useEffect, useState } from 'react'

export interface HeartParticle {
  id: number
  x: number
  y: number
  scale: number
  icon: string
}

export const HeartParticles: React.FC<{ hearts: HeartParticle[] }> = ({ hearts }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 99,
      }}
    >
      {hearts.map((h) => (
        <div
          key={h.id}
          style={{
            position: 'absolute',
            left: `${h.x}px`,
            top: `${h.y}px`,
            fontSize: `${18 * h.scale}px`,
            animation: 'mascotHeartFloat 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            userSelect: 'none',
          }}
        >
          {h.icon}
        </div>
      ))}
      <style>{`
        @keyframes mascotHeartFloat {
          0% {
            opacity: 1;
            transform: translate(-50%, 0) scale(0.6);
          }
          50% {
            opacity: 0.9;
            transform: translate(-50%, -24px) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -48px) scale(1.3);
          }
        }
      `}</style>
    </div>
  )
}
