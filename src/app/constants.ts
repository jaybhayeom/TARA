import {
  Bot, Cloud, HardDrive, Code2, PenLine, FlaskConical, GraduationCap,
  Palette, Bell, Volume2, Shield, Keyboard, Moon,
  Mail, Linkedin, Briefcase, Newspaper, Zap
} from "lucide-react";
import { SpinningStar } from "./components/SpinningStar";
import { AppLink, HistoryItem } from "./types";

export const DEFAULT_APP_LINKS: AppLink[] = [
  { id: "instagram",   name: "Instagram",   url: "https://instagram.com",    color: "#fff", bg: "linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)" },
  { id: "linkedin",    name: "LinkedIn",    url: "https://linkedin.com",     color: "#fff", bg: "#0a66c2" },
  { id: "internshala", name: "Internshala", url: "https://internshala.com",  color: "#fff", bg: "#00a651" },
  { id: "whatsapp",    name: "WhatsApp",    url: "https://web.whatsapp.com", color: "#fff", bg: "#25d366" },
  { id: "snapchat",    name: "Snapchat",    url: "https://snapchat.com",     color: "#111", bg: "#fffc00" },
  { id: "gmail",       name: "Gmail",       url: "https://mail.google.com",  color: "#fff", bg: "#ea4335" },
  { id: "claude",      name: "Claude",      url: "https://claude.ai",        color: "#fff", bg: "#c96c38" },
  { id: "github",      name: "GitHub",      url: "https://github.com",       color: "#fff", bg: "#24292e" },
  { id: "huggingface", name: "HuggingFace", url: "https://huggingface.co",   color: "#111", bg: "#ffd21e" },
  { id: "figma",       name: "Figma",       url: "https://figma.com",        color: "#fff", bg: "#f24e1e" },
];

export const AGENTS: Record<string, any> = {
  gemma: {
    label: "Gemma", version: "2B", desc: "Runs fully on-device",
    sub: "Offline · Local", color: "#34d399",
    dim: "rgba(16,185,129,0.13)", border: "rgba(16,185,129,0.2)",
    Icon: Bot, ModeIcon: HardDrive, modeLabel: "Offline", modeColor: "#34d399",
  },
  gemini: {
    label: "Gemini", version: "Flash", desc: "Google cloud model",
    sub: "Online · Cloud", color: "#a78bfa",
    dim: "rgba(139,92,246,0.13)", border: "rgba(139,92,246,0.2)",
    Icon: SpinningStar, ModeIcon: Cloud, modeLabel: "Online", modeColor: "#60a5fa",
  },
  groq: {
    label: "Groq", version: "Llama 3", desc: "Ultra-fast Groq cloud model",
    sub: "Online · Cloud", color: "#f97316",
    dim: "rgba(249,115,22,0.13)", border: "rgba(249,115,22,0.2)",
    Icon: Zap, ModeIcon: Cloud, modeLabel: "Online", modeColor: "#f97316",
  },
  grok: {
    label: "Grok", version: "xAI", desc: "Real-time xAI model",
    sub: "Online · Cloud", color: "#fb923c",
    dim: "rgba(251,146,60,0.13)", border: "rgba(251,146,60,0.2)",
    Icon: Zap, ModeIcon: Cloud, modeLabel: "Online", modeColor: "#fb923c",
  },
};

export const AGENT_PRESETS = [
  {
    id: "gemini", name: "Gemini Flash", role: "General Profile",
    desc: "Versatile cloud model — everyday questions, summaries, brainstorming and quick lookups.",
    tags: ["General", "Fast", "Cloud"], color: "#a78bfa", dim: "rgba(139,92,246,0.13)", border: "rgba(139,92,246,0.2)",
    Icon: SpinningStar, badge: "Flash",
  },
  {
    id: "gemma", name: "Gemma 2B", role: "Offline Profile",
    desc: "Fully on-device model. No internet required — private, secure and always available.",
    tags: ["Offline", "Private", "Local"], color: "#34d399", dim: "rgba(16,185,129,0.13)", border: "rgba(16,185,129,0.2)",
    Icon: Bot, badge: "2B",
  },
  {
    id: "groq", name: "Groq Llama 3", role: "Ultra-Fast Profile",
    desc: "Lightning-fast responses powered by Groq's LPU. Ideal for rapid coding, reasoning, and real-time conversation.",
    tags: ["Fast", "Llama 3", "Cloud"], color: "#f97316", dim: "rgba(249,115,22,0.13)", border: "rgba(249,115,22,0.2)",
    Icon: Zap, badge: "LPU",
  },
  {
    id: "grok", name: "Grok", role: "Real-Time AI",
    desc: "Real-time AI by xAI. Ideal for up-to-date data, research, and coding.",
    tags: ["Real-Time", "xAI", "Cloud"], color: "#fb923c", dim: "rgba(251,146,60,0.13)", border: "rgba(251,146,60,0.2)",
    Icon: Zap, badge: "Pro",
  },
  {
    id: "code", name: "Code Pilot", role: "Developer Profile",
    desc: "Code review, debugging, refactoring, architecture planning and writing tests.",
    tags: ["Debug", "Review", "Refactor"], color: "#60a5fa", dim: "rgba(96,165,250,0.13)", border: "rgba(96,165,250,0.22)",
    Icon: Code2, badge: "Dev",
  },
  {
    id: "writer", name: "Writer Pro", role: "Content & Copy Profile",
    desc: "Blog posts, essays, ad copy, storytelling, email drafts and creative writing.",
    tags: ["Essays", "Copy", "Creative"], color: "#f472b6", dim: "rgba(244,114,182,0.13)", border: "rgba(244,114,182,0.22)",
    Icon: PenLine, badge: "Pro",
  },
  {
    id: "research", name: "Analyst", role: "Research & Analysis Profile",
    desc: "In-depth research, fact-checking, data interpretation and executive summaries.",
    tags: ["Research", "Analysis", "Data"], color: "#fb923c", dim: "rgba(251,146,60,0.13)", border: "rgba(251,146,60,0.22)",
    Icon: FlaskConical, badge: "Pro",
  },
  {
    id: "tutor", name: "Tutor", role: "Learning & Education Profile",
    desc: "Step-by-step explanations, concept breakdowns, quizzes and study planning.",
    tags: ["Explain", "Learn", "Teach"], color: "#a3e635", dim: "rgba(163,230,53,0.13)", border: "rgba(163,230,53,0.22)",
    Icon: GraduationCap, badge: "Edu",
  },
];

