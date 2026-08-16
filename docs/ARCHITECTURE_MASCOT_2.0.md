# 架构设计与契约锁定：小鲸鱼姬 2.0 灵动交互系统 (Mascot 2.0 Architecture & Spec)

> **文档性质**：Phase 2 架构设计与契约锁定说明书 (Architecture & Spec Lock)
> **责任角色**：🏗️ ARCH（系统架构师）
> **适用模块**：`dsh-mascot-pet`
> **版本**：v2.0.0

---

## 1. 总体架构分层设计 (Layered Architecture)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DSH 会话与运行时事件流                                             │
│       (turn/start, chunk text/reasoning, tool/call, turn/end, tokenUsage, liveTokenUsage)              │
└──────────────────────────────────────────────────┬─────────────────────────────────────────────────────┘
                                                   │ window.dispatchEvent('dsh-mascot-activity-event')
                                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              小鲸鱼姬 2.0 核心状态机调度器 (MascotStateMachine)                          │
├──────────────────────────────────────────────────┬─────────────────────────────────────────────────────┤
│  1. 会话响应动作机 (Agent Action Machine)          │  2. 自主漫步引擎 (Autonomous Wander Engine)          │
│     • thinking (敲键盘 / 全息终端)                │     • 游弋区间 [-120px, +120px] 正弦漂移            │
│     • tool (拿扳手检修 / 查文件)                  │     • 左右朝向判定 (scaleX 翻转)                    │
│     • review (翻看笔记 / 点头汇报)                │     • 边界智能碰撞反弹与平滑折返                     │
│     • done (跳跃撒花 / 比心)                      │     • 动作优先级打断机制 (Interrupt Controller)      │
│     • failed (眩晕摔倒 / 冒蚊香圈)                │                                                     │
├──────────────────────────────────────────────────┼─────────────────────────────────────────────────────┤
│  3. 物理触控与拖拽机 (Physics & Pointer Machine)   │  4. 投喂成长与好感度机 (Feeding & Affection Store)    │
│     • 悬空抓起扑腾 (Air Hang Wiggle)              │     • 奶茶/西瓜/蛋糕投喂食物系统                    │
│     • 鼠标悬停视线朝向 (Eye Gaze Tracking)        │     • 饱腹感 (0~100) 与好感度亲密度等级 (Lv.1~Lv.10) │
│     • 抚摸摸头粉色爱心粒子 (Petting Hearts)        │     • LocalStorage 原子化持久化                     │
└──────────────────────────────────────────────────┴─────────────────────────────────────────────────────┘
                                                   │ 驱动 React 渲染状态
                                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    表现层组件体系 (Client Presentation)                                │
│   ┌───────────────────────────┐  ┌──────────────────────────┐  ┌────────────────────────────────────┐  │
│   │ 桌面主精灵 (MascotPet)    │  │ 动态气泡 (StatusBubble)  │  │ 伴侣中心 (MascotDashboard)         │  │
│   │ • 纯透明立绘 + 动效容器   │  │ • 思考中 / 状态台词      │  │ • Token 统计 · 投喂互动 · 摸鱼游戏 │  │
│   │ • 悬空扑腾 · 呼吸发光     │  │ • 工具名称实时同步       │  │ • 换装衣橱 · 好感度勋章            │  │
│   └───────────────────────────┘  └──────────────────────────┘  └────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 状态动作矩阵与优先级队列 (State-Action Matrix)

小鲸鱼姬的动作状态由 **优先级调度器 (Priority Scheduler)** 控制，高优先级动作打断低优先级动作：

| 优先级 (Priority) | 状态名称 (State) | 触发条件 (Trigger) | 动作表现与动画特性 | 皮肤专属动作定制 |
| :---: | :--- | :--- | :--- | :--- |
| **P5 (最高)** | `drag_hang` (悬空扑腾) | 鼠标按住拖拽位移 > 5px | 身体被拎起悬空，四肢高频扑腾挣扎，表情呆萌 | 全皮肤专属悬空微倾斜 |
| **P4** | `petting` (摸头享受) | 点击头部抚摸 | 眯眼笑、头顶升腾粉色爱心气泡，弹出治愈语音台词 | 触发 Happy 姿态 |
| **P4** | `feeding` (进食投喂) | 面板点击投喂零食 | 满足咀嚼动作，周围飘落美味星星，饱腹感增加 | 吃奶茶/蛋糕特效 |
| **P3** | `agent_tool` (工具检修) | Agent 触发 `tool/call` | 拿出扳手维修齿轮 / 放大镜查文件，气泡显示工具名 | 专注检修动效 |
| **P3** | `agent_think` (专注编码) | Agent 触发 `thinking` / Token 跳动 | 极客疯狂敲键盘 / 女仆托腮认真思考 / 水手转笔 | 呼吸光环 + TPS 速率条 |
| **P3** | `agent_done` (完成庆祝) | Agent 触发 `turn/end` (ok) | 开心跳跃、撒花、原地转圈欢呼 (持续 3 秒后回 idle) | 撒花彩带特效 |
| **P3** | `agent_failed` (报错晕眩) | Agent 触发 `turn/end` (error) | 趴地晕倒、双眼冒蚊香圈、顶冷汗问号 | 冒汗眩晕动效 |
| **P2** | `micro_idle` (闲置微动作) | 闲置每隔 20~30s 随机触发 | 打瞌睡 `(。-ω-)zzz`、伸懒腰、吹蓝色小水泡 | 闲置趣味动作 |
| **P1** | `wandering` (自主游弋) | 闲置 > 5 秒且无阻挡 | 在底部 `[-120px, +120px]` 范围内轻盈缓动游弋 | 左右平滑翻转 |
| **P0 (默认)** | `idle` (自然呼吸) | 默认静止状态 | 纯透明立绘、平缓自然浮动呼吸 | 3 款皮肤默认立绘 |

