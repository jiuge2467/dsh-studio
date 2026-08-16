import type { ReactNode } from 'react'
import { useState } from 'react'

interface Joke {
  title: string
  content: string
  tag: string
}

const JOKES: Joke[] = [
  {
    title: '二进制的世界上',
    content: '世界上只有 10 种人：一种是懂二进制的，一种是不懂二进制的，还有一种是以为这是三进制的。',
    tag: '💡 经典脑洞',
  },
  {
    title: '如何消灭一个程序员',
    content: '杀一个程序员不需要枪，只需要改三次需求，或者把他的 IDE 字体改成宋体，再把代码缩进从 2 空格改成 3 空格。',
    tag: '💀 真实扎心',
  },
  {
    title: '万圣节与圣诞节',
    content: '为什么程序员总是分不清万圣节（Halloween）和圣诞节（Christmas）？\n因为：OCT 31 == DEC 25 （八进制31等于十进制25）！',
    tag: '🎃 八进制梗',
  },
  {
    title: '买西瓜的故事',
    content: '老婆对程序员说："去菜市场买两个西瓜，如果看到卖西红柿的，买十个。"\n程序员回来了，手里拿了十个西瓜。老婆大怒："你怎么买十个西瓜？！"\n程序员："因为我看到卖西红柿的了。"',
    tag: '🍉 条件分支',
  },
  {
    title: '重构代码的真相',
    content: '"写这段代码的时候，只有我和上帝知道它是什么意思。\n三个月后，只有上帝知道了。"',
    tag: '😇 神明之作',
  },
  {
    title: '关于注释',
    content: '程序员最讨厌的四件事：写注释、写文档、别人不写注释、别人不写文档。',
    tag: '📝 薛定谔注释',
  },
]

export function JokeTeller(): ReactNode {
  const [index, setIndex] = useState(0)
  const fallbackJoke = JOKES[0] ?? { title: '笑话', content: '轻松一下~', tag: '😄' }
  const current = JOKES[index % JOKES.length] ?? fallbackJoke

  const handleNext = () => {
    setIndex(i => i + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--dsw-alias-label-secondary)' }}>程序员专属解压段子库</span>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
          {current.tag}
        </span>
      </div>

      <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>{current.title}</div>
        <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--dsw-alias-label-primary)' }}>{current.content}</div>
      </div>

      <button
        type="button"
        onClick={handleNext}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff',
          border: 'none',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
          transition: 'all 0.15s ease',
        }}
      >
        😄 再来一个笑话！
      </button>
    </div>
  )
}
