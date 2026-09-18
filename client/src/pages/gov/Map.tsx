import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { PageHeader, Spinner } from '../../components/ui';
import { GISMap, Pin } from '../../components/GISMap';
import { StatusBadge } from '../../components/StatusTimeline';
import type { Complaint } from '../../types';

export default function GovMap() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { api.get('/complaints').then((r) => setComplaints(r.complaints)); }, []);
  if (!complaints) return <Spinner />;

  const pins: Pin[] = complaints.map((c) => ({
    id: c.id, lat: c.gps.lat, lng: c.gps.lng, label: `${c.id} — ${c.category}`, sub: `${c.areaName} · ${c.community.length} confirmation(s)`,
    color: c.status === 'closed' ? '#10b981' : c.overdueFlags?.length ? '#e11d48' : c.status === 'work_in_progress' ? '#f97316' : '#f59e0b',
  }));

  return (
    <div>
      <PageHeader title="GIS Map" sub="Complaint hotspots across your jurisdiction — colour indicates stage (amber=active, orange=execution, green=closed, red=overdue)." />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2"><GISMap pins={pins} selected={selected} onSelect={setSelected} height={440} /></div>
        <div className="space-y-2">
          {complaints.map((c) => (
            <button key={c.id} onClick={() => setSelected(c.id)} className={`card flex w-full items-center gap-3 p-3 text-left ${selected === c.id ? 'ring-2 ring-brand-700' : 'hover:shadow-md'}`}>
              <img src={c.images[0]} alt="" className="h-12 w-16 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs font-bold text-brand-800">{c.id}</p>
                <p className="truncate text-xs text-slate-500">{c.category} · {c.areaName}</p>
                <StatusBadge status={c.status} />
              </div>
              <Link to={`/gov/complaints/${c.id}`} className="btn-ghost btn-sm">Open</Link>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
