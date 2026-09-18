import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle2, Trophy, Timer, BadgeCheck } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../store';
import { PageHeader, Stat, ProgressBar } from '../../components/ui';
import { ScoreRing } from '../../components/UploadBox';
import { StatusBadge } from '../../components/StatusTimeline';
import { fmtDate } from '../../constants';
import type { Assignment, Complaint } from '../../types';

export default function JsDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<{ available: Assignment[]; mine: Assignment[] } | null>(null);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([api.get('/assignments'), api.get('/scores/jsmember')])
      .then(([a, s]) => { setAssignments(a); setScore(s.score); });
  }, []);

  if (!assignments) return null;
  const active = assignments.mine.filter((a) => !['completed', 'expired'].includes(a.status));
  const doneReports = assignments.mine.filter((a) => a.status === 'report_verified' || a.status === 'completed');

  return (
    <div>
      <PageHeader title={`Field portal — ${user?.name}`} sub="Verified civic participation. No earnings — your contribution is ground truth."
        right={active.length > 0 ? <Link to="/jsmember/my-assignments" className="btn-amber">Continue active assignment</Link> : <Link to="/jsmember/assignments" className="btn-primary">Find assignments</Link>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Available assignments" value={assignments.available.length} icon={<ClipboardList size={18} />} tone="text-amber-500" />
        <Stat label="My active assignments" value={active.length} icon={<Timer size={18} />} tone="text-brand-600" />
        <Stat label="Reports submitted" value={doneReports.length} icon={<CheckCircle2 size={18} />} tone="text-emerald-500" />
        <Stat label="Field Trust Score" value={score ?? '—'} icon={<Trophy size={18} />} tone="text-civic-500" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="card-p flex flex-col items-center">
          <ScoreRing score={score ?? 0} label="Field Trust Score" />
          <p className="mt-2 text-center text-xs text-slate-500">GPS-verified visits, accepted reports and on-time submissions build trust.</p>
        </div>
        <div className="card-p lg:col-span-2">
          <p className="font-bold text-slate-800">Next steps</p>
          {active.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No active assignments. Check <Link className="link" to="/jsmember/assignments">Available Assignments</Link> — matching is based on your skills, distance and trust score.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {active.slice(0, 3).map((a) => (
                <Link key={a.id} to="/jsmember/my-assignments" className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:border-brand-600">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{a.complaint?.category} — {a.complaint?.areaName}</p>
                    <p className="text-xs text-slate-500">{a.id} · deadline {fmtDate(a.deadlineAt)}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {!user?.verified && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="flex items-center gap-2 font-bold"><BadgeCheck size={16} /> Verification pending</p>
          <p className="mt-1">Your profile is submitted. A JanSetu Admin must verify your account before you can accept assignments.</p>
        </div>
      )}
    </div>
  );
}
