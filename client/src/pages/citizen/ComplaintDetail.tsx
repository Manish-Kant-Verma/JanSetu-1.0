import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Users, Building2, Clock, CheckCircle2, XCircle, Camera, CalendarClock } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, Alert, Modal, Field, Spinner } from '../../components/ui';
import { StatusTimeline } from '../../components/StatusTimeline';
import { fmtDate, fmtDateTime, daysBetween } from '../../constants';
import type { Complaint } from '../../types';

export default function ComplaintDetail() {
  const { id } = useParams();
  const [data, setData] = useState<{ complaint: Complaint; assignment: any; action: any; project: any; linkedEvidence: string[] } | null>(null);
  const [err, setErr] = useState('');
  const [reopen, setReopen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get(`/complaints/${id}`).then(setData).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id]);

  if (err) return <Alert tone="error">{err} <Link to="/citizen/complaints" className="link">Back to my complaints</Link></Alert>;
  if (!data) return <Spinner />;
  const { complaint: c } = data;

  const confirm = async (confirmed: boolean, reopenReason?: string) => {
    setBusy(true);
    try {
      await api.post(`/complaints/${c.id}/verify-resolution`, { confirmed, reopenReason });
      setReopen(false);
      load();
    } catch (e: any) { alert(e.message); } finally { setBusy(false); }
  };

  const dLeft = (iso?: string) => {
    if (!iso) return null;
    const d = daysBetween(new Date(), iso);
    return d >= 0 ? `${d}d left` : 'overdue';
  };

  return (
    <div>
      <PageHeader title={c.id} sub={`${c.category} · ${c.areaName}`} right={<Link to="/citizen/complaints" className="btn-outline">All complaints</Link>} />
      {c.overdueFlags?.length > 0 && !['closed', 'rejected'].includes(c.status) && (
        <div className="mb-4"><Alert tone="warn"><b>OVERDUE</b> — this case crossed a configured deadline. Escalation follows the configured administrative process.</Alert></div>
      )}
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <div className="card-p">
            <p className="mb-2 font-bold text-slate-800">Evidence</p>
            <div className="flex gap-2 overflow-x-auto">
              {c.images.map((img) => <img key={img} src={img} alt="evidence" className="h-40 w-56 shrink-0 rounded-lg border border-slate-200 object-cover" />)}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-600"><MapPin size={14} className="text-civic-600" /> {c.areaName} · GPS {c.gps.lat.toFixed(5)}, {c.gps.lng.toFixed(5)}</p>
            {c.description && <p className="mt-2 text-sm leading-relaxed text-slate-700">{c.description}</p>}
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
              <span>Reported {fmtDateTime(c.createdAt)}</span>
              <span>Priority: {c.priority}</span>
              {c.aiSuggestion && <span>AI signal: {c.aiSuggestion.category} ({Math.round(c.aiSuggestion.confidence * 100)}%)</span>}
            </p>
          </div>

          {c.routedTo && (
            <div className="card-p">
              <p className="flex items-center gap-2 font-bold text-slate-800"><Building2 size={16} className="text-brand-700" /> Routing explanation</p>
              <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">{c.routingExplanation}</p>
              {(c.reviewDeadlineAt || c.resolutionDeadlineAt) && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {c.reviewDeadlineAt && <div className="rounded-lg border border-slate-200 p-2.5 text-xs"><p className="flex items-center gap-1 font-semibold text-slate-600"><Clock size={12} /> Review deadline</p><p>{fmtDate(c.reviewDeadlineAt)} <span className="text-slate-400">({dLeft(c.reviewDeadlineAt)})</span></p></div>}
                  {c.resolutionDeadlineAt && <div className="rounded-lg border border-slate-200 p-2.5 text-xs"><p className="flex items-center gap-1 font-semibold text-slate-600"><CalendarClock size={12} /> Resolution deadline (SLA)</p><p>{fmtDate(c.resolutionDeadlineAt)} <span className="text-slate-400">({dLeft(c.resolutionDeadlineAt)})</span></p></div>}
                </div>
              )}
            </div>
          )}

          {c.status === 'citizen_verification' && c.resolution && (
            <div id="verify-box" className="card-p border-2 border-amber-300 bg-amber-50/60">
              <p className="font-bold text-amber-900">Has this problem actually been solved?</p>
              <img src={c.resolution.photo} alt="completion" className="mt-3 h-48 w-full rounded-lg border border-amber-200 object-cover" />
              <p className="mt-2 text-sm text-amber-900"><b>Completed:</b> {fmtDate(c.resolution.date)} — {c.resolution.details}</p>
              <div className="mt-4 flex gap-2">
                <button className="btn-primary flex-1" disabled={busy} onClick={() => confirm(true)}><CheckCircle2 size={15} /> YES, problem solved</button>
                <button className="btn-danger flex-1" disabled={busy} onClick={() => setReopen(true)}><XCircle size={15} /> NO, still broken</button>
              </div>
            </div>
          )}

          {c.status === 'closed' && (
            <div className="card-p">
              <p className="flex items-center gap-2 font-bold text-emerald-700"><CheckCircle2 size={16} /> Case closed — verified by you</p>
              {c.resolution && <p className="mt-2 text-sm text-slate-600">Completed {fmtDate(c.resolution.date)}: {c.resolution.details}</p>}
            </div>
          )}
        </div>

        <div className="space-y-5 lg:col-span-2">
          {c.status !== 'closed' && c.status !== 'citizen_verification' && !c.linkedTo && (
            <div className="card-p">
              <p className="flex items-center gap-2 font-bold text-slate-800"><Users size={16} className="text-brand-700" /> Community verification</p>
              <p className="mt-1 text-sm text-slate-600"><b>{c.community.length}</b> verified user(s) confirmed this problem.</p>
              {c.community.length > 0 && <p className="mt-1 text-xs text-slate-400">{c.community.map((x) => x.userName).join(', ')}</p>}
              <p className="mt-2 text-xs text-slate-400">Community clicks strengthen evidence but never replace official government review.</p>
            </div>
          )}
          <div className="card-p">
            <p className="mb-3 font-bold text-slate-800">Case timeline</p>
            <StatusTimeline timeline={c.timeline} />
          </div>
        </div>
      </div>

      <Modal open={reopen} onClose={() => setReopen(false)} title="Re-complaint — tell us what is still wrong">
        <p className="mb-3 text-sm text-slate-600">Your rejection reopens the case and notifies the government. For strongest evidence, also submit a fresh report from the dashboard with a new photo + GPS.</p>
        <Field label="What is still broken?">
          <textarea className="input min-h-24" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="The repair covered only half the stretch…" />
        </Field>
        <div className="mt-4 flex gap-2">
          <button className="btn-outline flex-1" onClick={() => setReopen(false)}>Cancel</button>
          <button className="btn-danger flex-1" disabled={busy || !reason.trim()} onClick={() => confirm(false, reason)}><Camera size={14} /> Reopen case</button>
        </div>
      </Modal>
    </div>
  );
}


