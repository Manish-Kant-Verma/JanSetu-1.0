import { useEffect, useState } from 'react';
import { Trophy, History } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, Spinner } from '../../components/ui';
import { ScoreRing } from '../../components/UploadBox';
import { fmtDate } from '../../constants';
import type { ScoreInfo } from '../../types';

export default function CivilScore() {
  const [info, setInfo] = useState<ScoreInfo | null>(null);
  useEffect(() => { api.get('/scores/me').then(setInfo); }, []);
  if (!info) return <Spinner />;
  return (
    <div>
      <PageHeader title="Civil Score" sub="Transparent, rule-based trust in your civic participation." />
      <div className="grid gap-6 md:grid-cols-[auto,1fr]">
        <div className="card-p flex flex-col items-center justify-center">
          <ScoreRing score={info.score ?? 0} label="Civil Score" />
          <p className="mt-2 max-w-52 text-center text-xs text-slate-500">Verified reports, useful confirmations and accurate resolution feedback raise your score. Spam lowers it.</p>
        </div>
        <div className="card-p">
          <p className="font-bold text-slate-800">How your score is built</p>
          <div className="mt-3 space-y-3">
            {info.breakdown.map((b) => (
              <div key={b.label}>
                <div className="flex items-baseline justify-between text-sm">
                  <p className="font-medium text-slate-700">{b.label}</p>
                  <p className={`font-bold ${b.points < 0 ? 'text-rose-600' : 'text-slate-800'}`}>{b.points > 0 ? '+' : ''}{b.points}{b.max > 0 && <span className="text-xs text-slate-400"> / {b.max}</span>}</p>
                </div>
                <p className="text-xs text-slate-400">{b.detail}</p>
                {b.max > 0 && (
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${b.points < 0 ? 'bg-rose-400' : 'bg-brand-600'}`} style={{ width: `${Math.min(100, Math.max(0, (b.points / b.max) * 100))}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {info.history.length > 0 && (
        <div className="card-p mt-6">
          <p className="flex items-center gap-2 font-bold text-slate-800"><History size={16} className="text-brand-700" /> Score history</p>
          <div className="mt-3 divide-y divide-slate-100">
            {info.history.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-600">{h.reason}</span>
                <span className="flex items-center gap-3"><span className="text-xs text-slate-400">{fmtDate(h.at)}</span><b className={h.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{h.delta >= 0 ? '+' : ''}{h.delta}</b></span>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400"><Trophy size={12} /> Scores are explainable by design — every point maps to a transparent rule.</p>
    </div>
  );
}
