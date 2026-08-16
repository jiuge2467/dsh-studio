import { describe, it, expect, beforeEach } from 'vitest'
import { MascotStateMachine } from '../src/client/engines/MascotStateMachine.js'
import { MascotAffectionStore, MASCOT_FOODS } from '../src/client/engines/MascotAffectionStore.js'
import { MascotWanderEngine } from '../src/client/engines/MascotWanderEngine.js'

describe('Mascot 2.0 Engines Test Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    MascotAffectionStore.get().reset()
  })

  it('MascotStateMachine: should respect state priorities and transitions', () => {
    const sm = new MascotStateMachine()
    expect(sm.getState()).toBe('idle')

    // 1. 低优先级 wandering 可以被高优先级 agent_think 抢占
    expect(sm.transitionTo('wandering')).toBe(true)
    expect(sm.getState()).toBe('wandering')

    expect(sm.transitionTo('agent_think')).toBe(true)
    expect(sm.getState()).toBe('agent_think')

    // 2. 低优先级 micro_idle 无法抢占高优先级 agent_think
    expect(sm.transitionTo('micro_idle')).toBe(false)
    expect(sm.getState()).toBe('agent_think')

    // 3. 最高优先级 drag_hang 可以抢占 agent_think
    expect(sm.transitionTo('drag_hang')).toBe(true)
    expect(sm.getState()).toBe('drag_hang')

    // 4. 重置回 idle
    sm.resetToIdle()
    expect(sm.getState()).toBe('idle')
  })

  it('MascotAffectionStore: should calculate hunger and affection increments', () => {
    const store = MascotAffectionStore.get()
    const initial = store.getState()

    // 摸头测试
    const petRes = store.pet()
    expect(petRes.ok).toBe(true)
    expect(store.getState().totalPets).toBe(initial.totalPets + 1)
    expect(store.getState().affection).toBeGreaterThanOrEqual(initial.affection)

    // 投喂测试
    const food = MASCOT_FOODS[0] // 冰镇西瓜
    const feedRes = store.feed(food.id)
    expect(feedRes.ok).toBe(true)
    expect(store.getState().totalFeeds).toBe(initial.totalFeeds + 1)
    expect(feedRes.bonus.affection).toBe(food.affectionBonus)

    // 连续投喂相同食物应被 CD 拦截
    const secondFeed = store.feed(food.id)
    expect(secondFeed.ok).toBe(false)
    expect(secondFeed.message).toContain('还需等待')

    const status = store.getFoodStatus(food.id)
    expect(status.isCooling).toBe(true)
    expect(status.remainingSeconds).toBeGreaterThan(0)
  })

  it('MascotAffectionStore: dynamic CD and affection discounts', () => {
    const store = MascotAffectionStore.get()
    const watermelon = MASCOT_FOODS.find((f) => f.id === watermelonId) || MASCOT_FOODS[0]
    const baseCd = watermelon.baseCdSeconds

    // 初始状态 (Lv.1, hunger 75 ~ normal factor 1.0)
    const cdLv1 = store.getFoodCdSeconds(watermelon.id)
    expect(cdLv1).toBe(baseCd)

    // 增加好感度升到 Lv.3 (affection 350)
    store.rewardGameScore('2048', 800)
    store.rewardGameScore('2048', 800)
    store.rewardGameScore('2048', 800)
    store.rewardGameScore('2048', 800)
    store.rewardGameScore('2048', 800)
    store.rewardGameScore('2048', 800)
    store.rewardGameScore('2048', 800)
    store.rewardGameScore('2048', 800)

    const st = store.getState()
    if (st.level >= 2) {
      const cdLvHigher = store.getFoodCdSeconds(watermelon.id)
      expect(cdLvHigher).toBeLessThanOrEqual(baseCd)
    }
  })

  it('MascotAffectionStore: hunger mood detection', () => {
    const store = MascotAffectionStore.get()
    const initialMood = store.getMoodStatus()
    expect(initialMood.isDepressed).toBe(false)

    // 验证低饱腹感低落状态判定
    // 模拟强制消耗饱腹感
    ;(store as any).state.hunger = 10
    const starvingMood = store.getMoodStatus()
    expect(starvingMood.mood).toBe('starving')
    expect(starvingMood.isDepressed).toBe(true)
    expect(starvingMood.alertMessage).toContain('求投喂')

    ;(store as any).state.hunger = 25
    const hungryMood = store.getMoodStatus()
    expect(hungryMood.mood).toBe('hungry')
    expect(hungryMood.alertMessage).toContain('咕咕叫')
  })

  it('MascotWanderEngine: should handle interrupt cleanly', () => {
    const engine = new MascotWanderEngine(100)
    let lastCoord: any = null

    engine.onUpdate((c) => {
      lastCoord = c
    })

    engine.interrupt()
    expect(lastCoord).toEqual({
      offsetX: 0,
      offsetY: 0,
      direction: 1,
      isMoving: false,
    })

    engine.destroy()
  })

  it('MascotSoundEngine: should support mute state toggle and sound triggers', async () => {
    const { MascotSound } = await import('../src/client/engines/MascotSoundEngine.js')
    const initialMute = MascotSound.isMuted()
    MascotSound.setMuted(true)
    expect(MascotSound.isMuted()).toBe(true)

    // Triggers when muted should safely no-op without error
    MascotSound.playBubblePop()
    MascotSound.playGemCatch()
    MascotSound.play2048Slide()
    MascotSound.play2048Merge(256)
    MascotSound.playPaddleHit()
    MascotSound.playBrickBreak()
    MascotSound.playPowerup()
    MascotSound.playVictory()
    MascotSound.playGameOver()

    MascotSound.setMuted(initialMute)
  })

  it('MascotAffectionStore: should reward affection on game completion', () => {
    const store = MascotAffectionStore.get()
    const initialAff = store.getState().affection

    const r1 = store.rewardGameScore('bubble', 150)
    expect(r1.addedAffection).toBeGreaterThanOrEqual(1)
    expect(r1.message).toContain('戳水泡')

    const r2 = store.rewardGameScore('2048', 800)
    expect(r2.addedAffection).toBeGreaterThanOrEqual(2)
    expect(r2.message).toContain('2048')

    const r3 = store.rewardGameScore('breakout', 200)
    expect(r3.addedAffection).toBeGreaterThanOrEqual(2)
    expect(r3.message).toContain('打砖块')

    expect(store.getState().affection).toBeGreaterThan(initialAff)
  })
})
const watermelonId = 'watermelon'
