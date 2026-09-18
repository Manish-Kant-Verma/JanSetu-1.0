import { Link } from 'react-router-dom';
import { MapPin, Users, AlertTriangle } from 'lucide-react';
import type { Complaint } from '../types';
import { fmtDate } from '../constants';
import { StatusBadge } from './StatusTimeline';

export default function ComplaintCard({ c, to }: { c: Complaint; to?: string }) {
  const overdue = c.overdueFlags?.length && !['closed', 'rejected'].includes(c.status);
  return (
    <Link to={to || `/citizen/complaints/${c.id}`} className="card block overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex">
        {c.images[0] ? <img src={c.images[0]} alt="" className="h-24 w-28 shrink-0 object-cover" /> : <div className="h-24 w-28 shrink-0 bg-slate-100" />}
        <div className="min-w-0 flex-1 p-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-brand-800">{c.id}</span>
            <StatusBadge status={c.status} />
            {overdue && <span className="badge bg-rose-100 text-rose-700"><AlertTriangle size={10} /> OVERDUE</span>}
            <span className="badge bg-slate-100 text-slate-600">{c.category}</span>
          </div>
          <p className="mt-1.5 line-clamp-1 text-sm font-medium text-slate-800">{c.description || '(no description)'}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1"><MapPin size={12} /> {c.areaName}</span>
            {c.community.length > 0 && <span className="flex items-center gap-1"><Users size={12} /> {c.community.length} confirmation{c.community.length > 1 ? 's' : ''}</span>}
            <span>{fmtDate(c.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
