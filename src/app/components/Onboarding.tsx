import { useState, useEffect, useRef, useMemo } from "react";
import { SpinningStar } from "./SpinningStar";
import { Bot, Check, User, Loader2, Globe, Shield, Cpu, Zap, Heart, Code2, BarChart3, MessageCircle, ChevronDown, AlertCircle, Volume2, Smile } from "lucide-react";

export interface ThemeConfig {
  id: string; name: string; emoji: string;
  bg: string; surface: string; blobColor: string; accentColor: string;
}

export const THEMES: ThemeConfig[] = [
  { id:"midnight", name:"Midnight", emoji:"🌙", bg:"#000000", surface:"rgba(18,18,28,0.97)",  blobColor:"rgba(139,92,246,0.38)",  accentColor:"#a78bfa" },
  { id:"amoled",   name:"AMOLED",   emoji:"⬛", bg:"#000000", surface:"rgba(10,10,12,0.97)",  blobColor:"rgba(139,92,246,0.32)",  accentColor:"#a78bfa" },
  { id:"aurora",   name:"Aurora",   emoji:"🌌", bg:"#06091a", surface:"rgba(8,12,28,0.97)",   blobColor:"rgba(79,70,229,0.44)",   accentColor:"#818cf8" },
  { id:"forest",   name:"Forest",   emoji:"🌿", bg:"#040e06", surface:"rgba(5,14,7,0.97)",    blobColor:"rgba(16,185,129,0.38)",  accentColor:"#34d399" },
  { id:"ember",    name:"Ember",    emoji:"🔥", bg:"#100704", surface:"rgba(16,9,5,0.97)",    blobColor:"rgba(251,146,60,0.38)",  accentColor:"#fb923c" },
  { id:"rose",     name:"Rose",     emoji:"🌸", bg:"#11060f", surface:"rgba(18,6,15,0.97)",   blobColor:"rgba(236,72,153,0.38)",  accentColor:"#f472b6" },
];

// Placeholder avatars (gradient-based, ready to swap with real images later)
const PRESET_AVATARS = [
  { id: "grad1", gradient: "linear-gradient(135deg, #a78bfa, #ec4899)", emoji: "✨" },
  { id: "grad2", gradient: "linear-gradient(135deg, #34d399, #06b6d4)", emoji: "🌊" },
  { id: "grad3", gradient: "linear-gradient(135deg, #fb923c, #f43f5e)", emoji: "🔥" },
  { id: "grad4", gradient: "linear-gradient(135deg, #818cf8, #6366f1)", emoji: "🌌" },
  { id: "grad5", gradient: "linear-gradient(135deg, #f472b6, #a78bfa)", emoji: "🌸" },
  { id: "grad6", gradient: "linear-gradient(135deg, #facc15, #f97316)", emoji: "⚡" },
  { id: "grad7", gradient: "linear-gradient(135deg, #4ade80, #22d3ee)", emoji: "🍀" },
  { id: "grad8", gradient: "linear-gradient(135deg, #e879f9, #818cf8)", emoji: "🎭" },
];

export interface OnboardingData {
  name: string;
  avatar: string;
  role: string;
  agent: "gemini" | "gemma";
  themeId: string;
  passcode: string;
  securityQuestion: string;
  securityAnswer: string;
  groqKey: string;
  geminiKey: string;
  hasLocalLlm: boolean;
  pronoun: string;
  tone: number;
  responseLength: string;
  useCase: string;
  knowledgeLevel: string;
  emojiUsage: string;
  memoryEnabled: boolean;
}

interface Props { onComplete: (data: OnboardingData) => void; }

type Phase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
// 0 = Welcome
// 1 = "Let's get to know each other"
// 2 = AI typewriter
// 3 = Sign In / Name
// 4 = Nickname + Avatar
// 5 = AI Personality config (pronoun, tone, length, use-case, knowledge)
// 6 = Environment
// 7 = Theme picker
// 8 = Passcode
// 9 = API Keys

const AI_INTRO = [
  "Hi. I'm TARA, your AI assistant.",
  "I help you think, write, and explore ideas.",
  "I work online and offline — your choice.",
  "Your conversations are always private.",
  "Let's get you set up.",
];

const ENVIRONMENTS = [
  { id:"engineering", label:"Software Engineering", emoji:"💻", desc:"Strict, production-ready code." },
  { id:"data",        label:"Data Science",         emoji:"📊", desc:"Python, Pandas, Analytics." },
  { id:"companion",   label:"General Companion",    emoji:"✨", desc:"Conversational & Creative." },
];

const AGENT_OPTIONS = [
  { id:"gemini" as const, label:"Gemini Flash", sub:"Online · Cloud",  color:"#a78bfa", dim:"rgba(139,92,246,0.15)", border:"rgba(139,92,246,0.45)" },
  { id:"gemma"  as const, label:"Gemma 2B",    sub:"Offline · Local", color:"#34d399", dim:"rgba(16,185,129,0.15)", border:"rgba(16,185,129,0.45)" },
];

const PRONOUNS = ["He/Him", "She/Her", "They/Them", "Prefer not to say"];
const USE_CASES = [
  { id: "general",     label: "General",     emoji: "💬", desc: "All-round assistant" },
  { id: "coding",      label: "Coding",      emoji: "💻", desc: "Dev & engineering" },
  { id: "writing",     label: "Writing",     emoji: "✍️", desc: "Content & creativity" },
  { id: "therapy",     label: "Wellness",    emoji: "🧘", desc: "Emotional support" },
];
const KNOWLEDGE_LEVELS = ["Beginner", "Intermediate", "Expert"];

const SECURITY_QUESTIONS = [
  "What is the name of your first pet?",
  "What city were you born in?",
  "What was your childhood nickname?",
  "What is the name of your favorite teacher?",
  "Custom question...",
];

