# PRD: DeepSeek Harness 增强套件与 Q 版小鲸鱼姬融合插件 (dsh-mascot-suite)

> **文档性质**：Product Requirement Document (PRD)
> **责任角色**：🎯 PM（产品经理）
> **融合目标**：`dsh-web-ui`（生产力工具箱 + 皮肤中心）+ `dsh-mascot-pet`（Q版小鲸鱼姬桌宠与摸鱼中心）
> **当前阶段**：Phase 1: PRD & Scope (方案规划与可行性审核)

---

## 1. 需求背景与核心价值 (Product Discovery)

| 维度 | 详细说明 |
| :--- | :--- |
| **目标用户 (Who)** | 深度使用 DeepSeek Harness 进行多智能体开发、编码构建与全天候运维的开发者。 |
| **核心场景 (When & Where)** | 1. **全景生产力**：需要任务看板跟踪 Agent 规划、Git 图谱定位代码分支、输入框下实时查看 TPS 与 Token 消耗、手机扫码远程操控。<br>2. **情绪与摸鱼陪伴**：右下角常驻高颜值透明 Q 版「小鲸鱼姬」，跟随思考/工作状态做表情互动，工作间隙背单词、摇美食、玩解压游戏。<br>3. **个性化换肤与统一配置**：在设置弹窗中一键试穿 10 款经典皮肤，并在专属「小鲸鱼姬」与「插件配置」中统一管理所有功能。 |
| **形象定位 (Identity)** | **100% 锁定并保留官方高保真 Q 版女仆小鲸鱼姬形象**（Chibi Whale Maid），舍弃低分辨率像素贴图，保持生动萌系视觉。 |
| **冲突隔离 (Conflict Boundary)** | 保持现有的 `DSH-better-sidebar`（高级侧边栏 + Agent 技能工作台），自动屏蔽旧版 `dsh-aionui-panel`，避免双侧边栏冲突。 |

---

## 2. 功能特性矩阵 (Feature Scope Matrix)

### 🎯 P0（本次融合必须交付功能）

| 模块名称 | 来源 | 功能说明与用户故事 |
| :--- | :--- | :--- |
| **🐳 Q版小鲸鱼姬桌宠** | `dsh-mascot-pet` | 透明浮层常驻右下角，自由拖拽记忆；支持呼吸/思考/活跃/欢呼 4 种表情状态；点击展开摸鱼中心（Token 计费仪、四级单词背诵、美食轮盘、消消乐）。 |
| **⚙️ 专属设置分区** | `dsh-mascot-pet` | 在 DSH 设置弹窗左侧导航栏注入「🐳 小鲸鱼姬」独立卡片，提供桌宠总开关、换装外观预设选择、互动频率配置。 |
| **📋 任务看板 (Task Board)** | `dsh-web-ui` | 侧边栏任务看板：5 列状态流转、点击即拉起真实 Agent 执行、支持 Cron 定时自动巡检任务。 |
| **🌿 Git 图谱 (Git Graph)** | `dsh-web-ui` | 聊天输入框上方分支选择器与全量分支提交可视化泳道图。 |
| **⚡ 实时令牌统计 (Live Stats)** | `dsh-web-ui` | 输入框底栏实时显示生成速度 (TPS)、耗时、Token 消耗与缓存命中率。 |
| **📱 移动端远程控制** | `dsh-web-ui` | 局域网/公网扫码配对，手机端全功能会话、消息收发与模型切换。 |
| **🖥️ SSH 远程连接** | `dsh-web-ui` | 远程主机管理、Web xterm 终端、SFTP 文件传输与 Agent 直连执行。 |
| **🎨 皮肤中心与 10 款主题** | `dsh-web-ui` | Windows XP、Cyberpunk、Blue Fantasy 等 10 款皮肤，支持即时试穿与一键应用。 |
| **📦 超级聚合打包 (Bundle)** | 融合工程 | 单一入口 `dsh-mascot-suite`，通过 `dsh plugin --profile web add` 一键挂载。 |

---

## 3. EARS 验收标准 (Acceptance Criteria)

- **[EARS-1: Q版形象锁定]**
  *WHEN* 启用桌面伴侣
  *THEN* 屏幕右下角展示的是高保真 Q 版女仆小鲸鱼姬（带气泡互动与四态表情），而非像素方块贴图。
- **[EARS-2: 设置弹窗双入口]**
  *WHEN* 用户打开 DSH 设置弹窗
  *THEN* 左侧导航栏应同时包含独立的【小鲸鱼姬】专属设置卡片与【插件配置】/【皮肤中心】。
- **[EARS-3: 生产力插件齐备]**
  *WHEN* 挂载聚合插件后
  *THEN* 任务看板、Git 图谱、实时 TPS、移动端远程、SSH 面板均可正常打开且无报错。
- **[EARS-4: 侧边栏无冲突]**
  *WHEN* 用户使用右侧工作台
  *THEN* 现有的 `DSH-better-sidebar`（含 Agent 技能工作台）保持主控，旧版右侧面板不发生重叠抢占。
