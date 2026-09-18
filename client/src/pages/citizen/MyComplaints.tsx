<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, EmptyState, Spinner } from '../../components/ui';
import ComplaintCard from '../../components/ComplaintCard';
import { CATEGORIES } from '../../constants';
import type { Complaint } from '../../types';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    api.get(`/complaints?${params}`).then((r) => setComplaints(r.complaints));
  }, [q, status, category]);

  return (
    <div>
      <PageHeader title="My Complaints" sub="Every case you reported, with live status from the workflow." />
      <div className="card mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-52 flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-9" placeholder="Search ID, area, description…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All stages</option>
          <option value="closed">Closed</option>
          <option value="citizen_verification">Awaiting my verification</option>
          <option value="forwarded_to_government">With government</option>
          <option value="work_in_progress">Work in progress</option>
        </select>
        <select className="input !w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {!complaints ? <Spinner /> : complaints.length === 0 ? (
        <EmptyState title="No complaints match" sub="Try clearing filters — or report a new problem from the dashboard." />
      ) : (
        <div className="space-y-3">{complaints.map((c) => <ComplaintCard key={c.id} c={c} />)}</div>
      )}
    </div>
  );
}
=======
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, EmptyState, Spinner } from '../../components/ui';
import ComplaintCard from '../../components/ComplaintCard';
import { CATEGORIES } from '../../constants';
import type { Complaint } from '../../types';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    api.get(`/complaints?${params}`).then((r) => setComplaints(r.complaints));
  }, [q, status, category]);

  return (
    <div>
      <PageHeader title="My Complaints" sub="Every case you reported, with live status from the workflow." />
      <div className="card mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-52 flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-9" placeholder="Search ID, area, description…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All stages</option>
          <option value="closed">Closed</option>
          <option value="citizen_verification">Awaiting my verification</option>
          <option value="forwarded_to_government">With government</option>
          <option value="work_in_progress">Work in progress</option>
        </select>
        <select className="input !w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {!complaints ? <Spinner /> : complaints.length === 0 ? (
        <EmptyState title="No complaints match" sub="Try clearing filters — or report a new problem from the dashboard." />
      ) : (
        <div className="space-y-3">{complaints.map((c) => <ComplaintCard key={c.id} c={c} />)}</div>
      )}
    </div>
  );
}
>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
