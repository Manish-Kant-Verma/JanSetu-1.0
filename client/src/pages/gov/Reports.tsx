import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, EmptyState, Spinner, Field, Alert } from '../../components/ui';
import { StatusBadge } from '../../components/StatusTimeline';
import { fmtDateTime } from '../../constants';
import type { Assignment } from '../../types';

export default function GovReports() {
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => api.get('/assignments').then((r) => setAssignments(r.all));
  useEffect(() => { load(); }, []);
  if (!assignments) return <Spinner />;

  const pending = assignments.filter((a) => a.status === 'report_verified');
  const done = assignments.filter((a) => ['completed', 'correction_required'].includes(a.status) && a.report);

  const review = async (id: string, decision: string) => {
    setMsg(''); setErr('');
    try { await api.post(`/gov/assignments/${id}/review`, { decision, note }); setNote(''); setMsg(decision === 'approve' ? 'Report approved — decision pending.' : 'Corrections requested from the JS Member.'); load(); }
    catch (e: any) { setErr(e.message); }
  };

  return (
    <div>
      <PageHeader title="Technical Reports" sub="Field reports by verified JS Members — auto-checked by JanSetu, approved by you." />
      {msg && <div className="mb-4"><Alert tone="success">{msg}</Alert></div>}
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}

      {pending.length === 0 && done.length === 0 && (
        <EmptyState icon={<FileText size={36} />} title="No reports yet" sub="Request a field assessment on a complaint to receive technical reports from JS Members." />
      )}

      {pending.map((a) => (
        <div key={a.id} className="card-p mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={a.status} cls="bg-emerald-100 text-emerald-800" />
            <Link className="font-mono text-xs font-bold text-brand-800" to={`/gov/complaints/${a.complaintId}`}>{a.complaintId}</Link>
            <span className="text-xs text-slate-500">{a.complaint?.category} · {a.complaint?.areaName} · submitted {fmtDateTime(a.report!.submittedAt)}</span>
          </div>
          <div className="mt-3 grid gap-x-8 gap-y-2 text-sm text-slate-700 md:grid-cols-2">
            {[['Condition', a.report!.condition], ['Measurements', a.report!.measurements], ['Observations', a.report!.observations], ['Probable cause', a.report!.probableCause], ['Recommended action', a.report!.recommendedAction], ['Required resources', a.report!.requiredResources], ['Traffic impact', a.report!.trafficImpact], ['Safety concerns', a.report!.safetyConcerns]].map(([k, v]) => v ? <p key={k}><b className="text-xs uppercase tracking-wide text-slate-400">{k}:</b><br />{v}</p> : null)}
          </div>
          <p className="mt-2 text-sm"><b>Severity:</b> {a.report!.severity} {a.report!.gpsVerified && <span className="badge bg-emerald-100 text-emerald-800">GPS verified ✓</span>}</p>
          <div className="mt-2 flex gap-2">{a.report!.images.map((img) => <img key={img} src={img} className="h-28 w-40 rounded object-cover" alt="" />)}</div>
          <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-slate-50 p-3">
            <div className="min-w-52 flex-1"><Field label="Review note (optional)"><input className="input" value={note} onChange={(e) => setNote(e.target.value)} /></Field></div>
            <button className="btn-primary" onClick={() => review(a.id, 'approve')}><CheckCircle2 size={14} /> Approve report</button>
            <button className="btn-danger" onClick={() => review(a.id, 'correction')}><AlertTriangle size={14} /> Request corrections</button>
          </div>
        </div>
      ))}

      {done.map((a) => (
        <div key={a.id} className="card-p mb-3 opacity-90">
          <div className="flex flex-wrap items-center gap-2">
            {a.status === 'completed' ? <span className="badge bg-emerald-100 text-emerald-800">REPORT APPROVED</span> : <StatusBadge status={a.status} cls="bg-rose-100 text-rose-700" />}
            <Link className="font-mono text-xs font-bold text-brand-800" to={`/gov/complaints/${a.complaintId}`}>{a.complaintId}</Link>
            <span className="text-xs text-slate-500">{a.complaint?.category} · {fmtDateTime(a.report!.submittedAt)}</span>
          </div>
          {a.reviewNote && <p className="mt-1 text-xs text-slate-500">Note: {a.reviewNote}</p>}
          {a.status === 'completed' && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              {a.complaint && ['technical_report_approved', 'government_decision'].includes(a.complaint.status) ? (
                <>
                  <p className="mb-2 text-sm text-slate-700"><b>Next step: government decision.</b> The report is approved, but the complaint is not resolved. Choose direct government action or create a contractor project.</p>
                  <Link className="btn-primary" to={`/gov/complaints/${a.complaintId}`}>Choose next action →</Link>
                </>
              ) : <Link className="btn-outline" to={`/gov/complaints/${a.complaintId}`}>View complaint progress →</Link>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
