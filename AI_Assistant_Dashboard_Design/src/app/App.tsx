import { useState, useRef, useEffect, useCallback } from "react";
import {
  Settings, History, Send, User, Wifi, WifiOff,
  Bot, ChevronDown, ChevronRight, Plus, SquarePen,
  Trash2, Palette, Bell, Shield, Moon, Keyboard, Volume2, X,
  Cloud, HardDrive, CheckCircle2, Code2, PenLine,
  FlaskConical, GraduationCap, Users, ArrowLeft,
  Mail, Linkedin, Briefcase, Newspaper,
  Ghost, MoreHorizontal, Pin, Pencil,
  LayoutGrid, Link, ExternalLink,
  Copy, RotateCcw, Check,
} from "lucide-react";
import { BreathingLight } from "./components/BreathingLight";
import { SpinningStar } from "./components/SpinningStar";
import { Onboarding, THEMES, type ThemeConfig } from "./components/Onboarding";
import { ThemeBackground } from "./components/ThemeBackground";

type Agent = "gemma" | "gemini";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: Agent;
}

interface HistoryItem {
  id: string;
  title: string;
  time: string;
  agent: Agent;
  pinned?: boolean;
}

interface AppLink {
  id: string;
  name: string;
  url: string;
  color: string;
  bg: string;
}

