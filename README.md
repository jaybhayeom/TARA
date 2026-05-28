# TARA - Advanced Local & Cloud AI Assistant

<p align="center">
  <img src="./doc/screenshot1.png" alt="TARA Dashboard UI 1" width="400"/>
  <img src="./doc/screenshot2.png" alt="TARA Dashboard UI 2" width="400"/>
  <img src="./doc/screenshot3.png" alt="TARA Dashboard UI 3" width="400"/>
  <img src="./doc/screenshot4.png" alt="TARA Dashboard UI 4" width="400"/>
</p>

TARA is a privacy-first, highly customizable AI assistant built with React and Vite. It features a completely dynamic UI, secure local-first data storage, and the ability to seamlessly switch between ultra-fast cloud models (Gemini, Groq, xAI) and entirely offline, private local models (Gemma).

---

## ⚡ Core Architecture & Privacy

- **Local-First Data Storage**: All your chats, conversation threads, and app states are stored strictly in your browser's LocalStorage and IndexedDB. Nothing is ever sent to a central server outside of your direct AI queries.
- **Ironclad Master Keychain**: TARA features a custom locking system. Your API keys and personal memories are protected behind a user-defined Master Passcode (PIN). Access to the secure settings panel is strictly locked down.
- **Fallback Security Questions**: If you forget your Master Passcode, a custom Security Question flow allows you to securely reset the app data without crashing.
- **Background Memory Extraction**: TARA quietly listens to your conversations and automatically extracts personal context (User Bio, goals, preferences) to improve future personalization, storing it securely in your local memory bank.
- **Intelligent Prompt Rewriter**: TARA can optionally intercept your simple messages and automatically rewrite them into highly-structured, detailed prompts for the LLM to yield vastly superior answers.
- **Graceful Error Handling**: A custom React `ErrorBoundary` ensures that if a module crashes, you get a clean fallback screen allowing you to reset your data safely instead of a blank white screen of death.

---

## 🤖 Supported LLM Engines (Data Providers)

TARA seamlessly fetches data and intelligence from top-tier API providers and local models:
* **Gemini (Google)**: Versatile cloud LLM for everyday reasoning and context processing (Configured for Gemini 3.5 Flash).
* **Groq (Llama 3)**: Lightning-fast cloud LLM powered by Groq's LPU for instant generation.
* **Grok (xAI)**: Real-time cloud LLM, ideal for up-to-date data and current events.
* **Gemma (Local via Ollama)**: Fully on-device local LLM. No internet required — 100% private and secure.

---

## 🧠 Specialized AI Profiles

TARA uses the powerful LLMs above to drive specialized, task-focused AI profiles:
* **Code Pilot**: Specialized for code review, debugging, refactoring, and architecture planning.
* **Writer Pro**: Tailored for essays, ad copy, storytelling, and creative writing.
* **Analyst**: Focused on in-depth research, fact-checking, and data interpretation.
* **Tutor**: Designed for step-by-step explanations, concept breakdowns, and study planning.

---

## 🌌 Premium UI & Experience

- **"Galaxy Vibe" Aesthetics**: A heavily polished, galaxy-themed interface with micro-interactions, glowing elements, spinning stars, breathing lights, and a deeply immersive dark mode layout.
- **Advanced Typography**: Meticulously curated font pairing (Inter, Fira Code, and cursive fonts like Dancing Script) that dynamically changes based on context (code vs casual conversation).
- **Incognito Stealth Mode**: A dedicated, non-recording private chat window exclusively powered by **Groq** for instantaneous, ultra-fast transient conversations that vanish the moment you close the window.
- **Multi-Threaded Conversations**: A dynamic sidebar allowing you to organize, rename, and delete multiple chats. TARA even features an "Auto-Title" system that reads your first message and automatically names the thread.
- **Rich Messaging Engine**: Full support for markdown rendering, table generation, syntax-highlighted code blocks, and File Attachments (automatically decoding text/CSV files into Base64 for the LLM).

---

## 🔗 Workflow & App Integrations

- **Centralized Apps Panel**: A dedicated section to seamlessly launch and connect TARA with external workflows including **GitHub, Figma, Slack, Instagram, and LinkedIn**. TARA acts as your central command hub for cross-platform productivity.

---

## 🚀 Installation & Setup

Follow these exact steps to get TARA running on your local machine or a new device:

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your system.
* Download Node.js: [nodejs.org](https://nodejs.org/)

### 2. Clone the Repository
```bash
git clone https://github.com/jaybhayeom/TARA.git
cd TARA
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure API Keys (Two Options)

You can add your API keys directly into the TARA interface, or set them globally using an environment file.

**Option A: Setting keys in the app (Recommended)**
1. Start the app and complete the Onboarding (see Step 6).
2. Click **Settings -> Profiles**.
3. Click **Manage API Keys & Local Models** (Requires your Master Passcode).
4. Paste your keys directly into the secure UI.

**Option B: Setting keys via `.env` file**
1. Duplicate the `.env.example` file and rename it strictly to `.env`.
2. Insert your API keys inside the file.
*(Note: Your `.env` file is heavily protected and ignored by GitHub, ensuring your keys are never leaked).*

**Where to get your API Keys:**
* **Gemini API Key**: Get it from [Google AI Studio](https://aistudio.google.com/app/apikey).
* **Groq API Key**: Get it from the [GroqCloud Console](https://console.groq.com/keys).
* **xAI / Grok API Key**: Get it from the [xAI Console](https://console.x.ai/).

### 5. Setup Local Offline Models (Gemma via Ollama)
If you want to use **Gemma** or any other model completely offline for maximum privacy:
1. Download and install **Ollama** from [ollama.com](https://ollama.com/).
2. Open a new terminal and run: `ollama run gemma` (or `ollama run gemma4:e4b` if you are using a specific custom variant).
3. Leave Ollama running in the background. TARA will automatically detect it and allow you to chat with Gemma completely locally!

### 6. Start the Development Server
```bash
npm run dev
```

### 7. First Run Experience
1. Open the local address provided in your terminal (usually `http://localhost:5173`).
2. Go through the initial **Onboarding** sequence to configure your preferred UI theme, set your User Name, and most importantly, set your **Master Passcode** and **Security Question**.

---

## 🐛 Troubleshooting

**Ollama Connection Refused (CORS Error)**
If TARA cannot connect to your local Gemma model running in Ollama, it is likely because Ollama is blocking the browser connection by default.
1. Close your terminal running Ollama.
2. If on Windows (PowerShell), run: `$env:OLLAMA_ORIGINS="*"`
3. If on Mac/Linux, run: `export OLLAMA_ORIGINS="*"`
4. Restart Ollama by typing `ollama serve`. TARA should now instantly connect!

---

## 📜 License

This project is entirely open-source and available to anyone under the **MIT License**. You are free to use, modify, distribute, and build upon this software!

---

## 👨‍💻 Author & Credits

Designed and engineered by **Om Jaybhaye**.

* **Email**: [ojaybhaye04@gmail.com](mailto:ojaybhaye04@gmail.com)
* **GitHub**: [@jaybhayeom](https://github.com/jaybhayeom)
* **LinkedIn**: [Om Jaybhaye](https://www.linkedin.com/in/om-jaybhaye-py)

*If you found this project helpful, please consider leaving a ⭐️ on the repository!*