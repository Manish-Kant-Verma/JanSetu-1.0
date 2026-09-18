<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../store';
import { PageHeader, EmptyState, Alert } from '../../components/ui';
import { StatusBadge } from '../../components/StatusTimeline';
import { fmtDate, fmtDateTime } from '../../constants';
import type { Assignment } from '../../types';

export default function AvailableAssignments() {
  const { user } = useAuth();
  const [available, setAvailable] = useState<Assignment[] | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => api.get('/assignments').then((r) => setAvailable(r.available));
  useEffect(() => { load(); }, []);

  const accept = async (id: string) => {
    setMsg(''); setErr('');
    try {
      await api.post(`/assignments/${id}/accept`);
      setMsg(`Assignment ${id} accepted. Go to My Assignments to start the site visit.`);
      load();
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <div>
      <PageHeader title="Available Assignments" sub={`Matched to your skills, distance and Field Trust Score. Deadlines are enforced — missed assignments return to the pool.`} />
      {msg && <div className="mb-4"><Alert tone="success">{msg}</Alert></div>}
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}
      {!available ? null : available.length === 0 ? (
        <EmptyState icon={<CheckCircle2 size={36} />} title="No open assignments right now" sub="When a government official requests a field assessment in your area, it will appear here with a match score." />
      ) : (
        <div className="space-y-3">
          {available.map((a) => (
            <div key={a.id} className="card-p">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-800">{a.id}</span>
                <StatusBadge status={a.status} cls="bg-amber-100 text-amber-800" />
                <span className="badge bg-slate-100 text-slate-600">{a.complaint?.category}</span>
                <span className="badge bg-slate-100 text-slate-600">deadline {fmtDate(a.deadlineAt)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{a.complaint?.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin size={12} /> {a.complaint?.areaName}{a.distanceKm != null ? ` · ${a.distanceKm} km from your base` : ''}</span>
                <span>Skills needed: {a.skillsRequired.join(', ')}</span>
                <span>Reported {fmtDateTime(a.complaint?.createdAt)}</span>
              </div>
              {a.skillMatch && a.skillMatch.length > 0 && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700"><Sparkles size={12} /> Skill match: {a.skillMatch.join(', ')} · match score {a.matchScore}</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                {a.complaint && <img src={a.complaint.images[0]} alt="" className="h-14 w-24 rounded object-cover" />}
                <button className="btn-primary btn-sm ml-auto" onClick={() => accept(a.id)} disabled={!user?.verified}>Accept assignment</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
=======
import { useEffect, useState } from 'react';
import { MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../store';
import { PageHeader, EmptyState, Alert } from '../../components/ui';
import { StatusBadge } from '../../components/StatusTimeline';
import { fmtDate, fmtDateTime } from '../../constants';
import type { Assignment } from '../../types';

export default function AvailableAssignments() {
  const { user } = useAuth();
  const [available, setAvailable] = useState<Assignment[] | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => api.get('/assignments').then((r) => setAvailable(r.available));
  useEffect(() => { load(); }, []);

  const accept = async (id: string) => {
    setMsg(''); setErr('');
    try {
      await api.post(`/assignments/${id}/accept`);
      setMsg(`Assignment ${id} accepted. Go to My Assignments to start the site visit.`);
      load();
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <div>
      <PageHeader title="Available Assignments" sub={`Matched to your skills, distance and Field Trust Score. Deadlines are enforced — missed assignments return to the pool.`} />
      {msg && <div className="mb-4"><Alert tone="success">{msg}</Alert></div>}
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}
      {!available ? null : available.length === 0 ? (
        <EmptyState icon={<CheckCircle2 size={36} />} title="No open assignments right now" sub="When a government official requests a field assessment in your area, it will appear here with a match score." />
      ) : (
        <div className="space-y-3">
          {available.map((a) => (
            <div key={a.id} className="card-p">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-800">{a.id}</span>
                <StatusBadge status={a.status} cls="bg-amber-100 text-amber-800" />
                <span className="badge bg-slate-100 text-slate-600">{a.complaint?.category}</span>
                <span className="badge bg-slate-100 text-slate-600">deadline {fmtDate(a.deadlineAt)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{a.complaint?.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin size={12} /> {a.complaint?.areaName}{a.distanceKm != null ? ` · ${a.distanceKm} km from your base` : ''}</span>
                <span>Skills needed: {a.skillsRequired.join(', ')}</span>
                <span>Reported {fmtDateTime(a.complaint?.createdAt)}</span>
              </div>
              {a.skillMatch && a.skillMatch.length > 0 && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700"><Sparkles size={12} /> Skill match: {a.skillMatch.join(', ')} · match score {a.matchScore}</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                {a.complaint && <img src={a.complaint.images[0]} alt="" className="h-14 w-24 rounded object-cover" />}
                <button className="btn-primary btn-sm ml-auto" onClick={() => accept(a.id)} disabled={!user?.verified}>Accept assignment</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
