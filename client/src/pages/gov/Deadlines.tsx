import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, Spinner, Alert } from '../../components/ui';
import { StatusBadge } from '../../components/StatusTimeline';
import { fmtDate } from '../../constants';

interface Row { id: string; category: string; areaName: string; reviewDeadlineAt?: string; resolutionDeadlineAt?: string; reviewDays: number | null; resolutionDays: number | null; status: string }

export default function GovDeadlines() {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => { api.get('/gov/overview').then((o) => setRows(o.deadlines)); }, []);
  if (!rows) return <Spinner />;
  const breached = rows.filter((r) => (r.reviewDays !== null && r.reviewDays < 0) || (r.resolutionDays !== null && r.resolutionDays < 0));

  return (
    <div>
      <PageHeader title="Deadlines" sub="Every configured stage deadline — reminders fire at 7d/2d/1d, breaches are flagged OVERDUE with escalation." />
      {breached.length > 0 && <div className="mb-4"><Alert tone="error"><b>{breached.length} breached deadline(s).</b> The platform follows the configured administrative process — it tracks and escalates; it never claims authority over officials.</Alert></div>}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50"><tr><th className="th">Case</th><th className="th">Stage</th><th className="th">Review deadline</th><th className="th">Resolution deadline (SLA)</th><th className="th"></th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const rd = r.reviewDays ?? 0, sd = r.resolutionDays ?? 0;
              return (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="td"><Link className="link font-mono text-xs" to={`/gov/complaints/${r.id}`}>{r.id}</Link><span className="block text-xs text-slate-400">{r.category} · {r.areaName}</span></td>
                  <td className="td"><StatusBadge status={r.status} /></td>
                  <td className="td">{fmtDate(r.reviewDeadlineAt)} <span className={`badge ml-1 ${rd < 0 ? 'bg-rose-100 text-rose-700' : rd <= 1 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{rd < 0 ? `${-rd}d OVERDUE` : `${rd}d left`}</span></td>
                  <td className="td">{fmtDate(r.resolutionDeadlineAt)} <span className={`badge ml-1 ${sd < 0 ? 'bg-rose-100 text-rose-700' : sd <= 2 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{sd < 0 ? `${-sd}d OVERDUE` : `${sd}d left`}</span></td>
                  <td className="td text-right"><Link to={`/gov/complaints/${r.id}`} className="btn-outline btn-sm">Review</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400"><CalendarClock size={12} /> Deadline rules are configured per category by JanSetu Admin (Routing & SLA).</p>
    </div>
  );
}
