import { ChevronRight, Users } from "lucide-react";
import { SETTINGS_ITEMS } from "../../constants";
import { PopupHeader, PopupRow } from "./PopupComponents";

interface SettingsPanelProps {
  showSettings: boolean;
  showAgents: boolean;
  setShowSettings: (val: boolean) => void;
  setShowAgents: (val: boolean) => void;
  closeAll: () => void;
}

export function SettingsPanel({ showSettings, showAgents, setShowSettings, setShowAgents, closeAll }: SettingsPanelProps) {
  if (!showSettings || showAgents) return null;

  return (
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
          <div style={{ color: "#c4b5fd", fontSize: 12, fontWeight: 600 }}>Profiles</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>Manage chat profiles</div>
        </div>
        <ChevronRight size={12} style={{ color: "rgba(167,139,250,0.5)" }} />
      </button>

      <div style={{ padding: "4px 0" }}>
        {SETTINGS_ITEMS.map(({ Icon, label, desc }) => (
          <PopupRow key={label} icon={<Icon size={12} />} primary={label} secondary={desc} />
        ))}
      </div>
      <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 10 }}>AI Assistant v1.0.0</span>
        <button 
          onClick={() => {
            if (window.confirm("Are you sure you want to completely wipe all app data and restart?")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: 10, cursor: "pointer", opacity: 0.8 }}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.8"}
        >
          Reset App
        </button>
      </div>
    </div>
  );
}
