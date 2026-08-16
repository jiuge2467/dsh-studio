import { describe, it, expect } from 'vitest'
import { CET4_WORDS, generateCet4Quiz } from '../src/client/cet4-vocab-data.js'

describe('cet4-vocab-data', () => {
  it('should have a rich CET-4 vocabulary bank', () => {
    expect(CET4_WORDS.length).toBeGreaterThanOrEqual(90)
    for (const item of CET4_WORDS.slice(0, 10)) {
      expect(item.word).toBeDefined()
      expect(item.phonetic).toBeDefined()
      expect(item.meaning).toBeDefined()
      expect(item.example).toBeDefined()
    }
  })

  it('should generate valid 4-option quiz with correct answer', () => {
    const quizes = generateCet4Quiz(5)
    expect(quizes.length).toBe(5)
    const first = quizes[0]
    expect(first).toBeDefined()
    if (first) {
      expect(first.word).toBeDefined()
      expect(first.options.length).toBe(4)
      expect(first.options).toContain(first.meaning)
    }
  })
})