export const HISTORY: HistoryItem[] = [
  { id: "1", title: "Quantum computing basics",  time: "4m ago",    agent: "gemini" },
  { id: "2", title: "Python async patterns",     time: "1h ago",    agent: "gemma"  },
  { id: "3", title: "Recipe ideas for tonight",  time: "3h ago",    agent: "gemma"  },
  { id: "4", title: "SQL JOIN optimization",     time: "Yesterday", agent: "gemini" },
  { id: "5", title: "Cover letter draft",        time: "2 days ago",agent: "gemini" },
];

export const SETTINGS_ITEMS = [
  { Icon: Palette,  label: "Appearance",   desc: "Theme & display"    },
  { Icon: Bell,     label: "Notifications", desc: "Alerts & reminders" },
  { Icon: Volume2,  label: "Audio",         desc: "Voice & sound"      },
  { Icon: Shield,   label: "Privacy",       desc: "Data & permissions" },
  { Icon: Keyboard, label: "Shortcuts",     desc: "Key bindings"       },
  { Icon: Moon,     label: "Offline Mode",  desc: "Local model config" },
];

export const RECS = [
  {
    id: 1, label: "Email", icon: Mail, color: "#60a5fa",
    dim: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.18)",
    title: "3 unread messages", sub: "Standup notes · PR review request", time: "2m ago",
  },
  {
    id: 2, label: "LinkedIn", icon: Linkedin, color: "#38bdf8",
    dim: "rgba(56,189,248,0.10)", border: "rgba(56,189,248,0.18)",
    title: "5 new connections", sub: "Sarah M. accepted · 2 new messages", time: "15m ago",
  },
  {
    id: 3, label: "Jobs", icon: Briefcase, color: "#a78bfa",
    dim: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.18)",
    title: "12 new job matches", sub: "Senior React Dev at Stripe · Figma", time: "1h ago",
  },
  {
    id: 4, label: "Trending", icon: Newspaper, color: "#fb923c",
    dim: "rgba(251,146,60,0.10)", border: "rgba(251,146,60,0.18)",
    title: "AI regulation bill passes", sub: "EU announces new AI Act update", time: "3h ago",
  },
];

export const REPLIES = [
  "Got it — here's a focused breakdown based on what you asked.",
  "Interesting question. Let me walk you through the key points.",
  "Sure thing. Here's what I know about that topic.",
  "Based on your input, here's a concise response for you.",
  "Here's a Python function that does exactly that:\n\n```python\ndef fetch_data(url: str, timeout: int = 10) -> dict:\n    \"\"\"Fetch JSON data from a URL with error handling.\"\"\"\n    import requests\n    try:\n        response = requests.get(url, timeout=timeout)\n        response.raise_for_status()\n        return response.json()\n    except requests.RequestException as e:\n        print(f\"Error: {e}\")\n        return {}\n\n# Example usage\ndata = fetch_data(\"https://api.example.com/data\")\nprint(data)\n```\n\nThis handles timeouts and HTTP errors gracefully.",
  "Here's a clean JavaScript async example:\n\n```javascript\nconst fetchUser = async (userId) => {\n  try {\n    const res = await fetch(`/api/users/${userId}`);\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    const user = await res.json();\n    return user;\n  } catch (err) {\n    console.error('Failed to fetch user:', err);\n    return null;\n  }\n};\n\n// Usage\nfetchUser(42).then(user => {\n  if (user) console.log(`Hello, ${user.name}!`);\n});\n```",
  "Here's the React component structure you need:\n\n```tsx\nimport { useState, useEffect } from 'react';\n\ninterface Props {\n  title: string;\n  onSubmit: (value: string) => void;\n}\n\nexport function SearchBox({ title, onSubmit }: Props) {\n  const [query, setQuery] = useState('');\n\n  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (query.trim()) onSubmit(query.trim());\n  };\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <h2>{title}</h2>\n      <input\n        value={query}\n        onChange={e => setQuery(e.target.value)}\n        placeholder=\"Search...\"\n      />\n      <button type=\"submit\">Search</button>\n    </form>\n  );\n}\n```",
];