function hexRgb(hex: string) {
  if (!hex || hex.length < 7) return "167,139,250";
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

// Tiny success chime using Web Audio API (no external files needed)
function playSuccessChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.45);
    });
  } catch (e) { /* silent fail */ }
}

// Tick sound for typewriter
function playTick() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = "square";
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) { /* silent fail */ }
}

function getPasscodeStrength(p: string): { label: string; color: string; width: number } {
  if (!p) return { label: "", color: "#333", width: 0 };
  if (p.length < 4) return { label: "Weak", color: "#ef4444", width: 25 };
  if (p.length < 6) return { label: "Fair", color: "#f97316", width: 50 };
  if (p.length < 8) return { label: "Good", color: "#eab308", width: 75 };
  return { label: "Strong", color: "#22c55e", width: 100 };
}

export function Onboarding({ onComplete }: Props) {
  const [phase,    setPhase]   = useState<Phase>(0);
  const [fadeOut,  setFadeOut] = useState(false);
  const [exiting,  setExiting] = useState(false);

  // typewriter
  const [doneLines,  setDoneLines]  = useState<string[]>([]);
  const [typingText, setTypingText] = useState("");
  const [waveActive, setWaveActive] = useState(false);
  const timerA = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerB = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth
  const [consentChecked, setConsentChecked] = useState(false);
  const [verifyingGoogle, setVerifyingGoogle] = useState(false);
  const [authError, setAuthError] = useState("");
  const [googleToken, setGoogleToken] = useState("");
  const [driveRestoreAvailable, setDriveRestoreAvailable] = useState(false);
  const [driveRestoreData, setDriveRestoreData] = useState<any>(null);
  const [restoringDrive, setRestoringDrive] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Profile
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("grad1");
  const [googleAvatar, setGoogleAvatar] = useState("");
  const [pronoun, setPronoun] = useState("Prefer not to say");
  const [tone, setTone] = useState(50);
  const [responseLength, setResponseLength] = useState("Balanced");
  const [useCase, setUseCase] = useState("general");
  const [knowledgeLevel, setKnowledgeLevel] = useState("Intermediate");

  // Settings
  const [role, setRole] = useState("companion");
  const [agent, setAgent] = useState<"gemini"|"gemma">("gemini");
  const [themeId, setThemeId] = useState("midnight");
  const [passcode, setPasscode] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [verifyingGroq, setVerifyingGroq] = useState(false);
  const [verifyingGemini, setVerifyingGemini] = useState(false);
  const [groqValid, setGroqValid] = useState<boolean | null>(null);
  const [geminiValid, setGeminiValid] = useState<boolean | null>(null);
  const [hasLocalLlm, setHasLocalLlm] = useState(false);
  const [gpuCapable, setGpuCapable] = useState(false);
  const [emojiUsage, setEmojiUsage] = useState("Frequent");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [showGroqTooltip, setShowGroqTooltip] = useState(false);
  const [showGeminiTooltip, setShowGeminiTooltip] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];
  const passcodeStrength = getPasscodeStrength(passcode);

  const waveBars = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => {
      const norm = i / 27;
      const bell = Math.sin(norm * Math.PI);
      return { id: i, maxH: Math.round(6 + bell * 38), dur: 0.30 + (i % 7) * 0.07, delay: (i % 11) * 0.045 };
    })
  , []);

  function clear() {
    if (timerA.current) clearTimeout(timerA.current);
    if (timerB.current) clearTimeout(timerB.current);
  }

  function crossfade(next: Phase, wait = 0) {
    clear();
    timerA.current = setTimeout(() => {
      setFadeOut(true);
      timerB.current = setTimeout(() => { setFadeOut(false); setPhase(next); }, 460);
    }, wait);
  }

  // Online/offline detection
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  // Hardware check
  useEffect(() => {
    const checkGpu = async () => {
      try {
        if ((navigator as any).gpu) {
          const adapter = await (navigator as any).gpu.requestAdapter();
          if (adapter) setGpuCapable(true);
        }
      } catch (e) {}
    };
    checkGpu();
  }, []);

  // Local LLM ping
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const res = await fetch('http://127.0.0.1:11434/api/tags', { method: 'GET', signal: AbortSignal.timeout(1500) });
        if (res.ok) setHasLocalLlm(true);
      } catch (e) { setHasLocalLlm(false); }
    };
    checkOllama();
  }, []);

  // Auto-advances
  useEffect(() => { if (phase === 0) crossfade(1, 3000); return clear; }, [phase]);
  useEffect(() => { if (phase === 1) crossfade(2, 2300); return clear; }, [phase]);

  // Phase 2 typewriter with tick sounds
  useEffect(() => {
    if (phase !== 2) return;
    setDoneLines([]); setTypingText(""); setWaveActive(false);
    let li = 0, ci = 0;
    function tick() {
      if (li >= AI_INTRO.length) {
        setWaveActive(false);
        timerA.current = setTimeout(() => crossfade(3), 900);
        return;
      }
      const line = AI_INTRO[li];
      ci++;
      setWaveActive(true);
      setTypingText(line.slice(0, ci));
      if (ci % 3 === 0) playTick();
      if (ci < line.length) {
        timerA.current = setTimeout(tick, 30);
      } else {
        setWaveActive(false);
        timerA.current = setTimeout(() => {
          setDoneLines(prev => [...prev, line]);
          setTypingText(""); li++; ci = 0;
          timerA.current = setTimeout(tick, 220);
        }, 600);
      }
    }
    timerA.current = setTimeout(tick, 700);
    return clear;
  }, [phase]);

  const showFluid = phase >= 4;

  // Google Sign-In
  async function handleGoogleSignIn() {
    if (!consentChecked) { setAuthError("Please accept the privacy policy first."); return; }
    setVerifyingGoogle(true);
    setAuthError("");
    try {
      const electron = (window as any).require ? (window as any).require('electron') : null;
      if (!electron || !electron.ipcRenderer) {
        setAuthError("Google Auth requires the desktop app.");
        setVerifyingGoogle(false);
        return;
      }
      const token = await electron.ipcRenderer.invoke('google-auth-login');
      if (!token) {
        setAuthError("No token received. Check your Google Cloud Console settings.");
        setVerifyingGoogle(false);
        return;
      }
      setGoogleToken(token);
      // Fetch profile
      const res = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,photos,emailAddresses,locales', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data?.names?.length > 0) {
        setName(data.names[0].displayName || data.names[0].givenName || "");
      }
      if (data?.photos?.length > 0) {
        setGoogleAvatar(data.photos[0].url);
      }
      // Check Google Drive for backup
      try {
        const driveRes = await fetch(
          "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,modifiedTime)&q=name='tara_backup.json'",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const driveData = await driveRes.json();
        if (driveData?.files?.length > 0) {
          const fileId = driveData.files[0].id;
          const backupRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const backup = await backupRes.json();
          setDriveRestoreData(backup);
          setDriveRestoreAvailable(true);
        }
      } catch (e) { /* drive optional */ }

      setVerifyingGoogle(false);
      playSuccessChime();
      crossfade(4, 0);
    } catch (e: any) {
      setAuthError(e?.message || "Authentication failed. Please try again.");
      setVerifyingGoogle(false);
    }
  }

  // Restore from Drive
  async function restoreFromDrive() {
    if (!driveRestoreData) return;
    setRestoringDrive(true);
    try {
      const d = driveRestoreData;
      if (d.userName) localStorage.setItem("tara_username", d.userName);
      if (d.themeId) localStorage.setItem("tara_themeId", d.themeId);
      if (d.chatLanguage) localStorage.setItem("tara_chatLanguage", d.chatLanguage);
      if (d.groqKey) localStorage.setItem("tara_groq_api_key", d.groqKey);
      if (d.geminiKey) localStorage.setItem("tara_gemini_api_key_1", d.geminiKey);
      if (d.messages) localStorage.setItem("tara_threads", JSON.stringify(d.messages));
      if (d.memories) localStorage.setItem("tara_personal_memories", JSON.stringify(d.memories));
      localStorage.setItem("tara_onboarded", "1");
      playSuccessChime();
      window.location.reload();
    } catch (e) {
      setRestoringDrive(false);
    }
  }

  function finish() {
    setExiting(true);
    playSuccessChime();
    const finalQuestion = securityQuestion === "Custom question..." ? customQuestion : securityQuestion;
    setTimeout(() => onComplete({
      name: name.trim() || "You",
      avatar: googleAvatar || avatar,
      role, agent, themeId,
      passcode: passcode.trim() || "0000",
      securityQuestion: finalQuestion,
      securityAnswer: securityAnswer.trim(),
      groqKey, geminiKey, hasLocalLlm,
      pronoun, tone, responseLength, useCase, knowledgeLevel,
      emojiUsage, memoryEnabled,
    }), 820);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: theme.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "background 0.8s ease",
    }}>
      {/* Fluid blobs */}
      {showFluid && (
        <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {[
            { s:"70vmax", x:"-15%", y:"-20%", an:"ob-b1", d:"18s", c: theme.blobColor },
            { s:"55vmax", x:"55%",  y:"30%",  an:"ob-b2", d:"22s", c: theme.blobColor },
            { s:"60vmax", x:"10%",  y:"55%",  an:"ob-b3", d:"26s", c: theme.blobColor },
          ].map((b, i) => (
            <div key={i} style={{
              position:"absolute", left: b.x, top: b.y,
              width: b.s, height: b.s, borderRadius: "50%",
              background: `radial-gradient(circle, ${b.c}, transparent 68%)`,
              animation: `${b.an} ${b.d} ease-in-out infinite`,
              willChange: "transform", pointerEvents: "none",
            }} />
          ))}
        </div>
      )}

      {/* Content area */}
      <div style={{
        position: "relative", zIndex: 1,
        opacity: fadeOut || exiting ? 0 : 1,
        transform: exiting ? "scale(0.96)" : "scale(1)",
        transition: "opacity 0.46s ease, transform 0.46s ease",
        width: "100%", display: "flex", justifyContent: "center", alignItems: "center",
        padding: "24px",
      }}>

        {/* ── Phase 0: Welcome ── */}
        {phase === 0 && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "clamp(52px, 8vw, 90px)", fontWeight: 700,
              color: "#fff", letterSpacing: "0.01em",
              animation: "ob-write 1.2s steps(20,end) both, ob-fade-up 1.2s ease-out both",
              clipPath: "inset(0 100% 0 0)",
            }}>TARA</div>
            <svg width="160" height="16" viewBox="0 0 160 16" style={{ marginTop: 8, display: "block", margin: "0 auto" }}>
              <path d="M 8 12 Q 80 2 152 12" stroke="#a78bfa" strokeWidth="2.5" fill="none"
                strokeDasharray="180" strokeDashoffset="180" style={{ animation: "ob-underline 1.2s 0.5s ease-out forwards" }} />
            </svg>
          </div>
        )}

        {/* ── Phase 1 ── */}
        {phase === 1 && (
          <div style={{ textAlign: "center", animation: "ob-fade-up 0.6s ease-out both" }}>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(18px, 3vw, 26px)", fontWeight: 300, letterSpacing: "0.04em", margin: 0 }}>
              Let's get to know each other
            </p>
          </div>
        )}

        {/* ── Phase 2: Cinematic Typewriter ── */}
        {phase === 2 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            width: "min(600px, calc(100vw - 48px))",
            fontFamily: "'Cormorant SC', serif",
          }}>
            {/* Tara's Core (Optimized Liquid Fluid) */}
            <div style={{
              width: 160, height: 160, marginBottom: 50,
              background: `linear-gradient(135deg, ${theme.accentColor}, #ec4899, #8b5cf6, #06b6d4, ${theme.accentColor})`,
              backgroundSize: "300% 300%",
              animation: `ob-liquid-bg 8s ease infinite, ob-liquid-shape ${waveActive ? "1.2s" : "7s"} ease-in-out infinite alternate`,
              boxShadow: waveActive ? `0 0 50px 10px ${theme.accentColor}77` : `0 0 20px 3px ${theme.accentColor}22`,
              filter: waveActive ? "brightness(1.15)" : "brightness(1)",
              transform: waveActive ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), filter 0.2s ease, box-shadow 0.2s ease, animation-duration 0.5s",
              display: "flex", alignItems: "center", justifyContent: "center",
              willChange: "transform, filter, border-radius, background-position",
            }}>
               {/* Inner audio visualizer inside the liquid */}
              <div style={{ display: "flex", gap: 4, alignItems: "center", height: 28, mixBlendMode: "overlay" }}>
                {waveBars.slice(10, 16).map(b => (
                  <div key={b.id} style={{
                    width: 4, borderRadius: 2, background: "#fff",
                    "--h": `${Math.min(b.maxH, 36)}px`,
                    animation: `${waveActive ? "wave-speak" : "wave-idle"} ${b.dur}s ${b.delay}s ease-in-out infinite`,
                    willChange: "transform, opacity, height",
                  } as any} />
                ))}
              </div>
            </div>

            {/* Typewriter Text beneath */}
            <div style={{ minHeight: 140, textAlign: "center", width: "100%", animation: "ob-fade-up 1.2s ease-out both" }}>
              {doneLines.map((l, i) => (
                <p key={i} style={{ 
                  color: i === doneLines.length - 1 && !typingText ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)", 
                  fontSize: 26, fontWeight: 600, lineHeight: 1.6, margin: "0 0 10px", 
                  letterSpacing: "0.03em", transition: "color 0.8s"
                }}>{l}</p>
              ))}
              {typingText && (
                <p style={{ color: "rgba(255,255,255,1)", fontSize: 28, fontWeight: 700, lineHeight: 1.6, margin: 0, letterSpacing: "0.02em", textShadow: `0 0 16px ${theme.accentColor}99` }}>
                  {typingText}<span style={{ animation: "ob-blink 0.9s infinite", marginLeft: 2, color: theme.accentColor }}>|</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Phase 3: Sign In ── */}
        {phase === 3 && (
          <div style={{ width: "min(420px, calc(100vw - 48px))", animation: "ob-fade-up 0.55s ease-out both" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 12, animation: "ob-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>👋</div>
              <h2 style={{ color: "rgba(255,255,255,0.9)", fontSize: 22, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                Your Profile
              </h2>
              <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                Sign in or enter your name to continue
              </p>
            </div>

            {/* Privacy Consent */}
            <label style={{
              display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, padding: "12px 14px", cursor: "pointer",
            }}>
              <div
                onClick={() => setConsentChecked(v => !v)}
                style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                  background: consentChecked ? "#a78bfa" : "transparent",
                  border: consentChecked ? "1.5px solid #a78bfa" : "1.5px solid rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s", cursor: "pointer",
                }}
              >
                {consentChecked && <Check size={10} color="#fff" />}
              </div>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.6 }}>
                I agree that TARA processes my data <strong style={{ color: "rgba(255,255,255,0.65)" }}>locally on my device</strong>. No data is sold or shared.
              </span>
            </label>

            {/* Google Sign-In */}
            {isOnline ? (
              <button
                onClick={handleGoogleSignIn}
                disabled={verifyingGoogle || !consentChecked}
                style={{
                  width: "100%", padding: "14px", borderRadius: 15, border: "1px solid rgba(255,255,255,0.1)",
                  background: consentChecked ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                  color: "#fff", fontSize: 15, fontWeight: 600, cursor: consentChecked ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  transition: "all 0.2s", opacity: verifyingGoogle ? 0.7 : 1, marginBottom: authError ? 8 : 20,
                }}
                onMouseEnter={e => { if (consentChecked) e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => e.currentTarget.style.background = consentChecked ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)"}
              >
                {verifyingGoogle ? <Loader2 className="animate-spin" size={18} /> : <Globe size={18} />}
                {verifyingGoogle ? "Waiting for Google..." : "Sign in with Google"}
              </button>
            ) : (
              <div style={{
                padding: "12px 14px", marginBottom: 20, borderRadius: 12,
                background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)",
                color: "rgba(251,146,60,0.9)", fontSize: 12, display: "flex", alignItems: "center", gap: 8
              }}>
                <AlertCircle size={14} />
                You're offline. Please enter your name manually.
              </div>
            )}

            {authError && (
              <div style={{
                color: '#f87171', fontSize: 11, textAlign: 'center', marginBottom: 14,
                padding: '8px 12px', background: 'rgba(248,113,113,0.08)', borderRadius: 8,
                border: '1px solid rgba(248,113,113,0.15)'
              }}>
                ⚠ {authError}
              </div>
            )}

            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11, marginBottom: 20 }}>OR ENTER MANUALLY</div>
            <NameInput value={name} onChange={setName} onEnter={() => { if (name.trim()) { playSuccessChime(); crossfade(4, 0); } }} accent="#a78bfa" />
            <div style={{ height: 14 }} />
            <PrimaryBtn label="Continue →" disabled={!name.trim()} onClick={() => { playSuccessChime(); crossfade(4, 0); }} accent="#a78bfa" />
          </div>
        )}

        {/* ── Phase 4: Nickname + Avatar ── */}
        {phase === 4 && (
          <div style={{ width: "min(460px, calc(100vw - 48px))", animation: "ob-fade-up 0.6s ease-out both" }}>

            {/* Drive Restore Banner */}
            {driveRestoreAvailable && (
              <div style={{
                background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: 14, padding: "16px", marginBottom: 24,
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Shield size={14} color="#22c55e" />
                  </div>
                  <div>
                    <div style={{ color: "#86efac", fontSize: 12, fontWeight: 700 }}>Backup Found on Google Drive</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>Restore your chats, settings, and memories</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={restoreFromDrive}
                    disabled={restoringDrive}
                    style={{
                      flex: 1, padding: "9px", borderRadius: 9, border: "none", cursor: "pointer",
                      background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", fontSize: 12, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                  >
                    {restoringDrive ? <Loader2 size={13} className="animate-spin" /> : null}
                    {restoringDrive ? "Restoring..." : "✓ Restore Backup"}
                  </button>
                  <button
                    onClick={() => setDriveRestoreAvailable(false)}
                    style={{ padding: "9px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {/* Greeting */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "clamp(32px, 5.5vw, 52px)", fontWeight: 600,
                letterSpacing: "0.02em", lineHeight: 1.25,
                background: `linear-gradient(115deg, #fff 0%, ${theme.accentColor} 45%, #fff 100%)`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "ob-shimmer 2.4s linear infinite, ob-fade-up 0.6s ease-out both",
              }}>
                Nice to meet you,<br />{name || "friend"}!
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 10, marginBottom: 0 }}>
                What should Tara call you? You can keep your name or use a nickname.
              </p>
            </div>

            {/* Nickname Input */}
            <NameInput value={name} onChange={setName} onEnter={() => { if (name.trim()) crossfade(5, 0); }} accent={theme.accentColor} />
            <div style={{ height: 20 }} />

            {/* Avatar Selection */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
                Choose Avatar
              </div>
              {googleAvatar && (
                <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    onClick={() => { setAvatar("google"); }}
                    style={{
                      width: 52, height: 52, borderRadius: "50%", overflow: "hidden", cursor: "pointer",
                      border: avatar === "google" ? `2px solid ${theme.accentColor}` : "2px solid rgba(255,255,255,0.1)",
                      boxShadow: avatar === "google" ? `0 0 0 3px ${theme.accentColor}33` : "none",
                      transition: "all 0.2s", flexShrink: 0,
                    }}
                  >
                    <img src={googleAvatar} alt="Google" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Your Google photo</span>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8 }}>
                {PRESET_AVATARS.map(av => (
                  <button
                    key={av.id}
                    onClick={() => setAvatar(av.id)}
                    style={{
                      width: "100%", aspectRatio: "1", borderRadius: "50%", border: "none", cursor: "pointer",
                      background: av.gradient,
                      outline: (avatar === av.id && (!googleAvatar || avatar !== "google")) ? `2.5px solid ${theme.accentColor}` : "2px solid transparent",
                      boxShadow: (avatar === av.id && (!googleAvatar || avatar !== "google")) ? `0 0 0 3px ${theme.accentColor}33` : "none",
                      transition: "all 0.2s", fontSize: 14,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    title={av.id}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
            </div>

            <PrimaryBtn label="Continue →" disabled={!name.trim()} onClick={() => { playSuccessChime(); crossfade(5, 0); }} accent={theme.accentColor} />
          </div>
        )}

        {/* ── Phase 5: AI Personality Config ── */}
        {phase === 5 && (
          <div style={{ width: "min(500px, calc(100vw - 48px))", animation: "ob-fade-up 0.55s ease-out both" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 10, animation: "ob-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>🧠</div>
              <h2 style={{ color: "rgba(255,255,255,0.9)", fontSize: 20, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Personalize Tara</h2>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>These help Tara understand how to speak with you.</p>
            </div>

            {/* Pronouns */}
            <FieldLabel text="Your Pronouns" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 22 }}>
              {PRONOUNS.map(p => (
                <button key={p} onClick={() => setPronoun(p)} style={{
                  padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: pronoun === p ? `rgba(${hexRgb(theme.accentColor)},0.15)` : "rgba(255,255,255,0.04)",
                  outline: pronoun === p ? `1.5px solid ${theme.accentColor}66` : "1px solid rgba(255,255,255,0.08)",
                  color: pronoun === p ? theme.accentColor : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Tone Slider */}
            <FieldLabel text="Tone of Conversation" />
            <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>🤝 Professional</span>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>💜 Empathetic</span>
            </div>
            <input
              type="range" min={0} max={100} value={tone}
              onChange={e => setTone(Number(e.target.value))}
              style={{ width: "100%", marginBottom: 20, accentColor: theme.accentColor }}
            />

            {/* Response Length */}
            <FieldLabel text="Response Length" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 22 }}>
              {["Concise", "Balanced", "Detailed"].map(l => (
                <button key={l} onClick={() => setResponseLength(l)} style={{
                  padding: "10px 6px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: responseLength === l ? `rgba(${hexRgb(theme.accentColor)},0.15)` : "rgba(255,255,255,0.04)",
                  outline: responseLength === l ? `1.5px solid ${theme.accentColor}66` : "1px solid rgba(255,255,255,0.08)",
                  color: responseLength === l ? theme.accentColor : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                }}>
                  {l}
                </button>
              ))}
            </div>

            {/* Use Case */}
            <FieldLabel text="Primary Use Case" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 22 }}>
              {USE_CASES.map(uc => (
                <button key={uc.id} onClick={() => setUseCase(uc.id)} style={{
                  padding: "12px 10px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: useCase === uc.id ? `rgba(${hexRgb(theme.accentColor)},0.15)` : "rgba(255,255,255,0.04)",
                  outline: useCase === uc.id ? `1.5px solid ${theme.accentColor}66` : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontSize: 22 }}>{uc.emoji}</span>
                  <span style={{ color: useCase === uc.id ? theme.accentColor : "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600 }}>{uc.label}</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, textAlign: "center" }}>{uc.desc}</span>
                </button>
              ))}
            </div>

            {/* Knowledge Level */}
            <FieldLabel text="Your Knowledge Level" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 28 }}>
              {KNOWLEDGE_LEVELS.map(kl => (
                <button key={kl} onClick={() => setKnowledgeLevel(kl)} style={{
                  padding: "10px 6px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: knowledgeLevel === kl ? `rgba(${hexRgb(theme.accentColor)},0.15)` : "rgba(255,255,255,0.04)",
                  outline: knowledgeLevel === kl ? `1.5px solid ${theme.accentColor}66` : "1px solid rgba(255,255,255,0.08)",
                  color: knowledgeLevel === kl ? theme.accentColor : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                }}>
                  {kl}
                </button>
              ))}
            </div>

            <PrimaryBtn label="Next →" disabled={false} onClick={() => { playSuccessChime(); crossfade(6, 0); }} accent={theme.accentColor} />
          </div>
        )}

        {/* ── Phase 6: Environment ── */}
        {phase === 6 && (
          <div style={{ width: "min(480px, calc(100vw - 48px))", animation: "ob-fade-up 0.55s ease-out both" }}>
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <div style={{ fontSize: 36, marginBottom: 10, animation: "ob-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>⚙️</div>
              <h2 style={{ color: "rgba(255,255,255,0.9)", fontSize: 20, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Operating Environment</h2>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>This configures Tara's base reasoning parameters.</p>
            </div>
            <FieldLabel text="What is your primary use of TARA?" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 22 }}>
              {ENVIRONMENTS.map(env => {
                const active = role === env.id;
                return (
                  <button key={env.id} onClick={() => setRole(env.id)} style={{
                    padding: "16px 8px", borderRadius: 14, border: "none", cursor: "pointer",
                    background: active ? `rgba(${hexRgb(theme.accentColor)},0.14)` : "rgba(255,255,255,0.05)",
                    outline: active ? `1.5px solid ${theme.accentColor}66` : "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  >
                    <span style={{ fontSize: 24 }}>{env.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? theme.accentColor : "rgba(255,255,255,0.7)" }}>{env.label}</span>
                    <span style={{ fontSize: 10, color: active ? theme.accentColor : "rgba(255,255,255,0.3)", textAlign: "center" }}>{env.desc}</span>
                  </button>
                );
              })}
            </div>
            {gpuCapable && (
              <div style={{
                padding: "10px 14px", marginBottom: 16, borderRadius: 10,
                background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)",
                color: "rgba(52,211,153,0.9)", fontSize: 11, display: "flex", alignItems: "center", gap: 8
              }}>
                <Cpu size={13} />
                GPU detected! Local LLM (offline mode) is supported on this device.
              </div>
            )}
            <PrimaryBtn label="Next →" disabled={false} onClick={() => { playSuccessChime(); crossfade(7, 0); }} accent={theme.accentColor} />
          </div>
        )}

        {/* ── Phase 7: Theme ── */}
        {phase === 7 && (
          <div style={{ width: "min(460px, calc(100vw - 48px))", animation: "ob-fade-up 0.55s ease-out both" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 10, animation: "ob-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>🎨</div>
              <h2 style={{ color: "rgba(255,255,255,0.9)", fontSize: 20, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Choose your theme</h2>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>Background changes instantly as you pick.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 28 }}>
              {THEMES.map(t => {
                const active = themeId === t.id;
                return (
                  <button key={t.id} onClick={() => setThemeId(t.id)} style={{
                    padding: "18px 10px 13px", borderRadius: 18, border: "none", cursor: "pointer",
                    background: active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                    outline: active ? `1.5px solid ${t.accentColor}66` : "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.18s", position: "relative",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 9,
                  }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  >
                    <div style={{
                      width: 46, height: 46, borderRadius: 13,
                      background: `radial-gradient(circle at 38% 35%, ${t.blobColor}, ${t.bg} 68%)`,
                      border: `1px solid ${active ? t.accentColor + "44" : "rgba(255,255,255,0.08)"}`,
                      boxShadow: active ? `0 4px 18px ${t.blobColor}` : "none",
                      transition: "all 0.22s",
                    }} />
                    <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? t.accentColor : "rgba(255,255,255,0.42)" }}>
                      {t.name}
                    </span>
                    {active && (
                      <div style={{ position: "absolute", top: 8, right: 8, width: 17, height: 17, borderRadius: "50%", background: t.accentColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Check size={8} style={{ color: "#000" }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <PrimaryBtn label="Next →" disabled={false} onClick={() => { playSuccessChime(); crossfade(8, 0); }} accent={theme.accentColor} />
          </div>
        )}

        {/* ── Phase 8: Passcode ── */}
        {phase === 8 && (
          <div style={{ width: 360, animation: "ob-fade-up 0.5s ease-out both" }}>
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <div style={{ fontSize: 36, marginBottom: 10, animation: "ob-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>🔒</div>
              <h2 style={{ color: "rgba(255,255,255,0.9)", fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Security Setup</h2>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>Protect your API keys and private data.</p>
            </div>
            <FieldLabel text="Master Passcode" />
            <div style={{ marginBottom: 8 }}>
              <FieldInput value={passcode} onChange={setPasscode} onEnter={() => {}} accent={theme.accentColor} placeholder="Create a passcode..." />
            </div>
            {/* Strength meter */}
            {passcode && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ width: `${passcodeStrength.width}%`, height: "100%", background: passcodeStrength.color, transition: "all 0.3s", borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 10, color: passcodeStrength.color, fontWeight: 600 }}>{passcodeStrength.label}</span>
              </div>
            )}

            <FieldLabel text="Recovery Question" />
            <select
              value={securityQuestion}
              onChange={e => setSecurityQuestion(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px", marginBottom: 12, outline: "none" }}
            >
              {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>

            {securityQuestion === "Custom question..." && (
              <div style={{ marginBottom: 12 }}>
                <FieldInput value={customQuestion} onChange={setCustomQuestion} onEnter={() => {}} accent={theme.accentColor} placeholder="Type your custom question..." />
              </div>
            )}

            <div style={{ marginBottom: 26 }}>
              <FieldInput value={securityAnswer} onChange={setSecurityAnswer} onEnter={() => { if (passcode.trim() && securityAnswer.trim()) crossfade(9, 0); }} accent={theme.accentColor} placeholder="Your answer..." />
            </div>
            <PrimaryBtn label="Next →" disabled={!passcode.trim() || !securityAnswer.trim()} onClick={() => { playSuccessChime(); crossfade(9, 0); }} accent={theme.accentColor} />
          </div>
        )}

        {/* ── Phase 9: API Keys ── */}
        {phase === 9 && (
          <div style={{ width: 440, animation: "ob-fade-up 0.5s ease-out both" }}>
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <div style={{ fontSize: 36, marginBottom: 10, animation: "ob-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>🔑</div>
              <h2 style={{ color: "rgba(255,255,255,0.9)", fontSize: 20, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Reasoning Engines</h2>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>Add your keys to unlock cloud intelligence</p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 20, marginBottom: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
              {/* Groq */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <FieldLabel text="Groq API Key (Fast Inference)" />
                <div style={{ position: "relative" }}>
                  <button
                    onMouseEnter={() => setShowGroqTooltip(true)}
                    onMouseLeave={() => setShowGroqTooltip(false)}
                    style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 18, height: 18, color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}
                  >?</button>
                  {showGroqTooltip && (
                    <div style={{ position: "absolute", bottom: "120%", right: 0, width: 220, background: "rgba(0,0,0,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 12px", zIndex: 100, color: "rgba(255,255,255,0.7)", fontSize: 10.5, lineHeight: 1.55 }}>
                      Get your free key at <strong style={{ color: "#a78bfa" }}>console.groq.com</strong>. Sign up, go to API Keys, and create one. It starts with <code>gsk_</code>.
                    </div>
                  )}
                </div>
              </div>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <input
                  type="password" value={groqKey}
                  onChange={e => { setGroqKey(e.target.value); setGroqValid(null); if (e.target.value.length > 10) { setVerifyingGroq(true); setTimeout(() => { setVerifyingGroq(false); setGroqValid(true); }, 1000); } }}
                  placeholder="gsk_..."
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: `1px solid ${groqValid === true ? '#22c55e' : 'rgba(255,255,255,0.1)'}`, padding: '12px 14px', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ position: 'absolute', right: 12, top: 12 }}>
                  {verifyingGroq && <Loader2 className="animate-spin" size={16} color="rgba(255,255,255,0.5)" />}
                  {groqValid === true && <Check size={16} color="#22c55e" />}
                </div>
              </div>

              {/* Gemini */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <FieldLabel text="Gemini API Key (Deep Reasoning)" />
                <div style={{ position: "relative" }}>
                  <button
                    onMouseEnter={() => setShowGeminiTooltip(true)}
                    onMouseLeave={() => setShowGeminiTooltip(false)}
                    style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 18, height: 18, color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}
                  >?</button>
                  {showGeminiTooltip && (
                    <div style={{ position: "absolute", bottom: "120%", right: 0, width: 220, background: "rgba(0,0,0,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 12px", zIndex: 100, color: "rgba(255,255,255,0.7)", fontSize: 10.5, lineHeight: 1.55 }}>
                      Get your key at <strong style={{ color: "#818cf8" }}>aistudio.google.com</strong>. Click "Get API Key". It starts with <code>AIza</code>.
                    </div>
                  )}
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password" value={geminiKey}
                  onChange={e => { setGeminiKey(e.target.value); setGeminiValid(null); if (e.target.value.length > 10) { setVerifyingGemini(true); setTimeout(() => { setVerifyingGemini(false); setGeminiValid(true); }, 1000); } }}
                  placeholder="AIza..."
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: `1px solid ${geminiValid === true ? '#22c55e' : 'rgba(255,255,255,0.1)'}`, padding: '12px 14px', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ position: 'absolute', right: 12, top: 12 }}>
                  {verifyingGemini && <Loader2 className="animate-spin" size={16} color="rgba(255,255,255,0.5)" />}
                  {geminiValid === true && <Check size={16} color="#22c55e" />}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 20, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              {hasLocalLlm
                ? "✓ Local LLM (Ollama) detected and ready."
                : gpuCapable
                  ? "GPU detected. Install Ollama to enable offline mode."
                  : "No local LLM detected. Using Cloud Models."}
            </div>

            <PrimaryBtn label="Finish Setup ✓" disabled={false} onClick={finish} accent={theme.accentColor} />
          </div>
        )}

      </div>

      {/* Exit flash */}
      {exiting && (
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 99, pointerEvents: "none",
          background: theme.accentColor,
          animation: "ob-exit 0.82s cubic-bezier(0.4,0,0.6,1) forwards",
        }} />
      )}

      <style>{`
        @keyframes ob-write {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes ob-underline { to { stroke-dashoffset: 0; } }
        @keyframes ob-fade-up {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ob-pop {
          from { opacity:0; transform:scale(0.5) rotate(-10deg); }
          65%  { transform:scale(1.18) rotate(4deg); }
          to   { opacity:1; transform:scale(1) rotate(0deg); }
        }
        @keyframes ob-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes ob-shimmer {
          from { background-position:-200% center; }
          to   { background-position: 200% center; }
        }
        @keyframes wave-speak {
          0%,100% { height: 3px; }
          50%     { height: var(--h); }
        }
        @keyframes wave-idle {
          0%,100% { height: 2px; }
          50%     { height: 6px; }
        }
        @keyframes wave-edge-speak {
          0%,100% {
            border-color: rgba(167,139,250,0.45);
            box-shadow: 0 0 0 1px rgba(167,139,250,0.3), 0 0 18px 5px rgba(167,139,250,0.22), 0 0 40px 14px rgba(167,139,250,0.08);
          }
          50% {
            border-color: rgba(167,139,250,0.85);
            box-shadow: 0 0 0 1px rgba(167,139,250,0.7), 0 0 28px 10px rgba(167,139,250,0.4), 0 0 60px 24px rgba(167,139,250,0.16);
          }
        }
        @keyframes wave-edge-idle {
          0%,100% { border-color: rgba(255,255,255,0.07); box-shadow: 0 0 0 1px rgba(167,139,250,0.1), 0 0 10px 2px rgba(167,139,250,0.05); }
          50%     { border-color: rgba(255,255,255,0.1);  box-shadow: 0 0 0 1px rgba(167,139,250,0.18), 0 0 16px 4px rgba(167,139,250,0.09); }
        }
        @keyframes ob-b1 { 0%,100%{transform:translate(0,0)scale(1)} 33%{transform:translate(7%,-7%)scale(1.07)} 66%{transform:translate(-4%,5%)scale(0.94)} }
        @keyframes ob-b2 { 0%,100%{transform:translate(0,0)scale(1)} 40%{transform:translate(-8%,5%)scale(1.09)} 80%{transform:translate(5%,-6%)scale(0.96)} }
        @keyframes ob-b3 { 0%,100%{transform:translate(0,0)scale(1)} 35%{transform:translate(6%,8%)scale(1.11)} 70%{transform:translate(-5%,-4%)scale(0.92)} }
        @keyframes ob-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes ob-liquid-bg { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes ob-liquid-shape { 0%{border-radius:40% 60% 70% 30% / 40% 50% 60% 50%} 50%{border-radius:60% 40% 30% 70% / 60% 30% 70% 40%} 100%{border-radius:40% 60% 70% 30% / 40% 50% 60% 50%} }
        @keyframes ob-exit { 0%{opacity:0} 40%{opacity:0.7} 100%{opacity:0} }
      `}</style>
    </div>
  );
}

/* ── Sub-components ── */

function NameInput({ value, onChange, onEnter, accent }: {
  value:string; onChange:(v:string)=>void; onEnter:()=>void; accent:string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:10,
      background:"rgba(255,255,255,0.05)", borderRadius:15,
      border: focused ? `1px solid ${accent}99` : "1px solid rgba(255,255,255,0.1)",
      padding:"0 18px", transition:"border-color 0.2s, box-shadow 0.2s",
      boxShadow: focused ? `0 0 0 3px ${accent}22` : "none",
    }}>
      <User size={14} style={{ color: focused ? `${accent}cc` : "rgba(255,255,255,0.22)", flexShrink:0, transition:"color 0.2s" }} />
      <input
        autoFocus value={value} placeholder="e.g. Alex"
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onKeyDown={e => { if(e.key==="Enter" && value.trim()) onEnter(); }}
        style={{
          flex:1, background:"transparent", border:"none", outline:"none",
          color:"rgba(255,255,255,0.88)", fontSize:17, padding:"14px 10px",
          caretColor:accent, fontFamily:"system-ui,sans-serif",
        }}
      />
    </div>
  );
}

function FieldInput({ value, onChange, onEnter, accent, placeholder="" }: {
  value:string; onChange:(v:string)=>void; onEnter:()=>void; accent:string; placeholder?:string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:10,
      background:"rgba(255,255,255,0.05)", borderRadius:15,
      border: focused ? `1px solid ${accent}99` : "1px solid rgba(255,255,255,0.1)",
      padding:"0 18px", transition:"border-color 0.2s, box-shadow 0.2s",
      boxShadow: focused ? `0 0 0 3px ${accent}22` : "none",
    }}>
      <input
        value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onKeyDown={e => { if(e.key==="Enter") onEnter(); }}
        style={{
          flex:1, background:"transparent", border:"none", outline:"none",
          color:"rgba(255,255,255,0.88)", fontSize:15, padding:"14px 10px",
          caretColor:accent, fontFamily:"system-ui,sans-serif",
        }}
      />
    </div>
  );
}

function FieldLabel({ text }: { text:string }) {
  return (
    <div style={{
      color:"rgba(255,255,255,0.3)", fontSize:10.5, fontWeight:600,
      letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:10,
    }}>{text}</div>
  );
}

function PrimaryBtn({ label, disabled, onClick, accent }: {
  label:string; disabled:boolean; onClick:()=>void; accent:string;
}) {
  const rgb = hexRgb(accent);
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", padding:"15px 0", borderRadius:16, border:"none",
      background: disabled ? "rgba(255,255,255,0.06)" : accent,
      color: disabled ? "rgba(255,255,255,0.2)" : "#fff",
      fontSize:15, fontWeight:600, cursor: disabled ? "default" : "pointer",
      transition:"all 0.2s",
      boxShadow: disabled ? "none" : `0 4px 26px rgba(${rgb},0.42)`,
      display:"flex", alignItems:"center", justifyContent:"center",
    }}
      onMouseEnter={e => { if(!disabled){e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow=`0 10px 36px rgba(${rgb},0.55)`;} }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=disabled?"none":`0 4px 26px rgba(${rgb},0.42)`; }}
    >{label}</button>
  );
}
