import { describe, it, expect, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { apply, name, MascotService, createPetInteractTool } from '../src/index.js'

describe('dsh-mascot-pet Host Plugin', () => {
  it('should export standard name and apply function', () => {
    expect(name).toBe('dsh-mascot-pet')
    expect(typeof apply).toBe('function')
  })

  it('should register MascotService and manage emotion/speech', () => {
    const ctx = new Context()
    apply(ctx)

    expect(ctx.mascot).toBeDefined()
    expect(ctx.mascot.getEmotion()).toBe('idle')

    const emotionSpy = vi.fn()
    ctx.on('mascot/emotion-change' as any, emotionSpy)

    ctx.mascot.setEmotion('happy')
    expect(ctx.mascot.getEmotion()).toBe('happy')
    expect(emotionSpy).toHaveBeenCalledWith('happy')

    const speakSpy = vi.fn()
    ctx.on('mascot/speak' as any, speakSpy)

    ctx.mascot.speak('小鲸鱼姬正在为您写代码~')
    expect(ctx.mascot.getQuote()).toBe('小鲸鱼姬正在为您写代码~')
    expect(speakSpy).toHaveBeenCalledWith('小鲸鱼姬正在为您写代码~')
  })

  it('should execute pet_interact tool correctly', async () => {
    const ctx = new Context()
    apply(ctx)
    const tool = createPetInteractTool(ctx)

    expect(tool.name).toBe('pet_interact')

    const result = await tool.run({
      action: 'set_emotion',
      emotion: 'happy',
      message: '开心干饭！',
    })

    expect(result.ok).toBe(true)
    expect(result.action).toBe('set_emotion')
    expect(ctx.mascot.getEmotion()).toBe('happy')
    expect(ctx.mascot.getQuote()).toBe('开心干饭！')
  })
})
