<<<<<<< HEAD
export interface Pin {
  id: string;
  lat: number;
  lng: number;
  label: string;
  sub?: string;
  color?: string;
}

const AREA_LABELS = [
  { name: 'Vijay Nagar', lat: 22.7533, lng: 75.8933 },
  { name: 'Palasia', lat: 22.7599, lng: 75.8895 },
  { name: 'Bhawarkuan', lat: 22.7248, lng: 75.8839 },
  { name: 'Sudama Nagar', lat: 22.735, lng: 75.88 },
  { name: 'Rajwada', lat: 22.7196, lng: 75.8577 },
];

const BBOX = { minLat: 22.68, maxLat: 22.80, minLng: 75.82, maxLng: 75.94 };

/** Lightweight offline GIS view — plots GPS pins over a stylised jurisdiction grid. */
export function GISMap({ pins, selected, onSelect, height = 380 }: { pins: Pin[]; selected?: string | null; onSelect?: (id: string) => void; height?: number }) {
  const W = 100, H = 100 * (BBOX.maxLat - BBOX.minLat) / ((BBOX.maxLng - BBOX.minLng) * Math.cos((22.74 * Math.PI) / 180));
  const x = (lng: number) => ((Math.min(Math.max(lng, BBOX.minLng), BBOX.maxLng) - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * W;
  const y = (lat: number) => H - ((Math.min(Math.max(lat, BBOX.minLat), BBOX.maxLat) - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat)) * H;

  return (
    <div className="card overflow-hidden">
      <svg viewBox={`-2 -2 ${W + 4} ${H + 4}`} style={{ width: '100%', height }} className="bg-[#0f1e3d]">
        <defs>
          <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#1e3a8a" strokeWidth="0.15" />
          </pattern>
        </defs>
        <rect x="-2" y="-2" width={W + 4} height={H + 4} fill="url(#grid)" />
        {/* river-like decoration */}
        <path d={`M 0 ${H * 0.72} C ${W * 0.3} ${H * 0.6}, ${W * 0.5} ${H * 0.85}, ${W} ${H * 0.66}`} stroke="#164e63" strokeWidth="2.4" fill="none" opacity="0.8" />
        {/* area labels */}
        {AREA_LABELS.map((a) => (
          <g key={a.name}>
            <circle cx={x(a.lng)} cy={y(a.lat)} r="0.6" fill="#475569" />
            <text x={x(a.lng) + 1.6} y={y(a.lat) + 0.9} fontSize="2.4" fill="#64748b">{a.name}</text>
          </g>
        ))}
        {/* complaint pins */}
        {pins.map((p) => {
          const active = selected === p.id;
          return (
            <g key={p.id} onClick={() => onSelect?.(p.id)} className={onSelect ? 'cursor-pointer' : ''}>
              {active && <circle cx={x(p.lng)} cy={y(p.lat)} r="2.6" fill="none" stroke={p.color || '#f59e0b'} strokeWidth="0.5" opacity="0.8" />}
              <circle cx={x(p.lng)} cy={y(p.lat)} r={active ? 1.7 : 1.2} fill={p.color || '#f59e0b'} stroke="#0f172a" strokeWidth="0.25" />
            </g>
          );
        })}
        <text x="1.6" y={H - 1.4} fontSize="2.2" fill="#475569">JanSetu GIS view · Indore region · {pins.length} point(s)</text>
      </svg>
      {selected && (
        <div className="border-t border-slate-200 bg-white px-4 py-2.5 text-sm">
          {(() => { const p = pins.find((q) => q.id === selected); return p ? (<span><b>{p.label}</b>{p.sub ? ` — ${p.sub}` : ''} <span className="text-slate-400">({p.lat.toFixed(4)}, {p.lng.toFixed(4)})</span></span>) : null; })()}
        </div>
      )}
    </div>
  );
}
=======
export interface Pin {
  id: string;
  lat: number;
  lng: number;
  label: string;
  sub?: string;
  color?: string;
}

const AREA_LABELS = [
  { name: 'Vijay Nagar', lat: 22.7533, lng: 75.8933 },
  { name: 'Palasia', lat: 22.7599, lng: 75.8895 },
  { name: 'Bhawarkuan', lat: 22.7248, lng: 75.8839 },
  { name: 'Sudama Nagar', lat: 22.735, lng: 75.88 },
  { name: 'Rajwada', lat: 22.7196, lng: 75.8577 },
];

const BBOX = { minLat: 22.68, maxLat: 22.80, minLng: 75.82, maxLng: 75.94 };

/** Lightweight offline GIS view — plots GPS pins over a stylised jurisdiction grid. */
export function GISMap({ pins, selected, onSelect, height = 380 }: { pins: Pin[]; selected?: string | null; onSelect?: (id: string) => void; height?: number }) {
  const W = 100, H = 100 * (BBOX.maxLat - BBOX.minLat) / ((BBOX.maxLng - BBOX.minLng) * Math.cos((22.74 * Math.PI) / 180));
  const x = (lng: number) => ((Math.min(Math.max(lng, BBOX.minLng), BBOX.maxLng) - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * W;
  const y = (lat: number) => H - ((Math.min(Math.max(lat, BBOX.minLat), BBOX.maxLat) - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat)) * H;

  return (
    <div className="card overflow-hidden">
      <svg viewBox={`-2 -2 ${W + 4} ${H + 4}`} style={{ width: '100%', height }} className="bg-[#0f1e3d]">
        <defs>
          <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#1e3a8a" strokeWidth="0.15" />
          </pattern>
        </defs>
        <rect x="-2" y="-2" width={W + 4} height={H + 4} fill="url(#grid)" />
        {/* river-like decoration */}
        <path d={`M 0 ${H * 0.72} C ${W * 0.3} ${H * 0.6}, ${W * 0.5} ${H * 0.85}, ${W} ${H * 0.66}`} stroke="#164e63" strokeWidth="2.4" fill="none" opacity="0.8" />
        {/* area labels */}
        {AREA_LABELS.map((a) => (
          <g key={a.name}>
            <circle cx={x(a.lng)} cy={y(a.lat)} r="0.6" fill="#475569" />
            <text x={x(a.lng) + 1.6} y={y(a.lat) + 0.9} fontSize="2.4" fill="#64748b">{a.name}</text>
          </g>
        ))}
        {/* complaint pins */}
        {pins.map((p) => {
          const active = selected === p.id;
          return (
            <g key={p.id} onClick={() => onSelect?.(p.id)} className={onSelect ? 'cursor-pointer' : ''}>
              {active && <circle cx={x(p.lng)} cy={y(p.lat)} r="2.6" fill="none" stroke={p.color || '#f59e0b'} strokeWidth="0.5" opacity="0.8" />}
              <circle cx={x(p.lng)} cy={y(p.lat)} r={active ? 1.7 : 1.2} fill={p.color || '#f59e0b'} stroke="#0f172a" strokeWidth="0.25" />
            </g>
          );
        })}
        <text x="1.6" y={H - 1.4} fontSize="2.2" fill="#475569">JanSetu GIS view · Indore region · {pins.length} point(s)</text>
      </svg>
      {selected && (
        <div className="border-t border-slate-200 bg-white px-4 py-2.5 text-sm">
          {(() => { const p = pins.find((q) => q.id === selected); return p ? (<span><b>{p.label}</b>{p.sub ? ` — ${p.sub}` : ''} <span className="text-slate-400">({p.lat.toFixed(4)}, {p.lng.toFixed(4)})</span></span>) : null; })()}
        </div>
      )}
    </div>
  );
}
>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
