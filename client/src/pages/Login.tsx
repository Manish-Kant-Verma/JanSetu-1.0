import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth, homeFor } from '../store';
import { api } from '../api';
import { Alert } from '../components/ui';

interface DemoAcct { role: string; name: string; email: string; password: string; label: string }

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [accounts, setAccounts] = useState<DemoAcct[]>([]);

  useEffect(() => { api.get('/auth/demo-accounts').then((r) => setAccounts(r.accounts)).catch(() => {}); }, []);

  const submit = async (e: React.FormEvent, em?: string, pw?: string) => {
    e?.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const user = await login(em ?? email, pw ?? password);
      nav(homeFor(user.role));
    } catch (ex: any) { setErr(ex.message); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-slate-600">Login to your JanSetu portal.</p>
        <form onSubmit={submit} className="card-p mt-6 space-y-4">
          {err && <Alert tone="error">{err}</Alert>}
          <div><label className="label">Email</label><input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.in" /></div>
          <div><label className="label">Password</label><input type="password" className="input" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
          <button className="btn-primary w-full" disabled={busy}><LogIn size={15} /> {busy ? 'Signing in…' : 'Login'}</button>
          <p className="text-center text-sm text-slate-500">New to JanSetu? <Link to="/register" className="link">Create an account</Link></p>
        </form>
      </div>
      <div>
        <div className="card-p bg-amber-50/60">
          <p className="text-xs font-bold uppercase tracking-wider text-civic-600">Hackathon demo</p>
          <h2 className="mt-1 font-bold text-slate-800">One-click demo accounts</h2>
          <p className="mt-1 text-xs text-slate-500">Every role is pre-seeded with realistic cases across the full lifecycle.</p>
          <div className="mt-4 space-y-2">
            {accounts.map((a) => (
              <button key={a.email} onClick={(e) => submit(e, a.email, a.password)} disabled={busy}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm hover:border-brand-600 hover:shadow-sm disabled:opacity-60">
                <span><b>{a.label}</b><span className="block text-xs text-slate-400">{a.email}</span></span>
                <span className="badge bg-brand-50 text-brand-800">{a.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
