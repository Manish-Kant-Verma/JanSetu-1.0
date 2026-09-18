import { useRef, useState } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';

/** Photo evidence capture — opens camera on mobile, file picker on desktop. */
export function UploadBox({ images, onChange, max = 4, label = 'Capture photo evidence' }: { images: File[]; onChange: (files: File[]) => void; max?: number; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const add = (files: FileList | null) => {
    if (!files) return;
    const next = [...images, ...Array.from(files)].slice(0, max);
    onChange(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };
  const removeAt = (i: number) => {
    const next = images.filter((_, idx) => idx !== i);
    onChange(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      <div className="flex flex-wrap gap-2">
        {previews.map((src, i) => (
          <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
            <img src={src} className="h-full w-full object-cover" alt="evidence" />
            <button type="button" onClick={() => removeAt(i)} className="absolute right-0.5 top-0.5 rounded-full bg-slate-900/70 p-0.5 text-white"><X size={11} /></button>
          </div>
        ))}
        {images.length < max && (
          <button type="button" onClick={() => ref.current?.click()} className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-brand-600 hover:text-brand-700">
            {images.length === 0 ? <Camera size={20} /> : <ImagePlus size={20} />}
            <span className="text-[10px] font-medium">{images.length === 0 ? label : 'Add more'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

/** Score ring (Civil Score / Field Trust Score / Performance) */
export function ScoreRing({ score, size = 132, label }: { score: number; size?: number; label?: string }) {
  const r = 52, c = 2 * Math.PI * r;
  const tone = score >= 75 ? '#059669' : score >= 50 ? '#d97706' : '#e11d48';
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={tone} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * Math.min(100, score)) / 100} transform="rotate(-90 60 60)" />
        <text x="60" y="58" textAnchor="middle" fontSize="26" fontWeight="800" fill="#0f172a">{score}</text>
        <text x="60" y="76" textAnchor="middle" fontSize="11" fill="#64748b">/ 100</text>
      </svg>
      {label && <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>}
    </div>
  );
}
