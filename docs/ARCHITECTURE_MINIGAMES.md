# 架构设计与技术规范：小鲸鱼姬 2.0 摸鱼游戏中心与 Web Audio 引擎

> **版本**：v2.2
> **责任角色**：🏗️ ARCH（系统架构师）
> **适用模块**：`dsh-mascot-pet`

---

## 1. 系统架构图

```
                ┌──────────────────────────────────────┐
                │          MascotDashboard.tsx         │
                │        (Tab: 'game' 摸鱼挑战)         │
                └──────────────────┬───────────────────┘
                                   │
                                   ▼
                ┌──────────────────────────────────────┐
                │           GameCenter.tsx             │
                │  - 子游戏路由分发 (Bubble / 2048 / Bricks)│
                │  - 全局音效开关 (Sound Mute/Unmute)   │
                │  - 亲密度结算通知 (Affection Trigger)   │
                └──────┬───────────┬───────────┬───────┘
                       │           │           │
           ┌───────────┘           │           └───────────┐
           ▼                       ▼                       ▼
┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
│   BubbleGame.tsx   │   │   Aurora2048.tsx   │   │  NeonBreakout.tsx  │
│  - 浮力物理 & 连击   │   │  - 4x4 网格算法    │   │  - Canvas 60FPS    │
│  - 爆破粒子特效    │   │  - 撤销 / 手势 / 按键│   │  - 弹球物理&粒子   │
│  - 20s 快速解压    │   │  - 极光视觉引擎    │   │  - 道具 Buff 系统   │
└──────────┬─────────┘   └─────────┬──────────┘   └──────────┬─────────┘
           │                       │                         │
           └───────────────────────┼─────────────────────────┘
                                   ▼
            ┌───────────────────────────────────────────────┐
            │             MascotSoundEngine.ts              │
            │   Web Audio API 纯程序化合成声效发生器        │
            │ (pop / merge / hit / destroy / win / levelup) │
            └──────────────────────┬────────────────────────┘
                                   │
                                   ▼
            ┌───────────────────────────────────────────────┐
            │            MascotAffectionStore.ts            │
            │    游戏得分 -> 好感度 / 饱腹感 / 交互事件分发   │
            └───────────────────────────────────────────────┘
```

---

## 2. 核心模块与 API 契约

### 2.1 Web Audio 音效引擎 (`MascotSoundEngine.ts`)

```typescript
export class MascotSoundEngine {
  public static isMuted(): boolean;
  public static setMuted(muted: boolean): void;
  public static toggleMute(): boolean;

  // 游戏音效触发方法
  public static playBubblePop(): void;
  public static playGemCatch(): void;
  public static play2048Slide(): void;
  public static play2048Merge(value: number): void;
  public static playPaddleHit(): void;
  public static playBrickBreak(): void;
  public static playPowerup(): void;
  public static playGameOver(): void;
  public static playVictory(): void;
}
```

### 2.2 亲密度激励契约 (`MascotAffectionStore.ts`)

```typescript
export interface GameRewardResult {
  addedAffection: number
  newLevel: number
  newAffection: number
  celebrationText: string
}

// 在 MascotAffectionStore 中扩充方法：
public rewardGameScore(gameType: 'bubble' | '2048' | 'breakout', score: number): GameRewardResult;
```

### 2.3 子组件接口

```typescript
export interface MiniGameProps {
  onScoreEarned?: (score: number, gameType: 'bubble' | '2048' | 'breakout') => void
  soundMuted: boolean
}
```
