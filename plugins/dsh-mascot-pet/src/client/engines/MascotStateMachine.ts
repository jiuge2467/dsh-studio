/**
 * @module dsh-mascot-pet/client/engines/MascotStateMachine
 * @description 小鲸鱼姬 2.0 动作状态机与优先级调度器
 */

export type MascotActionState =
  | 'drag_hang'     // 鼠标拖拽悬空扑腾小短腿 (P5 - 最高)
  | 'petting'       // 摸头抚摸享受 (P4)
  | 'feeding'       // 进食投喂美味 (P4)
  | 'agent_tool'    // Agent 工具调用中 (P3)
  | 'agent_think'   // Agent 思考 / Token 高速消耗中 (P3)
  | 'agent_done'    // Agent 完成庆祝跳跃 (P3)
  | 'agent_failed'  // Agent 报错眩晕 (P3)
  | 'micro_idle'    // 闲置趣味微动作 (P2: 打瞌睡/伸懒腰/吹泡泡)
  | 'wandering'     // 自主轻盈游弋 (P1)
  | 'idle'          // 默认自然呼吸 (P0)

export type MicroIdleType = 'sleep' | 'stretch' | 'bubble' | 'curious'

export interface MascotStatusCopy {
  bubbleText: string
  subText?: string
  icon?: string
}

export const MICRO_IDLE_COPIES: Record<MicroIdleType, MascotStatusCopy> = {
  sleep: { bubbleText: '(。-ω-)zzz 呼噜呼噜...', icon: '💤' },
  stretch: { bubbleText: '伸个懒腰~ 准备大干一场！', icon: '✨' },
  bubble: { bubbleText: '咕噜咕噜~ 吹个蓝色小水泡！', icon: '🫧' },
  curious: { bubbleText: '在写什么好玩的高级代码呀？', icon: '👀' },
}

export const AGENT_STATE_COPIES: Record<string, MascotStatusCopy> = {
  agent_think: { bubbleText: '正在头脑风暴深度推理中...', icon: '⚡' },
  agent_tool: { bubbleText: '正在使用专属工具调试中...', icon: '🛠️' },
  agent_done: { bubbleText: '太棒啦！任务圆满完成~ 撒花！', icon: '🎉' },
  agent_failed: { bubbleText: '呜哇... 遇到异常报错了 (；´д｀)ゞ', icon: '😵' },
}

/** 状态优先级映射 (数值越大优先级越高) */
const STATE_PRIORITIES: Record<MascotActionState, number> = {
  drag_hang: 50,
  petting: 40,
  feeding: 40,
  agent_tool: 30,
  agent_think: 30,
  agent_done: 30,
  agent_failed: 30,
  micro_idle: 20,
  wandering: 10,
  idle: 0,
}

export class MascotStateMachine {
  private currentState: MascotActionState = 'idle'
  private currentMicroType: MicroIdleType | null = null
  private activeToolName: string = ''
  private stateExpiresAt: number = 0

  public getState(): MascotActionState {
    // 检查带时效的状态是否过期
    if (this.stateExpiresAt > 0 && Date.now() > this.stateExpiresAt) {
      this.stateExpiresAt = 0
      this.currentMicroType = null
      this.currentState = 'idle'
    }
    return this.currentState
  }

  public getMicroType(): MicroIdleType | null {
    return this.currentMicroType
  }

  public getActiveToolName(): string {
    return this.activeToolName
  }

  /** 请求切换状态 (遵循优先级门禁) */
  public transitionTo(
    targetState: MascotActionState,
    durationMs: number = 0,
    meta?: { microType?: MicroIdleType; toolName?: string }
  ): boolean {
    const currentPri = STATE_PRIORITIES[this.getState()]
    const targetPri = STATE_PRIORITIES[targetState]

    // 高优先级或同等优先级才允许抢占
    if (targetPri >= currentPri || this.currentState === 'idle') {
      this.currentState = targetState
      this.stateExpiresAt = durationMs > 0 ? Date.now() + durationMs : 0
      if (meta?.microType) this.currentMicroType = meta.microType
      if (meta?.toolName) this.activeToolName = meta.toolName
      return true
    }
    return false
  }

  /** 重置回 Idle 状态 */
  public resetToIdle(): void {
    this.currentState = 'idle'
    this.currentMicroType = null
    this.activeToolName = ''
    this.stateExpiresAt = 0
  }
}
