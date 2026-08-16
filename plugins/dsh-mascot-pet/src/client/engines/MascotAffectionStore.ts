/**
 * @module dsh-mascot-pet/client/engines/MascotAffectionStore
 * @description 好感度、饱腹感与投喂数据持久化管理中心（支持动态 CD 机制、时间自然衰减与饥饿情绪检测）
 */

export interface FoodItem {
  id: string
  name: string
  icon: string
  hungerBonus: number
  affectionBonus: number
  tasteDesc: string
  baseCdSeconds: number
}

export const MASCOT_FOODS: FoodItem[] = [
  {
    id: 'watermelon',
    name: '冰镇西瓜',
    icon: '🍉',
    hungerBonus: 20,
    affectionBonus: 10,
    tasteDesc: '清脆多汁~ 夏天吃西瓜最解压啦！',
    baseCdSeconds: 30,
  },
  {
    id: 'boba_tea',
    name: '珍珠奶茶',
    icon: '🧋',
    hungerBonus: 25,
    affectionBonus: 15,
    tasteDesc: '大口吸珍珠~ 甜度刚刚好，超满足！',
    baseCdSeconds: 60,
  },
  {
    id: 'donut',
    name: '草莓甜甜圈',
    icon: '🍩',
    hungerBonus: 30,
    affectionBonus: 20,
    tasteDesc: '香甜浓郁的草莓巧克力，能量满满！',
    baseCdSeconds: 90,
  },
  {
    id: 'cake',
    name: '治愈小蛋糕',
    icon: '🍰',
    hungerBonus: 35,
    affectionBonus: 25,
    tasteDesc: '松软香甜的奶油蛋糕，幸福感爆棚！',
    baseCdSeconds: 120,
  },
]

export interface MascotProfileState {
  affection: number // 0 ~ 1000
  hunger: number    // 0 ~ 100
  level: number     // 1 ~ 5
  title: string
  totalFeeds: number
  totalPets: number
  lastDecayTime: number
  foodCooldowns: Record<string, number>
}

export interface FoodCooldownStatus {
  isCooling: boolean
  remainingSeconds: number
  totalCdSeconds: number
}

export interface MascotMoodStatus {
  mood: 'energetic' | 'normal' | 'hungry' | 'starving'
  isDepressed: boolean
  alertMessage: string | null
}

const STORAGE_KEY = 'dsh_mascot_growth_v2'

export class MascotAffectionStore {
  private static instance: MascotAffectionStore

  public static get(): MascotAffectionStore {
    if (!this.instance) {
      this.instance = new MascotAffectionStore()
    }
    return this.instance
  }

  private state: MascotProfileState = {
    affection: 120,
    hunger: 75,
    level: 1,
    title: '初遇小萌新',
    totalFeeds: 0,
    totalPets: 0,
    lastDecayTime: Date.now(),
    foodCooldowns: {},
  }

