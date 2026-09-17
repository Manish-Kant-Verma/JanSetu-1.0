import { useEffect, useState } from 'react';
import { Trophy, Info } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../store';
import { PageHeader, Spinner } from '../../components/ui';
import { ScoreRing } from '../../components/UploadBox';
import { inr } from '../../constants';
import type { ScoreInfo, Project, Bid } from '../../types';

export default function Performance() {
  const { user } = useAuth();
  const [info, setInfo] = useState<ScoreInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  useEffect(() => {
    api.get('/scores/contractor').then(setInfo);
    api.get('/projects').then((r) => { setProjects(r.mine); setBids(r.myBids); });
  }, []);
  if (!info) return <Spinner />;
  const completed = projects.filter((p) => p.status === 'completed');
  const won = bids.filter((b) => b.status === 'accepted');

  return (
    <div>
      <PageHeader title="Performance Profile" sub="Documented, government-verified track record." />
      <div className="grid gap-6 md:grid-cols-[auto,1fr]">
        <div className="card-p flex flex-col items-center justify-center">
          <ScoreRing score={info.score ?? 0} label="Performance" />
        </div>
        <div className="card-p">
          <p className="font-bold text-slate-800">Performance factors</p>
          <div className="mt-3 space-y-3">
            {info.breakdown.map((b) => (
              <div key={b.label}>
                <div className="flex items-baseline justify-between text-sm">
                  <p className="font-medium text-slate-700">{b.label}</p>
                  <p className="font-bold text-slate-800">{b.points}{b.max > 0 && <span className="text-xs text-slate-400"> / {b.max}</span>}</p>
                </div>
                <p className="text-xs text-slate-400">{b.detail}</p>
                {b.max > 0 && <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(100, Math.max(0, (b.points / b.max) * 100))}%` }} /></div>}
              </div>
            ))}
          </div>
          <p className="mt-3 flex gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900"><Info size={13} className="mt-0.5 shrink-0" /> {info.note}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="card-p">
          <p className="flex items-center gap-2 font-bold text-slate-800"><Trophy size={15} className="text-emerald-600" /> Completed projects ({completed.length})</p>
          {completed.length === 0 ? <p className="mt-2 text-sm text-slate-400">None yet.</p> : (
            <div className="mt-2 space-y-1.5 text-sm">
              {completed.map((p) => <div key={p.id} className="flex justify-between rounded-lg border border-slate-100 p-2"><span><b className="font-mono text-xs text-brand-800">{p.code}</b> {p.title}</span><span className="text-xs text-slate-400">{inr(p.budgetEstimate)}</span></div>)}
            </div>
          )}
          <p className="mt-3 text-xs text-slate-400">Business: {user?.businessName} · Bids won: {won.length}/{bids.length}</p>
        </div>
        <div className="card-p">
          <p className="font-bold text-slate-800">Subscription (business layer)</p>
          <p className="mt-2 text-sm text-slate-600">The demo includes the full workflow. In production, this space carries the subscription tiers:</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>• Project discovery & alerts</li>
            <li>• Document management & proposal library</li>
            <li>• Performance dashboard & analytics</li>
            <li>• Project intelligence reports</li>
          </ul>
          <p className="mt-2 text-xs text-slate-400">No payment is required to see or win government work — subscriptions buy business-side tools only.</p>
        </div>
      </div>
    </div>
  );
}
