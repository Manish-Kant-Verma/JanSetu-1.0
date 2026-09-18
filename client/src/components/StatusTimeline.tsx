<<<<<<< HEAD
import { statusMeta } from '../constants';
import type { TimelineEntry } from '../types';

export function StatusBadge({ status, cls }: { status: string; cls?: string }) {
  const m = statusMeta(status);
  return <span className={`badge ${cls || m.cls}`}>{m.label}</span>;
}

const STEP_CLS: Record<string, string> = {
  system: 'bg-slate-400',
  JanSetu: 'bg-brand-700',
  user: 'bg-civic-500',
};

export function StatusTimeline({ timeline }: { timeline: TimelineEntry[] }) {
  if (!timeline.length) return <p className="text-sm text-slate-400">No activity yet.</p>;
  return (
    <ol className="relative space-y-0">
      {timeline.map((t, i) => {
        const last = i === timeline.length - 1;
        const actorType = t.by === 'system' ? 'system' : ['JanSetu', 'JanSetu Routing Engine'].includes(t.byName || '') ? 'JanSetu' : 'user';
        return (
          <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span className="absolute left-[7px] top-4 h-full w-[2px] bg-slate-100" />}
            <span className={`mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ${last ? 'ring-emerald-100 bg-emerald-500' : `${STEP_CLS[actorType]} ring-slate-50`}`} />
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${last ? 'text-emerald-700' : 'text-slate-800'}`}>{statusMeta(t.status).label}</p>
              <p className="text-xs text-slate-500">
                {t.byName || 'Unknown'} · {new Date(t.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
              {t.note && <p className="mt-1 rounded-md bg-slate-50 px-2.5 py-1.5 text-xs leading-relaxed text-slate-600">{t.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
=======
import { statusMeta } from '../constants';
import type { TimelineEntry } from '../types';

export function StatusBadge({ status, cls }: { status: string; cls?: string }) {
  const m = statusMeta(status);
  return <span className={`badge ${cls || m.cls}`}>{m.label}</span>;
}

const STEP_CLS: Record<string, string> = {
  system: 'bg-slate-400',
  JanSetu: 'bg-brand-700',
  user: 'bg-civic-500',
};

export function StatusTimeline({ timeline }: { timeline: TimelineEntry[] }) {
  if (!timeline.length) return <p className="text-sm text-slate-400">No activity yet.</p>;
  return (
    <ol className="relative space-y-0">
      {timeline.map((t, i) => {
        const last = i === timeline.length - 1;
        const actorType = t.by === 'system' ? 'system' : ['JanSetu', 'JanSetu Routing Engine'].includes(t.byName || '') ? 'JanSetu' : 'user';
        return (
          <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span className="absolute left-[7px] top-4 h-full w-[2px] bg-slate-100" />}
            <span className={`mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ${last ? 'ring-emerald-100 bg-emerald-500' : `${STEP_CLS[actorType]} ring-slate-50`}`} />
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${last ? 'text-emerald-700' : 'text-slate-800'}`}>{statusMeta(t.status).label}</p>
              <p className="text-xs text-slate-500">
                {t.byName || 'Unknown'} · {new Date(t.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
              {t.note && <p className="mt-1 rounded-md bg-slate-50 px-2.5 py-1.5 text-xs leading-relaxed text-slate-600">{t.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
