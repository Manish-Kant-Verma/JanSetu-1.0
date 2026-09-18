<<<<<<< HEAD
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRound, BadgeCheck, HardHat, Info } from 'lucide-react';
import { useAuth, homeFor } from '../store';
import { Alert } from '../components/ui';

const ROLES = [
  { id: 'citizen', icon: UserRound, t: 'Citizen', d: 'Report problems, support cases, verify resolutions.' },
  { id: 'jsmember', icon: BadgeCheck, t: 'JS Member', d: 'Volunteer for verified ground-level assessments. No earnings — civic trust only.' },
  { id: 'contractor', icon: HardHat, t: 'Contractor / Business', d: 'Discover eligible projects and bid. Verified by JanSetu Admin before bidding.' },
];

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState('citizen');
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', skills: '', experience: '', areaName: '', businessName: '', gstNumber: '', registrationNumber: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const user = await register({ ...f, role });
      nav(homeFor(user.role));
    } catch (ex: any) { setErr(ex.message); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900">Join JanSetu</h1>
      <p className="mt-2 text-slate-600">Choose how you want to participate in the civic resolution loop.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {ROLES.map((r) => (
          <button key={r.id} type="button" onClick={() => setRole(r.id)}
            className={`card-p text-left transition ${role === r.id ? 'ring-2 ring-brand-700' : 'hover:shadow-md'}`}>
            <r.icon size={20} className={role === r.id ? 'text-brand-700' : 'text-slate-400'} />
            <p className="mt-2 font-bold text-slate-800">{r.t}</p>
            <p className="mt-1 text-xs text-slate-500">{r.d}</p>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="card-p mt-6 space-y-4">
        {err && <Alert tone="error">{err}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full name *</label><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+91 …" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Email *</label><input type="email" className="input" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><label className="label">Password * (min 6)</label><input type="password" className="input" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
        </div>

        {role === 'jsmember' && (
          <>
            <div><label className="label">Skills (comma separated)</label><input className="input" value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder="civil, road assessment, environment, electrical…" /></div>
            <div><label className="label">Experience / background</label><textarea className="input min-h-20" value={f.experience} onChange={(e) => setF({ ...f, experience: e.target.value })} placeholder="Student, engineer, retired professional, social worker…" /></div>
            <div><label className="label">Base area (for assignment matching)</label><input className="input" value={f.areaName} onChange={(e) => setF({ ...f, areaName: e.target.value })} placeholder="e.g. Vijay Nagar, Indore" /></div>
            <div className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900"><Info size={14} className="mt-0.5 shrink-0" /> JS Members are volunteers — there is no earning, wallet or payment on JanSetu. Your Field Trust Score is your reward.</div>
          </>
        )}

        {role === 'contractor' && (
          <>
            <div><label className="label">Business name *</label><input className="input" required value={f.businessName} onChange={(e) => setF({ ...f, businessName: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">GST number</label><input className="input" value={f.gstNumber} onChange={(e) => setF({ ...f, gstNumber: e.target.value })} /></div>
              <div><label className="label">Work registration no.</label><input className="input" value={f.registrationNumber} onChange={(e) => setF({ ...f, registrationNumber: e.target.value })} /></div>
            </div>
            <div className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900"><Info size={14} className="mt-0.5 shrink-0" /> JanSetu never sells tenders. An Admin must verify your business before you can bid. Government selection follows applicable procurement rules.</div>
          </>
        )}

        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="text-center text-sm text-slate-500">Already registered? <Link to="/login" className="link">Login</Link></p>
        <p className="text-center text-xs text-slate-400">Government official accounts are provisioned by JanSetu Admin for security.</p>
      </form>
    </div>
  );
}
=======
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRound, BadgeCheck, HardHat, Info } from 'lucide-react';
import { useAuth, homeFor } from '../store';
import { Alert } from '../components/ui';

const ROLES = [
  { id: 'citizen', icon: UserRound, t: 'Citizen', d: 'Report problems, support cases, verify resolutions.' },
  { id: 'jsmember', icon: BadgeCheck, t: 'JS Member', d: 'Volunteer for verified ground-level assessments. No earnings — civic trust only.' },
  { id: 'contractor', icon: HardHat, t: 'Contractor / Business', d: 'Discover eligible projects and bid. Verified by JanSetu Admin before bidding.' },
];

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState('citizen');
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', skills: '', experience: '', areaName: '', businessName: '', gstNumber: '', registrationNumber: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const user = await register({ ...f, role });
      nav(homeFor(user.role));
    } catch (ex: any) { setErr(ex.message); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900">Join JanSetu</h1>
      <p className="mt-2 text-slate-600">Choose how you want to participate in the civic resolution loop.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {ROLES.map((r) => (
          <button key={r.id} type="button" onClick={() => setRole(r.id)}
            className={`card-p text-left transition ${role === r.id ? 'ring-2 ring-brand-700' : 'hover:shadow-md'}`}>
            <r.icon size={20} className={role === r.id ? 'text-brand-700' : 'text-slate-400'} />
            <p className="mt-2 font-bold text-slate-800">{r.t}</p>
            <p className="mt-1 text-xs text-slate-500">{r.d}</p>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="card-p mt-6 space-y-4">
        {err && <Alert tone="error">{err}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full name *</label><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+91 …" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Email *</label><input type="email" className="input" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><label className="label">Password * (min 6)</label><input type="password" className="input" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
        </div>

        {role === 'jsmember' && (
          <>
            <div><label className="label">Skills (comma separated)</label><input className="input" value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder="civil, road assessment, environment, electrical…" /></div>
            <div><label className="label">Experience / background</label><textarea className="input min-h-20" value={f.experience} onChange={(e) => setF({ ...f, experience: e.target.value })} placeholder="Student, engineer, retired professional, social worker…" /></div>
            <div><label className="label">Base area (for assignment matching)</label><input className="input" value={f.areaName} onChange={(e) => setF({ ...f, areaName: e.target.value })} placeholder="e.g. Vijay Nagar, Indore" /></div>
            <div className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900"><Info size={14} className="mt-0.5 shrink-0" /> JS Members are volunteers — there is no earning, wallet or payment on JanSetu. Your Field Trust Score is your reward.</div>
          </>
        )}

        {role === 'contractor' && (
          <>
            <div><label className="label">Business name *</label><input className="input" required value={f.businessName} onChange={(e) => setF({ ...f, businessName: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">GST number</label><input className="input" value={f.gstNumber} onChange={(e) => setF({ ...f, gstNumber: e.target.value })} /></div>
              <div><label className="label">Work registration no.</label><input className="input" value={f.registrationNumber} onChange={(e) => setF({ ...f, registrationNumber: e.target.value })} /></div>
            </div>
            <div className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900"><Info size={14} className="mt-0.5 shrink-0" /> JanSetu never sells tenders. An Admin must verify your business before you can bid. Government selection follows applicable procurement rules.</div>
          </>
        )}

        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="text-center text-sm text-slate-500">Already registered? <Link to="/login" className="link">Login</Link></p>
        <p className="text-center text-xs text-slate-400">Government official accounts are provisioned by JanSetu Admin for security.</p>
      </form>
    </div>
  );
}
>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
