"use client";

/**
 * Semicircle gauge like "Actuals vs Target": red/amber/green bands, scale labels along the arc, needle, value below.
 * 0 at left, maxScore at right. Bands from JSON (red < redEnd, amber redEnd–amberEnd, green > amberEnd).
 */

interface ScoreGaugeProps {
  score: number;
  maxScore: number;
  redEnd: number;
  amberEnd: number;
  size?: number;
  /** Label above the gauge (e.g. "Your score") */
  title?: string;
  /** Smaller text under title (e.g. "Closed for the current month") */
  subtitle?: string;
  /** Show scale labels along the arc (0, 20, 40, … maxScore). Default true. */
  showScaleLabels?: boolean;
}

function polarToCart(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

/** Nice step for scale ticks (e.g. 20 for max 120). */
function tickStep(max: number): number {
  if (max <= 10) return 2;
  if (max <= 25) return 5;
  if (max <= 50) return 10;
  if (max <= 100) return 20;
  return 20;
}

export function ScoreGauge({
  score,
  maxScore,
  redEnd,
  amberEnd,
  size = 220,
  title,
  subtitle,
  showScaleLabels = true,
}: ScoreGaugeProps) {
  const cx = size / 2;
  const cy = size * 0.52;
  const r = size * 0.36;
  const needleLen = size * 0.32;
  const labelR = r + size * 0.08;

  const deg = (v: number) => 180 - (v / maxScore) * 180;

  const d180 = polarToCart(cx, cy, r, 180);
  const dRed = polarToCart(cx, cy, r, deg(redEnd));
  const dAmber = polarToCart(cx, cy, r, deg(amberEnd));
  const d0 = polarToCart(cx, cy, r, 0);

  const needleAngle = 180 - (score / maxScore) * 180;

  const step = tickStep(maxScore);
  const ticks: number[] = [];
  for (let v = 0; v <= maxScore; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] !== maxScore) ticks.push(maxScore);

  return (
    <div className="w-full max-w-[300px] mx-auto">
      {title && (
        <p className="text-slate-800 font-semibold text-center text-sm mb-0.5">{title}</p>
      )}
      {subtitle && (
        <p className="text-slate-500 text-xs text-center mb-2">{subtitle}</p>
      )}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full block"
        aria-hidden
      >
        {/* Colored arc bands */}
        <path
          d={`M ${d180.x} ${d180.y} A ${r} ${r} 0 0 0 ${dRed.x} ${dRed.y}`}
          fill="none"
          stroke="#dc2626"
          strokeWidth={size * 0.07}
          strokeLinecap="round"
        />
        <path
          d={`M ${dRed.x} ${dRed.y} A ${r} ${r} 0 0 0 ${dAmber.x} ${dAmber.y}`}
          fill="none"
          stroke="#d97706"
          strokeWidth={size * 0.07}
          strokeLinecap="round"
        />
        <path
          d={`M ${dAmber.x} ${dAmber.y} A ${r} ${r} 0 0 0 ${d0.x} ${d0.y}`}
          fill="none"
          stroke="#16a34a"
          strokeWidth={size * 0.07}
          strokeLinecap="round"
        />

        {/* Scale ticks and labels */}
        {showScaleLabels &&
          ticks.map((val) => {
            const d = deg(val);
            const inner = polarToCart(cx, cy, r, d);
            const outer = polarToCart(cx, cy, labelR, d);
            const isLeft = d > 90;
            return (
              <g key={val}>
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#94a3b8"
                  strokeWidth={1}
                />
                <text
                  x={outer.x}
                  y={outer.y + 4}
                  textAnchor={isLeft ? "end" : "start"}
                  className="fill-slate-500 text-[10px] font-medium"
                  style={{ fontSize: "10px" }}
                >
                  {val}
                </text>
              </g>
            );
          })}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={cx - needleLen}
          y2={cy}
          stroke="#1e293b"
          strokeWidth={size * 0.018}
          strokeLinecap="round"
          transform={`rotate(${needleAngle} ${cx} ${cy})`}
        />
        <circle cx={cx} cy={cy} r={size * 0.025} fill="#1e293b" />

        {/* Value below needle pivot (like "43.99K" in reference) */}
        <text
          x={cx}
          y={cy + size * 0.18}
          textAnchor="middle"
          className="fill-slate-900 font-bold tabular-nums"
          style={{ fontSize: size * 0.12 }}
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + size * 0.24}
          textAnchor="middle"
          className="fill-slate-500"
          style={{ fontSize: size * 0.06 }}
        >
          / {maxScore}
        </text>
      </svg>
    </div>
  );
}
