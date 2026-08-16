/**
 * @module dsh-mascot-pet
 * @description DeepSeek 小鲸鱼姬桌宠与程序员摸鱼伴侣插件 (Host 端 Node.js 插件)
 *
 * 职责：
 * 1. 向模型注入小鲸鱼姬桌宠感知与交互契约；
 * 2. 注册 `pet_interact` 工具供 Agent 在需要时与桌宠互动；
 * 3. 维护桌宠运行时状态服务供其他插件消费。
 */

import { Context, Service } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-tools'

export const name = 'dsh-mascot-pet'
export const inject = []

export interface MascotPetConfig {
  /** 默认心情 */
  defaultMood?: 'idle' | 'happy' | 'thinking' | 'cheer'
  /** 是否启用系统 Prompt 注入感知 */
  enablePromptInjection?: boolean
}

export interface PetInteractArgs {
  action: 'set_emotion' | 'speak' | 'suggest_break' | 'recommend_food' | 'tell_joke'
  emotion?: 'idle' | 'happy' | 'thinking' | 'cheer'
  message?: string
}

export interface PetInteractResult {
  ok: boolean
  action: string
  responseMessage: string
}

/** 注入给模型的桌宠系统提示词 */
export const MASCOT_SYSTEM_PROMPT = `
# DeepSeek 小鲸鱼姬桌面伴侣 (Mascot Companion)
用户桌面上常驻着 Q 版透明萌宠【小鲸鱼姬】（Chibi Whale Maid）。
当你在深度思考、编写复杂代码或用户连续工作较长时间时，你可以通过 \`pet_interact\` 工具改变小鲸鱼姬的心情表情、向用户弹出温馨台词气泡，或者为用户推荐摸鱼解压、四级单词挑战或美食大转盘。
`

/** 桌宠状态与服务接口 */
export class MascotService extends Service {
  private currentEmotion: string = 'idle'
  private lastQuote: string = '随时为您服务~'

  constructor(ctx: Context) {
    super(ctx, 'mascot')
  }

  public getEmotion(): string {
    return this.currentEmotion
  }

  public setEmotion(emotion: string): void {
    this.currentEmotion = emotion
    this.ctx.emit('mascot/emotion-change' as any, emotion)
  }

  public getQuote(): string {
    return this.lastQuote
  }

  public speak(quote: string): void {
    this.lastQuote = quote
    this.ctx.emit('mascot/speak' as any, quote)
  }
}

declare module '@deepseek-ai/cordis' {
  interface Events {
    'mascot/emotion-change'(emotion: string): void
    'mascot/speak'(quote: string): void
  }
  interface Context {
    mascot: MascotService
  }
}

/** 创建 pet_interact 工具定义 */
export function createPetInteractTool(ctx: Context) {
  return {
    name: 'pet_interact',
    description: '与桌宠小鲸鱼姬互动：设置情绪姿态、气泡台词、提醒用户喝水/休息或发起摸鱼推荐',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['set_emotion', 'speak', 'suggest_break', 'recommend_food', 'tell_joke'],
          description: '要执行的互动动作',
        },
        emotion: {
          type: 'string',
          enum: ['idle', 'happy', 'thinking', 'cheer'],
          description: '当 action 为 set_emotion 时指定表情',
        },
        message: {
          type: 'string',
          description: '台词文本或提醒说明',
        },
      },
      required: ['action'],
    },
    run: async (args: PetInteractArgs): Promise<PetInteractResult> => {
      const msg = args.message ?? '小鲸鱼姬收到指令啦！'
      const mascot = (ctx as any).get ? (ctx as any).get('mascot') : (ctx as any).mascot
      if (args.emotion && mascot) {
        mascot.setEmotion(args.emotion)
      }
      if (args.message && mascot) {
        mascot.speak(args.message)
      }
      return {
        ok: true,
        action: args.action,
        responseMessage: `小鲸鱼姬已执行 [${args.action}]: "${msg}"`,
      }
    },
  }
}

/** Cordis Host 插件入口 */
export function apply(ctx: Context, config: MascotPetConfig = {}): () => void {
  // 1. 注册 Mascot 服务
  new MascotService(ctx)

  const disposers: Array<() => void> = []

  // 2. 注入 System Prompt (使用 ctx.get 安全获取可选服务)
  if (config.enablePromptInjection !== false) {
    const promptService = (ctx as any).get ? (ctx as any).get('systemPrompt') : (ctx as any).systemPrompt
    if (promptService && typeof promptService.registerSection === 'function') {
      disposers.push(
        promptService.registerSection({
          id: 'dsh-mascot-pet',
          order: 120,
          text: MASCOT_SYSTEM_PROMPT,
        }),
      )
    }
  }

  // 3. 注册 pet_interact 工具 (使用 ctx.get 安全获取可选服务)
  const toolsService = (ctx as any).get ? (ctx as any).get('tools') : (ctx as any).tools
  if (toolsService && typeof toolsService.register === 'function') {
    disposers.push(toolsService.register(createPetInteractTool(ctx)))
  }

  return () => {
    for (const dispose of disposers) {
      try {
        dispose()
      } catch {
        /* ignore */
      }
    }
  }
}
