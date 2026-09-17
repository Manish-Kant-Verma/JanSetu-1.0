import { useEffect, useState } from 'react';
import { ShieldCheck, Ban, Search, UserPlus } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, Spinner, EmptyState, Alert } from '../../components/ui';
import type { User } from '../../types';
import { fmtDate } from '../../constants';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const load = () => {
    const p = new URLSearchParams();
    if (role) p.set('role', role);
    if (q) p.set('q', q);
    api.get(`/admin/users?${p.toString()}`).then((r) => setUsers(r.users));
  };
  useEffect(load, []);
  const act = async (id: string, action: string) => {
    setMsg('');
    try {
      const r = await api.post(`/admin/users/${id}/${action}`);
      setUsers((u) => (u || []).map((x) => (x.id === id ? r.user : x)));
    } catch (e: any) { setMsg(e.message); }
  };
  if (!users) return <Spinner />;
  return (
    <div>
      <PageHeader title="Users & verification" sub="Verify JS Members and contractors." />
      {msg && <div className="mb-4"><Alert tone="info">{msg}</Alert></div>}
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="card-p mb-4 flex flex-wrap gap-3">
        <select className="input max-w-[200px]" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="citizen">Citizens</option>
          <option value="jsmember">JS Members</option>
          <option value="government">Government</option>
          <option value="contractor">Contractors</option>
          <option value="admin">Admins</option>
        </select>
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search name, email…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="btn-outline btn-sm">Search</button>
      </form>
      {users.length === 0 ? <EmptyState title="No users match" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead><tr className="border-b border-slate-100"><th className="th">User</th><th className="th">Role</th><th className="th">Status</th><th className="th">Joined</th><th className="th text-right">Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="td"><p className="font-semibold text-slate-800">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></td>
                  <td className="td"><span className="badge bg-slate-100 text-slate-700">{u.role}</span></td>
                  <td className="td"><span className={`badge ${u.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{u.verified ? 'verified' : 'pending'}</span></td>
                  <td className="td text-xs">{fmtDate(u.createdAt)}</td>
                  <td className="td"><div className="flex justify-end gap-2">
                    <button className="btn-outline btn-sm" onClick={() => act(u.id, 'verify')}><ShieldCheck size={13} /> {u.verified ? 'Revoke' : 'Verify'}</button>
                    <button className="btn-ghost btn-sm" onClick={() => act(u.id, 'toggle-active')}><Ban size={13} /> {u.active ? 'Deactivate' : 'Activate'}</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 flex items-center gap-1 text-xs text-slate-400"><UserPlus size={12} /> Officials are provisioned via API: POST /api/admin/users</p>
    </div>
  );
}
