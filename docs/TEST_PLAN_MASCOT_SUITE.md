# QA Test Plan & Verification Matrix: DSH 超级增强套件 (dsh-mascot-suite)

> **文档性质**：QA Test Plan & Verification Specification
> **责任角色**：🔍 QA（测试工程师）
> **当前阶段**：Phase 4: Test & Verify 方案规划

---

## 1. 测试用例矩阵 (Verification Matrix)

| 用例 ID | 测试模块 | 测试场景与验证动作 | 预期结果 |
| :--- | :--- | :--- | :--- |
| **TC-01** | **Q版小鲸鱼姬** | 启动页面，观察右下角桌宠形象与呼吸动画 | 渲染为清晰透明 Q 版女仆形象，Idle 态轻微起伏呼吸，无白边或像素马赛克。 |
| **TC-02** | **状态与动作感知** | 触发 Agent 思考与生成，或鼠标点击小鲸鱼姬身体 | 思考时切为 Thinking 表情；点击触发欢呼并弹出摸鱼中心面板。 |
| **TC-03** | **摸鱼功能交互** | 点击摸鱼面板中的四级单词/美食大转盘/消消乐 | 单词挑战正常计分，美食转盘随机抽奖，无报错抛出。 |
| **TC-04** | **设置页专属分区** | 点击 DSH 左下角【设置】，选择左侧【小鲸鱼姬】 | 成功展开小鲸鱼姬专属面板，显示桌宠显隐开关、换装预设卡片。 |
| **TC-05** | **桌宠显隐持久化** | 在设置中关闭桌宠，刷新浏览器页面 | 桌宠平滑淡出隐藏，页面刷新后依然保持隐藏状态。 |
| **TC-06** | **任务看板 (Task Board)** | 点击侧边栏【任务看板】，创建卡片并执行 | 看板正常渲染 5 列，支持将任务派发给 DSH 会话执行。 |
| **TC-07** | **Git 图谱 (Git Graph)** | 在主聊天区查看输入框上方的分支指示器 | 正常显示当前分支名，点击展开提交泳道与分支历史。 |
| **TC-08** | **实时 TPS 监控** | 发送对话请求，观察输入框底栏 | 实时滚动输出当前 TPS 速率、已用 Token 数与缓存命中率。 |
| **TC-09** | **皮肤中心试穿** | 进入【设置 > 皮肤中心】，点击试穿「Windows XP」 | 界面即时呈现 Luna 经典蓝天绿地风格，桌宠浮层保持正常不受破坏。 |
| **TC-10** | **侧边栏无冲突** | 打开右侧 `DSH-better-sidebar` 工作台与 Agent 技能页 | 侧边栏多分屏、代码编辑与 Agent 技能管理正常，无旧版面板重叠。 |

---

## 2. 自动化测试与打包验证流程

1. **单模块构建自检**：
   ```bash
   pnpm --filter @deepseek-ai/dsh-mascot-pet run build
   pnpm --filter @linxin666/dsh-web-ui-all run build
   ```
2. **Profile 依赖挂载验证**：
   ```bash
   pnpm dsh plugin --profile web add ./dsh-web-ui/packages/dsh-web-ui-all
   ```
3. **冒烟回归验证**：
   - 启动 `pnpm dsh web`，通过内置浏览器自动化子代理（Playwright）进行端到端全量页面检查。
