"use client";

export type RadarDataPoint = {
  label: string;
  score: number; // 1–10
};

type Props = {
  data: RadarDataPoint[];
  size?: number;
  maxScore?: number;
};

export default function RadarChart({ data, size = 260, maxScore = 10 }: Props) {
  const n = data.length;
  if (n < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const labelRadius = size * 0.48;
  const levels = 5;

  // Angle for axis i: start at top (−90°)
  function angleFor(i: number) {
    return (2 * Math.PI * i) / n - Math.PI / 2;
  }

  function polarToXY(r: number, angle: number) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  // Build grid polygon points for a given level fraction
  function gridPoints(fraction: number) {
    return Array.from({ length: n }, (_, i) => {
      const { x, y } = polarToXY(radius * fraction, angleFor(i));
      return `${x},${y}`;
    }).join(" ");
  }

  // Build data polygon points
  const dataPoints = data
    .map((d, i) => {
      const fraction = d.score / maxScore;
      const { x, y } = polarToXY(radius * fraction, angleFor(i));
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Radar chart"
    >
      {/* Grid levels */}
      {Array.from({ length: levels }, (_, lvl) => {
        const fraction = (lvl + 1) / levels;
        return (
          <polygon
            key={lvl}
            points={gridPoints(fraction)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        );
      })}

      {/* Axis lines */}
      {Array.from({ length: n }, (_, i) => {
        const { x, y } = polarToXY(radius, angleFor(i));
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={dataPoints}
        fill="rgba(79, 70, 229, 0.18)"
        stroke="#4f46e5"
        strokeWidth={2}
      />

      {/* Data dots */}
      {data.map((d, i) => {
        const fraction = d.score / maxScore;
        const { x, y } = polarToXY(radius * fraction, angleFor(i));
        return (
          <circle key={i} cx={x} cy={y} r={4} fill="#4f46e5" />
        );
      })}

      {/* Labels */}
      {data.map((d, i) => {
        const angle = angleFor(i);
        const { x, y } = polarToXY(labelRadius, angle);
        // Anchor text based on horizontal position
        const anchor =
          Math.abs(Math.cos(angle)) < 0.1
            ? "middle"
            : Math.cos(angle) > 0
            ? "start"
            : "end";
        const dominantBaseline =
          Math.abs(Math.sin(angle)) < 0.1
            ? "middle"
            : Math.sin(angle) > 0
            ? "hanging"
            : "auto";

        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline={dominantBaseline}
            fontSize={10}
            fill="#6b7280"
            fontFamily="inherit"
          >
            {d.label}
            <tspan
              x={x}
              dy="1.1em"
              textAnchor={anchor}
              fontSize={11}
              fontWeight="600"
              fill="#111827"
            >
              {d.score}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