  public reset(): void {
    this.state = {
      affection: 120,
      hunger: 75,
      level: 1,
      title: '初遇小萌新',
      totalFeeds: 0,
      totalPets: 0,
      lastDecayTime: Date.now(),
      foodCooldowns: {},
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  /** 应用饱腹度自然时间衰减（每 2 分钟衰减 1 点） */
  public applyDecay(): void {
    const now = Date.now()
    const last = this.state.lastDecayTime || now
    const elapsed = now - last
    const decayInterval = 120 * 1000 // 2 分钟

    if (elapsed >= decayInterval) {
      const decayPoints = Math.floor(elapsed / decayInterval)
      if (decayPoints > 0) {
        this.state.hunger = Math.max(0, this.state.hunger - decayPoints)
        this.state.lastDecayTime = now - (elapsed % decayInterval)
        this.save()
      }
    }
  }

  public getState(): MascotProfileState {
    this.applyDecay()
    return { ...this.state, foodCooldowns: { ...this.state.foodCooldowns } }
  }

  /**
   * 综合好感度与饱腹度计算某款零食的实际冷却时间 (秒)
   * 1. 好感度折扣：Lv.1 0%, Lv.2 5%, Lv.3 10%, Lv.4 15%, Lv.5 20%
   * 2. 饱腹度调节：饱腹感 < 30% 时饥饿渴望加快 20% (x0.8)；饱腹感 >= 80% 时慢嚼增加 20% (x1.2)
   */
  public getFoodCdSeconds(foodId: string): number {
    const food = MASCOT_FOODS.find((f) => f.id === foodId)
    if (!food) return 30

    const affDiscount = Math.min(0.25, Math.max(0, (this.state.level - 1) * 0.05))
    let hungerFactor = 1.0
    if (this.state.hunger < 30) {
      hungerFactor = 0.8
    } else if (this.state.hunger >= 80) {
      hungerFactor = 1.2
    }

    const calculated = Math.round(food.baseCdSeconds * (1 - affDiscount) * hungerFactor)
    return Math.max(5, calculated)
  }

  /** 获取指定零食当前的冷却状态 */
  public getFoodStatus(foodId: string): FoodCooldownStatus {
    const cdExpire = this.state.foodCooldowns[foodId] ?? 0
    const now = Date.now()
    const totalCd = this.getFoodCdSeconds(foodId)

    if (cdExpire > now) {
      const remainingSeconds = Math.ceil((cdExpire - now) / 1000)
      return {
        isCooling: true,
        remainingSeconds,
        totalCdSeconds: totalCd,
      }
    }

    return {
      isCooling: false,
      remainingSeconds: 0,
      totalCdSeconds: totalCd,
    }
  }

  /** 投喂零食 */
  public feed(foodId: string): { ok: boolean; message: string; bonus: { affection: number; hunger: number } } {
    this.applyDecay()
    const food = MASCOT_FOODS.find((f) => f.id === foodId)
    if (!food) {
      return { ok: false, message: '未知的美食', bonus: { affection: 0, hunger: 0 } }
    }

    if (this.state.hunger >= 100) {
      return {
        ok: false,
        message: '肚子已经圆滚滚饱饱啦，等消化一下再吃哦~ (๑´ڡ`๑)',
        bonus: { affection: 0, hunger: 0 },
      }
    }

    const status = this.getFoodStatus(foodId)
    if (status.isCooling) {
      return {
        ok: false,
        message: `小鲸鱼姬还在回味上一份美味呢，还需等待 ${status.remainingSeconds} 秒哦~ ⏳`,
        bonus: { affection: 0, hunger: 0 },
      }
    }

    const cdSeconds = this.getFoodCdSeconds(foodId)
    this.state.foodCooldowns[foodId] = Date.now() + cdSeconds * 1000
    this.state.hunger = Math.min(100, this.state.hunger + food.hungerBonus)
    this.state.affection = Math.min(1000, this.state.affection + food.affectionBonus)
    this.state.totalFeeds += 1
    this.recalculateLevel()
    this.save()

    return {
      ok: true,
      message: food.tasteDesc,
      bonus: { affection: food.affectionBonus, hunger: food.hungerBonus },
    }
  }

  /** 获取心情与饥饿状态判定 */
  public getMoodStatus(): MascotMoodStatus {
    this.applyDecay()
    const h = this.state.hunger
    if (h < 15) {
      return {
        mood: 'starving',
        isDepressed: true,
        alertMessage: '呜呜...肚子空空快饿扁啦 (╥﹏╥)，求投喂好吃的零食~',
      }
    }
    if (h < 30) {
      return {
        mood: 'hungry',
        isDepressed: false,
        alertMessage: '肚子有点咕咕叫了呢...主人有美味零食吗？🧋',
      }
    }
    if (h >= 80) {
      return {
        mood: 'energetic',
        isDepressed: false,
        alertMessage: null,
      }
    }
    return {
      mood: 'normal',
      isDepressed: false,
      alertMessage: null,
    }
  }

  public pet(): { ok: boolean; message: string; affectionBonus: number } {
    this.applyDecay()
    const bonus = 2
    this.state.affection = Math.min(1000, this.state.affection + bonus)
    this.state.totalPets += 1
    this.recalculateLevel()
    this.save()

    const petPhrases = [
      '摸摸头~ 好舒服呀 (*´▽`*)',
      '最喜欢主人摸头啦！爱心发射~ (๑•̀ㅂ•́)و✧',
      '感觉疲惫都被治愈了呢~ 咕噜咕噜',
      '开发者辛苦啦！小鲸鱼姬会一直陪着你哦~',
    ]
    const message = petPhrases[Math.floor(Math.random() * petPhrases.length)]

    return { ok: true, message, affectionBonus: bonus }
  }

  private recalculateLevel(): void {
    const aff = this.state.affection
    if (aff >= 800) {
      this.state.level = 5
      this.state.title = '至尊灵魂伴侣'
    } else if (aff >= 500) {
      this.state.level = 4
      this.state.title = '默契知心好友'
    } else if (aff >= 300) {
      this.state.level = 3
      this.state.title = '亲密编程搭子'
    } else if (aff >= 150) {
      this.state.level = 2
      this.state.title = '熟悉的小助手'
    } else {
      this.state.level = 1
      this.state.title = '初遇小萌新'
    }
  }

  public rewardGameScore(gameType: 'bubble' | '2048' | 'breakout', score: number): {
    addedAffection: number
    newLevel: number
    newAffection: number
    message: string
  } {
    this.applyDecay()
    let pts = 0
    let message = ''
    if (gameType === 'bubble') {
      pts = Math.min(20, Math.max(1, Math.floor(score / 30)))
      message = `🫧 戳水泡得分 ${score}，好感度 +${pts}！`
    } else if (gameType === '2048') {
      pts = Math.min(30, Math.max(2, Math.floor(score / 80)))
      message = `🔢 2048 极光得分 ${score}，好感度 +${pts}！`
    } else if (gameType === 'breakout') {
      pts = Math.min(25, Math.max(2, Math.floor(score / 20)))
      message = `🧱 霓虹打砖块得分 ${score}，好感度 +${pts}！`
    }

    this.state.affection = Math.min(1000, this.state.affection + pts)
    this.recalculateLevel()
    this.save()

    return {
      addedAffection: pts,
      newLevel: this.state.level,
      newAffection: this.state.affection,
      message,
    }
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        this.state = {
          ...this.state,
          ...parsed,
          foodCooldowns: parsed.foodCooldowns || {},
          lastDecayTime: parsed.lastDecayTime || Date.now(),
        }
        this.recalculateLevel()
      }
    } catch { /* ignore */ }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
    } catch { /* ignore */ }
  }
}
