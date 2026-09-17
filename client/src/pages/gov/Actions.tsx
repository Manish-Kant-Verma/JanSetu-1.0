import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Send } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, EmptyState, Spinner, Field, ProgressBar, Alert } from '../../components/ui';
import { ACTION_STATUS_CLS, fmtDate } from '../../constants';
import type { GovAction } from '../../types';

export default function GovActions() {
  const [actions, setActions] = useState<{ action: GovAction; complaint: any }[] | null>(null);
  const [note, setNote] = useState('');
  const [pct, setPct] = useState(25);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/complaints').then((r) => {
      const withAction = (r.complaints as any[]).filter((c: any) => c.actionId);
      Promise.all(withAction.map((c: any) => api.get(`/complaints/${c.id}`)))
        .then((details) => setActions(details.map((d: any) => ({ action: d.action, complaint: d.complaint })).filter((x) => x.action)));
    });
  }, []);

  const addProgress = async (id: string) => {
    setMsg(''); setErr('');
    try { await api.post(`/gov/actions/${id}/progress`, { percent: pct, note }); setNote(''); setMsg('Progress recorded — citizen notified.'); location.reload(); }
    catch (e: any) { setErr(e.message); }
  };

  if (!actions) return <Spinner />;
  return (
    <div>
      <PageHeader title="Actions & Resolutions" sub="Government work orders created from decisions — track progress, submit resolution evidence." />
      {msg && <div className="mb-4"><Alert tone="success">{msg}</Alert></div>}
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}
      {actions.length === 0 ? (
        <EmptyState icon={<Landmark size={36} />} title="No actions yet" sub="Review a complaint and choose a decision path to create an action." />
      ) : actions.map(({ action: a, complaint: c }) => (
        <div key={a.id} className="card-p mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-brand-800">{a.id}</span>
            <span className={`badge ${ACTION_STATUS_CLS[a.status] || 'bg-slate-100'}`}>{a.status.replace(/_/g, ' ').toUpperCase()}</span>
            <span className="badge bg-slate-100 text-slate-600">{a.type.replace(/_/g, ' ')}</span>
            <span className="text-xs text-slate-500">deadline {fmtDate(a.deadlineAt)}</span>
            <Link className="link ml-auto text-xs" to={`/gov/complaints/${c.id}`}>Open case {c.id}</Link>
          </div>
          <p className="mt-1.5 text-sm font-medium text-slate-800">{a.title}</p>
          <p className="text-xs text-slate-500">{a.details}</p>
          {a.progress.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {a.progress.map((p, i) => (
                <div key={i} className="text-xs text-slate-600">
                  <div className="flex justify-between"><span>{fmtDate(p.at)} — {p.note || 'update'}</span><b>{p.percent}%</b></div>
                  <ProgressBar percent={p.percent} />
                </div>
              ))}
            </div>
          )}
          {!['completed', 'resolution_submitted'].includes(a.status) && (
            <div className="mt-3 flex items-end gap-2">
              <div className="flex-1"><Field label="Progress note"><input className="input" value={note} onChange={(e) => setNote(e.target.value)} /></Field></div>
              <div className="w-24"><Field label="%"><input type="number" className="input" value={pct} onChange={(e) => setPct(Number(e.target.value))} /></Field></div>
              <button className="btn-primary" onClick={() => addProgress(a.id)}><Send size={14} /> Update</button>
            </div>
          )}
          {a.status !== 'completed' && <p className="mt-2 text-xs text-slate-400">To close the loop, open the case and submit resolution evidence (photo + date + details) → citizen verifies.</p>}
        </div>
      ))}
    </div>
  );
}
