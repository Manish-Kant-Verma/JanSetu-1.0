import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, BadgeCheck, LayoutDashboard, Flag, FolderKanban, FileText, MapPin, CalendarClock, ClipboardList, UserCog, Landmark, Scale, ScrollText, Briefcase, Trophy, ChevronRight } from 'lucide-react';
import { useAuth, homeFor } from '../store';
import { api } from '../api';
import { Logo } from './PublicLayout';
import type { Notification } from '../types';
import { timeAgo } from '../constants';

const NAVS: Record<string, { to: string; label: string; icon: any }[]> = {
  citizen: [
    { to: '/citizen', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/citizen/report', label: 'Report a Problem', icon: Flag },
    { to: '/citizen/complaints', label: 'My Complaints', icon: ClipboardList },
    { to: '/citizen/notifications', label: 'Notifications', icon: Bell },
    { to: '/citizen/score', label: 'Civil Score', icon: Trophy },
    { to: '/citizen/profile', label: 'Profile', icon: UserCog },
  ],
  jsmember: [
    { to: '/jsmember', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jsmember/assignments', label: 'Available Assignments', icon: BadgeCheck },
    { to: '/jsmember/my-assignments', label: 'My Assignments', icon: ClipboardList },
    { to: '/jsmember/reports', label: 'My Reports', icon: FileText },
    { to: '/jsmember/score', label: 'Field Trust Score', icon: Trophy },
    { to: '/jsmember/profile', label: 'Profile', icon: UserCog },
  ],
  government: [
    { to: '/gov', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/gov/complaints', label: 'Complaints', icon: ClipboardList },
    { to: '/gov/reports', label: 'Technical Reports', icon: FileText },
    { to: '/gov/actions', label: 'Actions & Resolutions', icon: Landmark },
    { to: '/gov/map', label: 'GIS Map', icon: MapPin },
    { to: '/gov/deadlines', label: 'Deadlines', icon: CalendarClock },
    { to: '/gov/projects', label: 'Projects & Bids', icon: FolderKanban },
  ],
  contractor: [
    { to: '/contractor', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/contractor/opportunities', label: 'Opportunities', icon: BadgeCheck },
    { to: '/contractor/bids', label: 'My Bids', icon: FileText },
    { to: '/contractor/projects', label: 'Active Projects', icon: FolderKanban },
    { to: '/contractor/performance', label: 'Performance', icon: Trophy },
    { to: '/contractor/profile', label: 'Profile', icon: UserCog },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: UserCog },
    { to: '/admin/complaints', label: 'Complaints', icon: ClipboardList },
    { to: '/admin/orgs', label: 'Gov Organisations', icon: Landmark },
    { to: '/admin/rules', label: 'Routing & SLA', icon: Scale },
    { to: '/admin/audit', label: 'Audit Logs', icon: ScrollText },
  ],
};

const ROLE_LABEL: Record<string, string> = { citizen: 'Citizen', jsmember: 'JS Member', government: 'Government Official', contractor: 'Contractor / Business', admin: 'JanSetu Admin' };

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const [notes, setNotes] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const { notifications, unread } = await api.get('/notifications');
        if (!stop) { setNotes(notifications.slice(0, 8)); setUnread(unread); }
      } catch { /* ignore */ }
    };
    load();
    const t = setInterval(load, 25000);
    return () => { stop = true; clearInterval(t); };
  }, []);

  if (!user) return null;
  const items = NAVS[user.role] || [];
  const markAll = async () => { await api.post('/notifications/read-all'); setUnread(0); setNotes(notes.map((n) => ({ ...n, read: true }))); };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-brand-900 transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-4 py-4"><Logo light /></div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {items.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/citizen' || n.to === '/jsmember' || n.to === '/gov' || n.to === '/contractor' || n.to === '/admin'}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                <n.icon size={16} /> {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-civic-500 text-sm font-bold text-brand-900">{user.name.slice(0, 1)}</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                <p className="flex items-center gap-1 text-[11px] text-slate-400">{ROLE_LABEL[user.role]} {user.verified ? <BadgeCheck size={11} className="text-emerald-400" /> : <span className="text-amber-400">· pending</span>}</p>
              </div>
              <button onClick={() => { logout(); nav('/'); }} className="ml-auto text-slate-400 hover:text-white" title="Logout"><LogOut size={16} /></button>
            </div>
          </div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
          <button className="btn-ghost btn-sm lg:hidden" onClick={() => setOpen(true)}><Menu size={18} /></button>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button className="btn-ghost btn-sm relative" onClick={() => setBell(!bell)}><Bell size={18} />
                {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{unread}</span>}
              </button>
              {bell && (
                <div className="card absolute right-0 top-10 z-30 w-80 overflow-hidden p-0">
                  <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                    <p className="text-sm font-bold text-slate-700">Notifications</p>
                    <button className="text-xs text-brand-700 hover:underline" onClick={markAll}>Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notes.length === 0 && <p className="px-3 py-6 text-center text-sm text-slate-400">No notifications</p>}
                    {notes.map((n) => (
                      <button key={n.id} onClick={() => { setBell(false); if (n.link) nav(n.link); }} className={`block w-full border-b border-slate-50 px-3 py-2.5 text-left hover:bg-slate-50 ${n.read ? '' : 'bg-brand-50/40'}`}>
                        <p className="text-xs font-bold text-slate-800">{n.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.body}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{timeAgo(n.at)}</p>
                      </button>
                    ))}
                  </div>
                  <Link to={`${homeFor(user.role)}${user.role === 'citizen' ? '/notifications' : ''}`} onClick={() => setBell(false)} className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-slate-50">View all <ChevronRight size={12} /></Link>
                </div>
              )}
            </div>
            <span className="badge bg-brand-50 text-brand-800">{ROLE_LABEL[user.role]}</span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </div>
    </div>
  );
}

