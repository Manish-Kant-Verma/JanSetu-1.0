import { useEffect, useState } from 'react';
import { FolderKanban, Send, CheckCircle2, Camera } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, EmptyState, Spinner, Field, Alert, ProgressBar } from '../../components/ui';
import { PROJECT_STATUS_LABEL, inr, fmtDate } from '../../constants';
import type { Project } from '../../types';

export default function ContractorProjects() {
  const [mine, setMine] = useState<Project[] | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const load = () => api.get('/projects').then((r) => setMine(r.mine));
  useEffect(() => { load(); }, []);
  if (!mine) return <Spinner />;

  return (
    <div>
      <PageHeader title="Active Projects" sub="Execution with evidence — progress updates keep the citizen and government informed." />
      {msg && <div className="mb-4"><Alert tone="success">{msg}</Alert></div>}
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}
      {mine.length === 0 ? (
        <EmptyState icon={<FolderKanban size={36} />} title="No awarded projects yet" sub="Submit competitive, well-documented bids on open opportunities." />
      ) : mine.map((p) => <ProjectCard key={p.id} p={p} reload={load} setMsg={setMsg} setErr={setErr} />)}
    </div>
  );
}

function ProjectCard({ p, reload, setMsg, setErr }: { p: Project; reload: () => void; setMsg: (s: string) => void; setErr: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(Math.min(90, (p.progress[p.progress.length - 1]?.percent ?? 0) + 15));
  const [note, setNote] = useState('');
  const [images, setImages] = useState<File[]>([]);

  const addProgress = async () => {
    setBusy(true); setErr('');
    try {
      const fd = new FormData();
      fd.append('percent', String(pct));
      fd.append('note', note);
      images.forEach((i) => fd.append('images', i));
      await api.postForm(`/projects/${p.id}/progress`, fd);
      setMsg(`Progress ${pct}% recorded — citizen and government notified.`);
      setNote(''); setImages([]); setOpen(false); reload();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };
  const complete = async () => {
    setBusy(true); setErr('');
    try { await api.post(`/projects/${p.id}/complete`, { note: 'Work completed, site handed over.' }); setMsg('Work marked complete — government will now submit resolution evidence for citizen verification.'); reload(); }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  const last = p.progress[p.progress.length - 1];
  const canWork = ['awarded', 'in_progress'].includes(p.status);

  return (
    <div className="card-p">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-bold text-brand-800">{p.code}</span>
        <span className="badge bg-orange-100 text-orange-800">{(PROJECT_STATUS_LABEL as any)[p.status]}</span>
        <span className="text-xs text-slate-500">{inr(p.budgetEstimate)} · {p.location}</span>
      </div>
      <p className="mt-1.5 font-bold text-slate-800">{p.title}</p>
      {last && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-slate-500"><span>Last update: {fmtDate(last.at)} — {last.note}</span><b>{last.percent}%</b></div>
          <ProgressBar percent={last.percent} tone="bg-orange-500" />
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {canWork && <button className="btn-outline btn-sm" onClick={() => setOpen(!open)}><Camera size={13} /> Update progress</button>}
        {canWork && <button className="btn-primary btn-sm" onClick={complete} disabled={busy}><CheckCircle2 size={13} /> Mark work complete</button>}
      </div>
      {open && canWork && (
        <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3">
          <div className="grid grid-cols-[auto,1fr] gap-3">
            <Field label="% complete"><input type="number" className="input" value={pct} onChange={(e) => setPct(Number(e.target.value))} /></Field>
            <Field label="What was done?"><input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. DPC layer laid on 120 m" /></Field>
          </div>
          <Field label="Progress photographs"><input type="file" accept="image/*" multiple className="input" onChange={(e) => setImages(Array.from(e.target.files || []))} /></Field>
          <button className="btn-primary btn-sm" onClick={addProgress} disabled={busy}><Send size={13} /> Submit progress evidence</button>
        </div>
      )}
    </div>
  );
}
