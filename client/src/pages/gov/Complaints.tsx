import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Users } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, EmptyState, Spinner } from '../../components/ui';
import { StatusBadge } from '../../components/StatusTimeline';
import { CATEGORIES, fmtDate } from '../../constants';
import type { Complaint } from '../../types';

export default function GovComplaints() {
  const [list, setList] = useState<Complaint[] | null>(null);
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (stage) params.set('status', stage);
    if (category) params.set('category', category);
    api.get(`/complaints?${params}`).then((r) => setList(r.complaints));
  }, [q, stage, category]);

  return (
    <div>
      <PageHeader title="Complaint queue" sub="Full case files routed to your organisation — evidence, community support and stage in one view." />
      <div className="card mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-52 flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-9" placeholder="Search ID, area…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input !w-auto" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">All stages</option>
          <option value="forwarded_to_government">Awaiting government review</option>
          <option value="reopened">Re-opened / re-complaints</option>
          <option value="report_review">Report review</option>
          <option value="government_direct_action">Direct action</option>
          <option value="work_in_progress">Work in progress</option>
          <option value="citizen_verification">Citizen verification</option>
          <option value="closed">Closed</option>
        </select>
        <select className="input !w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {!list ? <Spinner /> : list.length === 0 ? (
        <EmptyState title="No cases match" sub="Try clearing filters." />
      ) : (
        <div className="space-y-2.5">
          {list.map((c) => (
            <Link key={c.id} to={`/gov/complaints/${c.id}`} className="card flex items-center gap-4 p-4 transition hover:border-brand-600 hover:shadow-sm">
              {c.images[0] && <img src={c.images[0]} alt="" className="h-16 w-24 rounded-lg object-cover" />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand-800">{c.id}</span>
                  <StatusBadge status={c.status} />
                  {c.overdueFlags.length > 0 && !['closed', 'rejected'].includes(c.status) && <span className="badge bg-rose-100 text-rose-700">OVERDUE</span>}
                  <span className="badge bg-slate-100 text-slate-600">{c.category}</span>
                </div>
                <p className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={11} /> {c.areaName}</span>
                  <span className="flex items-center gap-1"><Users size={11} /> {c.community.length} confirmations</span>
                  <span>{fmtDate(c.createdAt)}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
