<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Gavel, Wrench, HardHat, Camera, Send, MapPin, Users, Sparkles, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, Alert, Field, Spinner, ProgressBar } from '../../components/ui';
import { StatusTimeline, StatusBadge } from '../../components/StatusTimeline';
import { fmtDate, fmtDateTime, inr } from '../../constants';
import type { Complaint, Assignment, GovAction, Project } from '../../types';

export default function GovReview() {
  const { id } = useParams();
  const [data, setData] = useState<{ complaint: Complaint; assignment: Assignment | null; action: GovAction | null; project: Project | null; linkedEvidence: string[] } | null>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [panel, setPanel] = useState<'' | 'direct' | 'field' | 'contractor' | 'resolve'>('');
  const [form, setForm] = useState<any>({});
  const [approving, setApproving] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  const load = () => api.get(`/complaints/${id}`).then(setData).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id]);
  if (err && !data) return <Alert tone="error">{err}</Alert>;
  if (!data) return <Spinner />;
  const { complaint: c } = data;

  const act = async (fn: () => Promise<any>, okMsg: string) => {
    setErr(''); setMsg('');
    try { await fn(); setMsg(okMsg); setPanel(''); load(); } catch (e: any) { setErr(e.message); }
  };

  const decide = (decision: string, extra: any = {}) =>
    act(() => api.post(`/complaints/${c.id}/decision`, { decision, ...extra }),
      decision === 'direct' ? 'Direct government action created — citizen notified.' :
      decision === 'field' ? 'Field assessment requested — assignment published to eligible JS Members.' :
      'Contractor project created — bid window is open.');

  const reviewReport = (decision: string) =>
    act(() => api.post(`/gov/assignments/${data.assignment!.id}/review`, { decision, note: form.reviewNote }), decision === 'approve' ? 'Technical report approved.' : 'Corrections requested from the JS Member.');

  const canApprove = ['submitted', 'under_review', 'verification_required', 'community_verification', 'verified'].includes(c.status);
  const approveComplaint = async () => {
    setApproving(true);
    setErr(''); setMsg('');
    try {
      await api.post(`/complaints/${c.id}/approve`, { note: approvalNote });
      await load();
      setMsg('Complaint approved and forwarded. Choose the next action below.');
    } catch (e: any) { setErr(e.message); } finally { setApproving(false); }
  };
  const canDecide = ['report_review', 'technical_report_approved', 'government_decision', 'forwarded_to_government', 'reopened'].includes(c.status);
  const canResolve = ['government_direct_action', 'work_in_progress', 'reopened', 'technical_report_approved'].includes(c.status);

  return (
    <div>
      <PageHeader title={`Case review — ${c.id}`} sub={`${c.category} · ${c.areaName} · reported ${fmtDateTime(c.createdAt)}`}
        right={<Link to="/gov/complaints" className="btn-outline">Back to queue</Link>} />

      {msg && <div className="mb-4"><Alert tone="success">{msg}</Alert></div>}
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}
      {c.overdueFlags.length > 0 && <div className="mb-4"><Alert tone="warn"><b>OVERDUE</b> — deadlines crossed. Escalation applies per configured administrative process.</Alert></div>}

      {canApprove && (
        <div className="card-p mb-5 border-brand-200 bg-brand-50">
          <h2 className="flex items-center gap-2 font-bold text-slate-800"><CheckCircle2 size={18} /> Approve complaint & forward</h2>
          <p className="mt-1 text-sm text-slate-600">Review the photo, location and description below. Approval forwards this complaint for further action; it does not mark the problem resolved.</p>
          <p className="mt-2 text-sm"><b>Forward to:</b> {c.routedTo ? `${c.routedTo.orgName} — ${c.routedTo.department}` : 'No department assigned. Routing is required before approval.'}</p>
          <div className="mt-3"><Field label="Approval note (optional)"><textarea className="input" maxLength={2000} value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)} /></Field></div>
          <button className="btn-primary mt-3" disabled={approving || !c.routedTo} onClick={approveComplaint}><Send size={15} /> {approving ? 'Approving…' : 'Approve complaint & forward'}</button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <div className="card-p">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={c.status} />
              {c.priority === 'high' && <span className="badge bg-rose-100 text-rose-700">HIGH PRIORITY</span>}
              <span className="badge bg-slate-100 text-slate-600">{c.category}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto">{c.images.map((img) => <img key={img} src={img} alt="" className="h-44 w-60 shrink-0 rounded-lg border border-slate-200 object-cover" />)}</div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{c.description}</p>
            <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
              <p className="flex items-center gap-1.5"><MapPin size={13} className="text-civic-600" /> {c.areaName} · {c.gps.lat.toFixed(5)}, {c.gps.lng.toFixed(5)}</p>
              <p className="flex items-center gap-1.5"><Users size={13} className="text-brand-700" /> {c.community.length} community confirmation(s)</p>
            </div>
          </div>

          {c.aiSuggestion && (
            <div className="card-p">
              <p className="flex items-center gap-2 font-bold text-slate-800"><Sparkles size={15} className="text-civic-600" /> JanSetu AI signal</p>
              <p className="mt-1.5 text-sm text-slate-700">Suggested category: <b>{c.aiSuggestion.category}</b> ({Math.round(c.aiSuggestion.confidence * 100)}% confidence) — a recommendation only; the official decision remains yours.</p>
              <ul className="mt-1.5 list-inside list-disc text-xs text-slate-400">{c.aiSuggestion.signals.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          )}

          {c.routingExplanation && (
            <div className="card-p">
              <p className="font-bold text-slate-800">Routing explanation</p>
              <p className="mt-1.5 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{c.routingExplanation}</p>
            </div>
          )}

          {data.assignment?.report && (
            <div className="card-p">
              <p className="flex items-center gap-2 font-bold text-slate-800"><Wrench size={15} className="text-violet-600" /> JS Member field report <span className="text-xs font-normal text-slate-400">({data.assignment.id})</span></p>
              <div className="mt-2 grid gap-x-6 gap-y-1.5 text-sm text-slate-700 sm:grid-cols-2">
                {[['Condition', data.assignment.report.condition], ['Measurements', data.assignment.report.measurements], ['Observations', data.assignment.report.observations], ['Probable cause', data.assignment.report.probableCause], ['Recommended action', data.assignment.report.recommendedAction], ['Required resources', data.assignment.report.requiredResources], ['Traffic impact', data.assignment.report.trafficImpact], ['Safety concerns', data.assignment.report.safetyConcerns]].map(([k, v]) => v ? <p key={k}><b className="text-xs uppercase tracking-wide text-slate-400">{k}:</b><br />{v}</p> : null)}
              </div>
              <p className="mt-2 text-sm"><b>Severity:</b> {data.assignment.report.severity} {data.assignment.report.gpsVerified && <span className="badge bg-emerald-100 text-emerald-800">GPS verified ✓</span>}</p>
              <div className="mt-2 flex gap-2">{data.assignment.report.images.map((img) => <img key={img} src={img} className="h-24 w-32 rounded object-cover" alt="" />)}</div>
              {data.assignment.status === 'report_verified' && (
                <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-violet-50 p-3">
                  <div className="flex-1"><Field label="Review note (optional)"><input className="input" value={form.reviewNote || ''} onChange={(e) => setForm({ ...form, reviewNote: e.target.value })} /></Field></div>
                  <button className="btn-primary" onClick={() => reviewReport('approve')}><CheckCircle2 size={14} /> Approve report</button>
                  <button className="btn-danger" onClick={() => reviewReport('correction')}><XCircle size={14} /> Request corrections</button>
                </div>
              )}
            </div>
          )}

          {/* Decision panel */}
          {canDecide && (
            <div className="card-p">
              <p className="flex items-center gap-2 font-bold text-slate-800"><Gavel size={16} className="text-brand-700" /> Government decision</p>
              <p className="mt-1 text-xs text-slate-500">{['technical_report_approved', 'government_decision'].includes(c.status) ? 'Next step: choose direct government action or create a contractor project. Report approval does not close the complaint; completion evidence and citizen verification still follow.' : 'Is field/technical assessment required? How should this be solved?'}</p>
              <div className="mt-3 space-y-2">
                <button className="btn-outline w-full justify-start" onClick={() => setPanel(panel === 'direct' ? '' : 'direct')}><CheckCircle2 size={15} /> Path A — direct action with existing resources</button>
                <button className="btn-outline w-full justify-start" onClick={() => setPanel(panel === 'field' ? '' : 'field')}><Wrench size={15} /> Path B — request JS Member field assessment</button>
                <button className="btn-outline w-full justify-start" onClick={() => setPanel(panel === 'contractor' ? '' : 'contractor')}><HardHat size={15} /> Path C — contractor project & procurement</button>
                <button className="btn-outline w-full justify-start" onClick={() => setPanel(panel === 'resolve' ? '' : 'resolve')}><Camera size={15} /> Work already done — submit resolution evidence</button>
              </div>

              {panel === 'direct' && (
                <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3">
                  <Field label="Action title"><input className="input" placeholder="e.g. Pothole repair with municipal crew" onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
                  <Field label="Details"><textarea className="input min-h-16" onChange={(e) => setForm({ ...form, details: e.target.value })} /></Field>
                  <Field label="Deadline (days from now)"><input type="number" className="input" defaultValue={7} onChange={(e) => setForm({ ...form, deadlineDays: e.target.value })} /></Field>
                  <button className="btn-primary w-full" onClick={() => decide('direct', form)}>Create government action</button>
                </div>
              )}

              {panel === 'field' && (
                <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3">
                  <Field label="Why is ground verification needed?"><textarea className="input min-h-16" onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Need exact measurements / cause confirmation before estimate…" /></Field>
                  <Field label="Assignment deadline (days)"><input type="number" className="input" defaultValue={2} onChange={(e) => setForm({ ...form, deadlineDays: e.target.value })} /></Field>
                  <button className="btn-primary w-full" onClick={() => decide('field', form)}>Publish to eligible JS Members</button>
                </div>
              )}

              {panel === 'contractor' && (
                <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3">
                  <Field label="Project title"><input className="input" placeholder="e.g. Road restoration — 200 m Bhawarkuan" onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
                  <Field label="Scope of work"><textarea className="input min-h-16" onChange={(e) => setForm({ ...form, scope: e.target.value })} /></Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Budget estimate (₹)"><input type="number" className="input" onChange={(e) => setForm({ ...form, budget: e.target.value })} /></Field>
                    <Field label="Bid deadline (days)"><input type="number" className="input" defaultValue={7} onChange={(e) => setForm({ ...form, bidDays: e.target.value })} /></Field>
                  </div>
                  <Field label="Eligibility criteria"><input className="input" onChange={(e) => setForm({ ...form, eligibility: e.target.value })} placeholder="Registered contractors, GST, category…" /></Field>
                  <button className="btn-primary w-full" onClick={() => decide('contractor', form)}>Create project & open bidding</button>
                  <p className="text-[11px] text-slate-400">JanSetu provides the digital project record and bid management. The official procurement decision remains with government under applicable rules.</p>
                </div>
              )}

              {panel === 'resolve' && <ResolvePanel onDone={() => { setMsg('Resolution submitted — now awaiting citizen verification.'); setPanel(''); load(); }} complaintId={c.id} />}
            </div>
          )}

          {!canDecide && canResolve && (
            <div className="card-p">
              <p className="flex items-center gap-2 font-bold text-slate-800"><Camera size={16} className="text-brand-700" /> Submit resolution evidence</p>
              <p className="mt-1 text-xs text-slate-500">Completion photo + date + work details → then the citizen verifies.</p>
              <div className="mt-3"><ResolvePanel onDone={() => { setMsg('Resolution submitted — now awaiting citizen verification.'); load(); }} complaintId={c.id} /></div>
            </div>
          )}

          {data.action && (
            <div className="card-p">
              <p className="font-bold text-slate-800">Government action</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{data.action.title}</p>
              <p className="text-xs text-slate-500">{data.action.type.replace(/_/g, ' ')} · deadline {fmtDate(data.action.deadlineAt)}</p>
              {data.action.progress.length > 0 && (
                <div className="mt-2 space-y-2">
                  {data.action.progress.map((p, i) => (
                    <div key={i} className="text-xs text-slate-600">
                      <div className="flex justify-between"><span>{fmtDate(p.at)} — {p.note}</span><b>{p.percent}%</b></div>
                      <ProgressBar percent={p.percent} />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-end gap-2">
                <div className="flex-1"><Field label="Add progress note"><input className="input" placeholder="Crew deployed…" onChange={(e) => setForm({ ...form, progNote: e.target.value })} /></Field></div>
                <div className="w-24"><Field label="%"><input type="number" className="input" defaultValue={25} onChange={(e) => setForm({ ...form, progPct: e.target.value })} /></Field></div>
                <button className="btn-primary" onClick={() => act(() => api.post(`/gov/actions/${data.action!.id}/progress`, { percent: form.progPct, note: form.progNote }), 'Progress recorded.')}>Add</button>
              </div>
            </div>
          )}

          {data.project && (
            <div className="card-p">
              <p className="font-bold text-slate-800">Linked project</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{data.project.code} — {data.project.title}</p>
              <p className="text-xs text-slate-500">Budget {inr(data.project.budgetEstimate)} · bids {data.project.bids?.length ?? 0} · status {data.project.status.replace(/_/g, ' ')}</p>
              <Link to="/gov/projects" className="link mt-1 inline-block text-xs">Manage in Projects & Bids →</Link>
            </div>
          )}

          <div className="card-p">
            <p className="mb-3 font-bold text-slate-800">Case timeline</p>
            <StatusTimeline timeline={c.timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResolvePanel({ complaintId, onDone }: { complaintId: string; onDone: () => void }) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [details, setDetails] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const submit = async () => {
    setBusy(true); setErr('');
    try {
      const fd = new FormData();
      if (photo) fd.append('photo', photo);
      fd.append('details', details);
      fd.append('date', date);
      await api.postForm(`/complaints/${complaintId}/resolve`, fd);
      onDone();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-2">
      {err && <Alert tone="error">{err}</Alert>}
      <input type="file" accept="image/*" capture="environment" className="input" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
      <Field label="Completion date"><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      <Field label="Work details"><textarea className="input min-h-16" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="What was done, materials, measurements…" /></Field>
      <button className="btn-primary w-full" onClick={submit} disabled={busy || !photo}><Send size={14} /> Submit resolution evidence</button>
    </div>
  );
}



=======
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Gavel, Wrench, HardHat, Camera, Send, MapPin, Users, Sparkles, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, Alert, Field, Spinner, ProgressBar } from '../../components/ui';
import { StatusTimeline, StatusBadge } from '../../components/StatusTimeline';
import { fmtDate, fmtDateTime, inr } from '../../constants';
import type { Complaint, Assignment, GovAction, Project } from '../../types';

export default function GovReview() {
  const { id } = useParams();
  const [data, setData] = useState<{ complaint: Complaint; assignment: Assignment | null; action: GovAction | null; project: Project | null; linkedEvidence: string[] } | null>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [panel, setPanel] = useState<'' | 'direct' | 'field' | 'contractor' | 'resolve'>('');
  const [form, setForm] = useState<any>({});

  const load = () => api.get(`/complaints/${id}`).then(setData).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id]);
  if (err) return <Alert tone="error">{err}</Alert>;
  if (!data) return <Spinner />;
  const { complaint: c } = data;

  const act = async (fn: () => Promise<any>, okMsg: string) => {
    setErr(''); setMsg('');
    try { await fn(); setMsg(okMsg); setPanel(''); load(); } catch (e: any) { setErr(e.message); }
  };

  const decide = (decision: string, extra: any = {}) =>
    act(() => api.post(`/complaints/${c.id}/decision`, { decision, ...extra }),
      decision === 'direct' ? 'Direct government action created — citizen notified.' :
      decision === 'field' ? 'Field assessment requested — assignment published to eligible JS Members.' :
      'Contractor project created — bid window is open.');

  const reviewReport = (decision: string) =>
    act(() => api.post(`/gov/assignments/${data.assignment!.id}/review`, { decision, note: form.reviewNote }), decision === 'approve' ? 'Technical report approved.' : 'Corrections requested from the JS Member.');

  const canDecide = ['report_review', 'technical_report_approved', 'government_decision', 'verified', 'forwarded_to_government', 'reopened'].includes(c.status);
  const canResolve = ['government_direct_action', 'work_in_progress', 'reopened', 'technical_report_approved'].includes(c.status);

  return (
    <div>
      <PageHeader title={`Case review — ${c.id}`} sub={`${c.category} · ${c.areaName} · reported ${fmtDateTime(c.createdAt)}`}
        right={<Link to="/gov/complaints" className="btn-outline">Back to queue</Link>} />

      {msg && <div className="mb-4"><Alert tone="success">{msg}</Alert></div>}
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}
      {c.overdueFlags.length > 0 && <div className="mb-4"><Alert tone="warn"><b>OVERDUE</b> — deadlines crossed. Escalation applies per configured administrative process.</Alert></div>}

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <div className="card-p">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={c.status} />
              {c.priority === 'high' && <span className="badge bg-rose-100 text-rose-700">HIGH PRIORITY</span>}
              <span className="badge bg-slate-100 text-slate-600">{c.category}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto">{c.images.map((img) => <img key={img} src={img} alt="" className="h-44 w-60 shrink-0 rounded-lg border border-slate-200 object-cover" />)}</div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{c.description}</p>
            <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
              <p className="flex items-center gap-1.5"><MapPin size={13} className="text-civic-600" /> {c.areaName} · {c.gps.lat.toFixed(5)}, {c.gps.lng.toFixed(5)}</p>
              <p className="flex items-center gap-1.5"><Users size={13} className="text-brand-700" /> {c.community.length} community confirmation(s)</p>
            </div>
          </div>

          {c.aiSuggestion && (
            <div className="card-p">
              <p className="flex items-center gap-2 font-bold text-slate-800"><Sparkles size={15} className="text-civic-600" /> JanSetu AI signal</p>
              <p className="mt-1.5 text-sm text-slate-700">Suggested category: <b>{c.aiSuggestion.category}</b> ({Math.round(c.aiSuggestion.confidence * 100)}% confidence) — a recommendation only; the official decision remains yours.</p>
              <ul className="mt-1.5 list-inside list-disc text-xs text-slate-400">{c.aiSuggestion.signals.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          )}

          {c.routingExplanation && (
            <div className="card-p">
              <p className="font-bold text-slate-800">Routing explanation</p>
              <p className="mt-1.5 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{c.routingExplanation}</p>
            </div>
          )}

          {data.assignment?.report && (
            <div className="card-p">
              <p className="flex items-center gap-2 font-bold text-slate-800"><Wrench size={15} className="text-violet-600" /> JS Member field report <span className="text-xs font-normal text-slate-400">({data.assignment.id})</span></p>
              <div className="mt-2 grid gap-x-6 gap-y-1.5 text-sm text-slate-700 sm:grid-cols-2">
                {[['Condition', data.assignment.report.condition], ['Measurements', data.assignment.report.measurements], ['Observations', data.assignment.report.observations], ['Probable cause', data.assignment.report.probableCause], ['Recommended action', data.assignment.report.recommendedAction], ['Required resources', data.assignment.report.requiredResources], ['Traffic impact', data.assignment.report.trafficImpact], ['Safety concerns', data.assignment.report.safetyConcerns]].map(([k, v]) => v ? <p key={k}><b className="text-xs uppercase tracking-wide text-slate-400">{k}:</b><br />{v}</p> : null)}
              </div>
              <p className="mt-2 text-sm"><b>Severity:</b> {data.assignment.report.severity} {data.assignment.report.gpsVerified && <span className="badge bg-emerald-100 text-emerald-800">GPS verified ✓</span>}</p>
              <div className="mt-2 flex gap-2">{data.assignment.report.images.map((img) => <img key={img} src={img} className="h-24 w-32 rounded object-cover" alt="" />)}</div>
              {data.assignment.status === 'report_verified' && (
                <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-violet-50 p-3">
                  <div className="flex-1"><Field label="Review note (optional)"><input className="input" value={form.reviewNote || ''} onChange={(e) => setForm({ ...form, reviewNote: e.target.value })} /></Field></div>
                  <button className="btn-primary" onClick={() => reviewReport('approve')}><CheckCircle2 size={14} /> Approve report</button>
                  <button className="btn-danger" onClick={() => reviewReport('correction')}><XCircle size={14} /> Request corrections</button>
                </div>
              )}
            </div>
          )}

          {/* Decision panel */}
          {canDecide && (
            <div className="card-p">
              <p className="flex items-center gap-2 font-bold text-slate-800"><Gavel size={16} className="text-brand-700" /> Government decision</p>
              <p className="mt-1 text-xs text-slate-500">Is field/technical assessment required? How should this be solved?</p>
              <div className="mt-3 space-y-2">
                <button className="btn-outline w-full justify-start" onClick={() => setPanel(panel === 'direct' ? '' : 'direct')}><CheckCircle2 size={15} /> Path A — direct action with existing resources</button>
                <button className="btn-outline w-full justify-start" onClick={() => setPanel(panel === 'field' ? '' : 'field')}><Wrench size={15} /> Path B — request JS Member field assessment</button>
                <button className="btn-outline w-full justify-start" onClick={() => setPanel(panel === 'contractor' ? '' : 'contractor')}><HardHat size={15} /> Path C — contractor project & procurement</button>
                <button className="btn-outline w-full justify-start" onClick={() => setPanel(panel === 'resolve' ? '' : 'resolve')}><Camera size={15} /> Work already done — submit resolution evidence</button>
              </div>

              {panel === 'direct' && (
                <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3">
                  <Field label="Action title"><input className="input" placeholder="e.g. Pothole repair with municipal crew" onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
                  <Field label="Details"><textarea className="input min-h-16" onChange={(e) => setForm({ ...form, details: e.target.value })} /></Field>
                  <Field label="Deadline (days from now)"><input type="number" className="input" defaultValue={7} onChange={(e) => setForm({ ...form, deadlineDays: e.target.value })} /></Field>
                  <button className="btn-primary w-full" onClick={() => decide('direct', form)}>Create government action</button>
                </div>
              )}

              {panel === 'field' && (
                <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3">
                  <Field label="Why is ground verification needed?"><textarea className="input min-h-16" onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Need exact measurements / cause confirmation before estimate…" /></Field>
                  <Field label="Assignment deadline (days)"><input type="number" className="input" defaultValue={2} onChange={(e) => setForm({ ...form, deadlineDays: e.target.value })} /></Field>
                  <button className="btn-primary w-full" onClick={() => decide('field', form)}>Publish to eligible JS Members</button>
                </div>
              )}

              {panel === 'contractor' && (
                <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3">
                  <Field label="Project title"><input className="input" placeholder="e.g. Road restoration — 200 m Bhawarkuan" onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
                  <Field label="Scope of work"><textarea className="input min-h-16" onChange={(e) => setForm({ ...form, scope: e.target.value })} /></Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Budget estimate (₹)"><input type="number" className="input" onChange={(e) => setForm({ ...form, budget: e.target.value })} /></Field>
                    <Field label="Bid deadline (days)"><input type="number" className="input" defaultValue={7} onChange={(e) => setForm({ ...form, bidDays: e.target.value })} /></Field>
                  </div>
                  <Field label="Eligibility criteria"><input className="input" onChange={(e) => setForm({ ...form, eligibility: e.target.value })} placeholder="Registered contractors, GST, category…" /></Field>
                  <button className="btn-primary w-full" onClick={() => decide('contractor', form)}>Create project & open bidding</button>
                  <p className="text-[11px] text-slate-400">JanSetu provides the digital project record and bid management. The official procurement decision remains with government under applicable rules.</p>
                </div>
              )}

              {panel === 'resolve' && <ResolvePanel onDone={() => { setMsg('Resolution submitted — now awaiting citizen verification.'); setPanel(''); load(); }} complaintId={c.id} />}
            </div>
          )}

          {!canDecide && canResolve && (
            <div className="card-p">
              <p className="flex items-center gap-2 font-bold text-slate-800"><Camera size={16} className="text-brand-700" /> Submit resolution evidence</p>
              <p className="mt-1 text-xs text-slate-500">Completion photo + date + work details → then the citizen verifies.</p>
              <div className="mt-3"><ResolvePanel onDone={() => { setMsg('Resolution submitted — now awaiting citizen verification.'); load(); }} complaintId={c.id} /></div>
            </div>
          )}

          {data.action && (
            <div className="card-p">
              <p className="font-bold text-slate-800">Government action</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{data.action.title}</p>
              <p className="text-xs text-slate-500">{data.action.type.replace(/_/g, ' ')} · deadline {fmtDate(data.action.deadlineAt)}</p>
              {data.action.progress.length > 0 && (
                <div className="mt-2 space-y-2">
                  {data.action.progress.map((p, i) => (
                    <div key={i} className="text-xs text-slate-600">
                      <div className="flex justify-between"><span>{fmtDate(p.at)} — {p.note}</span><b>{p.percent}%</b></div>
                      <ProgressBar percent={p.percent} />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-end gap-2">
                <div className="flex-1"><Field label="Add progress note"><input className="input" placeholder="Crew deployed…" onChange={(e) => setForm({ ...form, progNote: e.target.value })} /></Field></div>
                <div className="w-24"><Field label="%"><input type="number" className="input" defaultValue={25} onChange={(e) => setForm({ ...form, progPct: e.target.value })} /></Field></div>
                <button className="btn-primary" onClick={() => act(() => api.post(`/gov/actions/${data.action!.id}/progress`, { percent: form.progPct, note: form.progNote }), 'Progress recorded.')}>Add</button>
              </div>
            </div>
          )}

          {data.project && (
            <div className="card-p">
              <p className="font-bold text-slate-800">Linked project</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{data.project.code} — {data.project.title}</p>
              <p className="text-xs text-slate-500">Budget {inr(data.project.budgetEstimate)} · bids {data.project.bids?.length ?? 0} · status {data.project.status.replace(/_/g, ' ')}</p>
              <Link to="/gov/projects" className="link mt-1 inline-block text-xs">Manage in Projects & Bids →</Link>
            </div>
          )}

          <div className="card-p">
            <p className="mb-3 font-bold text-slate-800">Case timeline</p>
            <StatusTimeline timeline={c.timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResolvePanel({ complaintId, onDone }: { complaintId: string; onDone: () => void }) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [details, setDetails] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const submit = async () => {
    setBusy(true); setErr('');
    try {
      const fd = new FormData();
      if (photo) fd.append('photo', photo);
      fd.append('details', details);
      fd.append('date', date);
      await api.postForm(`/complaints/${complaintId}/resolve`, fd);
      onDone();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-2">
      {err && <Alert tone="error">{err}</Alert>}
      <input type="file" accept="image/*" capture="environment" className="input" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
      <Field label="Completion date"><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      <Field label="Work details"><textarea className="input min-h-16" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="What was done, materials, measurements…" /></Field>
      <button className="btn-primary w-full" onClick={submit} disabled={busy || !photo}><Send size={14} /> Submit resolution evidence</button>
    </div>
  );
}



>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
