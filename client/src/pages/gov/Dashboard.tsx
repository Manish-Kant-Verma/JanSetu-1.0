import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Wrench, Gavel, CheckCircle2, AlertTriangle, CalendarClock, FileText } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../store';
import { PageHeader, Stat, Alert } from '../../components/ui';
import { StatusBadge } from '../../components/StatusTimeline';
import { fmtDate } from '../../constants';

interface Overview {
  stats: { total: number; waiting: number; field: number; decided: number; verifying: number; closed: number; overdue: number };
  overdue: any[];
  deadlines: { id: string; category: string; areaName: string; reviewDeadlineAt?: string; resolutionDeadlineAt?: string; reviewDays: number | null; resolutionDays: number | null; status: string }[];
  reportsAwaitingCount: number;
}

export default function GovDashboard() {
  const { user } = useAuth();
  const [o, setO] = useState<Overview | null>(null);
  useEffect(() => { api.get('/gov/overview').then(setO); }, []);
  if (!o) return null;

  return (
    <div>
      <PageHeader title="Government workspace" sub={`${user?.designation || 'Official'} · ${user?.department || ''} — cases routed to your organisation by the JanSetu routing engine.`}
        right={<Link to="/gov/complaints" className="btn-primary">Open complaint queue</Link>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Awaiting review" value={o.stats.waiting} icon={<Inbox size={18} />} tone="text-amber-500" />
        <Stat label="Field verification" value={o.stats.field} icon={<Wrench size={18} />} tone="text-violet-500" />
        <Stat label="Execution / decision" value={o.stats.decided} icon={<Gavel size={18} />} tone="text-brand-600" />
        <Stat label="Awaiting citizen verify" value={o.stats.verifying} icon={<CheckCircle2 size={18} />} tone="text-teal-500" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Stat label="Closed successfully" value={o.stats.closed} icon={<CheckCircle2 size={18} />} tone="text-emerald-500" sub="Verified by citizens" />
        <Stat label="OVERDUE cases" value={o.stats.overdue} icon={<AlertTriangle size={18} />} tone="text-rose-500" sub="Escalation applies" />
        <Stat label="Reports awaiting review" value={o.reportsAwaitingCount} icon={<FileText size={18} />} tone="text-violet-500" />
      </div>

      {o.overdue.length > 0 && (
        <div className="mt-6"><Alert tone="error"><b>{o.overdue.length} case(s) overdue.</b> Review deadlines have passed — configured escalation applies. The platform tracks and notifies; administrative authority stays with government.</Alert></div>
      )}

      <div className="card-p mt-6">
        <p className="flex items-center gap-2 font-bold text-slate-800"><CalendarClock size={16} className="text-brand-700" /> Upcoming & breached deadlines</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr className="border-b border-slate-100"><th className="th">Case</th><th className="th">Category</th><th className="th">Stage</th><th className="th">Review deadline</th><th className="th">Resolution deadline</th></tr></thead>
            <tbody>
              {o.deadlines.map((d) => (
                <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="td"><Link className="link font-mono text-xs" to={`/gov/complaints/${d.id}`}>{d.id}</Link></td>
                  <td className="td">{d.category}<span className="block text-xs text-slate-400">{d.areaName}</span></td>
                  <td className="td"><StatusBadge status={d.status} /></td>
                  <td className="td">{fmtDate(d.reviewDeadlineAt)} <span className={`badge ml-1 ${d.reviewDays !== null && d.reviewDays < 0 ? 'bg-rose-100 text-rose-700' : d.reviewDays !== null && d.reviewDays <= 1 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{d.reviewDays === null ? '—' : d.reviewDays < 0 ? `${-d.reviewDays}d overdue` : `${d.reviewDays}d left`}</span></td>
                  <td className="td">{fmtDate(d.resolutionDeadlineAt)} <span className={`badge ml-1 ${d.resolutionDays !== null && d.resolutionDays < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{d.resolutionDays === null ? '—' : d.resolutionDays < 0 ? `${-d.resolutionDays}d overdue` : `${d.resolutionDays}d left`}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
