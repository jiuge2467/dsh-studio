/**
 * @module dsh-mascot-pet/client/engines/MascotWanderEngine
 * @description 自主游弋漫步引擎：平滑正弦漂移、边界避障与即时打断
 */

export interface WanderCoordinate {
  offsetX: number
  offsetY: number
  direction: 1 | -1 // 1: 朝右, -1: 朝左
  isMoving: boolean
}

export class MascotWanderEngine {
  private enabled: boolean = true
  private rangeX: number = 100 // 允许漫步的最大水平半径 (px)
  private currentX: number = 0
  private targetX: number = 0
  private direction: 1 | -1 = 1
  private isMoving: boolean = false
  private wanderTimer: any = null
  private stepInterval: any = null
  private onUpdateCallback: ((coord: WanderCoordinate) => void) | null = null

  constructor(rangeX: number = 100) {
    this.rangeX = rangeX
  }

  public setEnabled(val: boolean): void {
    this.enabled = val
    if (!val) {
      this.interrupt()
    } else {
      this.scheduleNextWander()
    }
  }

  public onUpdate(cb: (coord: WanderCoordinate) => void): void {
    this.onUpdateCallback = cb
  }

  /** 启动漫步调度器 */
  public start(): void {
    if (!this.enabled) return
    this.scheduleNextWander()
  }

  /** 打断当前漫步并平滑复位 */
  public interrupt(): void {
    if (this.wanderTimer) clearTimeout(this.wanderTimer)
    if (this.stepInterval) clearInterval(this.stepInterval)
    this.isMoving = false
    this.currentX = 0
    this.targetX = 0
    if (this.onUpdateCallback) {
      this.onUpdateCallback({
        offsetX: 0,
        offsetY: 0,
        direction: this.direction,
        isMoving: false,
      })
    }
    // 8 秒后尝试恢复漫步
    if (this.enabled) {
      this.wanderTimer = setTimeout(() => this.scheduleNextWander(), 8000)
    }
  }

  public destroy(): void {
    if (this.wanderTimer) clearTimeout(this.wanderTimer)
    if (this.stepInterval) clearInterval(this.stepInterval)
    this.onUpdateCallback = null
  }

  private scheduleNextWander(): void {
    if (!this.enabled) return
    if (this.wanderTimer) clearTimeout(this.wanderTimer)

    // 闲置 8~16 秒后触发一次游动漫步
    const delay = 8000 + Math.random() * 8000
    this.wanderTimer = setTimeout(() => {
      this.performWanderStep()
    }, delay)
  }

  private performWanderStep(): void {
    if (!this.enabled) return

    // 随机选择目标点 [-rangeX, rangeX]
    this.targetX = (Math.random() * 2 - 1) * this.rangeX
    this.direction = this.targetX >= this.currentX ? 1 : -1
    this.isMoving = true

    const startTime = Date.now()
    const startX = this.currentX
    const duration = 2500 + Math.random() * 1500 // 2.5s ~ 4s 游弋时间

    if (this.stepInterval) clearInterval(this.stepInterval)

    this.stepInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / duration)

      // Easing: easeInOutQuad
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress

      this.currentX = startX + (this.targetX - startX) * eased
      // 垂直轻微正弦波起伏 (-6px ~ +6px)
      const offsetY = Math.sin(progress * Math.PI * 2) * 6

      if (this.onUpdateCallback) {
        this.onUpdateCallback({
          offsetX: Math.round(this.currentX),
          offsetY: Math.round(offsetY),
          direction: this.direction,
          isMoving: true,
        })
      }

      if (progress >= 1) {
        clearInterval(this.stepInterval)
        this.isMoving = false
        if (this.onUpdateCallback) {
          this.onUpdateCallback({
            offsetX: Math.round(this.currentX),
            offsetY: 0,
            direction: this.direction,
            isMoving: false,
          })
        }
        // 调度下一次漫步
        this.scheduleNextWander()
      }
    }, 30)
  }
}
