/**
 * @module dsh-mascot-pet/client/engines/MascotSoundEngine
 * @description Web Audio API 纯程序化合成音效引擎，零外部音频文件依赖，提供清脆可爱的 8-bit & 现代合成音效。
 */

const STORAGE_KEY_MUTED = 'dsh_mascot_sound_muted'

class SoundEngine {
  private ctx: AudioContext | null = null
  private muted: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.muted = localStorage.getItem(STORAGE_KEY_MUTED) === 'true'
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public isMuted(): boolean {
    return this.muted
  }

  public setMuted(val: boolean): void {
    this.muted = val
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MUTED, String(val))
      window.dispatchEvent(new CustomEvent('dsh-mascot-sound-mute-change', { detail: { muted: val } }))
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted)
    return this.muted
  }

  /** 1. 水泡破裂音效 (Bubble Pop - 快速上行滑频) */
  public playBubblePop(freqBase: number = 400): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      const startTime = ctx.currentTime
      osc.frequency.setValueAtTime(freqBase, startTime)
      osc.frequency.exponentialRampToValueAtTime(freqBase * 2.2, startTime + 0.08)

      gain.gain.setValueAtTime(0.3, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + 0.08)
    } catch {
      /* ignore audio error on inactive tab */
    }
  }

  /** 2. 拾取稀有宝石/金币音效 (High Chime) */
  public playGemCatch(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      [1046.5, 1318.51, 1567.98].forEach((f, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        const startTime = ctx.currentTime + idx * 0.04
        osc.frequency.setValueAtTime(f, startTime)
        gain.gain.setValueAtTime(0.25, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(startTime)
        osc.stop(startTime + 0.12)
      })
    } catch {}
  }

  /** 3. 2048 滑动音效 */
  public play2048Slide(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const now = ctx.currentTime
      osc.frequency.setValueAtTime(180, now)
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.05)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.05)
    } catch {}
  }

  /** 4. 2048 合并音效 (根据数字大小变调) */
  public play2048Merge(value: number): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const baseFreq = Math.min(880, 260 + Math.log2(value) * 55)
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'triangle'
      osc2.type = 'sine'

      const now = ctx.currentTime
      osc1.frequency.setValueAtTime(baseFreq, now)
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now)

      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.14)
      osc2.stop(now + 0.14)
    } catch {}
  }

  /** 5. 打砖块挡板击打音效 */
  public playPaddleHit(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      const now = ctx.currentTime
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.06)
      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.06)
    } catch {}
  }

  /** 6. 砖块爆裂音效 */
  public playBrickBreak(pitchMultiplier: number = 1): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      const now = ctx.currentTime
      const freq = (500 + Math.random() * 200) * pitchMultiplier
      osc.frequency.setValueAtTime(freq, now)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.08)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.08)
    } catch {}
  }

  /** 7. 拾取掉落道具音效 */
  public playPowerup(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const freqs = [523.25, 659.25, 783.99, 1046.5]
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        const now = ctx.currentTime + i * 0.04
        osc.frequency.setValueAtTime(f, now)
        gain.gain.setValueAtTime(0.2, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.08)
      })
    } catch {}
  }

  /** 8. 游戏胜利/好感度升级大欢呼音效 */
  public playVictory(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const melody = [523.25, 659.25, 783.99, 1046.5, 1318.51]
      melody.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        const now = ctx.currentTime + idx * 0.07
        osc.frequency.setValueAtTime(freq, now)
        gain.gain.setValueAtTime(0.25, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.2)
      })
    } catch {}
  }

  /** 9. 游戏结束音效 */
  public playGameOver(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const tones = [350, 310, 270, 220]
      tones.forEach((f, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        const now = ctx.currentTime + i * 0.09
        osc.frequency.setValueAtTime(f, now)
        gain.gain.setValueAtTime(0.18, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.12)
      })
    } catch {}
  }
}

export const MascotSound = new SoundEngine()
