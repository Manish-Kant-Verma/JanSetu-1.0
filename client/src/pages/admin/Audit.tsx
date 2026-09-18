import { useEffect, useState } from 'react';
import { Search, ScrollText } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, Spinner, EmptyState } from '../../components/ui';
import { fmtDateTime } from '../../constants';

interface Log { id: string; actorName: string; action: string; entity: string; at: string }

export default function AdminAudit() {
  const [logs, setLogs] = useState<Log[] | null>(null);
  const [q, setQ] = useState('');
  const load = () => api.get(`/admin/audit${q ? `?q=${encodeURIComponent(q)}` : ''}`).then((r) => setLogs(r.logs));
  useEffect(() => { void load(); }, []);
  const search = (e: any) => { e.preventDefault(); load(); };
  if (!logs) return <Spinner />;
  return (
    <div>
      <PageHeader title="Audit trail" sub="Every significant action on JanSetu — who did what, on which entity, and when." />
      <form onSubmit={search} className="card-p mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search actor, action, entity…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="btn-outline btn-sm">Search</button>
      </form>
      {logs.length === 0 ? <EmptyState icon={<ScrollText size={40} />} title="No audit entries" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead><tr className="border-b border-slate-100"><th className="th">When</th><th className="th">Actor</th><th className="th">Action</th><th className="th">Entity</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="td whitespace-nowrap text-xs">{fmtDateTime(l.at)}</td>
                  <td className="td">{l.actorName}</td>
                  <td className="td"><span className="badge bg-slate-100 text-slate-700">{l.action}</span></td>
                  <td className="td font-mono text-xs text-slate-500">{l.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
