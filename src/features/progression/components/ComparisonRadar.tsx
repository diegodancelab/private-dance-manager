"use client";

export type RadarDataPoint = {
  label: string;
  score: number;
};

type Props = {
  current: RadarDataPoint[];
  reference?: RadarDataPoint[];
  size?: number;
};

export default function ComparisonRadar({ current, reference, size = 280 }: Props) {
  const n = current.length;
  if (n < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const labelRadius = size * 0.48;
  const levels = 5;
  const maxScore = 10;

  function angleFor(i: number) {
    return (2 * Math.PI * i) / n - Math.PI / 2;
  }

  function polarToXY(r: number, angle: number) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function gridPoints(fraction: number) {
    return Array.from({ length: n }, (_, i) => {
      const { x, y } = polarToXY(radius * fraction, angleFor(i));
      return `${x},${y}`;
    }).join(" ");
  }

  function buildPolygon(data: RadarDataPoint[]) {
    return data
      .map((d, i) => {
        const { x, y } = polarToXY(radius * (d.score / maxScore), angleFor(i));
        return `${x},${y}`;
      })
      .join(" ");
  }

  const referencePoints = reference ? buildPolygon(reference) : null;
  const currentPoints = buildPolygon(current);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Radar de progression">
      {/* Grid */}
      {Array.from({ length: levels }, (_, lvl) => (
        <polygon
          key={lvl}
          points={gridPoints((lvl + 1) / levels)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}

      {/* Axis lines */}
      {Array.from({ length: n }, (_, i) => {
        const { x, y } = polarToXY(radius, angleFor(i));
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" strokeWidth={1} />;
      })}

      {/* Reference polygon (gray, rendered first = behind) */}
      {referencePoints && (
        <polygon
          points={referencePoints}
          fill="rgba(156, 163, 175, 0.20)"
          stroke="#9ca3af"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
      )}

      {/* Current polygon (indigo) */}
      <polygon
        points={currentPoints}
        fill="rgba(79, 70, 229, 0.18)"
        stroke="#4f46e5"
        strokeWidth={2}
      />

      {/* Current dots */}
      {current.map((d, i) => {
        const { x, y } = polarToXY(radius * (d.score / maxScore), angleFor(i));
        return <circle key={i} cx={x} cy={y} r={4} fill="#4f46e5" />;
      })}

      {/* Labels */}
      {current.map((d, i) => {
        const angle = angleFor(i);
        const { x, y } = polarToXY(labelRadius, angle);
        const anchor =
          Math.abs(Math.cos(angle)) < 0.1 ? "middle" : Math.cos(angle) > 0 ? "start" : "end";
        const dominantBaseline =
          Math.abs(Math.sin(angle)) < 0.1 ? "middle" : Math.sin(angle) > 0 ? "hanging" : "auto";

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
            <tspan x={x} dy="1.1em" textAnchor={anchor} fontSize={11} fontWeight="600" fill="#111827">
              {d.score}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
