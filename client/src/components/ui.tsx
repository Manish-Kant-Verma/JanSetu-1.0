<<<<<<< HEAD
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function Spinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand-700" />
      {text && <p className="text-sm">{text}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, sub, children }: { icon?: ReactNode; title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-10 text-center">
      {icon && <div className="text-slate-300">{icon}</div>}
      <p className="font-semibold text-slate-700">{title}</p>
      {sub && <p className="max-w-md text-sm text-slate-500">{sub}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`card max-h-[90vh] w-full overflow-y-auto p-0 ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="btn-ghost btn-sm !px-2 !py-2" aria-label="Close"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Stat({ label, value, tone, icon, sub }: { label: string; value: ReactNode; tone?: string; icon?: ReactNode; sub?: string }) {
  return (
    <div className="card-p">
      <div className="flex items-center justify-between">
        <p className="stat-label">{label}</p>
        {icon && <span className={tone || 'text-slate-300'}>{icon}</span>}
      </div>
      <p className="stat-value mt-1">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export function ProgressBar({ percent, tone }: { percent: number; tone?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${tone || 'bg-brand-600'}`} style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Alert({ tone = 'info', children }: { tone?: 'info' | 'success' | 'warn' | 'error'; children: ReactNode }) {
  const cls = {
    info: 'bg-sky-50 border-sky-200 text-sky-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warn: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
  }[tone];
  return <div className={`rounded-lg border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}
=======
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function Spinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand-700" />
      {text && <p className="text-sm">{text}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, sub, children }: { icon?: ReactNode; title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-10 text-center">
      {icon && <div className="text-slate-300">{icon}</div>}
      <p className="font-semibold text-slate-700">{title}</p>
      {sub && <p className="max-w-md text-sm text-slate-500">{sub}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`card max-h-[90vh] w-full overflow-y-auto p-0 ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="btn-ghost btn-sm !px-2 !py-2" aria-label="Close"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Stat({ label, value, tone, icon, sub }: { label: string; value: ReactNode; tone?: string; icon?: ReactNode; sub?: string }) {
  return (
    <div className="card-p">
      <div className="flex items-center justify-between">
        <p className="stat-label">{label}</p>
        {icon && <span className={tone || 'text-slate-300'}>{icon}</span>}
      </div>
      <p className="stat-value mt-1">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export function ProgressBar({ percent, tone }: { percent: number; tone?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${tone || 'bg-brand-600'}`} style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Alert({ tone = 'info', children }: { tone?: 'info' | 'success' | 'warn' | 'error'; children: ReactNode }) {
  const cls = {
    info: 'bg-sky-50 border-sky-200 text-sky-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warn: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
  }[tone];
  return <div className={`rounded-lg border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}
>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
