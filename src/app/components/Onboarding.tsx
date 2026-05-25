import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { SpinningStar } from "./SpinningStar";
import { Bot, Check, User } from "lucide-react";

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

export interface OnboardingData {
  name: string; role: string;
  agent: "gemini" | "gemma"; themeId: string;
  passcode: string;
  securityQuestion: string;
  securityAnswer: string;
}

interface Props { onComplete: (data: OnboardingData) => void; }

type Phase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
// 0 = Welcome cursive + SVG underline
// 1 = "Let's get to know each other"
// 2 = Sound wave + AI typewriter  (pure black bg)
// 3 = Name form                   (pure black bg)
// 4 = "Nice to meet you!" shimmer (fluid bg blooms in)
// 5 = Role + Agent
// 6 = Theme picker

const AI_INTRO = [
  "Hi. I'm your AI assistant.",
  "I help you think, write, and explore ideas.",
  "I work online and offline — your choice.",
  "Your conversations are always private.",
  "Let's get you set up.",
];

const ROLES = [
  { id:"student",   label:"Student",   emoji:"🎓" },
  { id:"developer", label:"Developer", emoji:"💻" },
  { id:"designer",  label:"Designer",  emoji:"🎨" },
  { id:"writer",    label:"Writer",    emoji:"✍️" },
  { id:"analyst",   label:"Analyst",   emoji:"📊" },
  { id:"other",     label:"Other",     emoji:"✨" },
];

const AGENT_OPTIONS = [
  { id:"gemini" as const, label:"Gemini Flash", sub:"Online · Cloud",  color:"#a78bfa", dim:"rgba(139,92,246,0.15)", border:"rgba(139,92,246,0.45)" },
  { id:"gemma"  as const, label:"Gemma 2B",    sub:"Offline · Local", color:"#34d399", dim:"rgba(16,185,129,0.15)", border:"rgba(16,185,129,0.45)" },
];

const SECURITY_QUESTIONS = [
  "What is the name of your first pet?",
  "What city were you born in?",
  "What was your childhood nickname?",
  "What is the name of your favorite teacher?",
];

function hexRgb(hex: string) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

