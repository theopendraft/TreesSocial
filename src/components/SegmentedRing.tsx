import React from "react";

type SegmentedRingProps = {
  segments: number;
  color?: string; // stroke color
  size?: number; // px
  strokeWidth?: number; // px
  gapRatio?: number; // 0..1 portion of each segment reserved for gap
  className?: string;
};

// Renders an SVG circle with repeated dash pattern to simulate broken/segmented rings.
export const SegmentedRing: React.FC<SegmentedRingProps> = ({
  segments,
  color = "#ef4444", // tailwind red-500
  size = 64,
  strokeWidth = 3,
  gapRatio = 0.3,
  className = "",
}) => {
  const r = size / 2 - strokeWidth; // inner radius to keep stroke within bounds
  const circumference = 2 * Math.PI * r;
  const perSegment = circumference / Math.max(segments, 1);

  // If 1 segment, render a full continuous ring
  if (segments <= 1) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={className}
        style={{ pointerEvents: "none" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

  // For 2+ segments, create equal arc segments with small gaps
  const gap = Math.max(2, perSegment * Math.max(0, Math.min(1, gapRatio)));
  const dash = Math.max(0, perSegment - gap);
  const dashArray = `${dash} ${gap}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ pointerEvents: "none" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default SegmentedRing;
