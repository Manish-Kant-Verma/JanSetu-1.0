import { useEffect, useState } from 'react';
import { Briefcase, Send } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, EmptyState, Spinner, Field, Alert, Modal, ProgressBar } from '../../components/ui';
import { inr, fmtDate } from '../../constants';
import type { Project } from '../../types';

export default function Opportunities() {
  const [open, setOpen] = useState<Project[] | null>(null);
  const [bidFor, setBidFor] = useState<Project | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => api.get('/projects').then((r) => setOpen(r.open));
  useEffect(() => { load(); }, []);
  if (!open) return <Spinner />;

  return (
    <div>
      <PageHeader title="Opportunities" sub="Projects published by government with eligibility criteria and bid deadlines. Selection follows applicable procurement rules." />
      {msg && <div className="mb-4"><Alert tone="success">{msg}</Alert></div>}
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}
      {open.length === 0 ? (
        <EmptyState icon={<Briefcase size={36} />} title="No open projects right now" sub="When government creates a contractor project, it appears here with full technical scope." />
      ) : (
        <div className="space-y-3">
          {open.map((p) => (
            <div key={p.id} className="card-p">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-800">{p.code}</span>
                <span className="badge bg-amber-100 text-amber-800">BID DEADLINE {fmtDate(p.bidDeadlineAt)} {p.daysLeft != null && `(${p.daysLeft}d left)`}</span>
                <span className="badge bg-slate-100 text-slate-600">{p.category}</span>
                {p.complaint && <span className="text-xs text-slate-400">from case {p.complaint.id}</span>}
              </div>
              <p className="mt-2 font-bold text-slate-800">{p.title}</p>
              <p className="mt-1 text-sm text-slate-600">{p.scope}</p>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                <span>Budget estimate: <b>{inr(p.budgetEstimate)}</b></span>
                <span>Location: {p.location}</span>
                <span>GPS: {p.gps.lat.toFixed(4)}, {p.gps.lng.toFixed(4)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Eligibility: {p.eligibility}</p>
              <p className="mt-1 text-xs text-slate-400">Documents: {p.documents.join(', ')}</p>
              <button className="btn-primary btn-sm mt-3" onClick={() => setBidFor(p)}><Send size={13} /> Submit bid</button>
            </div>
          ))}
        </div>
      )}

      <BidModal project={bidFor} onClose={() => setBidFor(null)} onDone={() => { setBidFor(null); setMsg('Bid submitted — the government evaluates according to the applicable procurement procedure.'); load(); }} />
    </div>
  );
}

function BidModal({ project, onClose, onDone }: { project: Project | null; onClose: () => void; onDone: () => void }) {
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('30');
  const [proposal, setProposal] = useState('');
  const [docs, setDocs] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { if (project) { setAmount(String(project.budgetEstimate)); setErr(''); } }, [project]);
  if (!project) return null;
  const submit = async () => {
    setBusy(true); setErr('');
    try {
      const fd = new FormData();
      fd.append('amount', amount);
      fd.append('timelineDays', days);
      fd.append('proposal', proposal);
      docs.forEach((d) => fd.append('documents', d));
      await api.postForm(`/projects/${project.id}/bid`, fd);
      onDone();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={`Bid — ${project.code}`}>
      <p className="text-sm text-slate-600">{project.title}</p>
      <ProgressBar percent={60} />
      <div className="mt-3 space-y-3">
        {err && <Alert tone="error">{err}</Alert>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bid amount (₹) *"><input type="number" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          <Field label="Completion timeline (days)"><input type="number" className="input" value={days} onChange={(e) => setDays(e.target.value)} /></Field>
        </div>
        <Field label="Technical proposal"><textarea className="input min-h-24" value={proposal} onChange={(e) => setProposal(e.target.value)} placeholder="Method, materials, quality plan, warranty…" /></Field>
        <Field label="Supporting documents (optional)"><input type="file" multiple className="input" onChange={(e) => setDocs(Array.from(e.target.files || []))} /></Field>
        <button className="btn-primary w-full" onClick={submit} disabled={busy || !amount}>{busy ? 'Submitting…' : 'Submit bid'}</button>
      </div>
    </Modal>
  );
}
