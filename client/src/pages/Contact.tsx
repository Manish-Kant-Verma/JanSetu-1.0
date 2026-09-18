import { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { api } from '../api';
import { Alert } from '../components/ui';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', body: '' });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/contact', form);
      setSent(true);
    } catch (ex: any) { setErr(ex.message); }
  };
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900">Contact JanSetu</h1>
      <p className="mt-2 text-slate-600">Questions about partnerships, CSR programs, enterprise API access or press — write to us.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <form onSubmit={submit} className="card-p space-y-4">
          {sent && <Alert tone="success">Message received — the JanSetu team will get back to you.</Alert>}
          {err && <Alert tone="error">{err}</Alert>}
          <div><label className="label">Your name</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Email</label><input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Subject</label><input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div><label className="label">Message</label><textarea className="input min-h-28" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          <button className="btn-primary w-full"><Send size={15} /> Send message</button>
        </form>
        <div className="space-y-4">
          <div className="card-p"><p className="flex items-center gap-2 font-bold text-slate-800"><Mail size={16} className="text-brand-700" /> Email</p><p className="mt-1 text-sm text-slate-600">hello@jansetu.in</p></div>
          <div className="card-p"><p className="flex items-center gap-2 font-bold text-slate-800"><Phone size={16} className="text-brand-700" /> Support hours</p><p className="mt-1 text-sm text-slate-600">Mon–Sat, 10:00–18:00 IST</p></div>
          <div className="card-p"><p className="flex items-center gap-2 font-bold text-slate-800"><MapPin size={16} className="text-brand-700" /> Pilot city</p><p className="mt-1 text-sm text-slate-600">Indore, Madhya Pradesh — demo dataset seeded across Vijay Nagar, Palasia, Rajwada, Bhawarkuan and Sudama Nagar.</p></div>
        </div>
      </div>
    </div>
  );
}
