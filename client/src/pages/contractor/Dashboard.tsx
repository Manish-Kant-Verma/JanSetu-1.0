<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Trophy, Timer, Info } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../store';
import { PageHeader, Stat, Alert } from '../../components/ui';
import { ScoreRing } from '../../components/UploadBox';
import { PROJECT_STATUS_LABEL, BID_STATUS_CLS, fmtDate } from '../../constants';
import type { Project, Bid } from '../../types';

export default function ContractorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<{ open: Project[]; mine: Project[]; myBids: Bid[] } | null>(null);
  const [score, setScore] = useState<number | null>(null);
  useEffect(() => {
    Promise.all([api.get('/projects'), api.get('/scores/contractor')]).then(([p, s]) => { setData(p); setScore(s.score); });
  }, []);
  if (!data) return null;

  const active = data.mine.filter((p) => ['awarded', 'in_progress'].includes(p.status));
  const completed = data.mine.filter((p) => p.status === 'completed');

  return (
    <div>
      <PageHeader title={user?.businessName || 'Business workspace'} sub="Project discovery, bid management and documented performance — JanSetu never sells tenders."
        right={<Link to="/contractor/opportunities" className="btn-amber">Browse opportunities</Link>} />

      {!user?.verified && (
        <div className="mb-4"><Alert tone="warn"><b>Verification pending.</b> A JanSetu Admin must verify your business before you can submit bids.</Alert></div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open opportunities" value={data.open.length} icon={<Briefcase size={18} />} tone="text-amber-500" />
        <Stat label="Active projects" value={active.length} icon={<Timer size={18} />} tone="text-orange-500" />
        <Stat label="Completed" value={completed.length} icon={<Trophy size={18} />} tone="text-emerald-500" />
        <Stat label="Bids submitted" value={data.myBids.length} icon={<FileText size={18} />} tone="text-brand-600" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="card-p flex flex-col items-center">
          <ScoreRing score={score ?? 0} label="Performance" />
          <p className="mt-2 text-center text-xs text-slate-500">Government-verified completions and documented performance. Complements — never replaces — procurement criteria.</p>
        </div>
        <div className="card-p lg:col-span-2">
          <p className="font-bold text-slate-800">My bids & projects</p>
          <div className="mt-3 space-y-2">
            {data.myBids.slice(0, 4).map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 text-sm">
                <span><b className="font-mono text-xs text-brand-800">{b.project?.code}</b> {b.project?.title}</span>
                <span className="flex items-center gap-2 text-xs text-slate-500">{fmtDate(b.submittedAt)}<span className={`badge ${BID_STATUS_CLS[b.status]}`}>{b.status}</span></span>
              </div>
            ))}
            {data.myBids.length === 0 && <p className="text-sm text-slate-400">No bids yet — check opportunities.</p>}
          </div>
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 flex gap-2"><Info size={14} className="mt-0.5 shrink-0" /> Subscription features (project intelligence, document management, analytics dashboards) appear in the Business layer.</div>
        </div>
      </div>
    </div>
  );
}
=======
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Trophy, Timer, Info } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../store';
import { PageHeader, Stat, Alert } from '../../components/ui';
import { ScoreRing } from '../../components/UploadBox';
import { PROJECT_STATUS_LABEL, BID_STATUS_CLS, fmtDate } from '../../constants';
import type { Project, Bid } from '../../types';

export default function ContractorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<{ open: Project[]; mine: Project[]; myBids: Bid[] } | null>(null);
  const [score, setScore] = useState<number | null>(null);
  useEffect(() => {
    Promise.all([api.get('/projects'), api.get('/scores/contractor')]).then(([p, s]) => { setData(p); setScore(s.score); });
  }, []);
  if (!data) return null;

  const active = data.mine.filter((p) => ['awarded', 'in_progress'].includes(p.status));
  const completed = data.mine.filter((p) => p.status === 'completed');

  return (
    <div>
      <PageHeader title={user?.businessName || 'Business workspace'} sub="Project discovery, bid management and documented performance — JanSetu never sells tenders."
        right={<Link to="/contractor/opportunities" className="btn-amber">Browse opportunities</Link>} />

      {!user?.verified && (
        <div className="mb-4"><Alert tone="warn"><b>Verification pending.</b> A JanSetu Admin must verify your business before you can submit bids.</Alert></div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open opportunities" value={data.open.length} icon={<Briefcase size={18} />} tone="text-amber-500" />
        <Stat label="Active projects" value={active.length} icon={<Timer size={18} />} tone="text-orange-500" />
        <Stat label="Completed" value={completed.length} icon={<Trophy size={18} />} tone="text-emerald-500" />
        <Stat label="Bids submitted" value={data.myBids.length} icon={<FileText size={18} />} tone="text-brand-600" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="card-p flex flex-col items-center">
          <ScoreRing score={score ?? 0} label="Performance" />
          <p className="mt-2 text-center text-xs text-slate-500">Government-verified completions and documented performance. Complements — never replaces — procurement criteria.</p>
        </div>
        <div className="card-p lg:col-span-2">
          <p className="font-bold text-slate-800">My bids & projects</p>
          <div className="mt-3 space-y-2">
            {data.myBids.slice(0, 4).map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 text-sm">
                <span><b className="font-mono text-xs text-brand-800">{b.project?.code}</b> {b.project?.title}</span>
                <span className="flex items-center gap-2 text-xs text-slate-500">{fmtDate(b.submittedAt)}<span className={`badge ${BID_STATUS_CLS[b.status]}`}>{b.status}</span></span>
              </div>
            ))}
            {data.myBids.length === 0 && <p className="text-sm text-slate-400">No bids yet — check opportunities.</p>}
          </div>
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 flex gap-2"><Info size={14} className="mt-0.5 shrink-0" /> Subscription features (project intelligence, document management, analytics dashboards) appear in the Business layer.</div>
        </div>
      </div>
    </div>
  );
}
>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
