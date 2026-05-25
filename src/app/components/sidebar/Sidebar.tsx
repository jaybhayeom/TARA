import React from "react";
import { History, LayoutGrid, Settings, SquarePen, User } from "lucide-react";
import { AGENTS } from "../../constants";
import { Agent } from "../../types";

export function RailIcon({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} style={{ width: 32, height: 32, borderRadius: 8, background: active ? "rgba(255,255,255,0.09)" : "transparent", border: "none", color: active ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s,color 0.15s" }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.28)"; } }}
    >{icon}</button>
  );
}

interface SidebarProps {
  agent: Agent;
  showHistory: boolean;
  showApps: boolean;
  showSettings: boolean;
  showAgents: boolean;
  showProfile: boolean;
  closeAll: () => void;
  setShowHistory: (val: boolean) => void;
  setShowApps: (val: boolean) => void;
  setShowSettings: (val: boolean) => void;
  setShowProfile: (val: boolean) => void;
  newChat: () => void;
}

export function Sidebar({
  agent, showHistory, showApps, showSettings, showAgents, showProfile,
  closeAll, setShowHistory, setShowApps, setShowSettings, setShowProfile, newChat
}: SidebarProps) {
  const cfg = AGENTS[agent];
  
  return (
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
  );
}