const DEFAULT_APP_LINKS: AppLink[] = [
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

const AGENTS = {
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
};

/* ── Specialist agent presets ── */
const AGENT_PRESETS = [
  {
    id: "gemini", name: "Gemini Flash", role: "General Assistant",
    desc: "Versatile cloud model — everyday questions, summaries, brainstorming and quick lookups.",
    tags: ["General", "Fast", "Cloud"], color: "#a78bfa", dim: "rgba(139,92,246,0.13)", border: "rgba(139,92,246,0.2)",
    Icon: SpinningStar, badge: "Flash",
  },
  {
    id: "gemma", name: "Gemma 2B", role: "Offline Assistant",
    desc: "Fully on-device model. No internet required — private, secure and always available.",
    tags: ["Offline", "Private", "Local"], color: "#34d399", dim: "rgba(16,185,129,0.13)", border: "rgba(16,185,129,0.2)",
    Icon: Bot, badge: "2B",
  },
  {
    id: "code", name: "Code Pilot", role: "Developer Agent",
    desc: "Code review, debugging, refactoring, architecture planning and writing tests.",
    tags: ["Debug", "Review", "Refactor"], color: "#60a5fa", dim: "rgba(96,165,250,0.13)", border: "rgba(96,165,250,0.22)",
    Icon: Code2, badge: "Dev",
  },
  {
    id: "writer", name: "Writer Pro", role: "Content & Copy Agent",
    desc: "Blog posts, essays, ad copy, storytelling, email drafts and creative writing.",
    tags: ["Essays", "Copy", "Creative"], color: "#f472b6", dim: "rgba(244,114,182,0.13)", border: "rgba(244,114,182,0.22)",
    Icon: PenLine, badge: "Pro",
  },
  {
    id: "research", name: "Analyst", role: "Research & Analysis Agent",
    desc: "In-depth research, fact-checking, data interpretation and executive summaries.",
    tags: ["Research", "Analysis", "Data"], color: "#fb923c", dim: "rgba(251,146,60,0.13)", border: "rgba(251,146,60,0.22)",
    Icon: FlaskConical, badge: "Pro",
  },
  {
    id: "tutor", name: "Tutor", role: "Learning & Education Agent",
    desc: "Step-by-step explanations, concept breakdowns, quizzes and study planning.",
    tags: ["Explain", "Learn", "Teach"], color: "#a3e635", dim: "rgba(163,230,53,0.13)", border: "rgba(163,230,53,0.22)",
    Icon: GraduationCap, badge: "Edu",
  },
];

const HISTORY: HistoryItem[] = [
  { id: "1", title: "Quantum computing basics",  time: "4m ago",    agent: "gemini" },
  { id: "2", title: "Python async patterns",     time: "1h ago",    agent: "gemma"  },
  { id: "3", title: "Recipe ideas for tonight",  time: "3h ago",    agent: "gemma"  },
  { id: "4", title: "SQL JOIN optimization",     time: "Yesterday", agent: "gemini" },
  { id: "5", title: "Cover letter draft",        time: "2 days ago",agent: "gemini" },
];

const SETTINGS_ITEMS = [
  { Icon: Palette,  label: "Appearance",   desc: "Theme & display"    },
  { Icon: Bell,     label: "Notifications", desc: "Alerts & reminders" },
  { Icon: Volume2,  label: "Audio",         desc: "Voice & sound"      },
  { Icon: Shield,   label: "Privacy",       desc: "Data & permissions" },
  { Icon: Keyboard, label: "Shortcuts",     desc: "Key bindings"       },
  { Icon: Moon,     label: "Offline Mode",  desc: "Local model config" },
];

const RECS = [
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

const REPLIES = [
  "Got it — here's a focused breakdown based on what you asked.",
  "Interesting question. Let me walk you through the key points.",
  "Sure thing. Here's what I know about that topic.",
  "Based on your input, here's a concise response for you.",
  "Here's a Python function that does exactly that:\n\n```python\ndef fetch_data(url: str, timeout: int = 10) -> dict:\n    \"\"\"Fetch JSON data from a URL with error handling.\"\"\"\n    import requests\n    try:\n        response = requests.get(url, timeout=timeout)\n        response.raise_for_status()\n        return response.json()\n    except requests.RequestException as e:\n        print(f\"Error: {e}\")\n        return {}\n\n# Example usage\ndata = fetch_data(\"https://api.example.com/data\")\nprint(data)\n```\n\nThis handles timeouts and HTTP errors gracefully.",
  "Here's a clean JavaScript async example:\n\n```javascript\nconst fetchUser = async (userId) => {\n  try {\n    const res = await fetch(`/api/users/${userId}`);\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    const user = await res.json();\n    return user;\n  } catch (err) {\n    console.error('Failed to fetch user:', err);\n    return null;\n  }\n};\n\n// Usage\nfetchUser(42).then(user => {\n  if (user) console.log(`Hello, ${user.name}!`);\n});\n```",
  "Here's the React component structure you need:\n\n```tsx\nimport { useState, useEffect } from 'react';\n\ninterface Props {\n  title: string;\n  onSubmit: (value: string) => void;\n}\n\nexport function SearchBox({ title, onSubmit }: Props) {\n  const [query, setQuery] = useState('');\n\n  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (query.trim()) onSubmit(query.trim());\n  };\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <h2>{title}</h2>\n      <input\n        value={query}\n        onChange={e => setQuery(e.target.value)}\n        placeholder=\"Search...\"\n      />\n      <button type=\"submit\">Search</button>\n    </form>\n  );\n}\n```",
];

export default function App() {
  const [onboarded, setOnboarded] = useState<boolean>(false);
  const [userName,  setUserName]  = useState<string>("Alex");
  const [themeId,   setThemeId]   = useState<string>("midnight");
  const appTheme: ThemeConfig = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const [agent,          setAgent]          = useState<Agent>("gemini");
  const [isOnline,       setIsOnline]       = useState(true);
  const [messages,       setMessages]       = useState<Message[]>([]);
  const [input,          setInput]          = useState("");
  const [isTyping,       setIsTyping]       = useState(false);
  const [showAgent,      setShowAgent]      = useState(false);
  const [showHistory,    setShowHistory]    = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [showProfile,    setShowProfile]    = useState(false);
  const [showAgents,     setShowAgents]     = useState(false);   // agents sub-panel
  const [activePreset,   setActivePreset]   = useState("gemini");
  const [isFocused,      setIsFocused]      = useState(false);
  const [dismissedRecs,  setDismissedRecs]  = useState<Set<number>>(new Set());
  const [hoveredMsg,     setHoveredMsg]     = useState<string | null>(null);
  const [showIncognitoModal,   setShowIncognitoModal]   = useState(false);
  const [showIncognitoWindow,  setShowIncognitoWindow]  = useState(false);
  const [incognitoMessages,    setIncognitoMessages]    = useState<Message[]>([]);
  const [incognitoInput,       setIncognitoInput]       = useState("");
  const [incognitoTyping,      setIncognitoTyping]      = useState(false);
  const [incognitoFocused,     setIncognitoFocused]     = useState(false);
  const incognitoEndRef = useRef<HTMLDivElement>(null);
  const incognitoTaRef  = useRef<HTMLTextAreaElement>(null);
  const [historyList,    setHistoryList]    = useState<HistoryItem[]>(HISTORY);
  const [historyMenuId,  setHistoryMenuId]  = useState<string | null>(null);
  const [historyMenuPos, setHistoryMenuPos] = useState({ x: 0, y: 0 });
  const [renamingId,     setRenamingId]     = useState<string | null>(null);
  const [renameValue,    setRenameValue]    = useState("");
  const [showApps,       setShowApps]       = useState(false);
  const [appLinks,       setAppLinks]       = useState<AppLink[]>(DEFAULT_APP_LINKS);
  const [showAddLink,    setShowAddLink]    = useState(false);
  const [newLinkName,    setNewLinkName]    = useState("");
  const [newLinkUrl,     setNewLinkUrl]     = useState("");
  const [hoveredApp,     setHoveredApp]     = useState<string | null>(null);
  const [editApps,       setEditApps]       = useState(false);
  const [renamingAppId,  setRenamingAppId]  = useState<string | null>(null);
  const [renameAppValue, setRenameAppValue] = useState("");
  const [copiedId,       setCopiedId]       = useState<string | null>(null);

  const endRef  = useRef<HTMLDivElement>(null);
  const taRef   = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const cfg              = AGENTS[agent];
  const hasMessages      = messages.length > 0;
  const allRecsDismissed = RECS.every(r => dismissedRecs.has(r.id));
  const [expandedGreeting, setExpandedGreeting] = useState(false);

  useEffect(() => {
    if (allRecsDismissed) {
      const t = setTimeout(() => setExpandedGreeting(true), 180);
      return () => clearTimeout(t);
    } else {
      setExpandedGreeting(false);
    }
  }, [allRecsDismissed]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }, [input]);

  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: `u${uid()}`, role: "user", content: text }]);
    setInput("");
    setIsTyping(true);
    const snap = agent;
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `a${uid()}`, role: "assistant", agent: snap,
        content: REPLIES[Math.floor(Math.random() * REPLIES.length)],
      }]);
    }, 1400 + Math.random() * 700);
  }, [input, agent]);

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function newChat() { setMessages([]); setInput(""); setIsTyping(false); }

  function copyText(text: string, id: string) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // copy not available
    }
  }

  function retryMessage(msgId: string) {
    const idx = messages.findIndex(m => m.id === msgId);
    if (idx === -1) return;
    const before = messages.slice(0, idx);
    setMessages(before);
    setIsTyping(true);
    const snap = agent;
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `a${uid()}`, role: "assistant", agent: snap,
        content: REPLIES[Math.floor(Math.random() * REPLIES.length)],
      }]);
    }, 1400 + Math.random() * 700);
  }

  function parseContent(content: string) {
    const parts: { type: "text" | "code"; body: string; lang: string }[] = [];
    const re = /```(\w*)\n?([\s\S]*?)```/g;
    let last = 0, m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      if (m.index > last) parts.push({ type: "text", body: content.slice(last, m.index).trim(), lang: "" });
      parts.push({ type: "code", body: m[2].trim(), lang: m[1] || "code" });
      last = m.index + m[0].length;
    }
    if (last < content.length) parts.push({ type: "text", body: content.slice(last).trim(), lang: "" });
    return parts.length ? parts : [{ type: "text" as const, body: content, lang: "" }];
  }

  function addLink() {
    const name = newLinkName.trim();
    let url = newLinkUrl.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    const colors = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];
    const bg = colors[appLinks.length % colors.length];
    setAppLinks(prev => [...prev, { id: `custom-${uid()}`, name, url, color: "#fff", bg }]);
    setNewLinkName(""); setNewLinkUrl(""); setShowAddLink(false);
  }

  function closeIncognito() {
    setShowIncognitoWindow(false);
    setIncognitoMessages([]);
    setIncognitoInput("");
    setIncognitoTyping(false);
  }

  function sendIncognito() {
    const text = incognitoInput.trim();
    if (!text) return;
    setIncognitoMessages(prev => [...prev, { id: `iu${uid()}`, role: "user", content: text }]);
    setIncognitoInput("");
    setIncognitoTyping(true);
    setTimeout(() => {
      setIncognitoTyping(false);
      setIncognitoMessages(prev => [...prev, {
        id: `ia${uid()}`, role: "assistant",
        content: REPLIES[Math.floor(Math.random() * REPLIES.length)],
      }]);
    }, 1200 + Math.random() * 600);
  }

  useEffect(() => { incognitoEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [incognitoMessages, incognitoTyping]);

  useEffect(() => {
    const ta = incognitoTaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 100) + "px";
  }, [incognitoInput]);

  function closeAll() {
    setShowHistory(false); setShowSettings(false);
    setShowProfile(false); setShowAgents(false);
    setShowApps(false); setShowAddLink(false);
  }

  function handleOnboardingComplete(data: { name: string; role: string; agent: "gemini" | "gemma"; themeId: string }) {
    setUserName(data.name);
    setAgent(data.agent);
    setThemeId(data.themeId);
    setOnboarded(true);
  }

  if (!onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="size-full flex overflow-hidden" style={{ background: appTheme.bg, fontFamily: "system-ui,sans-serif", transition: "background 0.6s ease", position: "relative" }}>
      {/* Full-screen theme effect layer */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <ThemeBackground themeId={themeId} />
      </div>

      {/* ── Left rail ── */}
      <aside style={{
        width: 52, flexShrink: 0, display: "flex", flexDirection: "column",
        alignItems: "center", padding: "14px 0 12px", gap: 2, zIndex: 20,
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: cfg.dim, border: `1px solid ${cfg.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.3s, border-color 0.3s",
          }}>
            <cfg.Icon size={15} style={{ color: cfg.color }} />
          </div>
        </div>

        <RailIcon icon={<SquarePen size={14} />} label="New chat" onClick={newChat} />
        <RailIcon
          icon={<History size={14} />} label="History" active={showHistory}
          onClick={() => { closeAll(); setShowHistory(true); }}
        />
        <RailIcon
          icon={<LayoutGrid size={14} />} label="Apps" active={showApps}
          onClick={() => { closeAll(); setShowApps(true); }}
        />

        <div style={{ flex: 1 }} />

        <RailIcon
          icon={<Settings size={14} />} label="Settings" active={showSettings || showAgents}
          onClick={() => { closeAll(); setShowSettings(true); }}
        />
        <button
          onClick={() => { closeAll(); setShowProfile(true); }}
          title="Profile"
          style={{
            width: 28, height: 28, borderRadius: "50%", marginTop: 4,
            background: showProfile ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "rgba(167,139,250,0.12)",
            border: showProfile ? "2px solid rgba(167,139,250,0.5)" : "2px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          <User size={13} style={{ color: showProfile ? "#fff" : "rgba(255,255,255,0.4)" }} />
        </button>
      </aside>

      {/* ── Popups ── */}

      {/* Overlay */}
      {(showSettings || showHistory || showProfile || showAgents || showApps) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      {/* Settings */}
      {showSettings && !showAgents && (
        <div className="fixed z-50 anim-slide-left" style={{
          left: 58, bottom: 44, width: 220, borderRadius: 13, overflow: "hidden",
          background: "rgba(13,13,20,0.99)", border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 20px 52px rgba(0,0,0,0.72)",
        }}>
          <PopupHeader title="Settings" onClose={closeAll} />

          {/* Agents row — special entry */}
          <button
            onClick={() => { setShowSettings(false); setShowAgents(true); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px",
              background: "rgba(167,139,250,0.07)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              cursor: "pointer", transition: "background 0.12s", border: "none", textAlign: "left",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(167,139,250,0.13)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(167,139,250,0.07)")}
          >
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Users size={12} style={{ color: "#a78bfa" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#c4b5fd", fontSize: 12, fontWeight: 600 }}>Agents</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>Manage specialist models</div>
            </div>
            <ChevronRight size={12} style={{ color: "rgba(167,139,250,0.5)" }} />
          </button>

          <div style={{ padding: "4px 0" }}>
            {SETTINGS_ITEMS.map(({ Icon, label, desc }) => (
              <PopupRow key={label} icon={<Icon size={12} />} primary={label} secondary={desc} />
            ))}
          </div>
          <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 10 }}>AI Assistant v1.0.0</span>
          </div>
        </div>
      )}

      {/* ── Agents panel ── */}
      {showAgents && (
        <div className="fixed z-50 anim-slide-left" style={{
          left: 58, top: 12, bottom: 12, width: 300, borderRadius: 14, overflow: "hidden",
          display: "flex", flexDirection: "column",
          background: "rgba(11,11,18,0.99)", border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.75)",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "13px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0,
          }}>
            <button
              onClick={() => { setShowAgents(false); setShowSettings(true); }}
              style={{
                width: 26, height: 26, borderRadius: 7, border: "none",
                background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
            >
              <ArrowLeft size={13} />
            </button>
            <div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600 }}>Agents</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>Choose a specialist for your task</div>
            </div>
            <button onClick={closeAll} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", display: "flex", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
            ><X size={14} /></button>
          </div>

          {/* Agent cards */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
            {AGENT_PRESETS.map(preset => {
              const Ico = preset.Icon;
              const isActive = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setActivePreset(preset.id);
                    if (preset.id === "gemini" || preset.id === "gemma") {
                      setAgent(preset.id as Agent);
                    }
                    closeAll();
                  }}
                  style={{
                    width: "100%", textAlign: "left", marginBottom: 8,
                    padding: "12px 13px", borderRadius: 11, cursor: "pointer",
                    background: isActive ? preset.dim : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isActive ? preset.border : "rgba(255,255,255,0.07)"}`,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; } }}
                >
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 7 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      background: isActive ? preset.dim : "rgba(255,255,255,0.06)",
                      border: `1px solid ${isActive ? preset.border : "rgba(255,255,255,0.08)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Ico size={16} style={{ color: isActive ? preset.color : "rgba(255,255,255,0.45)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ color: isActive ? preset.color : "rgba(255,255,255,0.82)", fontSize: 13, fontWeight: 600 }}>
                          {preset.name}
                        </span>
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: "0.05em",
                          padding: "1px 5px", borderRadius: 4,
                          background: isActive ? preset.dim : "rgba(255,255,255,0.08)",
                          color: isActive ? preset.color : "rgba(255,255,255,0.38)",
                        }}>{preset.badge}</span>
                      </div>
                      <div style={{ color: isActive ? preset.color : "rgba(255,255,255,0.38)", fontSize: 10, fontWeight: 500, opacity: isActive ? 0.85 : 1 }}>
                        {preset.role}
                      </div>
                    </div>
                    {isActive && (
                      <CheckCircle2 size={14} style={{ color: preset.color, flexShrink: 0 }} />
                    )}
                  </div>

                  {/* Description */}
                  <p style={{
                    color: "rgba(255,255,255,0.42)", fontSize: 11, lineHeight: 1.55,
                    margin: 0, paddingLeft: 44,
                  }}>
                    {preset.desc}
                  </p>

                  {/* Tags */}
                  <div style={{ display: "flex", gap: 5, marginTop: 8, paddingLeft: 44, flexWrap: "wrap" }}>
                    {preset.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: 9, fontWeight: 600, letterSpacing: "0.04em",
                        padding: "2px 7px", borderRadius: 20,
                        background: isActive ? `${preset.dim}` : "rgba(255,255,255,0.06)",
                        color: isActive ? preset.color : "rgba(255,255,255,0.35)",
                        border: `1px solid ${isActive ? preset.border : "rgba(255,255,255,0.08)"}`,
                      }}>{tag}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      {showHistory && (
        <div className="fixed z-50 anim-slide-left" style={{
          left: 58, top: 12, bottom: 12, width: 268, borderRadius: 14, overflow: "hidden",
          display: "flex", flexDirection: "column",
          background: "rgba(11,11,18,0.99)", border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.75)",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "13px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0,
          }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600 }}>History</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>Your recent conversations</div>
            </div>
            <button onClick={closeAll} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", display: "flex", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
            ><X size={14} /></button>
          </div>

          {/* Chat list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
            {[...historyList.filter(h => h.pinned), ...historyList.filter(h => !h.pinned)].map(item => {
              const ac = AGENTS[item.agent];
              const Ico = ac.Icon;
              return (
                <div key={item.id} style={{ position: "relative", marginBottom: 6 }}>
                  <div
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "11px 12px", borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${item.pinned ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.06)"}`,
                      transition: "background 0.12s, border-color 0.12s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLDivElement).style.borderColor = item.pinned ? "rgba(167,139,250,0.35)" : "rgba(255,255,255,0.11)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLDivElement).style.borderColor = item.pinned ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.06)"; }}
                  >
                    {/* Pin indicator */}
                    {item.pinned && (
                      <Pin size={9} style={{ color: "#a78bfa", position: "absolute", top: 7, right: 34, opacity: 0.7 }} />
                    )}

                    <div style={{ width: 28, height: 28, borderRadius: 8, background: ac.dim, border: `1px solid ${ac.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Ico size={12} style={{ color: ac.color }} />
                    </div>

                    {/* Title / rename input */}
                    <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                      {renamingId === item.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              setHistoryList(prev => prev.map(h => h.id === item.id ? { ...h, title: renameValue.trim() || h.title } : h));
                              setRenamingId(null);
                            }
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          onBlur={() => {
                            setHistoryList(prev => prev.map(h => h.id === item.id ? { ...h, title: renameValue.trim() || h.title } : h));
                            setRenamingId(null);
                          }}
                          onClick={e => e.stopPropagation()}
                          style={{
                            width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(167,139,250,0.4)",
                            borderRadius: 5, color: "rgba(255,255,255,0.85)", fontSize: 12, padding: "2px 6px", outline: "none",
                          }}
                        />
                      ) : (
                        <>
                          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{item.title}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 4, background: ac.dim, color: ac.color }}>{ac.label}</span>
                            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>{item.time}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* More options button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHistoryMenuPos({ x: rect.right, y: rect.bottom + 4 });
                        setHistoryMenuId(historyMenuId === item.id ? null : item.id);
                      }}
                      style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: "none",
                        background: historyMenuId === item.id ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.0)",
                        color: historyMenuId === item.id ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.28)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = historyMenuId === item.id ? "rgba(255,255,255,0.1)" : "transparent"; e.currentTarget.style.color = historyMenuId === item.id ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.28)"; }}
                    >
                      <MoreHorizontal size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <button
              onClick={() => setHistoryList([])}
              style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,90,90,0.4)", fontSize: 11, cursor: "pointer", transition: "color 0.15s", background: "none", border: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,90,90,0.8)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,90,90,0.4)")}
            >
              <Trash2 size={11} /> Clear all history
            </button>
          </div>
        </div>
      )}

      {/* ── Apps panel ── */}
      {showApps && (
        <div className="fixed z-50 anim-slide-left" style={{
          left: 58, top: 12, bottom: 12, width: 300, borderRadius: 14,
          display: "flex", flexDirection: "column", overflow: "hidden",
          background: "rgba(11,11,18,0.99)", border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.75)",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 9, padding: "13px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <LayoutGrid size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600 }}>Apps</div>
              <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 10 }}>Your saved shortcuts</div>
            </div>
            {/* Edit / Done toggle */}
            <button
              onClick={() => { setEditApps(v => !v); setRenamingAppId(null); }}
              style={{
                marginLeft: "auto", padding: "4px 10px", borderRadius: 7, border: "none",
                background: editApps ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.06)",
                color: editApps ? "#c4b5fd" : "rgba(255,255,255,0.45)",
                fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = editApps ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = editApps ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.06)"; }}
            >{editApps ? "Done" : "Edit"}</button>
            <button onClick={closeAll} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", display: "flex", transition: "color 0.15s", marginLeft: 6 }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
            ><X size={14} /></button>
          </div>

          {/* App grid */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {appLinks.map((app, idx) => {
                const isHov = hoveredApp === app.id;
                const abbr = app.name.slice(0, 2).toUpperCase();
                const domain = (() => { try { return new URL(app.url).hostname; } catch { return ""; } })();
                const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;
                const isRenaming = renamingAppId === app.id;
                const jiggleDelay = `${(idx % 4) * 0.06}s`;

                return (
                  <div key={app.id}
                    style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}
                    onMouseEnter={() => !editApps && setHoveredApp(app.id)}
                    onMouseLeave={() => setHoveredApp(null)}
                  >
                    {/* Remove badge (edit mode) */}
                    {editApps && (
                      <button
                        onClick={() => { setAppLinks(prev => prev.filter(a => a.id !== app.id)); }}
                        style={{
                          position: "absolute", top: -5, left: -2, zIndex: 3,
                          width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(11,11,18,1)",
                          background: "#ff3b30", color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                        }}
                      ><X size={9} /></button>
                    )}

                    {/* Icon button */}
                    <button
                      onClick={() => !editApps && window.open(app.url, "_blank", "noopener,noreferrer")}
                      title={app.name}
                      className={editApps ? "app-jiggle" : ""}
                      style={{
                        width: 54, height: 54, borderRadius: 14, border: "none",
                        background: app.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: editApps ? "default" : "pointer",
                        boxShadow: isHov && !editApps ? "0 6px 20px rgba(0,0,0,0.55)" : "0 2px 10px rgba(0,0,0,0.38)",
                        transform: isHov && !editApps ? "scale(1.1) translateY(-2px)" : "scale(1)",
                        transition: "transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease",
                        animationDelay: jiggleDelay,
                        position: "relative", overflow: "hidden",
                      }}
                    >
                      {/* Favicon image */}
                      {faviconUrl && (
                        <img
                          src={faviconUrl}
                          alt={app.name}
                          width={30} height={30}
                          style={{ objectFit: "contain", position: "relative", zIndex: 1 }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      {/* Letter fallback (shown when favicon fails or no domain) */}
                      {!faviconUrl && (
                        <span style={{ color: app.color, fontSize: 14, fontWeight: 700, zIndex: 1 }}>{abbr}</span>
                      )}
                    </button>

                    {/* Label / rename */}
                    {isRenaming ? (
                      <input
                        autoFocus
                        value={renameAppValue}
                        onChange={e => setRenameAppValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            setAppLinks(prev => prev.map(a => a.id === app.id ? { ...a, name: renameAppValue.trim() || a.name } : a));
                            setRenamingAppId(null);
                          }
                          if (e.key === "Escape") setRenamingAppId(null);
                        }}
                        onBlur={() => {
                          setAppLinks(prev => prev.map(a => a.id === app.id ? { ...a, name: renameAppValue.trim() || a.name } : a));
                          setRenamingAppId(null);
                        }}
                        style={{
                          marginTop: 5, width: 54, padding: "2px 4px", borderRadius: 4,
                          background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.4)",
                          color: "#c4b5fd", fontSize: 9, outline: "none", textAlign: "center",
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => { if (editApps) { setRenamingAppId(app.id); setRenameAppValue(app.name); } }}
                        style={{
                          marginTop: 5, fontSize: 9,
                          color: editApps ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.42)",
                          maxWidth: 54, overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap", textAlign: "center", width: "100%",
                          cursor: editApps ? "text" : "default",
                          textDecoration: editApps ? "underline dotted rgba(255,255,255,0.2)" : "none",
                        }}
                      >{app.name}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {editApps && (
              <p className="anim-fade-in" style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 10, marginTop: 16 }}>
                Tap <span style={{ color: "rgba(255,80,80,0.6)" }}>●</span> to remove · Tap name to rename
              </p>
            )}
          </div>

          {/* Add link section */}
          <div style={{ padding: "10px 14px 14px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
            {!showAddLink ? (
              <button
                onClick={() => { setEditApps(false); setShowAddLink(true); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "9px 0", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.12)",
                  background: "transparent", color: "rgba(255,255,255,0.35)",
                  cursor: "pointer", fontSize: 12, transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
              >
                <Plus size={13} /> Add link
              </button>
            ) : (
              <div className="anim-slide-up" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  autoFocus
                  placeholder="Name  (e.g. Portfolio)"
                  value={newLinkName}
                  onChange={e => setNewLinkName(e.target.value)}
                  style={{
                    width: "100%", padding: "8px 11px", borderRadius: 9, boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.8)", fontSize: 12, outline: "none",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", padding: "0 10px" }}>
                  <Link size={11} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                  <input
                    placeholder="https://yoursite.com"
                    value={newLinkUrl}
                    onChange={e => setNewLinkUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addLink(); }}
                    style={{
                      flex: 1, padding: "8px 0", background: "transparent",
                      border: "none", color: "rgba(255,255,255,0.8)", fontSize: 12, outline: "none",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <button
                    onClick={() => { setShowAddLink(false); setNewLinkName(""); setNewLinkUrl(""); }}
                    style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.38)", fontSize: 11, cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >Cancel</button>
                  <button
                    onClick={addLink}
                    style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  >Add</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile */}
      {showProfile && (
        <div className="fixed z-50 anim-slide-left" style={{
          left: 58, bottom: 8, width: 204, borderRadius: 13, overflow: "hidden",
          background: "rgba(13,13,20,0.99)", border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 16px 52px rgba(0,0,0,0.72)",
        }}>
          <div style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={14} style={{ color: "#fff" }} />
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 500 }}>{userName}</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>alex@example.com</div>
            </div>
          </div>
          {["Profile", "API Keys", "Sign out"].map(item => (
            <button key={item}
              style={{
                width: "100%", textAlign: "left", padding: "9px 12px",
                color: item === "Sign out" ? "rgba(255,90,90,0.55)" : "rgba(255,255,255,0.55)",
                fontSize: 12, background: "transparent", cursor: "pointer", transition: "background 0.12s, color 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = item === "Sign out" ? "rgba(255,90,90,0.85)" : "rgba(255,255,255,0.82)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = item === "Sign out" ? "rgba(255,90,90,0.55)" : "rgba(255,255,255,0.55)"; }}
            >{item}</button>
          ))}
        </div>
      )}

      {/* ── Main area ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", zIndex: 1 }}>
        <BreathingLight agent={agent} />

        {/* Top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          {/* Incognito toggle */}
          <button
            onClick={() => showIncognitoWindow ? setShowIncognitoWindow(false) : setShowIncognitoModal(true)}
            title={showIncognitoWindow ? "Incognito active — click to hide" : "Start a temporary private chat"}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20,
              marginRight: 8,
              background: showIncognitoWindow ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
              border: showIncognitoWindow ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = showIncognitoWindow ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = showIncognitoWindow ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)"; }}
          >
            <Ghost size={12} style={{ color: showIncognitoWindow ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.35)" }} />
            <span style={{ fontSize: 11, color: showIncognitoWindow ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.01em" }}>
              {showIncognitoWindow ? "Incognito" : "Temporary"}
            </span>
          </button>

          <button
            onClick={() => setIsOnline(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20,
              background: isOnline ? "rgba(16,185,129,0.08)" : "rgba(120,120,140,0.08)",
              border: isOnline ? "1px solid rgba(16,185,129,0.18)" : "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer", transition: "all 0.2s",
            }}
            title={isOnline ? "Click to go offline" : "Click to go online"}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? "#34d399" : "#6b7280", display: "inline-block", animation: isOnline ? "pulse-dot 2s ease-in-out infinite" : "none" }} />
            {isOnline ? <Wifi size={11} style={{ color: "#34d399" }} /> : <WifiOff size={11} style={{ color: "#6b7280" }} />}
            <span style={{ fontSize: 11, color: isOnline ? "#34d399" : "#9ca3af", letterSpacing: "0.02em", fontWeight: 500 }}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </button>
        </div>

        {/* ── Messages ── */}
        {hasMessages && (
          <div style={{ flex: 1, overflowY: "auto", paddingTop: 60, paddingBottom: 148, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", maxWidth: 720, padding: "0 32px" }}>
              {messages.map(msg => {
                const mc = msg.agent ? AGENTS[msg.agent] : cfg;
                const MIcon = mc.Icon;
                const isUser = msg.role === "user";
                const isHov = hoveredMsg === msg.id;
                const parts = parseContent(msg.content);
                const hasCode = parts.some(p => p.type === "code");

                return (
                  <div key={msg.id} className="anim-fade-up"
                    onMouseEnter={() => setHoveredMsg(msg.id)}
                    onMouseLeave={() => setHoveredMsg(null)}
                    style={{ display: "flex", flexDirection: "column", marginBottom: 20, alignItems: isUser ? "flex-end" : "flex-start" }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      {!isUser && (
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: mc.dim, border: `1px solid ${mc.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 3 }}>
                          <MIcon size={13} style={{ color: mc.color }} />
                        </div>
                      )}

                      {isUser ? (
                        <div style={{ maxWidth: 520, padding: "11px 18px", borderRadius: "20px 20px 5px 20px", background: "linear-gradient(135deg,#6d28d9,#4338ca 60%,#3730a3)", color: "rgba(255,255,255,0.92)", fontSize: 13, lineHeight: 1.7, boxShadow: "0 4px 20px rgba(109,40,217,0.35),0 1px 4px rgba(0,0,0,0.3)" }}>
                          {msg.content}
                        </div>
                      ) : (
                        <div style={{ maxWidth: 580 }}>
                          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: `3px solid ${mc.color}`, borderRadius: hasCode ? "4px 18px 4px 4px" : "4px 18px 18px 18px", padding: "11px 16px 11px 14px", color: "rgba(255,255,255,0.78)", fontSize: 13, lineHeight: 1.75 }}>
                            {parts.map((part, i) => {
                              if (part.type === "code") {
                                const codeId = `${msg.id}-code-${i}`;
                                const isCopied = copiedId === codeId;
                                return (
                                  <div key={i} style={{ marginTop: i > 0 ? 10 : 0, marginBottom: i < parts.length - 1 ? 10 : 0, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                                    {/* Code header */}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ display: "flex", gap: 5 }}>
                                          {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                                        </div>
                                        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "monospace", textTransform: "lowercase" }}>{part.lang || "code"}</span>
                                      </div>
                                      <button
                                        onClick={() => copyText(part.body, codeId)}
                                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: isCopied ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)", color: isCopied ? "#34d399" : "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: 11, transition: "all 0.15s" }}
                                        onMouseEnter={e => { if (!isCopied) { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; } }}
                                        onMouseLeave={e => { if (!isCopied) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; } }}
                                      >
                                        {isCopied ? <Check size={11} /> : <Copy size={11} />}
                                        {isCopied ? "Copied!" : "Copy"}
                                      </button>
                                    </div>
                                    {/* Code body */}
                                    <div style={{ background: "#0d1117", padding: "14px 16px", overflowX: "auto" }}>
                                      <pre style={{ margin: 0, fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", fontSize: 12.5, lineHeight: 1.7, color: "#e6edf3", whiteSpace: "pre" }}>
                                        <code>{part.body}</code>
                                      </pre>
                                    </div>
                                  </div>
                                );
                              }
                              return part.body ? <p key={i} style={{ margin: i === 0 ? 0 : "8px 0 0", whiteSpace: "pre-wrap" }}>{part.body}</p> : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons — appear on hover below bubble */}
                    <div style={{
                      display: "flex", gap: 4, marginTop: 5,
                      marginLeft: isUser ? 0 : 36,
                      opacity: isHov ? 1 : 0,
                      transform: isHov ? "translateY(0)" : "translateY(-4px)",
                      transition: "opacity 0.18s ease, transform 0.18s ease",
                      pointerEvents: isHov ? "auto" : "none",
                    }}>
                      {/* Copy message */}
                      <button
                        onClick={() => copyText(msg.content, `copy-${msg.id}`)}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", background: copiedId === `copy-${msg.id}` ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)", color: copiedId === `copy-${msg.id}` ? "#34d399" : "rgba(255,255,255,0.38)", cursor: "pointer", fontSize: 11, transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = copiedId === `copy-${msg.id}` ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)"; e.currentTarget.style.color = copiedId === `copy-${msg.id}` ? "#34d399" : "rgba(255,255,255,0.38)"; }}
                      >
                        {copiedId === `copy-${msg.id}` ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedId === `copy-${msg.id}` ? "Copied" : "Copy"}</span>
                      </button>

                      {/* Retry (AI messages only) */}
                      {!isUser && (
                        <button
                          onClick={() => retryMessage(msg.id)}
                          style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.38)", cursor: "pointer", fontSize: 11, transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}
                        >
                          <RotateCcw size={11} />
                          <span>Retry</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="anim-fade-in" style={{ display: "flex", marginBottom: 20, justifyContent: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: cfg.dim, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 10, marginTop: 3 }}>
                    <cfg.Icon size={13} style={{ color: cfg.color }} />
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: `3px solid ${cfg.color}`, borderRadius: "4px 18px 18px 18px", padding: "12px 18px", display: "flex", alignItems: "center", gap: 5 }}>
                    {[1,2,3].map(i => <span key={i} className={`dot-${i}`} style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, opacity: 0.75, display: "inline-block" }} />)}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>
        )}

        {/* ── Greeting + Recommendations ── */}
        {!hasMessages && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            paddingTop: expandedGreeting ? "24vh" : "18vh",
            position: "relative", zIndex: 1,
            transition: "padding-top 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}>

            {/* ── Expanded greeting (all notifications cleared) ── */}
            {expandedGreeting ? (
              <div className="greeting-expanded" style={{ textAlign: "center", position: "relative" }}>

                {/* Decorative spinning stars */}
                <SpinningStar size={13} color="#a78bfa" style={{
                  position: "absolute", top: -6, left: -36,
                  animation: "spin-slow 8s linear infinite, star-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.05s both",
                  opacity: 0.7,
                }} />
                <SpinningStar size={9} color="#60a5fa" style={{
                  position: "absolute", top: 10, right: -28,
                  animation: "spin-slow 10s linear infinite reverse, star-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both",
                  opacity: 0.55,
                }} />
                <SpinningStar size={7} color="#f472b6" style={{
                  position: "absolute", bottom: 30, left: -20,
                  animation: "spin-slow 12s linear infinite, star-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.25s both",
                  opacity: 0.45,
                }} />

                <h1 className="shimmer-text" style={{
                  fontSize: 54, fontWeight: 600, margin: 0,
                  letterSpacing: "-0.03em", lineHeight: 1.1,
                }}>
                  Hi, {userName}.
                </h1>

                <p className="tagline-in" style={{
                  color: "rgba(255,255,255,0.32)", fontSize: 15, marginTop: 14,
                  letterSpacing: "0.01em", lineHeight: 1.6, fontWeight: 400,
                }}>
                  All clear. Your focus is yours.
                  <br />
                  <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 13 }}>
                    What would you like to explore today?
                  </span>
                </p>

                {/* Subtle glow behind text */}
                <div aria-hidden style={{
                  position: "absolute", inset: "-40px -80px",
                  background: "radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 70%)",
                  pointerEvents: "none", zIndex: -1,
                }} />
              </div>

            ) : (
              /* ── Normal greeting with rec cards ── */
              <>
                <h1 className="anim-fade-up" style={{
                  color: "rgba(255,255,255,0.86)", fontSize: 26, fontWeight: 400,
                  marginBottom: 28, textAlign: "center", letterSpacing: "-0.01em",
                }}>
                  Hi, {userName}. What's on your mind?
                </h1>

                <div className="anim-fade-up" style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9,
                  width: "100%", maxWidth: 560, padding: "0 28px",
                }}>
                  {RECS.filter(r => !dismissedRecs.has(r.id)).map(rec => {
                    const Ico = rec.icon;
                    return (
                      <div key={rec.id} style={{
                        display: "flex", alignItems: "center", gap: 11,
                        padding: "12px 13px", borderRadius: 13, textAlign: "left",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        position: "relative",
                        transition: "background 0.15s, border-color 0.15s",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = rec.dim; (e.currentTarget as HTMLDivElement).style.borderColor = rec.border; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                          background: rec.dim, border: `1px solid ${rec.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Ico size={14} style={{ color: rec.color }} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, paddingRight: 18 }}>
                            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rec.title}</span>
                            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, flexShrink: 0 }}>{rec.time}</span>
                          </div>
                          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rec.sub}</div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setDismissedRecs(prev => new Set([...prev, rec.id])); }}
                          title="Dismiss"
                          style={{
                            position: "absolute", top: 7, right: 7,
                            width: 18, height: 18, borderRadius: 5, border: "none",
                            background: "transparent", color: "rgba(255,255,255,0.2)",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background 0.15s, color 0.15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,80,80,0.15)"; e.currentTarget.style.color = "rgba(255,100,100,0.8)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.2)"; }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* ── History item context menu ── */}
      {historyMenuId && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setHistoryMenuId(null)} />
          <div className="anim-slide-up" style={{
            position: "fixed", zIndex: 70,
            left: historyMenuPos.x - 152,
            top: historyMenuPos.y,
            width: 152, borderRadius: 11, overflow: "hidden",
            background: "rgba(14,14,22,0.99)", border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)",
          }}>
            {/* Pin / Unpin */}
            <button
              onClick={() => {
                setHistoryList(prev => prev.map(h => h.id === historyMenuId ? { ...h, pinned: !h.pinned } : h));
                setHistoryMenuId(null);
              }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", background: "transparent", border: "none", cursor: "pointer", transition: "background 0.12s", textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(167,139,250,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Pin size={12} style={{ color: "#a78bfa" }} />
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
                {historyList.find(h => h.id === historyMenuId)?.pinned ? "Unpin" : "Pin"}
              </span>
            </button>

            {/* Rename */}
            <button
              onClick={() => {
                const item = historyList.find(h => h.id === historyMenuId);
                if (item) { setRenameValue(item.title); setRenamingId(item.id); }
                setHistoryMenuId(null);
              }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", background: "transparent", border: "none", cursor: "pointer", transition: "background 0.12s", textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(96,165,250,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Pencil size={12} style={{ color: "#60a5fa" }} />
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>Rename</span>
            </button>

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "2px 0" }} />

            {/* Delete */}
            <button
              onClick={() => {
                setHistoryList(prev => prev.filter(h => h.id !== historyMenuId));
                setHistoryMenuId(null);
              }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", background: "transparent", border: "none", cursor: "pointer", transition: "background 0.12s", textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,60,60,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Trash2 size={12} style={{ color: "rgba(255,80,80,0.7)" }} />
              <span style={{ color: "rgba(255,100,100,0.8)", fontSize: 12 }}>Delete</span>
            </button>
          </div>
        </>
      )}

      {/* ── Incognito modal ── */}
      {showIncognitoModal && (
        <div
          onClick={() => setShowIncognitoModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(5,5,12,0.6)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="anim-slide-up"
            style={{
              width: 420, borderRadius: 20,
              background: "rgba(22,22,34,0.72)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
              overflow: "hidden",
            }}
          >
            {/* Top bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "14px 14px 0" }}>
              <button
                onClick={() => setShowIncognitoModal(false)}
                style={{
                  width: 26, height: 26, borderRadius: 8, border: "none",
                  background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >
                <X size={13} />
              </button>
            </div>

            {/* Icon */}
            <div style={{ display: "flex", justifyContent: "center", padding: "18px 0 16px" }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Ghost size={30} style={{ color: "rgba(255,255,255,0.5)" }} />
              </div>
            </div>

            {/* Title */}
            <div style={{ textAlign: "center", padding: "0 32px 6px" }}>
              <h2 style={{ color: "rgba(255,255,255,0.88)", fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
                Incognito Mode
              </h2>
              <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>
                Your session stays private. Nothing is recorded.
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "14px 24px" }} />

            {/* Notes */}
            <div style={{ padding: "0 28px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "🚫", text: "Chats won't appear in your history" },
                { icon: "💾", text: "Nothing is saved after the session ends" },
                { icon: "🔒", text: "Messages stay on your device only" },
                { icon: "👁️", text: "No activity is logged or synced to cloud" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                  }}>{icon}</div>
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12.5, lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{
              display: "flex", gap: 10, padding: "16px 24px 22px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}>
              <button
                onClick={() => setShowIncognitoModal(false)}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 11, border: "1px solid rgba(255,255,255,0.09)",
                  background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)",
                  fontSize: 13, cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowIncognitoModal(false); setShowIncognitoWindow(true); }}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 11, border: "none",
                  background: "rgba(255,255,255,0.11)", color: "rgba(255,255,255,0.82)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.17)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.11)"; e.currentTarget.style.color = "rgba(255,255,255,0.82)"; }}
              >
                <Ghost size={14} /> Start Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Incognito floating window ── */}
      {showIncognitoWindow && (
        <>
          {/* Overlay + centering wrapper */}
          <div style={{
            position: "fixed", top: 0, bottom: 0, left: 52, right: 0,
            zIndex: 150,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
          }} onClick={closeIncognito}>

          <div className="anim-slide-up" onClick={e => e.stopPropagation()} style={{
            width: "min(660px, calc(100vw - 120px))",
            height: "min(520px, calc(100vh - 120px))",
            borderRadius: 22,
            background: "rgba(13,13,19,0.88)",
            backdropFilter: "blur(36px)",
            WebkitBackdropFilter: "blur(36px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "15px 18px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              flexShrink: 0,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Ghost size={15} style={{ color: "rgba(255,255,255,0.5)" }} />
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>Incognito Chat</div>
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10.5, marginTop: 1 }}>Not saved · Private session · Messages clear on close</div>
              </div>
              <button
                onClick={closeIncognito}
                style={{
                  marginLeft: "auto", width: 28, height: 28, borderRadius: 8, border: "none",
                  background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,70,70,0.2)"; e.currentTarget.style.color = "rgba(255,110,110,0.9)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
              >
                <X size={13} />
              </button>
            </div>

            {/* Messages area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 10px" }}>
              {incognitoMessages.length === 0 && !incognitoTyping && (
                <div style={{
                  height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 12,
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Ghost size={26} style={{ color: "rgba(255,255,255,0.25)" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500, marginBottom: 5 }}>Private session started</div>
                    <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11.5, lineHeight: 1.6 }}>
                      Nothing here will be saved to history.<br />Type a message below to begin.
                    </div>
                  </div>
                </div>
              )}

              {incognitoMessages.map(msg => (
                <div key={msg.id} className="anim-fade-up" style={{
                  display: "flex", marginBottom: 14,
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}>
                  {msg.role === "user" ? (
                    <div style={{
                      maxWidth: "68%", padding: "10px 16px",
                      borderRadius: "18px 18px 5px 18px",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.82)", fontSize: 13, lineHeight: 1.65,
                    }}>
                      {msg.content}
                    </div>
                  ) : (
                    <div style={{
                      maxWidth: "72%", padding: "10px 16px",
                      borderRadius: "5px 18px 18px 18px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderLeft: "2px solid rgba(255,255,255,0.22)",
                      color: "rgba(255,255,255,0.62)", fontSize: 13, lineHeight: 1.65,
                    }}>
                      {msg.content}
                    </div>
                  )}
                </div>
              ))}

              {incognitoTyping && (
                <div className="anim-fade-in" style={{ display: "flex", marginBottom: 14 }}>
                  <div style={{
                    padding: "11px 16px", borderRadius: "5px 18px 18px 18px",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                    borderLeft: "2px solid rgba(255,255,255,0.22)",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    {[1,2,3].map(i => <span key={i} className={`dot-${i}`} style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.35)", display: "inline-block" }} />)}
                  </div>
                </div>
              )}
              <div ref={incognitoEndRef} />
            </div>

            {/* Input area */}
            <div style={{ padding: "12px 18px 18px", flexShrink: 0 }}>
              <div style={{
                display: "flex", alignItems: "flex-end", gap: 10,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 14,
                border: incognitoFocused ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.09)",
                padding: "10px 10px 10px 16px",
                transition: "border-color 0.2s",
              }}>
                <textarea
                  ref={incognitoTaRef}
                  rows={1}
                  value={incognitoInput}
                  onChange={e => setIncognitoInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendIncognito(); } }}
                  onFocus={() => setIncognitoFocused(true)}
                  onBlur={() => setIncognitoFocused(false)}
                  placeholder="Send a private message… (Enter to send)"
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    resize: "none", color: "rgba(255,255,255,0.78)", fontSize: 13,
                    lineHeight: 1.55, minHeight: 24, maxHeight: 100,
                    caretColor: "rgba(255,255,255,0.7)",
                  }}
                />
                <button
                  onClick={sendIncognito}
                  disabled={!incognitoInput.trim()}
                  style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0, border: "none",
                    background: incognitoInput.trim() ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.04)",
                    color: incognitoInput.trim() ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.18)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: incognitoInput.trim() ? "pointer" : "default",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (incognitoInput.trim()) { e.currentTarget.style.background = "rgba(255,255,255,0.24)"; e.currentTarget.style.color = "#fff"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = incognitoInput.trim() ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.04)"; e.currentTarget.style.color = incognitoInput.trim() ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.18)"; }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>

          </div>{/* end centering wrapper */}
        </>
      )}

      {/* ── Gradient fade (shown when messages exist) ── */}
      {hasMessages && (
        <div style={{
          position: "fixed", left: 52, right: 0, bottom: 0, height: 170, zIndex: 9,
          background: `linear-gradient(to top, ${appTheme.bg} 55%, transparent)`,
          pointerEvents: "none",
        }} />
      )}

      {/* ── Chatbox — fixed, transitions from center to bottom ── */}
      <div style={{
        position: "fixed", left: 52, right: 0, zIndex: 10,
        display: "flex", justifyContent: "center",
        padding: "0 32px",
        top: hasMessages ? "calc(100vh - 28px)" : "62%",
        transform: hasMessages ? "translateY(-100%)" : "translateY(-50%)",
        transition: "top 0.52s cubic-bezier(0.4, 0, 0.2, 1), transform 0.52s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={{ width: "100%", maxWidth: 740 }}>
          <div className={isFocused ? "chatbox-glow" : "chatbox-idle"} style={{ background: appTheme.surface, borderRadius: 16, padding: "10px 10px 10px 14px" }}>
            <textarea
              ref={taRef} rows={1} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={`Ask ${cfg.label}…`}
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", color: "rgba(255,255,255,0.82)", fontSize: 14, lineHeight: 1.6, minHeight: 42, maxHeight: 140, caretColor: cfg.color, paddingBottom: 8 }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input ref={fileRef} type="file" style={{ display: "none" }} multiple />
              <button
                onClick={() => fileRef.current?.click()} title="Attach file"
                style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.38)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}
              ><Plus size={15} /></button>

              <div style={{ flex: 1 }} />

              {/* Agent switcher */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowAgent(v => !v)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 7px", borderRadius: 10, background: showAgent ? cfg.dim : "rgba(255,255,255,0.06)", border: `1px solid ${showAgent ? cfg.border : "rgba(255,255,255,0.1)"}`, cursor: "pointer", transition: "all 0.18s" }}
                  onMouseEnter={e => { if (!showAgent) { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; } }}
                  onMouseLeave={e => { if (!showAgent) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; } }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: cfg.dim, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <cfg.Icon size={11} style={{ color: cfg.color }} />
                  </div>
                  <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ color: "rgba(255,255,255,0.82)", fontSize: 12, fontWeight: 600 }}>{cfg.label}</span>
                      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.04em", padding: "1px 5px", borderRadius: 4, background: cfg.dim, color: cfg.color }}>{cfg.version}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                      <cfg.ModeIcon size={8} style={{ color: cfg.modeColor, opacity: 0.8 }} />
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{cfg.sub}</span>
                    </div>
                  </div>
                  <ChevronDown size={12} style={{ color: "rgba(255,255,255,0.35)", marginLeft: 2, transform: showAgent ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </button>

                {showAgent && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAgent(false)} />
                    <div className="anim-slide-up" style={{ position: "absolute", bottom: 46, right: 0, zIndex: 50, width: 240, borderRadius: 14, overflow: "hidden", background: "rgba(12,12,20,0.99)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 48px rgba(0,0,0,0.75),0 0 0 1px rgba(255,255,255,0.04)" }}>
                      <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Select Model</span>
                      </div>
                      {(["gemini","gemma"] as Agent[]).map(a => {
                        const ac = AGENTS[a]; const Ico = ac.Icon; const MIco = ac.ModeIcon; const active = agent === a;
                        return (
                          <button key={a} onClick={() => { setAgent(a); setShowAgent(false); }}
                            style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 11, padding: "11px 14px", background: active ? ac.dim : "transparent", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.12s", border: "none", textAlign: "left" }}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                          >
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: active ? ac.dim : "rgba(255,255,255,0.06)", border: `1px solid ${active ? ac.border : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Ico size={15} style={{ color: active ? ac.color : "rgba(255,255,255,0.45)" }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                <span style={{ color: active ? ac.color : "rgba(255,255,255,0.78)", fontSize: 13, fontWeight: 600 }}>{ac.label}</span>
                                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", padding: "1px 5px", borderRadius: 4, background: active ? ac.dim : "rgba(255,255,255,0.08)", color: active ? ac.color : "rgba(255,255,255,0.4)" }}>{ac.version}</span>
                              </div>
                              <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 11, marginBottom: 5 }}>{ac.desc}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <MIco size={9} style={{ color: ac.modeColor }} />
                                <span style={{ fontSize: 10, color: active ? ac.modeColor : "rgba(255,255,255,0.3)", fontWeight: 500 }}>{ac.modeLabel}</span>
                              </div>
                            </div>
                            {active && <CheckCircle2 size={15} style={{ color: ac.color, flexShrink: 0, marginTop: 1 }} />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Send */}
              <button onClick={send} disabled={!input.trim()} title="Send (Enter)"
                style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: input.trim() ? cfg.color : "rgba(255,255,255,0.06)", border: "none", color: input.trim() ? "#fff" : "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "default", transition: "background 0.2s,color 0.2s,transform 0.1s" }}
                onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = "scale(1.07)"; }}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              ><Send size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RailIcon({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} style={{ width: 32, height: 32, borderRadius: 8, background: active ? "rgba(255,255,255,0.09)" : "transparent", border: "none", color: active ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s,color 0.15s" }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.28)"; } }}
    >{icon}</button>
  );
}

function PopupHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase" }}>{title}</span>
      <button onClick={onClose} style={{ color: "rgba(255,255,255,0.25)", cursor: "pointer", display: "flex", border: "none", background: "none", transition: "color 0.15s" }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
      ><X size={13} /></button>
    </div>
  );
}

function PopupRow({ icon, primary, secondary }: { icon: React.ReactNode; primary: string; secondary: string }) {
  return (
    <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "transparent", border: "none", cursor: "pointer", transition: "background 0.12s", textAlign: "left" }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "rgba(255,255,255,0.42)" }}>{icon}</div>
      <div>
        <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 12, fontWeight: 500 }}>{primary}</div>
        <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 10 }}>{secondary}</div>
      </div>
    </button>
  );
}
