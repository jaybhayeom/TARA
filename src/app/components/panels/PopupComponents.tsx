import React from "react";
import { X } from "lucide-react";

export function PopupHeader({ title, onClose }: { title: string; onClose: () => void }) {
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

export function PopupRow({ icon, primary, secondary }: { icon: React.ReactNode; primary: string; secondary: string }) {
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
