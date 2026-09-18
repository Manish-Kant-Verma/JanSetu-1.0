<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { GitBranch, Power } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, Spinner, Field, Alert } from '../../components/ui';
import { CATEGORIES } from '../../constants';
import type { RoutingRule, Org } from '../../types';

export default function AdminRules() {
  const [rules, setRules] = useState<RoutingRule[] | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ category: 'Road Damage', keywords: '', orgId: '', department: '', slaDays: 7, reviewDays: 2 });
  useEffect(() => {
    api.get('/admin/routing-rules').then((r) => setRules(r.rules));
    api.get('/admin/orgs').then((r) => { setOrgs(r.orgs); if (r.orgs[0]) setForm((f) => ({ ...f, orgId: f.orgId || r.orgs[0].id, department: f.department || r.orgs[0].departments[0] || '' })); });
  }, []);
  const add = async (e: any) => {
    e.preventDefault(); setMsg('');
    try {
      const r = await api.post('/admin/routing-rules', form);
      setRules((x) => [...(x || []), r.rule]);
      setMsg('Routing rule added.');
    } catch (e: any) { setMsg(e.message); }
  };
  const toggle = async (id: string) => {
    const r = await api.post(`/admin/routing-rules/${id}/toggle`);
    setRules((x) => (x || []).map((y) => (y.id === id ? r.rule : y)));
  };
  if (!rules) return <Spinner />;
  const orgName = (id: string) => orgs.find((o) => o.id === id)?.name || id;
  return (
    <div>
      <PageHeader title="Routing & SLA rules" sub="Category + keywords + jurisdiction decide where a case goes — and how fast it must move." />
      {msg && <div className="mb-4"><Alert tone={msg.includes('added') ? 'success' : 'error'}>{msg}</Alert></div>}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {rules.map((r) => (
            <div key={r.id} className={`card-p ${r.active ? '' : 'opacity-60'}`}>
              <p className="flex items-center gap-2 font-bold text-slate-800"><GitBranch size={14} className="text-brand-700" /> {r.category} → {orgName(r.orgId)} · {r.department}</p>
              <p className="mt-1 text-xs text-slate-500">keywords: {r.keywords.join(', ') || '—'} · review {r.reviewDays}d · SLA {r.slaDays}d</p>
              <button className="btn-ghost btn-sm mt-2" onClick={() => toggle(r.id)}><Power size={13} /> {r.active ? 'Disable' : 'Enable'}</button>
            </div>
          ))}
        </div>
        <form onSubmit={add} className="card-p h-fit space-y-3">
          <p className="font-bold text-slate-800">Add routing rule</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Category"><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
            <Field label="Keywords (comma separated)"><input className="input" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="pothole, road, crack" /></Field>
          </div>
          <Field label="Organisation"><select className="input" value={form.orgId} onChange={(e) => setForm({ ...form, orgId: e.target.value })}>{orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></Field>
          <Field label="Department"><input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Review days"><input className="input" type="number" value={form.reviewDays} onChange={(e) => setForm({ ...form, reviewDays: Number(e.target.value) })} /></Field>
            <Field label="Resolution SLA days"><input className="input" type="number" value={form.slaDays} onChange={(e) => setForm({ ...form, slaDays: Number(e.target.value) })} /></Field>
          </div>
          <button className="btn-primary w-full">Add rule</button>
        </form>
      </div>
    </div>
  );
}
=======
import { useEffect, useState } from 'react';
import { GitBranch, Power } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, Spinner, Field, Alert } from '../../components/ui';
import { CATEGORIES } from '../../constants';
import type { RoutingRule, Org } from '../../types';

export default function AdminRules() {
  const [rules, setRules] = useState<RoutingRule[] | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ category: 'Road Damage', keywords: '', orgId: '', department: '', slaDays: 7, reviewDays: 2 });
  useEffect(() => {
    api.get('/admin/routing-rules').then((r) => setRules(r.rules));
    api.get('/admin/orgs').then((r) => { setOrgs(r.orgs); if (r.orgs[0]) setForm((f) => ({ ...f, orgId: f.orgId || r.orgs[0].id, department: f.department || r.orgs[0].departments[0] || '' })); });
  }, []);
  const add = async (e: any) => {
    e.preventDefault(); setMsg('');
    try {
      const r = await api.post('/admin/routing-rules', form);
      setRules((x) => [...(x || []), r.rule]);
      setMsg('Routing rule added.');
    } catch (e: any) { setMsg(e.message); }
  };
  const toggle = async (id: string) => {
    const r = await api.post(`/admin/routing-rules/${id}/toggle`);
    setRules((x) => (x || []).map((y) => (y.id === id ? r.rule : y)));
  };
  if (!rules) return <Spinner />;
  const orgName = (id: string) => orgs.find((o) => o.id === id)?.name || id;
  return (
    <div>
      <PageHeader title="Routing & SLA rules" sub="Category + keywords + jurisdiction decide where a case goes — and how fast it must move." />
      {msg && <div className="mb-4"><Alert tone={msg.includes('added') ? 'success' : 'error'}>{msg}</Alert></div>}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {rules.map((r) => (
            <div key={r.id} className={`card-p ${r.active ? '' : 'opacity-60'}`}>
              <p className="flex items-center gap-2 font-bold text-slate-800"><GitBranch size={14} className="text-brand-700" /> {r.category} → {orgName(r.orgId)} · {r.department}</p>
              <p className="mt-1 text-xs text-slate-500">keywords: {r.keywords.join(', ') || '—'} · review {r.reviewDays}d · SLA {r.slaDays}d</p>
              <button className="btn-ghost btn-sm mt-2" onClick={() => toggle(r.id)}><Power size={13} /> {r.active ? 'Disable' : 'Enable'}</button>
            </div>
          ))}
        </div>
        <form onSubmit={add} className="card-p h-fit space-y-3">
          <p className="font-bold text-slate-800">Add routing rule</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Category"><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
            <Field label="Keywords (comma separated)"><input className="input" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="pothole, road, crack" /></Field>
          </div>
          <Field label="Organisation"><select className="input" value={form.orgId} onChange={(e) => setForm({ ...form, orgId: e.target.value })}>{orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></Field>
          <Field label="Department"><input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Review days"><input className="input" type="number" value={form.reviewDays} onChange={(e) => setForm({ ...form, reviewDays: Number(e.target.value) })} /></Field>
            <Field label="Resolution SLA days"><input className="input" type="number" value={form.slaDays} onChange={(e) => setForm({ ...form, slaDays: Number(e.target.value) })} /></Field>
          </div>
          <button className="btn-primary w-full">Add rule</button>
        </form>
      </div>
    </div>
  );
}
>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
