import React from 'react';

export function RingMark({ size = 30 }) {
  const s = size;
  const rings = [0.95, 0.75, 0.55, 0.35, 0.15];
  const colors = ['#EDE3CC', '#C1621F', '#EDE3CC', '#C1621F', '#F8F3E7'];

  return (
    <span className="ring-mark">
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        {rings.map((r, i) => (
          <circle
            key={i}
            cx={s / 2}
            cy={s / 2}
            r={(s / 2) * r - 1}
            fill="none"
            stroke={colors[i % colors.length]}
            strokeWidth={s * 0.035}
          />
        ))}
        <circle cx={s / 2} cy={s / 2} r={s * 0.06} fill="#C1621F" />
      </svg>
    </span>
  );
}
