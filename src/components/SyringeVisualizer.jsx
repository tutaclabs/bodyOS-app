import React from 'react';

export function SyringeVisualizer({ drawUnits = 0, maxUnits = 100 }) {
  const height = 300;
  const width = 80;
  const safeUnits = Number.isFinite(drawUnits) ? drawUnits : 0;
  const safeMax = maxUnits > 0 ? maxUnits : 100;
  const fillPercentage = Math.min(safeUnits / safeMax, 1);
  const fillHeight = (height - 40) * fillPercentage;

  return (
    <div style={{ alignItems: 'center', margin: '20px 0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#00CFBD', fontWeight: 'bold', marginBottom: 10 }}>
        Draw to: {safeUnits.toFixed(1)} Units
      </div>
      <svg height={height} width={width} viewBox={`0 0 ${width} ${height}`}>
        <rect x="20" y="20" width="40" height={height - 40} rx="5" stroke="#FFF" strokeWidth="2" fill="rgba(255,255,255,0.1)" />
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={i} x1="45" y1={20 + (i * (height - 40)) / 10} x2="60" y2={20 + (i * (height - 40)) / 10} stroke="#AAA" strokeWidth="1" />
        ))}
        <rect x="22" y={height - 20 - fillHeight} width="36" height={fillHeight} fill="rgba(0, 207, 189, 0.4)" />
        <g transform={`translate(0 ${-fillHeight})`}>
          <line x1="15" y1={height - 20} x2="65" y2={height - 20} stroke="#FF4B4B" strokeWidth="3" />
          <rect x="38" y={height - 20} width="4" height={fillHeight + 20} fill="#AAA" />
        </g>
      </svg>
    </div>
  );
}
