# DeepSeek 小鲸鱼姬桌宠与摸鱼伴侣插件 (dsh-mascot-pet)

> **DeepSeek Harness 官方标准插件** | **一切皆插件** | **由 Cordis 驱动**

`dsh-mascot-pet` 是专为 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 打造的桌面萌宠与摸鱼解压伴侣插件。基于 Cordis 双端插件架构设计，完美解耦，无缝集成于 DSH 桌面端与 Web 工作台。

---

## ✨ 核心特性

- 🐳 **Q版透明萌宠 (Chibi Whale Maid)**：纯透明悬浮于界面，支持鼠标自由拖拽并自动持久化位置坐标；
- 🧠 **Agent 思考状态深度联动**：实时感知 Agent 执行状态，动态切换待命、深度思考（呼吸发光）、开心、摸鱼等表情立绘；
- 💬 **实时台词气泡与互动**：展示思考秒数、Token 实时消费，支持单击一键唤起多功能伴侣面板；
- 📊 **用量与计费看板**：基于 DeepSeek V3 / R1 官方计费模型，实时精确统计本次会话与当月累计开销及 Token 速率；
- 🔤 **CET-4 英语四级乱序闯关**：内置数百条高频四级核心词库，支持 4 选 1 乱序释义闯关与每日打卡；
- 🫧 **程序员摸鱼消消乐**：工作之余一键开启 20 秒解压消泡泡挑战；
- 🎲 **美食大转盘**：“今天吃什么”程序员终极选择困难救星；
- 😄 **极客笑话库**：精选程序员趣味段子与冷笑话；
- 🛠️ **Host 端工具支持 (`pet_interact`)**：模型可主动通过工具向桌宠发送动作、改变心情表情或向用户推送小贴士。

---

## 📦 安装与快速启用

### 方式 1：通过 DSH CLI 一键安装（推荐）

在终端中执行：
```bash
dsh plugin --profile <your-profile> add dsh-mascot-pet
```

### 方式 2：手动挂载到 `cordis.patch.yml`

在你的 DSH 项目 `cordis.patch.yml` 中添加：
```yaml
- insert:
    - id: mascot-pet
      name: 'dsh-mascot-pet'
```

### 方式 3：执行一键脚本

- **Windows (PowerShell)**:
  ```powershell
  .\scripts\install.ps1
  ```
- **macOS / Linux (Bash)**:
  ```bash
  bash scripts/install.sh
  ```

---

## 🏗️ 架构与扩展

```
dsh-mascot-pet/
├── src/
│   ├── index.ts              # Host (Node.js) 插件: 注册 MascotService 与 pet_interact 工具
│   ├── client/               # Browser 前端 Half (Web UI 扩展)
│   │   ├── index.tsx         # 前端 Cordis 插件入口: apply(ctx), 注册全局浮动 Slot / DOM 挂载
│   │   ├── MascotPet.tsx     # 核心桌宠组件 (拖拽/状态机/心情气泡/事件监听)
│   │   ├── MascotDashboard.tsx # 5 大功能伴侣面板
│   │   ├── pricing-engine.ts # DeepSeek 模型 Token 计费引擎
│   │   ├── cet4-vocab-data.ts# 英语四级高频词库
│   │   └── modules/          # 背单词、消消乐、美食转盘、极客段子
└── tests/                    # Vitest 单元测试套件
```

---

## 📄 开源许可证

本项目基于 [MIT 许可证](LICENSE) 开源。