---

## 3. 自主漫步引擎数学模型 (Wander Engine Model)

漫步引擎采用 **正弦波时间调制 + 平滑弹性缓动 (Sinusoidal Easing)**：

```typescript
export interface WanderPosition {
  offsetX: number       // 水平游弋偏移量: -120px ~ +120px
  offsetY: number       // 垂直轻微沉浮量: -8px ~ +8px
  direction: 1 | -1     // 1 为向右, -1 为向左 (驱动 transform: scaleX)
  isMoving: boolean     // 是否处于移动步进周期
}
```

* **游弋步进周期**：每 8~15 秒选择一个随机目标点 `targetX ∈ [-120, 120]`；
* **朝向翻转**：若 `targetX > currentX` 则 `direction = 1`；反之 `direction = -1`；
* **碰撞检测**：若游弋至屏幕左边缘或右边缘阈值，自动反转 `direction = -direction` 并缓动反弹；
* **即时打断 (Zero-latency Interrupt)**：一旦监听到 `PointerDown` 或 `dsh-mascot-activity-event`，立即将 `offsetX/offsetY` 重置并平滑定格回基准点。

---

## 4. 数据契约与持久化规范 (Storage Spec)

| LocalStorage Key | 类型 (Type) | 默认值 (Default) | 描述说明 |
| :--- | :--- | :--- | :--- |
| `dsh_mascot_skin` | `'classic' \| 'geek' \| 'sailor'` | `'classic'` | 当前激活的 Q 版皮肤 ID |
| `dsh_mascot_affection` | `number` (0 ~ 1000) | `100` | 好感度亲密度积分（Lv.1 ~ Lv.10） |
| `dsh_mascot_hunger` | `number` (0 ~ 100) | `80` | 饱腹感值（随时间每 10 分钟 -1，投喂 +20） |
| `dsh_mascot_wander_enabled` | `boolean` | `true` | 是否开启自主漫步功能 |
| `dsh_mascot_sound_enabled` | `boolean` | `true` | 是否开启互动音效与语音气泡 |

---

## 5. 组件工程目录规范 (`dsh-mascot-pet/src/client/`)

```
dsh-mascot-pet/src/client/
├── index.tsx                         # DSH 扩展挂载入口 (composer.dock & body 注入)
├── MascotPet.tsx                     # 桌面主控伴侣容器组件
├── MascotPet.module.css              # 主题样式 (支持深浅自适应、高对比度、呼吸发光)
├── MascotTokenBridge.tsx             # 会话 Token 与 Agent 动作事件捕获中继
├── mascot-skins-assets.ts            # 3 款纯透明皮肤 Base64 资产与配色定义
├── engines/
│   ├── MascotStateMachine.ts        # 7 状态会话与动作优先级状态机
│   ├── MascotWanderEngine.ts        # 自主游弋漫步与边界物理碰撞引擎
│   └── MascotAffectionStore.ts      # 好感度、饱腹感与投喂持久化管理
├── components/
│   ├── StatusBubble.tsx             # 动态台词与工具状态气泡
│   ├── StatusPill.tsx               # 翡翠绿 Token 计费与实时吞吐药丸
│   ├── HeartParticles.tsx           # 摸头互动粉色爱心升腾粒子
│   └── MascotDashboard.tsx          # 伴侣控制中心 (换装、投喂、Token 看板、摸鱼游戏)
└── hooks/
    ├── useMascotState.ts            # 统一状态管理 Hook
    └── useWanderPosition.ts         # 漫步坐标与打断 Hook
```

---

## 6. Spec 锁定清单 (Spec Lock)

- [x] **动作状态机枚举与优先级**：`drag_hang` > `petting`/`feeding` > `agent_tool`/`agent_think`/`agent_done`/`agent_failed` > `micro_idle` > `wandering` > `idle`
- [x] **漫步区间与打断机制**：`[-120px, +120px]`，高优先级交互零延迟打断
- [x] **持久化键值规范**：`dsh_mascot_skin`, `dsh_mascot_affection`, `dsh_mascot_hunger`, `dsh_mascot_wander_enabled`
- [x] **多皮肤资产规范**：100% 纯透明无边框 Standalone PNG DataURI
