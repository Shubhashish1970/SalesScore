"use client";

/**
 * Semicircle gauge: 0 at left, maxScore at right. Bands from JSON (red &lt; redEnd, amber redEnd–amberEnd, green &gt; amberEnd). Needle at finalScore.
 */

interface ScoreGaugeProps {
  score: number;
  maxScore: number;
  redEnd: number;
  amberEnd: number;
  size?: number;
}

function polarToCart(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

export function ScoreGauge({ score, maxScore, redEnd, amberEnd, size = 200 }: ScoreGaugeProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const needleLen = size * 0.34;

  const deg = (v: number) => 180 - (v / maxScore) * 180;

  const d180 = polarToCart(cx, cy, r, 180);
  const d120 = polarToCart(cx, cy, r, deg(redEnd));
  const d112 = polarToCart(cx, cy, r, deg(amberEnd));
  const d0 = polarToCart(cx, cy, r, 0);

  const needleAngle = 180 - (score / maxScore) * 180;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-[280px] mx-auto block"
      aria-hidden
    >
      {/* Red band: 0 to redEnd */}
      <path
        d={`M ${d180.x} ${d180.y} A ${r} ${r} 0 0 0 ${d120.x} ${d120.y}`}
        fill="none"
        stroke="#dc2626"
        strokeWidth={size * 0.08}
        strokeLinecap="round"
      />
      {/* Amber band: redEnd to amberEnd */}
      <path
        d={`M ${d120.x} ${d120.y} A ${r} ${r} 0 0 0 ${d112.x} ${d112.y}`}
        fill="none"
        stroke="#d97706"
        strokeWidth={size * 0.08}
        strokeLinecap="round"
      />
      {/* Green band: amberEnd to maxScore */}
      <path
        d={`M ${d112.x} ${d112.y} A ${r} ${r} 0 0 0 ${d0.x} ${d0.y}`}
        fill="none"
        stroke="#16a34a"
        strokeWidth={size * 0.08}
        strokeLinecap="round"
      />
      {/* Needle: from center to edge, rotated to score */}
      <line
        x1={cx}
        y1={cy}
        x2={cx - needleLen}
        y2={cy}
        stroke="#1e293b"
        strokeWidth={size * 0.02}
        strokeLinecap="round"
        transform={`rotate(${needleAngle} ${cx} ${cy})`}
      />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={size * 0.03} fill="#1e293b" />
    </svg>
  );
}
