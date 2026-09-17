import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, FolderKanban, CheckCircle2, Trophy, Bell, Camera, Clock } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../store';
import { PageHeader, Stat, EmptyState } from '../../components/ui';
import ComplaintCard from '../../components/ComplaintCard';
import type { Complaint } from '../../types';
import { fmtDate } from '../../constants';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/complaints'), api.get('/scores/me')])
      .then(([c, s]) => { setComplaints(c.complaints); setScore(s.score); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  const active = complaints.filter((c) => !['closed', 'rejected'].includes(c.status));
  const resolved = complaints.filter((c) => c.status === 'closed');
  const needsVerification = complaints.filter((c) => c.status === 'citizen_verification');

  return (
    <div>
      <PageHeader
        title={`Namaste, ${user?.name?.split(' ')[0]} 👋`}
        sub="From citizen report to government action — track every case you raised."
        right={<Link to="/citizen/report" className="btn-amber"><Camera size={16} /> REPORT A PROBLEM</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active cases" value={active.length} icon={<Clock size={18} />} tone="text-amber-500" />
        <Stat label="Resolved & closed" value={resolved.length} icon={<CheckCircle2 size={18} />} tone="text-emerald-500" />
        <Stat label="Civil Score" value={score ?? '—'} icon={<Trophy size={18} />} tone="text-civic-500" sub="Transparent, rule-based" />
        <Stat label="Awaiting your verification" value={needsVerification.length} icon={<Bell size={18} />} tone="text-rose-500" sub={needsVerification.length ? 'Confirm the fix below' : 'All caught up'} />
      </div>

      {needsVerification.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-bold text-amber-900">Has this problem actually been solved?</p>
          <p className="mt-1 text-sm text-amber-800">The government submitted resolution evidence. Your confirmation closes the case — your rejection reopens it.</p>
          <div className="mt-3 space-y-2">{needsVerification.map((c) => <ComplaintCard key={c.id} c={c} />)}</div>
        </div>
      )}

      <h2 className="mb-3 mt-8 font-bold text-slate-800">Your cases</h2>
      {complaints.length === 0 ? (
        <EmptyState icon={<Flag size={40} />} title="No complaints yet" sub="Spot a pothole, garbage dump or broken streetlight? Report it in 30 seconds — photo + GPS evidence included.">
          <Link to="/citizen/report" className="btn-primary">Report your first problem</Link>
        </EmptyState>
      ) : (
        <div className="space-y-3">{complaints.slice(0, 6).map((c) => <ComplaintCard key={c.id} c={c} />)}</div>
      )}
      {complaints.length > 6 && (
        <div className="mt-4 text-center"><Link to="/citizen/complaints" className="btn-outline">View all {complaints.length} complaints</Link></div>
      )}

      <div className="card-p mt-8 flex flex-wrap items-center justify-between gap-4 bg-brand-900 text-white">
        <div>
          <p className="flex items-center gap-2 font-bold"><FolderKanban size={16} className="text-civic-500" /> How your report travels</p>
          <p className="mt-1 text-sm text-slate-300">Capture → JanSetu verification → Routing → Government review → (JS Member assessment) → Action → Resolution → your verification.</p>
        </div>
        <Link to="/how-it-works" className="btn-amber btn-sm">See the full workflow</Link>
      </div>
      <p className="mt-6 text-center text-xs text-slate-400">Account created {fmtDate(user?.createdAt)} · Every action on JanSetu is audit-logged</p>
    </div>
  );
}
