# DeepSeek Mascot Pet Plugin (dsh-mascot-pet)

> **Official DeepSeek Harness Plugin** | **Everything is a Plugin** | **Powered by Cordis**

`dsh-mascot-pet` is an interactive desktop pet & relaxation companion plugin designed specifically for [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness). Built on top of the dual-half Cordis plugin architecture, it seamlessly mounts into both DSH Web and Desktop environments.

---

## ✨ Features

- 🐳 **Chibi Whale Maid Desktop Pet**: Fully transparent floating pet with draggable position and coordinate persistence.
- 🧠 **Agent State Synchronized**: Dynamically reacts to agent reasoning (idle, thinking glow, happy, relaxation).
- 💬 **Live Dialog & Thinking Bubble**: Displays thinking seconds, real-time token cost, and interactive dialogue.
- 📊 **Token Meter & Cost Dashboard**: Accurate DeepSeek V3 / R1 pricing estimation and monthly budget tracking.
- 🔤 **CET-4 Vocabulary Quiz**: Built-in 4-option English vocabulary challenge with daily check-in streak.
- 🫧 **Bubble Pop Mini-Game**: 20-second relaxing bubble popping challenge for developers.
- 🎲 **Food Recommendation Wheel**: "What to eat today" decision wheel.
- 😄 **Geek Humor & Jokes**: Curated developer jokes and punchlines.
- 🛠️ **Host Tool Support (`pet_interact`)**: The model can proactively trigger pet animations, speech bubbles, and health reminders.

---

## 📦 Installation

### CLI (Recommended)

```bash
dsh plugin --profile <your-profile> add dsh-mascot-pet
```

### Manual Cordis Patch

Add to your `cordis.patch.yml`:
```yaml
- insert:
    - id: mascot-pet
      name: 'dsh-mascot-pet'
```

---

## 📄 License

[MIT License](LICENSE)
