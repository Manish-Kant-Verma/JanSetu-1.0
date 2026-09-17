import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Flag, CheckCircle2, AlertTriangle, FolderKanban, UserCheck, Building2 } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, Stat, Spinner } from '../../components/ui';

interface Overview { stats: { users: number; citizens: number; jsmembers: number; pendingJsmembers: number; contractors: number; pendingContractors: number; complaints: number; active: number; closed: number; overdue: number; projects: number; openProjects: number } }

export default function AdminOverview() {
  const [o, setO] = useState<Overview | null>(null);
  useEffect(() => { api.get('/admin/overview').then(setO); }, []);
  if (!o) return <Spinner />;
  const s = o.stats;
  return (
    <div>
      <PageHeader title="Platform overview" sub="Users, cases, overdue pressure and procurement — one glance." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total users" value={s.users} icon={<Users size={18} />} tone="text-brand-600" sub={`${s.citizens} citizens · ${s.jsmembers} JS members`} />
        <Stat label="Total complaints" value={s.complaints} icon={<Flag size={18} />} tone="text-amber-500" sub={`${s.active} active · ${s.closed} closed`} />
        <Stat label="OVERDUE cases" value={s.overdue} icon={<AlertTriangle size={18} />} tone="text-rose-500" sub="Review / resolution SLA breached" />
        <Stat label="Open projects" value={s.openProjects} icon={<FolderKanban size={18} />} tone="text-violet-500" sub={`${s.projects} total projects`} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Stat label="Pending JS member verifications" value={s.pendingJsmembers} icon={<UserCheck size={18} />} tone="text-violet-500" />
        <Stat label="Pending contractor verifications" value={s.pendingContractors} icon={<Building2 size={18} />} tone="text-orange-500" />
        <Stat label="Closed successfully" value={s.closed} icon={<CheckCircle2 size={18} />} tone="text-emerald-500" />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link to="/admin/users" className="card-p transition hover:shadow-md"><p className="font-bold text-slate-800">Verify users →</p><p className="mt-1 text-sm text-slate-500">Approve JS Members & contractors, manage officials.</p></Link>
        <Link to="/admin/rules" className="card-p transition hover:shadow-md"><p className="font-bold text-slate-800">Routing & SLA rules →</p><p className="mt-1 text-sm text-slate-500">How complaints reach departments, and in how many days.</p></Link>
        <Link to="/admin/audit" className="card-p transition hover:shadow-md"><p className="font-bold text-slate-800">Audit trail →</p><p className="mt-1 text-sm text-slate-500">Every action on JanSetu is logged and visible.</p></Link>
      </div>
    </div>
  );
}
