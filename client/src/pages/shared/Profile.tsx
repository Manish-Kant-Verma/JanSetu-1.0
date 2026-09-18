<<<<<<< HEAD
import { useState } from 'react';
import { useAuth } from '../../store';
import { api } from '../../api';
import { PageHeader, Alert, Field } from '../../components/ui';
import { fmtDate } from '../../constants';

const ROLE_LABEL: Record<string, string> = { citizen: 'Citizen', jsmember: 'JS Member', government: 'Government Official', contractor: 'Contractor / Business', admin: 'JanSetu Admin' };

export default function Profile() {
  const { user } = useAuth();
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pw, setPw] = useState({ current: '', next: '' });
  if (!user) return null;

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try { await api.post('/auth/change-password', pw); setMsg('Password updated successfully.'); setPw({ current: '', next: '' }); }
    catch (ex: any) { setErr(ex.message); }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" sub="Your JanSetu account details." />
      {msg && <div className="mb-4"><Alert tone="success">{msg}</Alert></div>}
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}

      <div className="card-p space-y-2 text-sm">
        <div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-slate-500">Name</span><b>{user.name}</b></div>
        <div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-slate-500">Email</span><b>{user.email}</b></div>
        <div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-slate-500">Role</span><b>{ROLE_LABEL[user.role]}</b></div>
        <div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-slate-500">Verification</span><b className={user.verified ? 'text-emerald-600' : 'text-amber-600'}>{user.verified ? 'Verified ✓' : 'Pending review'}</b></div>
        <div className="flex justify-between py-1.5"><span className="text-slate-500">Member since</span><b>{fmtDate(user.createdAt)}</b></div>
      </div>

      {user.role === 'jsmember' && (
        <div className="card-p mt-4">
          <p className="font-bold text-slate-800">JS Member profile</p>
          <div className="mt-2 space-y-1.5 text-sm text-slate-600">
            <p><b>Skills:</b> {user.skills?.join(', ') || '—'}</p>
            <p><b>Experience:</b> {user.experience || '—'}</p>
            <p><b>Base location:</b> {user.baseLocation?.area || '—'}</p>
          </div>
        </div>
      )}

      {user.role === 'contractor' && (
        <div className="card-p mt-4">
          <p className="font-bold text-slate-800">Business profile</p>
          <div className="mt-2 space-y-1.5 text-sm text-slate-600">
            <p><b>Business:</b> {user.businessName || '—'}</p>
            <p><b>GST:</b> {user.gstNumber || '—'}</p>
            <p><b>Work registration:</b> {user.registrationNumber || '—'}</p>
            <p><b>Documents:</b> {user.documents?.join(', ') || '—'}</p>
          </div>
        </div>
      )}

      {user.role === 'government' && (
        <div className="card-p mt-4">
          <p className="font-bold text-slate-800">Official details</p>
          <div className="mt-2 space-y-1.5 text-sm text-slate-600">
            <p><b>Department:</b> {user.department || '—'}</p>
            <p><b>Designation:</b> {user.designation || '—'}</p>
          </div>
        </div>
      )}

      <form onSubmit={changePw} className="card-p mt-4 space-y-3">
        <p className="font-bold text-slate-800">Change password</p>
        <Field label="Current password"><input type="password" className="input" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
        <Field label="New password (min 6)"><input type="password" className="input" required minLength={6} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
        <button className="btn-primary">Update password</button>
      </form>
    </div>
  );
}
=======
import { useState } from 'react';
import { useAuth } from '../../store';
import { api } from '../../api';
import { PageHeader, Alert, Field } from '../../components/ui';
import { fmtDate } from '../../constants';

const ROLE_LABEL: Record<string, string> = { citizen: 'Citizen', jsmember: 'JS Member', government: 'Government Official', contractor: 'Contractor / Business', admin: 'JanSetu Admin' };

export default function Profile() {
  const { user } = useAuth();
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pw, setPw] = useState({ current: '', next: '' });
  if (!user) return null;

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try { await api.post('/auth/change-password', pw); setMsg('Password updated successfully.'); setPw({ current: '', next: '' }); }
    catch (ex: any) { setErr(ex.message); }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" sub="Your JanSetu account details." />
      {msg && <div className="mb-4"><Alert tone="success">{msg}</Alert></div>}
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}

      <div className="card-p space-y-2 text-sm">
        <div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-slate-500">Name</span><b>{user.name}</b></div>
        <div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-slate-500">Email</span><b>{user.email}</b></div>
        <div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-slate-500">Role</span><b>{ROLE_LABEL[user.role]}</b></div>
        <div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-slate-500">Verification</span><b className={user.verified ? 'text-emerald-600' : 'text-amber-600'}>{user.verified ? 'Verified ✓' : 'Pending review'}</b></div>
        <div className="flex justify-between py-1.5"><span className="text-slate-500">Member since</span><b>{fmtDate(user.createdAt)}</b></div>
      </div>

      {user.role === 'jsmember' && (
        <div className="card-p mt-4">
          <p className="font-bold text-slate-800">JS Member profile</p>
          <div className="mt-2 space-y-1.5 text-sm text-slate-600">
            <p><b>Skills:</b> {user.skills?.join(', ') || '—'}</p>
            <p><b>Experience:</b> {user.experience || '—'}</p>
            <p><b>Base location:</b> {user.baseLocation?.area || '—'}</p>
          </div>
        </div>
      )}

      {user.role === 'contractor' && (
        <div className="card-p mt-4">
          <p className="font-bold text-slate-800">Business profile</p>
          <div className="mt-2 space-y-1.5 text-sm text-slate-600">
            <p><b>Business:</b> {user.businessName || '—'}</p>
            <p><b>GST:</b> {user.gstNumber || '—'}</p>
            <p><b>Work registration:</b> {user.registrationNumber || '—'}</p>
            <p><b>Documents:</b> {user.documents?.join(', ') || '—'}</p>
          </div>
        </div>
      )}

      {user.role === 'government' && (
        <div className="card-p mt-4">
          <p className="font-bold text-slate-800">Official details</p>
          <div className="mt-2 space-y-1.5 text-sm text-slate-600">
            <p><b>Department:</b> {user.department || '—'}</p>
            <p><b>Designation:</b> {user.designation || '—'}</p>
          </div>
        </div>
      )}

      <form onSubmit={changePw} className="card-p mt-4 space-y-3">
        <p className="font-bold text-slate-800">Change password</p>
        <Field label="Current password"><input type="password" className="input" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
        <Field label="New password (min 6)"><input type="password" className="input" required minLength={6} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
        <button className="btn-primary">Update password</button>
      </form>
    </div>
  );
}
>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
