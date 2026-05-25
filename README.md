# TARA - Advanced Local & Cloud AI Assistant

TARA is a privacy-first, highly customizable AI assistant built with React and Vite. It features a completely dynamic UI, secure local-first data storage, and the ability to seamlessly switch between ultra-fast cloud models (Gemini, Groq, xAI) and entirely offline, private local models (Gemma).

---

## ⚡ Core Features

- **Privacy-First Data Architecture**: All your chats, memories, and app states are stored strictly in your browser's LocalStorage and IndexedDB. Nothing is ever sent to a central server outside of your direct AI queries.
- **Secure Master Keychain**: API keys and model configurations are protected behind a custom Master Passcode (PIN). Access to the secure settings panel is strictly locked down.
- **Multi-Agent Profiles**: Seamlessly switch between different AI personalities and system prompts for specialized tasks.
- **Incognito Stealth Mode**: A dedicated, non-recording private chat window exclusively powered by **Groq** for instantaneous, ultra-fast transient conversations.
- **Workflow & App Integrations**: A dedicated "Apps" panel to seamlessly connect TARA with external workflows (GitHub, Figma, Slack, Instagram, LinkedIn) for enhanced cross-platform productivity.
- **Real-Time Data Access**: Integrates with Grok (xAI) for lightning-fast, real-time up-to-date data queries when required.
- **Fluid UI & Animations**: A heavily polished, galaxy-themed interface with micro-interactions, responsive sidebars, and typing animations designed for a premium user experience.

---

## 🤖 Supported LLM Engines (Data Providers)

TARA seamlessly fetches data and intelligence from top-tier API providers and local models:
* **Gemini (Google)**: Versatile cloud LLM for everyday reasoning and context processing.
* **Groq (Llama 3)**: Lightning-fast cloud LLM powered by Groq's LPU for instant generation.
* **Grok (xAI)**: Real-time cloud LLM, ideal for up-to-date data and current events.
* **Gemma (Local)**: Fully on-device local LLM. No internet required — 100% private and secure.

---

## 🧠 Specialized AI Profiles

TARA uses the powerful LLMs above to drive specialized, task-focused AI profiles:

* **Code Pilot**: Specialized for code review, debugging, refactoring, and architecture planning.
* **Writer Pro**: Tailored for essays, ad copy, storytelling, and creative writing.
* **Analyst**: Focused on in-depth research, fact-checking, and data interpretation.
* **Tutor**: Designed for step-by-step explanations, concept breakdowns, and study planning.

---

## 🚀 Installation & Setup

Follow these exact steps to get TARA running on your local machine or a new device:

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your system.
* Download Node.js: [nodejs.org](https://nodejs.org/)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/tara-ai.git
cd tara-ai
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

### 6. First Run Experience
1. Open the local address provided in your terminal (usually `http://localhost:5173`).
2. Go through the initial **Onboarding** sequence to configure your preferred UI theme, set your User Name, and most importantly, set your **Master Passcode** and **Security Question**.
3. You're in! Access your protected API keys panel at any time by clicking "Settings" -> "Profiles" -> "Manage API Keys".

---

## 🛠 Tech Stack

* **Core**: React 18, TypeScript, Vite
* **Styling**: Vanilla CSS (Zero Tailwind bloat) with dynamic inline React styling
* **Icons**: Lucide React
* **Data Storage**: `idb-keyval` (IndexedDB) & LocalStorage
* **Fonts**: Inter, Outfit, Fira Code, Dancing Script (Google Fonts)

---
*Built with precision. Zero fluff.*