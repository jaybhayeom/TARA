import { useMemo } from "react";

interface Props { themeId: string; }

export function ThemeBackground({ themeId }: Props) {
  return (
    <div aria-hidden style={{
      position: "absolute", inset: 0,
      pointerEvents: "none", overflow: "hidden", zIndex: 0,
    }}>
      {themeId === "midnight" && <Midnight />}
      {themeId === "amoled"   && <Amoled />}
      {themeId === "aurora"   && <Aurora />}
      {themeId === "forest"   && <Forest />}
      {themeId === "ember"    && <Ember />}
      {themeId === "rose"     && <Rose />}
      <Css />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   🌙  MIDNIGHT — deep-space star field + nebula clouds
═══════════════════════════════════════════════════ */
function Midnight() {
  const stars = useMemo(() =>
    Array.from({ length: 65 }, (_, i) => ({
      id: i,
      x:  (i * 137.508) % 100,
      y:  (i * 93.733)  % 100,
      sz: 0.5 + (i % 5) * 0.22,
      dur:   2.2 + (i % 9)  * 0.48,
      delay: (i % 13) * 0.27,
    }))
  , []);

  return (
    <>
      {stars.map(s => (
        <div key={s.id} style={{
          position: "absolute",
          left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.sz}px`, height: `${s.sz}px`,
          borderRadius: "50%", background: "#fff",
          willChange: "opacity",
          animation: `mn-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}
      {/* Purple nebula — top-left */}
      <div style={{
        position: "absolute", width: "70%", height: "70%",
        top: "-22%", left: "-18%",
        background: "radial-gradient(circle, rgba(139,92,246,0.26) 0%, transparent 70%)",
        filter: "blur(100px)",
        animation: "mn-drift1 26s ease-in-out infinite",
      }} />
      {/* Blue-violet cloud — bottom-right */}
      <div style={{
        position: "absolute", width: "55%", height: "55%",
        bottom: "-20%", right: "-14%",
        background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
        filter: "blur(90px)",
        animation: "mn-drift2 32s ease-in-out infinite",
      }} />
      {/* Faint shooting star streak */}
      <div style={{
        position: "absolute", top: "18%", left: "-5%",
        width: 220, height: 1,
        background: "linear-gradient(to right, transparent, rgba(255,255,255,0.35), transparent)",
        transform: "rotate(-20deg)",
        animation: "mn-shoot 14s linear 3s infinite",
      }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(13,13,21,0.38)" }} />
    </>
  );
}

/* ═══════════════════════════════════════════════════
   ⬛  AMOLED — pure black with sonar pulse rings
═══════════════════════════════════════════════════ */
function Amoled() {
  return (
    <>
      {/* Sonar rings — 3 staggered, 12 s cycle */}
      {[0, 4, 8].map(d => (
        <div key={d} style={{
          position: "absolute",
          width: "180vmax", height: "180vmax",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          border: "1px solid rgba(167,139,250,0.14)",
          willChange: "transform, opacity",
          animation: `amoled-ring 12s ease-out ${d}s infinite`,
        }} />
      ))}
      {/* Micro center glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 6, height: 6, borderRadius: "50%",
        transform: "translate(-50%,-50%)",
        background: "rgba(167,139,250,0.5)",
        boxShadow: "0 0 18px 6px rgba(167,139,250,0.18)",
        animation: "amoled-pulse 3.5s ease-in-out infinite",
      }} />
      {/* Ultra-dim scan line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 4px)",
        pointerEvents: "none",
      }} />
    </>
  );
}

/* ═══════════════════════════════════════════════════
   🌌  AURORA — northern-lights horizontal curtains
═══════════════════════════════════════════════════ */
function Aurora() {
  const bands = [
    { color: "rgba(0,255,130,0.15)",   top: "6%",   h: "20%", dur: 9,  delay: 0, anim: 0 },
    { color: "rgba(0,190,255,0.13)",   top: "16%",  h: "22%", dur: 13, delay: 2, anim: 1 },
    { color: "rgba(110,50,255,0.14)",  top: "2%",   h: "18%", dur: 11, delay: 4, anim: 2 },
    { color: "rgba(0,240,180,0.10)",   top: "26%",  h: "16%", dur: 15, delay: 1, anim: 1 },
    { color: "rgba(40,120,255,0.11)",  top: "-4%",  h: "26%", dur: 17, delay: 3, anim: 0 },
    { color: "rgba(160,50,255,0.09)",  top: "32%",  h: "14%", dur: 19, delay: 5, anim: 2 },
  ];

  const stars = useMemo(() =>
    Array.from({ length: 45 }, (_, i) => ({
      id: i, x: (i*137.5)%100, y: (i*93.7)%100,
      sz: 0.5+(i%3)*0.3, dur:2+(i%7)*0.4, delay:(i%11)*0.25,
    }))
  , []);

  return (
    <>
      {/* Deep space base */}
      <div style={{ position:"absolute", inset:0, background:"rgba(4,6,20,0.65)" }} />
      {/* Stars behind aurora */}
      {stars.map(s => (
        <div key={s.id} style={{
          position:"absolute", left:`${s.x}%`, top:`${s.y}%`,
          width:`${s.sz}px`, height:`${s.sz}px`,
          borderRadius:"50%", background:"#fff", opacity:0.35,
          animation:`mn-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}
      {/* Aurora bands */}
      {bands.map((b,i) => (
        <div key={i} style={{
          position:"absolute", left:"-5%", right:"-5%",
          top: b.top, height: b.h,
          background:`linear-gradient(to bottom,transparent,${b.color},transparent)`,
          filter:"blur(22px)",
          willChange:"transform",
          animation:`aurora-w${b.anim} ${b.dur}s ease-in-out ${b.delay}s infinite`,
        }} />
      ))}
      {/* Edge vignette */}
      <div style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(4,6,20,0.7) 100%)",
      }} />
    </>
  );
}

/* ═══════════════════════════════════════════════════
   🌿  FOREST — bioluminescent fireflies + green mist
═══════════════════════════════════════════════════ */
function Forest() {
  const flies = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id:i, x:(i*137.5)%100, y:15+(i*73.1)%72,
      sz: 1.5+(i%4)*0.5, dur:3+(i%9)*0.55, delay:(i%16)*0.32,
      bright: i%3===0,
    }))
  , []);

  return (
    <>
      <div style={{ position:"absolute", inset:0, background:"rgba(3,11,4,0.55)" }} />
      {/* Main canopy glow — top */}
      <div style={{
        position:"absolute", width:"80%", height:"50%",
        top:"-25%", left:"10%",
        background:"radial-gradient(ellipse, rgba(16,185,129,0.2) 0%, transparent 70%)",
        filter:"blur(90px)",
        animation:"mn-drift1 24s ease-in-out infinite",
      }} />
      {/* Teal side light */}
      <div style={{
        position:"absolute", width:"40%", height:"40%",
        bottom:"-10%", right:"-5%",
        background:"radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)",
        filter:"blur(80px)",
        animation:"mn-drift2 30s ease-in-out infinite",
      }} />
      {/* Ground mist */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:"28%",
        background:"radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.15) 0%, transparent 60%)",
        filter:"blur(36px)",
        animation:"forest-mist 6s ease-in-out infinite",
      }} />
      {/* Fireflies */}
      {flies.map(f => (
        <div key={f.id} style={{
          position:"absolute",
          left:`${f.x}%`, top:`${f.y}%`,
          width:`${f.sz}px`, height:`${f.sz}px`,
          borderRadius:"50%",
          background: f.bright ? "#d9f99d" : "#86efac",
          boxShadow:`0 0 ${f.sz*4}px ${f.sz*1.5}px ${f.bright?"rgba(163,230,53,0.7)":"rgba(134,239,172,0.5)"}`,
          willChange:"opacity",
          animation:`forest-fly ${f.dur}s ease-in-out ${f.delay}s infinite`,
        }} />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   🔥  EMBER — rising sparks + heat shimmer
═══════════════════════════════════════════════════ */
function Ember() {
  const embers = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id:i, x:(i*137.5)%100,
      startY: 60+(i*11.3)%38,
      sz: 1.2+(i%5)*0.6,
      dur: 2.5+(i%9)*0.65,
      delay: (i%22)*0.28,
      hue: i%3===0 ? "#fbbf24" : i%3===1 ? "#f97316" : "#ef4444",
    }))
  , []);

  return (
    <>
      <div style={{ position:"absolute", inset:0, background:"rgba(14,7,3,0.52)" }} />
      {/* Lava-floor heat glow */}
      <div style={{
        position:"absolute", bottom:"-5%", left:"-10%", right:"-10%", height:"55%",
        background:"radial-gradient(ellipse at 50% 100%, rgba(251,146,60,0.32) 0%, rgba(239,68,68,0.14) 45%, transparent 72%)",
        filter:"blur(48px)",
        animation:"ember-heat 4s ease-in-out infinite",
      }} />
      {/* Mid orange cloud */}
      <div style={{
        position:"absolute", width:"50%", height:"40%",
        top:"30%", left:"25%",
        background:"radial-gradient(circle, rgba(251,146,60,0.1) 0%, transparent 70%)",
        filter:"blur(70px)",
        animation:"mn-drift1 18s ease-in-out infinite",
      }} />
      {/* Top vignette */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:"35%",
        background:"radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.09) 0%, transparent 70%)",
        filter:"blur(40px)",
      }} />
      {/* Ember sparks */}
      {embers.map(e => (
        <div key={e.id} style={{
          position:"absolute",
          left:`${e.x}%`, top:`${e.startY}%`,
          width:`${e.sz}px`, height:`${e.sz * 1.6}px`,
          borderRadius:"50%",
          background: e.hue,
          boxShadow:`0 0 ${e.sz*3}px ${e.sz}px ${e.hue}aa`,
          willChange:"transform, opacity",
          animation:`ember-rise ${e.dur}s ease-in ${e.delay}s infinite`,
        }} />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   🌸  ROSE — soft petals + bloom + dreamy mist
═══════════════════════════════════════════════════ */
function Rose() {
  const petals = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id:i, x:(i*137.5)%100, y:(i*73.1)%100,
      w:50+(i%5)*28, h:24+(i%4)*16,
      dur:9+(i%6)*2.2, delay:i*1.1,
    }))
  , []);

  return (
    <>
      <div style={{ position:"absolute", inset:0, background:"rgba(15,5,12,0.5)" }} />
      {/* Main pink nebula */}
      <div style={{
        position:"absolute", width:"65%", height:"65%",
        top:"-20%", left:"-15%",
        background:"radial-gradient(circle, rgba(236,72,153,0.28) 0%, transparent 70%)",
        filter:"blur(100px)",
        animation:"mn-drift1 22s ease-in-out infinite",
      }} />
      {/* Warm rose — bottom right */}
      <div style={{
        position:"absolute", width:"52%", height:"52%",
        bottom:"-16%", right:"-10%",
        background:"radial-gradient(circle, rgba(244,114,182,0.22) 0%, transparent 70%)",
        filter:"blur(88px)",
        animation:"mn-drift2 28s ease-in-out infinite",
      }} />
      {/* Soft center bloom */}
      <div style={{
        position:"absolute", top:"50%", left:"50%",
        width:"55%", height:"55%",
        transform:"translate(-50%,-50%)",
        background:"radial-gradient(circle, rgba(255,200,220,0.07) 0%, transparent 70%)",
        filter:"blur(60px)",
        animation:"rose-bloom 5s ease-in-out infinite",
      }} />
      {/* Floating petal wisps */}
      {petals.map(p => (
        <div key={p.id} style={{
          position:"absolute",
          left:`${p.x}%`, top:`${p.y}%`,
          width:`${p.w}px`, height:`${p.h}px`,
          borderRadius:"50%",
          background:"radial-gradient(ellipse, rgba(236,72,153,0.14) 0%, transparent 70%)",
          filter:"blur(16px)",
          animation:`petal-drift ${p.dur}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   CSS keyframes (injected once)
═══════════════════════════════════════════════════ */
function Css() {
  return (
    <style>{`
      /* Shared */
      @keyframes mn-twinkle {
        0%,100%{ opacity:0.07; }
        50%    { opacity:0.55; }
      }
      @keyframes mn-drift1 {
        0%,100%{ transform:translate(0,0)scale(1); }
        33%    { transform:translate(6%,-8%)scale(1.08); }
        66%    { transform:translate(-4%,5%)scale(0.93); }
      }
      @keyframes mn-drift2 {
        0%,100%{ transform:translate(0,0)scale(1); }
        40%    { transform:translate(-7%,5%)scale(1.1); }
        80%    { transform:translate(5%,-6%)scale(0.95); }
      }

      /* Midnight */
      @keyframes mn-shoot {
        0%,90%,100%{ transform:rotate(-20deg)translateX(-120px); opacity:0; }
        91%         { opacity:0.6; }
        94%         { opacity:0; transform:rotate(-20deg)translateX(900px); }
      }

      /* AMOLED */
      @keyframes amoled-ring {
        0%  { transform:translate(-50%,-50%)scale(0.005); opacity:0.5; }
        85% { opacity:0.04; }
        100%{ transform:translate(-50%,-50%)scale(1); opacity:0; }
      }
      @keyframes amoled-pulse {
        0%,100%{ opacity:0.3; transform:translate(-50%,-50%)scale(1); }
        50%    { opacity:0.85; transform:translate(-50%,-50%)scale(1.6); }
      }

      /* Aurora */
      @keyframes aurora-w0 {
        0%,100%{ transform:translateY(0)scaleX(1); opacity:0.85; }
        50%    { transform:translateY(-3%)scaleX(1.05); opacity:1; }
      }
      @keyframes aurora-w1 {
        0%,100%{ transform:translateY(0)scaleX(1); opacity:0.7; }
        50%    { transform:translateY(4%)scaleX(0.97); opacity:1; }
      }
      @keyframes aurora-w2 {
        0%,100%{ transform:translateY(0)scaleX(1); opacity:0.8; }
        33%    { transform:translateY(-5%)scaleX(1.06); opacity:0.55; }
        66%    { transform:translateY(3%)scaleX(0.95); opacity:1; }
      }

      /* Forest */
      @keyframes forest-fly {
        0%,100%{ opacity:0; transform:scale(0.4); }
        35%    { opacity:0.95; transform:scale(1); }
        65%    { opacity:0.6; transform:scale(0.75); }
      }
      @keyframes forest-mist {
        0%,100%{ opacity:0.7; transform:scaleX(1); }
        50%    { opacity:1; transform:scaleX(1.04); }
      }

      /* Ember */
      @keyframes ember-rise {
        0%  { transform:translateY(0px); opacity:0.95; }
        70% { opacity:0.4; }
        100%{ transform:translateY(-65vh); opacity:0; }
      }
      @keyframes ember-heat {
        0%,100%{ opacity:0.85; transform:scaleX(1); }
        50%    { opacity:1; transform:scaleX(1.06); }
      }

      /* Rose */
      @keyframes rose-bloom {
        0%,100%{ transform:translate(-50%,-50%)scale(1); opacity:0.7; }
        50%    { transform:translate(-50%,-50%)scale(1.18); opacity:1; }
      }
      @keyframes petal-drift {
        0%,100%{ transform:translate(0,0); opacity:0.25; }
        33%    { transform:translate(14px,-16px); opacity:0.55; }
        66%    { transform:translate(-10px,10px); opacity:0.15; }
      }
    `}</style>
  );
}
