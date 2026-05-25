interface SpinningStarProps {
  size?: number;
  style?: React.CSSProperties;
  color?: string;
}

export function SpinningStar({ size = 14, style, color }: SpinningStarProps) {
  const fill = style?.color ?? color ?? "#a78bfa";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      style={{ animation: "spin-slow 8s linear infinite", flexShrink: 0, display: "block" }}
    >
      <path d="M12 2 L13.6 9.4 L21 12 L13.6 14.6 L12 22 L10.4 14.6 L3 12 L10.4 9.4 Z" />
    </svg>
  );
}
