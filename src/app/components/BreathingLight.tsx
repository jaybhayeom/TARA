interface BreathingLightProps {
  agent: string;
}

export function BreathingLight({ agent }: BreathingLightProps) {
  let hue = "139,92,246";
  if (agent === "gemma") hue = "16,185,129";
  else if (agent === "collector") hue = "245,158,11";
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(${hue},0.11) 0%, rgba(${hue},0.05) 40%, transparent 68%)`,
        animation: "breathe 5s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute",
        width: 380,
        height: 380,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(${hue},0.14) 0%, rgba(${hue},0.04) 55%, transparent 72%)`,
        animation: "breathe-mid 5s ease-in-out 0.5s infinite",
      }} />
    </div>
  );
}
