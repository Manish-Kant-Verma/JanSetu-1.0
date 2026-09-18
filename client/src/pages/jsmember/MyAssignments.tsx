import { useEffect, useState } from 'react';
import { PlayCircle, FileText, Send } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, EmptyState, Alert, Field, Spinner } from '../../components/ui';
import { StatusBadge } from '../../components/StatusTimeline';
import { UploadBox } from '../../components/UploadBox';
import { fmtDate, fmtDateTime } from '../../constants';
import type { Assignment } from '../../types';

export default function MyAssignments() {
  const [mine, setMine] = useState<Assignment[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [err, setErr] = useState('');

  const load = () => api.get('/assignments').then((r) => setMine(r.mine));
  useEffect(() => { load(); }, []);

  if (!mine) return <Spinner />;

  return (
    <div>
      <PageHeader title="My Assignments" sub="Site visits, fresh evidence and field reports — the ground truth layer of JanSetu." />
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}
      {mine.length === 0 ? (
        <EmptyState icon={<PlayCircle size={36} />} title="No assignments yet" sub="Accept an available assignment to begin a site visit workflow." />
      ) : (
        <div className="space-y-4">
          {mine.map((a) => <AssignmentCard key={a.id} a={a} open={openId === a.id} onOpen={() => setOpenId(openId === a.id ? null : a.id)} reload={load} setErr={setErr} />)}
        </div>
      )}
    </div>
  );
}

function AssignmentCard({ a, open, onOpen, reload, setErr }: { a: Assignment; open: boolean; onOpen: () => void; reload: () => void; setErr: (s: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [report, setReport] = useState({ condition: '', measurements: '', observations: '', probableCause: '', severity: 'medium', recommendedAction: '', requiredResources: '', trafficImpact: '', safetyConcerns: '' });
  const [result, setResult] = useState<{ correctionRequired: boolean; issues: string[] } | null>(null);
  const canVisit = a.status === 'accepted';
  const canReport = a.status === 'site_visit_started' || a.status === 'correction_required';

  const startVisit = async () => {
    setBusy(true); setErr('');
    const fallback = async () => {
      try {
        await api.post(`/assignments/${a.id}/start-visit`, { lat: a.complaint!.gps.lat + 0.0001, lng: a.complaint!.gps.lng + 0.0001 });
        setErr('Device GPS unavailable — recorded demo site GPS so the workflow can continue.');
        reload();
      } catch (e: any) { setErr(e.message); }
    };
    try {
      if (!navigator.geolocation) return await fallback();
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 }));
      await api.post(`/assignments/${a.id}/start-visit`, { lat: pos.coords.latitude, lng: pos.coords.longitude });
      reload();
    } catch { await fallback(); } finally { setBusy(false); }
  };

  const submitReport = async () => {
    setBusy(true); setErr(''); setResult(null);
    try {
      const fd = new FormData();
      images.forEach((img) => fd.append('images', img));
      Object.entries(report).forEach(([k, v]) => fd.append(k, String(v)));
      const r = await api.postForm(`/assignments/${a.id}/report`, fd);
      setResult({ correctionRequired: r.correctionRequired, issues: r.issues || [] });
      reload();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="card-p">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-bold text-brand-800">{a.id}</span>
        <StatusBadge status={a.status} cls="bg-violet-100 text-violet-800" />
        <span className="text-xs text-slate-500">{a.complaint?.id} · {a.complaint?.category} · {a.complaint?.areaName} · deadline {fmtDate(a.deadlineAt)}</span>
        <button className="btn-outline btn-sm ml-auto" onClick={onOpen}>{open ? 'Collapse' : 'Open workflow'}</button>
      </div>
      {a.reviewNote && a.status === 'correction_required' && (
        <div className="mt-3"><Alert tone="error"><b>CORRECTION REQUIRED:</b> {a.reviewNote}</Alert></div>
      )}
      {open && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          {a.complaint && (
            <div className="flex gap-3">
              <img src={a.complaint.images[0]} alt="" className="h-24 w-32 rounded-lg object-cover" />
              <div className="text-xs text-slate-600">
                <p className="text-sm font-semibold text-slate-800">Citizen report</p>
                <p className="mt-1">{a.complaint.description}</p>
                <p className="mt-1 text-slate-400">Reported GPS: {a.complaint.gps.lat.toFixed(5)}, {a.complaint.gps.lng.toFixed(5)}</p>
              </div>
            </div>
          )}
          {a.siteVisit && (
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Site visit {a.siteVisit.gpsVerified ? '— GPS verified ✓' : '— recorded'}</p>
              <p>Started {fmtDateTime(a.siteVisit.at)} at {a.siteVisit.gps.lat.toFixed(5)}, {a.siteVisit.gps.lng.toFixed(5)}</p>
            </div>
          )}
          {canVisit && (
            <button className="btn-primary" onClick={startVisit} disabled={busy}><PlayCircle size={15} /> START SITE VISIT (records GPS + timestamp)</button>
          )}

          {canReport && (
            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-800"><FileText size={15} className="text-brand-700" /> Field / technical report</p>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Existing condition *"><textarea className="input min-h-16" value={report.condition} onChange={(e) => setReport({ ...report, condition: e.target.value })} /></Field>
                <Field label="Measurements *"><textarea className="input min-h-16" value={report.measurements} onChange={(e) => setReport({ ...report, measurements: e.target.value })} placeholder="Sizes, lengths, counts…" /></Field>
                <Field label="Observations *"><textarea className="input min-h-16" value={report.observations} onChange={(e) => setReport({ ...report, observations: e.target.value })} /></Field>
                <Field label="Probable cause *"><textarea className="input min-h-16" value={report.probableCause} onChange={(e) => setReport({ ...report, probableCause: e.target.value })} /></Field>
                <Field label="Traffic impact"><input className="input" value={report.trafficImpact} onChange={(e) => setReport({ ...report, trafficImpact: e.target.value })} /></Field>
                <Field label="Safety concerns"><input className="input" value={report.safetyConcerns} onChange={(e) => setReport({ ...report, safetyConcerns: e.target.value })} /></Field>
                <Field label="Severity">
                  <select className="input" value={report.severity} onChange={(e) => setReport({ ...report, severity: e.target.value })}>
                    {['low', 'medium', 'high', 'critical'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Required resources"><input className="input" value={report.requiredResources} onChange={(e) => setReport({ ...report, requiredResources: e.target.value })} /></Field>
              </div>
              <Field label="Recommended action *"><textarea className="input min-h-16" value={report.recommendedAction} onChange={(e) => setReport({ ...report, recommendedAction: e.target.value })} /></Field>
              <div>
                <p className="label">Fresh site photographs *</p>
                <UploadBox images={images} onChange={setImages} max={5} label="Capture at site" />
              </div>
              {result && !result.correctionRequired && <Alert tone="success">Report verified by JanSetu checks — sent to the government for review.</Alert>}
              {result?.correctionRequired && <Alert tone="error">Checks failed: {result.issues.join('; ')}</Alert>}
              <button className="btn-primary" onClick={submitReport} disabled={busy}><Send size={15} /> {busy ? 'Submitting…' : 'Submit field report'}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


