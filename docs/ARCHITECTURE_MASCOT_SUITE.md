# System Architecture & Fusion Spec: DSH 超级增强套件 (dsh-mascot-suite)

> **文档性质**：Architecture & Technical Specification  
> **责任角色**：🏗️ ARCH（系统架构师）  
> **关联源码**：`dsh-web-ui/` + `dsh-mascot-pet/`  
> **当前阶段**：Phase 2: Arch & DB (架构可行性与融合设计)  

---

## 1. 系统融合拓扑图 (Topology)

```
                       ┌─────────────────────────────────────────────────────────┐
                       │          DeepSeek Harness Web Runtime (Cordis Ctx)      │
                       └────────────────────────────┬────────────────────────────┘
                                                    │
                      ┌─────────────────────────────┴────────────────────────────┐
                      │    dsh-mascot-suite (超级聚合包 cordis.patch.yml)        │
                      └──────┬──────────────────────┬─────────────────────┬──────┘
                             │                      │                     │
      ┌──────────────────────┴───────┐   ┌──────────┴──────────┐   ┌──────┴──────────────────────┐
      │  🐳 桌宠与摸鱼伴侣层           │   │ 📋 生产力与运维工具箱 │   │ 🎨 视觉主题与设置中心        │
      ├──────────────────────────────┤   ├─────────────────────┤   ├─────────────────────────────┤
      │ • Q版小鲸鱼姬 (高清 SVG/PNG) │   │ • Task Board 任务看板│   │ • Skin Center (10款经典皮肤)│
      │ • 4态呼吸/思考/活跃状态感知  │   │ • Git Graph 提交图谱│   │ • Web UI Plugins 配置中心   │
      │ • 摸鱼中心 (单词/美食/游戏)  │   │ • Live Stats 实时TPS│   │ • 🐳 小鲸鱼姬专属设置卡片   │
      │ • pet_interact Agent 工具    │   │ • Remote Mobile 配对│   │   (换装预设/显隐/交互偏好)  │
      │ • Token 消耗实时计费仪       │   │ • SSH 远程运维面板  │   │                             │
      └──────────────────────────────┘   └─────────────────────┘   └─────────────────────────────┘
```

---

## 2. 冲突消除与模块置换策略 (Conflict Mitigation)

| 潜在冲突点 | 冲突原因 | 解决与仲裁决策 |
| :--- | :--- | :--- |
| **右侧面板冲突** | `dsh-web-ui` 包含 `dsh-aionui-panel`，而当前系统已安装高级 `DSH-better-sidebar` | **禁用 `dsh-aionui-panel`**：聚合 patch 中移除该模块，保证 `DSH-better-sidebar` 作为唯一侧边栏主控。 |
| **桌宠资产冲突** | `dsh-web-ui` 包含像素鲸鱼 `dsh-pet`，而用户要求保留 Q 版小鲸鱼姬 | **置换为 `dsh-mascot-pet`**：完全采用 Q 版女仆小鲸鱼姬高保真资产与状态机，移除像素贴图。 |
| **设置页路由冲突** | 多个插件向 DSH 设置注入页面 | **双轨并行注册**：通用工具注入 `settings.plugin.item`，小鲸鱼姬注入顶级 `settings.section`（左侧专属大项）。 |

---

## 3. Cordis Bundle 聚合契约 (`cordis.patch.yml`)

```yaml
# dsh-mascot-suite 聚合补丁层
- insert:
    - id: mascot-pet
      name: '@deepseek-ai/dsh-mascot-pet'
    - id: ui-web-ui-settings
      name: '@linxin666/dsh-client-ui-web-ui-settings'
    - id: ui-task-board
      name: '@linxin666/dsh-client-ui-task-board'
    - id: ui-git-graph
      name: '@linxin666/dsh-client-ui-git-graph'
    - id: live-stats
      name: '@linxin666/dsh-live-stats'
    - id: remote-web-ui
      name: '@linxin666/dsh-remote-web-ui'
    - id: ssh
      name: '@linxin666/dsh-ssh'
    - id: describe-image
      name: '@linxin666/dsh-tool-describe-image'
    - id: ui-skin-center
      name: '@linxin666/dsh-client-ui-skin-center'
```

---

## 4. UI 插槽分配与层级安全围栏 (Slot Allocation)

```
1. 顶部/全局层:
   - 全局 Slot: conversation.layout.overlay / DOM Host (小鲸鱼姬桌宠浮层, z-index: 9999)
2. 侧边栏/导航层:
   - 侧边栏 Item: 任务看板 (task-board), SSH (ssh-manager)
   - 聊天底栏 Slot: live-stats (实时 TPS / Token 计数条)
   - 输入框顶栏 Slot: git-graph (分支切换与图谱)
3. 设置弹窗层:
   - 设置左侧 Section (settings.section):
     ├── 通用设置 / 模型 / 插件 / Agent 预设 / 侧边卡片
     └── 🐳 小鲸鱼姬 (mascot-pet 专属卡片, order: 110)
   - 插件子项 Slot (settings.plugin.item):
     └── Web UI 插件配置中心 (web-ui-plugins)
```