export function Onboarding({ onComplete }: Props) {
  const [phase,    setPhase]   = useState<Phase>(0);
  const [fadeOut,  setFadeOut] = useState(false);
  const [exiting,  setExiting] = useState(false);

  /* typewriter */
  const [doneLines,  setDoneLines]  = useState<string[]>([]);
  const [typingText, setTypingText] = useState("");
  const [waveActive, setWaveActive] = useState(false);  // drives sound wave + edge glow
  const timerA = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerB = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* form */
  const [name, setName] = useState("");
  const [role, setRole] = useState("developer");
  const [agent, setAgent] = useState<"gemini"|"gemma">("gemini");
  const [themeId, setThemeId] = useState("midnight");
  const [passcode, setPasscode] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  /* sound wave bars — bell-curve heights, generated once */
  const waveBars = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => {
      const norm = i / 27;                               // 0 → 1
      const bell = Math.sin(norm * Math.PI);             // 0 → 1 → 0
      return {
        id:    i,
        maxH:  Math.round(6 + bell * 38),               // 6–44 px
        dur:   0.30 + (i % 7) * 0.07,                   // 0.30–0.72 s
        delay: (i % 11) * 0.045,                        // 0–0.45 s stagger
      };
    })
  , []);

  /* helpers */
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

  /* auto-advances */
  useEffect(() => { if (phase === 0) crossfade(1, 3000); return clear; }, [phase]);
  useEffect(() => { if (phase === 1) crossfade(2, 2300); return clear; }, [phase]);
  useEffect(() => { if (phase === 4) crossfade(5, 2600); return clear; }, [phase]);

  /* phase 2 typewriter */
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
      if (ci < line.length) {
        timerA.current = setTimeout(tick, 30);
      } else {
        setWaveActive(false);
        timerA.current = setTimeout(() => {
          const done = line;
          setDoneLines(prev => [...prev, done]);
          setTypingText(""); li++; ci = 0;
          timerA.current = setTimeout(tick, 220);
        }, 600);
      }
    }
    timerA.current = setTimeout(tick, 700);
    return clear;
  }, [phase]);

  /* fluid bg visible from phase 4 */
  const showFluid = phase >= 4;

  function finish() {
    setExiting(true);
    setTimeout(() => onComplete({ 
      name: name.trim() || "You", 
      role, agent, themeId, 
      passcode: passcode.trim() || "0000",
      securityQuestion,
      securityAnswer: securityAnswer.trim()
    }), 820);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: showFluid ? theme.bg : "#000000",
      transition: "background 0.7s ease",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui,sans-serif", overflow: "hidden",
    }}>

      {/* ── Fluid blobs (phase 4+) ── */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        opacity: showFluid ? 1 : 0,
        transition: "opacity 1.8s ease",
      }}>
        <div style={{ position:"absolute", width:"58%", height:"58%", top:"-14%", left:"-10%",  background:`radial-gradient(circle,${theme.blobColor} 0%,transparent 70%)`, filter:"blur(88px)", animation:"ob-b1 20s ease-in-out infinite", transition:"background 0.7s" }} />
        <div style={{ position:"absolute", width:"50%", height:"50%", top:"30%",   right:"-14%", background:"radial-gradient(circle,rgba(59,130,246,0.24) 0%,transparent 70%)",  filter:"blur(82px)", animation:"ob-b2 26s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:"44%", height:"44%", bottom:"-16%",left:"20%",  background:"radial-gradient(circle,rgba(236,72,153,0.2) 0%,transparent 70%)",   filter:"blur(92px)", animation:"ob-b3 18s ease-in-out infinite" }} />
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.52)" }} />
      </div>

      {/* ── Skip ── */}
      {phase < 7 && !exiting && (
        <button onClick={() => { clear(); setFadeOut(false); setPhase(7); }}
          style={{ position:"absolute", top:22, right:26, background:"none", border:"none",
            color:"rgba(255,255,255,0.16)", fontSize:12, cursor:"pointer",
            letterSpacing:"0.04em", transition:"color 0.2s", zIndex:10 }}
          onMouseEnter={e => (e.currentTarget.style.color="rgba(255,255,255,0.42)")}
          onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.16)")}
        >skip →</button>
      )}

      {/* ── Content ── */}
      <div style={{
        width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity:   exiting ? 0 : fadeOut ? 0 : 1,
        transform: exiting ? "scale(1.04)" : fadeOut ? "scale(0.97)" : "scale(1)",
        transition: "opacity 0.42s ease, transform 0.42s ease",
      }}>

        {/* Phase 0 — Welcome */}
        {phase === 0 && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Dancing Script',cursive",
              fontSize: "clamp(58px,9vw,86px)", fontWeight: 600,
              color: "rgba(255,255,255,0.88)", letterSpacing: "0.03em",
              display: "inline-block", overflow: "hidden", whiteSpace: "nowrap",
              animation: "ob-write 2s cubic-bezier(0.4,0,0.2,1) both",
            }}>Welcome.</div>
            <svg width="272" height="20" viewBox="0 0 272 20" style={{ display:"block", margin:"6px auto 0" }}>
              <path d="M 8 13 Q 68 4 136 13 Q 204 22 264 13"
                stroke="rgba(167,139,250,0.5)" strokeWidth="2.5"
                fill="none" strokeLinecap="round"
                style={{ strokeDasharray:272, strokeDashoffset:272,
                  animation:"ob-underline 1s ease-out 1.85s forwards" }}
              />
            </svg>
          </div>
        )}

        {/* Phase 1 — "Let's get to know each other" */}
        {phase === 1 && (
          <div style={{ textAlign:"center", padding:"0 32px" }}>
            <div style={{
              fontFamily: "'Dancing Script',cursive",
              fontSize: "clamp(28px,4.5vw,46px)", fontWeight: 400,
              color: "rgba(255,255,255,0.65)", letterSpacing: "0.01em",
              animation: "ob-fade-up 0.65s ease-out both",
            }}>Let's get to know each other.</div>
          </div>
        )}

        {/* Phase 2 — Sound wave + typewriter */}
        {phase === 2 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 32, padding: "0 40px", maxWidth: 520,
            animation: "ob-fade-up 0.6s ease-out both",
          }}>

            {/* Sound wave with edge lighting */}
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 3,
              padding: "16px 22px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid transparent",
              animation: waveActive ? "wave-edge-speak 0.44s ease-in-out infinite" : "wave-edge-idle 2.2s ease-in-out infinite",
              transition: "animation 0.3s",
              height: 72,
              boxSizing: "border-box",
            }}>
              {waveBars.map(bar => (
                <div key={bar.id} style={{
                  width: 3,
                  borderRadius: 3,
                  flexShrink: 0,
                  background: `linear-gradient(to top, ${theme.accentColor}, ${theme.accentColor}55)`,
                  animationName: waveActive ? "wave-speak" : "wave-idle",
                  animationDuration: `${bar.dur}s`,
                  animationDelay: `${bar.delay}s`,
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationFillMode: "both",
                  "--h": `${bar.maxH}px`,
                } as React.CSSProperties} />
              ))}
            </div>

            {/* Typewriter text */}
            <div style={{ textAlign: "center", width: "100%" }}>
              {doneLines.map((line, i) => (
                <p key={i} style={{
                  fontSize: i===0 ? 21 : 15, fontWeight: i===0 ? 600 : 400,
                  color: i===0 ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.36)",
                  margin: i===0 ? "0 0 16px" : "0 0 9px", lineHeight: 1.6,
                  animation: "ob-fade-up 0.35s ease-out both",
                }}>{line}</p>
              ))}
              {doneLines.length < AI_INTRO.length && (
                <p style={{
                  fontSize: doneLines.length===0 ? 21 : 15,
                  fontWeight: doneLines.length===0 ? 600 : 400,
                  color: doneLines.length===0 ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.52)",
                  margin: doneLines.length===0 ? "0 0 16px" : "0 0 9px", lineHeight: 1.6,
                }}>
                  {typingText}
                  <span style={{
                    display: "inline-block", width: 1.5, height: "1em",
                    background: "rgba(167,139,250,0.9)",
                    marginLeft: 3, verticalAlign: "text-bottom",
                    animation: "ob-blink 0.72s ease-in-out infinite",
                  }} />
                </p>
              )}
            </div>
          </div>
        )}

        {/* Phase 3 — Name (still pure black) */}
        {phase === 3 && (
          <div style={{ width:"min(420px,calc(100vw-48px))", animation:"ob-fade-up 0.55s ease-out both" }}>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ fontSize:40, marginBottom:12, animation:"ob-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>👋</div>
              <h2 style={{ color:"rgba(255,255,255,0.9)", fontSize:22, fontWeight:700, margin:"0 0 8px", letterSpacing:"-0.02em" }}>
                What's your name?
              </h2>
              <p style={{ color:"rgba(255,255,255,0.28)", fontSize:13, margin:0, lineHeight:1.6 }}>
                I'll use this to personalise your experience
              </p>
            </div>
            <NameInput value={name} onChange={setName} onEnter={() => { if(name.trim()) crossfade(4,0); }} accent="#a78bfa" />
            <div style={{ height:14 }} />
            <PrimaryBtn label="Continue →" disabled={!name.trim()} onClick={() => crossfade(4,0)} accent="#a78bfa" />
          </div>
        )}

        {/* Phase 4 — Nice to meet you (fluid bg just bloomed) */}
        {phase === 4 && (
          <div style={{ textAlign:"center", padding:"0 32px", animation:"ob-fade-up 0.6s ease-out both" }}>
            <div style={{ marginBottom:20, display:"flex", justifyContent:"center" }}>
              <SpinningStar size={30} color={theme.accentColor} />
            </div>
            <div style={{
              fontFamily: "'Dancing Script',cursive",
              fontSize: "clamp(36px,6.5vw,60px)", fontWeight: 600,
              letterSpacing: "0.02em", lineHeight: 1.25,
              background: `linear-gradient(115deg,#fff 0%,${theme.accentColor} 45%,#fff 100%)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "ob-shimmer 2.4s linear infinite, ob-fade-up 0.6s ease-out both",
            }}>
              Nice to meet you,<br />{name}!
            </div>
            <p style={{ color:"rgba(255,255,255,0.22)", fontSize:13, marginTop:18 }}>
              Let's tailor a few things for you…
            </p>
          </div>
        )}

        {/* Phase 5 — Role + Agent */}
        {phase === 5 && (
          <div style={{ width:"min(460px,calc(100vw-48px))", animation:"ob-fade-up 0.55s ease-out both" }}>
            <div style={{ textAlign:"center", marginBottom:26 }}>
              <div style={{ fontSize:36, marginBottom:10, animation:"ob-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>💼</div>
              <h2 style={{ color:"rgba(255,255,255,0.9)", fontSize:20, fontWeight:700, margin:"0 0 6px", letterSpacing:"-0.02em" }}>A little more about you</h2>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:13, margin:0 }}>Helps me tailor suggestions to your workflow</p>
            </div>

            <FieldLabel text="What best describes you?" />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:22 }}>
              {ROLES.map(r => {
                const active = role === r.id;
                return (
                  <button key={r.id} onClick={() => setRole(r.id)} style={{
                    padding:"12px 6px", borderRadius:13, border:"none", cursor:"pointer",
                    background: active ? `rgba(${hexRgb(theme.accentColor)},0.14)` : "rgba(255,255,255,0.05)",
                    outline: active ? `1.5px solid ${theme.accentColor}66` : "1px solid rgba(255,255,255,0.08)",
                    transition:"all 0.15s",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                  }}
                    onMouseEnter={e => { if(!active) e.currentTarget.style.background="rgba(255,255,255,0.09)"; }}
                    onMouseLeave={e => { if(!active) e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
                  >
                    <span style={{ fontSize:20 }}>{r.emoji}</span>
                    <span style={{ fontSize:11, fontWeight:500, color: active ? theme.accentColor : "rgba(255,255,255,0.44)" }}>{r.label}</span>
                  </button>
                );
              })}
            </div>

            <FieldLabel text="Default AI model" />
            <div style={{ display:"flex", gap:10, marginBottom:28 }}>
              {AGENT_OPTIONS.map(a => {
                const Ico = a.id === "gemini" ? SpinningStar : Bot;
                const active = agent === a.id;
                return (
                  <button key={a.id} onClick={() => setAgent(a.id)} style={{
                    flex:1, padding:"15px 10px", borderRadius:15, border:"none", cursor:"pointer",
                    background: active ? a.dim : "rgba(255,255,255,0.04)",
                    outline: active ? `1.5px solid ${a.border}` : "1px solid rgba(255,255,255,0.08)",
                    transition:"all 0.18s",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:8,
                  }}
                    onMouseEnter={e => { if(!active) e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}
                    onMouseLeave={e => { if(!active) e.currentTarget.style.background = active ? a.dim : "rgba(255,255,255,0.04)"; }}
                  >
                    <Ico size={21} style={{ color: active ? a.color : "rgba(255,255,255,0.3)" }} />
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:12, fontWeight:600, color: active ? a.color : "rgba(255,255,255,0.58)", marginBottom:2 }}>{a.label}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>{a.sub}</div>
                    </div>
                    <div style={{
                      width:17, height:17, borderRadius:"50%",
                      border:`2px solid ${active ? a.color : "rgba(255,255,255,0.15)"}`,
                      background: active ? a.color : "transparent",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all 0.18s",
                    }}>
                      {active && <Check size={8} style={{ color:"#000" }} />}
                    </div>
                  </button>
                );
              })}
            </div>
            <PrimaryBtn label="Next →" disabled={false} onClick={() => crossfade(6,0)} accent={theme.accentColor} />
          </div>
        )}

        {/* Phase 6 — Theme picker */}
        {phase === 6 && (
          <div style={{ width:"min(460px,calc(100vw-48px))", animation:"ob-fade-up 0.55s ease-out both" }}>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ fontSize:36, marginBottom:10, animation:"ob-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>🎨</div>
              <h2 style={{ color:"rgba(255,255,255,0.9)", fontSize:20, fontWeight:700, margin:"0 0 6px", letterSpacing:"-0.02em" }}>Choose your theme</h2>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:13, margin:0 }}>
                Click to preview — the background changes instantly
              </p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:28 }}>
              {THEMES.map(t => {
                const active = themeId === t.id;
                return (
                  <button key={t.id} onClick={() => setThemeId(t.id)} style={{
                    padding:"18px 10px 13px", borderRadius:18, border:"none", cursor:"pointer",
                    background: active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                    outline: active ? `1.5px solid ${t.accentColor}66` : "1px solid rgba(255,255,255,0.08)",
                    transition:"all 0.18s", position:"relative",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:9,
                  }}
                    onMouseEnter={e => { if(!active) e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}
                    onMouseLeave={e => { if(!active) e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
                  >
                    <div style={{
                      width:46, height:46, borderRadius:13,
                      background:`radial-gradient(circle at 38% 35%, ${t.blobColor}, ${t.bg} 68%)`,
                      border:`1px solid ${active ? t.accentColor+"44" : "rgba(255,255,255,0.08)"}`,
                      boxShadow: active ? `0 4px 18px ${t.blobColor}` : "none",
                      transition:"all 0.22s",
                    }} />
                    <span style={{ fontSize:12, fontWeight: active ? 600 : 400, color: active ? t.accentColor : "rgba(255,255,255,0.42)" }}>
                      {t.name}
                    </span>
                    {active && (
                      <div style={{
                        position:"absolute", top:8, right:8,
                        width:17, height:17, borderRadius:"50%",
                        background: t.accentColor,
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}>
                        <Check size={8} style={{ color:"#000" }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <PrimaryBtn label="Next →" disabled={false} onClick={() => crossfade(7,0)} accent={theme.accentColor} />
          </div>
        )}
        {/* Phase 7 — Passcode & Security */}
        {phase === 7 && (
          <div style={{ width: 320, animation:"ob-fade-up 0.5s ease-out both" }}>
            <FieldLabel text="Set Master Passcode" />
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginBottom:16 }}>
              This passcode will be required to view your API keys.
            </p>
            <div style={{ marginBottom: 20 }}>
              <FieldInput value={passcode} onChange={setPasscode} onEnter={() => {}} accent={theme.accentColor} />
            </div>
            
            <FieldLabel text="Recovery Question" />
            <select 
              value={securityQuestion}
              onChange={(e) => setSecurityQuestion(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px", marginBottom: 12, outline: "none" }}
            >
              {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
            <div style={{ marginBottom: 26 }}>
              <FieldInput value={securityAnswer} onChange={setSecurityAnswer} onEnter={finish} accent={theme.accentColor} />
            </div>

            <PrimaryBtn label="Secure & Finish" disabled={!passcode.trim() || !securityAnswer.trim()} onClick={finish} accent={theme.accentColor} />
          </div>
        )}

      </div>

      {/* Exit flash */}
      {exiting && (
        <div aria-hidden style={{
          position:"absolute", inset:0, zIndex:99, pointerEvents:"none",
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

        /* Sound wave bars */
        @keyframes wave-speak {
          0%,100% { height: 3px; }
          50%     { height: var(--h); }
        }
        @keyframes wave-idle {
          0%,100% { height: 2px; }
          50%     { height: 6px; }
        }

        /* Edge lighting synced with wave */
        @keyframes wave-edge-speak {
          0%,100% {
            border-color: rgba(167,139,250,0.45);
            box-shadow: 0 0 0 1px rgba(167,139,250,0.3),
                        0 0 18px 5px rgba(167,139,250,0.22),
                        0 0 40px 14px rgba(167,139,250,0.08);
          }
          50% {
            border-color: rgba(167,139,250,0.85);
            box-shadow: 0 0 0 1px rgba(167,139,250,0.7),
                        0 0 28px 10px rgba(167,139,250,0.4),
                        0 0 60px 24px rgba(167,139,250,0.16);
          }
        }
        @keyframes wave-edge-idle {
          0%,100% {
            border-color: rgba(255,255,255,0.07);
            box-shadow: 0 0 0 1px rgba(167,139,250,0.1),
                        0 0 10px 2px rgba(167,139,250,0.05);
          }
          50% {
            border-color: rgba(255,255,255,0.1);
            box-shadow: 0 0 0 1px rgba(167,139,250,0.18),
                        0 0 16px 4px rgba(167,139,250,0.09);
          }
        }

        /* Fluid blobs */
        @keyframes ob-b1 {
          0%,100%{transform:translate(0,0)scale(1)} 33%{transform:translate(7%,-7%)scale(1.07)} 66%{transform:translate(-4%,5%)scale(0.94)}
        }
        @keyframes ob-b2 {
          0%,100%{transform:translate(0,0)scale(1)} 40%{transform:translate(-8%,5%)scale(1.09)} 80%{transform:translate(5%,-6%)scale(0.96)}
        }
        @keyframes ob-b3 {
          0%,100%{transform:translate(0,0)scale(1)} 35%{transform:translate(6%,8%)scale(1.11)} 70%{transform:translate(-5%,-4%)scale(0.92)}
        }

        @keyframes ob-exit {
          0%{opacity:0} 40%{opacity:0.7} 100%{opacity:0}
        }
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
          color:"rgba(255,255,255,0.88)", fontSize:17, padding:"14px 10px",
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
