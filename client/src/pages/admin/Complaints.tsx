import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, Spinner, EmptyState } from '../../components/ui';
import { StatusBadge } from '../../components/StatusTimeline';
import { CATEGORIES, fmtDate } from '../../constants';
import type { Complaint } from '../../types';

export default function AdminComplaints() {
  const [list, setList] = useState<Complaint[] | null>(null);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const load = () => {
    const p = new URLSearchParams();
    if (status) p.set('status', status);
    if (category) p.set('category', category);
    if (q) p.set('q', q);
    api.get(`/complaints?${p.toString()}`).then((r) => setList(r.complaints));
  };
  useEffect(load, []);
  const search = (e: any) => { e.preventDefault(); load(); };
  if (!list) return <Spinner />;
  return (
    <div>
      <PageHeader title="All complaints" sub="Platform-wide case visibility. Admins see every case across organisations." />
      <form onSubmit={search} className="card-p mb-4 flex flex-wrap gap-3">
        <input className="input max-w-[200px]" placeholder="Status (e.g. closed)" value={status} onChange={(e) => setStatus(e.target.value)} />
        <select className="input max-w-[200px]" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search id, area, text…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="btn-outline btn-sm">Search</button>
      </form>
      {list.length === 0 ? <EmptyState title="No complaints found" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead><tr className="border-b border-slate-100"><th className="th">Case</th><th className="th">Category</th><th className="th">Routed to</th><th className="th">Stage</th><th className="th">Filed</th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="td font-mono text-xs text-brand-800">{c.id}<span className="block font-sans text-xs text-slate-400">{c.areaName}</span></td>
                  <td className="td">{c.category}</td>
                  <td className="td text-xs">{c.routedTo ? `${c.routedTo.orgName} · ${c.routedTo.department}` : '—'}</td>
                  <td className="td"><StatusBadge status={c.status} /></td>
                  <td className="td text-xs">{fmtDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-slate-400">Tip: open any case from the <Link to="/gov/complaints" className="link">government queue</Link> with an official account for full action history.</p>
    </div>
  );
}
