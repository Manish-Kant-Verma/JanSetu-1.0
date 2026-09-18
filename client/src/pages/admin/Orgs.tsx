import { useEffect, useState } from 'react';
import { Landmark } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, Spinner, Field, Alert } from '../../components/ui';
import type { Org } from '../../types';

export default function AdminOrgs() {
  const [orgs, setOrgs] = useState<Org[] | null>(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ name: '', type: 'Municipal Corporation', level: 'district', district: 'Indore', state: 'Madhya Pradesh', departments: '' });
  useEffect(() => { api.get('/admin/orgs').then((r) => setOrgs(r.orgs)); }, []);
  const add = async (e: any) => {
    e.preventDefault(); setMsg('');
    try {
      const r = await api.post('/admin/orgs', form);
      setOrgs((o) => [...(o || []), r.org]);
      setForm({ ...form, name: '', departments: '' });
      setMsg('Organisation added.');
    } catch (e: any) { setMsg(e.message); }
  };
  if (!orgs) return <Spinner />;
  return (
    <div>
      <PageHeader title="Government organisations" sub="Departments that receive routed complaints." />
      {msg && <div className="mb-4"><Alert tone={msg.includes('added') ? 'success' : 'error'}>{msg}</Alert></div>}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {orgs.map((o) => (
            <div key={o.id} className="card-p">
              <p className="flex items-center gap-2 font-bold text-slate-800"><Landmark size={15} className="text-brand-700" /> {o.name}</p>
              <p className="mt-1 text-xs text-slate-500">{o.type} · {o.level} · {o.district}, {o.state}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">{o.departments.map((d) => <span key={d} className="badge bg-brand-50 text-brand-800">{d}</span>)}</div>
            </div>
          ))}
        </div>
        <form onSubmit={add} className="card-p h-fit space-y-3">
          <p className="font-bold text-slate-800">Add organisation</p>
          <Field label="Name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Type"><input className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></Field>
            <Field label="Level"><select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}><option value="village">village</option><option value="block">block</option><option value="district">district</option><option value="state">state</option></select></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="District"><input className="input" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></Field>
            <Field label="State"><input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
          </div>
          <Field label="Departments (comma separated)" hint="e.g. Roads & Infrastructure, Sanitation & Waste Management"><input className="input" value={form.departments} onChange={(e) => setForm({ ...form, departments: e.target.value })} /></Field>
          <button className="btn-primary w-full">Add organisation</button>
        </form>
      </div>
    </div>
  );
}
