<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Award } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, EmptyState, Spinner, Field, Alert } from '../../components/ui';
import { PROJECT_STATUS_CLS, BID_STATUS_CLS, PROJECT_STATUS_LABEL, inr, fmtDate } from '../../constants';
import type { Project } from '../../types';

export default function GovProjects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => api.get('/projects').then((r) => setProjects(r.all));
  useEffect(() => { load(); }, []);
  if (!projects) return <Spinner />;

  const award = async (projectId: string, bidId: string) => {
    setMsg(''); setErr('');
    try { await api.post(`/projects/${projectId}/award`, { bidId }); setMsg('Bid awarded — contractor notified, work order active.'); load(); }
    catch (e: any) { setErr(e.message); }
  };

  return (
    <div>
      <PageHeader title="Projects & Bids" sub="Digital project records with bid management and audit trail. Selection follows applicable procurement rules — JanSetu never sells tenders." />
      {msg && <div className="mb-4"><Alert tone="success">{msg}</Alert></div>}
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}
      {projects.length === 0 ? (
        <EmptyState icon={<FolderKanban size={36} />} title="No projects yet" sub="Choose the contractor path on a reviewed complaint to create a project." />
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div key={p.id} className="card-p">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-800">{p.code}</span>
                <span className={`badge ${PROJECT_STATUS_CLS[p.status]}`}>{(PROJECT_STATUS_LABEL as any)[p.status] || p.status}</span>
                {p.status === 'open_bidding' && <span className="badge bg-amber-100 text-amber-800">bid deadline {fmtDate(p.bidDeadlineAt)} {p.daysLeft != null && `(${p.daysLeft}d)`}</span>}
                {p.complaint && <Link className="link text-xs" to={`/gov/complaints/${p.complaint.id}`}>case {p.complaint.id}</Link>}
              </div>
              <p className="mt-2 text-sm font-bold text-slate-800">{p.title}</p>
              <p className="text-xs text-slate-500">{p.scope}</p>
              <p className="mt-1 text-xs text-slate-500">Budget {inr(p.budgetEstimate)} · Location {p.location} · Eligibility: {p.eligibility}</p>

              {p.bids && p.bids.length > 0 && (
                <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full min-w-[560px]">
                    <thead className="bg-slate-50"><tr><th className="th">Bid</th><th className="th">Contractor</th><th className="th">Amount</th><th className="th">Timeline</th><th className="th">Proposal</th><th className="th">Status</th><th className="th"></th></tr></thead>
                    <tbody>
                      {p.bids.map((b) => (
                        <tr key={b.id} className="border-t border-slate-100">
                          <td className="td font-mono text-xs">{b.id}</td>
                          <td className="td">{b.contractorName}</td>
                          <td className="td font-semibold">{inr(b.amount)}</td>
                          <td className="td">{b.timelineDays} days</td>
                          <td className="td max-w-64 text-xs">{b.proposal}</td>
                          <td className="td"><span className={`badge ${BID_STATUS_CLS[b.status]}`}>{b.status}</span></td>
                          <td className="td">{(p.status === 'open_bidding' || p.status === 'evaluation') && b.status === 'submitted' && (
                            <button className="btn-primary btn-sm" onClick={() => award(p.id, b.id)}><Award size={12} /> Award</button>
                          )}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {p.progress.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {p.progress.map((pr, i) => (
                    <div key={i} className="text-xs text-slate-600">
                      <div className="flex justify-between"><span>{fmtDate(pr.at)} — {pr.note}</span><b>{pr.percent}%</b></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-orange-400" style={{ width: `${pr.percent}%` }} /></div>
                      {pr.images && pr.images.length > 0 && <div className="mt-1 flex gap-2">{pr.images.map((im) => <img key={im} src={im} className="h-16 w-24 rounded object-cover" alt="" />)}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
=======
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Award } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, EmptyState, Spinner, Field, Alert } from '../../components/ui';
import { PROJECT_STATUS_CLS, BID_STATUS_CLS, PROJECT_STATUS_LABEL, inr, fmtDate } from '../../constants';
import type { Project } from '../../types';

export default function GovProjects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => api.get('/projects').then((r) => setProjects(r.all));
  useEffect(() => { load(); }, []);
  if (!projects) return <Spinner />;

  const award = async (projectId: string, bidId: string) => {
    setMsg(''); setErr('');
    try { await api.post(`/projects/${projectId}/award`, { bidId }); setMsg('Bid awarded — contractor notified, work order active.'); load(); }
    catch (e: any) { setErr(e.message); }
  };

  return (
    <div>
      <PageHeader title="Projects & Bids" sub="Digital project records with bid management and audit trail. Selection follows applicable procurement rules — JanSetu never sells tenders." />
      {msg && <div className="mb-4"><Alert tone="success">{msg}</Alert></div>}
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}
      {projects.length === 0 ? (
        <EmptyState icon={<FolderKanban size={36} />} title="No projects yet" sub="Choose the contractor path on a reviewed complaint to create a project." />
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div key={p.id} className="card-p">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-800">{p.code}</span>
                <span className={`badge ${PROJECT_STATUS_CLS[p.status]}`}>{(PROJECT_STATUS_LABEL as any)[p.status] || p.status}</span>
                {p.status === 'open_bidding' && <span className="badge bg-amber-100 text-amber-800">bid deadline {fmtDate(p.bidDeadlineAt)} {p.daysLeft != null && `(${p.daysLeft}d)`}</span>}
                {p.complaint && <Link className="link text-xs" to={`/gov/complaints/${p.complaint.id}`}>case {p.complaint.id}</Link>}
              </div>
              <p className="mt-2 text-sm font-bold text-slate-800">{p.title}</p>
              <p className="text-xs text-slate-500">{p.scope}</p>
              <p className="mt-1 text-xs text-slate-500">Budget {inr(p.budgetEstimate)} · Location {p.location} · Eligibility: {p.eligibility}</p>

              {p.bids && p.bids.length > 0 && (
                <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full min-w-[560px]">
                    <thead className="bg-slate-50"><tr><th className="th">Bid</th><th className="th">Contractor</th><th className="th">Amount</th><th className="th">Timeline</th><th className="th">Proposal</th><th className="th">Status</th><th className="th"></th></tr></thead>
                    <tbody>
                      {p.bids.map((b) => (
                        <tr key={b.id} className="border-t border-slate-100">
                          <td className="td font-mono text-xs">{b.id}</td>
                          <td className="td">{b.contractorName}</td>
                          <td className="td font-semibold">{inr(b.amount)}</td>
                          <td className="td">{b.timelineDays} days</td>
                          <td className="td max-w-64 text-xs">{b.proposal}</td>
                          <td className="td"><span className={`badge ${BID_STATUS_CLS[b.status]}`}>{b.status}</span></td>
                          <td className="td">{(p.status === 'open_bidding' || p.status === 'evaluation') && b.status === 'submitted' && (
                            <button className="btn-primary btn-sm" onClick={() => award(p.id, b.id)}><Award size={12} /> Award</button>
                          )}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {p.progress.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {p.progress.map((pr, i) => (
                    <div key={i} className="text-xs text-slate-600">
                      <div className="flex justify-between"><span>{fmtDate(pr.at)} — {pr.note}</span><b>{pr.percent}%</b></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-orange-400" style={{ width: `${pr.percent}%` }} /></div>
                      {pr.images && pr.images.length > 0 && <div className="mt-1 flex gap-2">{pr.images.map((im) => <img key={im} src={im} className="h-16 w-24 rounded object-cover" alt="" />)}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
