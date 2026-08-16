# Task Backlog: 零食投喂 CD 体系 / 饥饿心情系统 & Token 全局累计账本

## Phase 1: PRD & Scope (PM) - [DONE]
- [x] 零食差异化 CD 需求收敛（30s / 60s / 90s / 120s）
- [x] 好感度折扣 & 饱腹度进食调节算法设计
- [x] 饱腹感时间自然衰减 & 饥饿低落主动提醒机制
- [x] Token 实时未统计与全站历史总计费累计需求收敛
- [x] 交付产物：`implementation_plan.md`

## Phase 2: Architecture & Contracts (ARCH) - [DONE]
- [x] 零食动态 CD 数学模型设计
- [x] 饱腹度自然时间衰减算法（每 2 分钟 1 点）
- [x] `MascotTokenBridge` 插槽切换至 `conversation.composer.dock` 常驻底栏
- [x] `dsh_billing_ledger_v2` 全局持久化账本模型与跨会话隔离契约锁定

## Phase 3: Coding & Implementation (DEV) - [DONE]
- [x] 升级 `MascotAffectionStore.ts`：支持动态 CD、倒计时查询、时间衰减与饥饿情绪检测
- [x] 升级 `FeedingCenter.tsx`：实现 CD 实时倒计时置灰（`⏳ 45s`）、饱腹度状态条与满腹保护
- [x] 升级 `pricing-engine.ts`：实现全站历史累计账本（All-Time Ledger）与多会话隔离累加
- [x] 升级 `MascotTokenBridge.tsx` & `client/index.tsx`：修正探针插槽并双轨提取会话与节点 Token
- [x] 升级 `MascotDashboard.tsx` & `MascotPet.tsx`：用量账单展示双重视图，周期自检饥饿状态并弹出提醒气泡

## Phase 4: Test & Verify (QA) - [DONE]
- [x] 扩充 `tests/pricing-engine.test.ts` 覆盖全站多会话历史账本累加与隔离
- [x] 扩充 `tests/engines.test.ts` 覆盖动态 CD、好感度减免、冷却拦截与低饱腹度低落情绪判定
- [x] 运行全量 Vitest 单元测试（19/19 全绿通过 100% PASS）

## Phase 5 & 6: Package & Release (OPS) - [DONE]
- [x] 重新打包构建 `plugins/dsh-mascot-pet`
- [x] 验证向后兼容与 LocalStorage 数据无损升级
- [x] 产出 `walkthrough.md` 交付报告与功能验收清单
