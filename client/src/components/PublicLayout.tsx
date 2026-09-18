<<<<<<< HEAD
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Waypoints, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth, homeFor } from '../store';

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-800 text-civic-500"><Waypoints size={20} /></span>
      <span>
        <span className={`block text-lg font-extrabold leading-none tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>JanSetu</span>
        <span className={`block text-[10px] font-medium leading-tight ${light ? 'text-slate-300' : 'text-slate-500'}`}>Citizen Report → Government Action</span>
      </span>
    </Link>
  );
}

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100'}`}>{n.label}</NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <Link to={homeFor(user.role)} className="btn-primary">My Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-outline">Login</Link>
                <Link to="/citizen-report" className="btn-amber">Report a Problem</Link>
              </>
            )}
          </div>
          <button className="btn-ghost md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">{n.label}</NavLink>
            ))}
            <div className="mt-2 flex gap-2">
              {user ? <Link to={homeFor(user.role)} className="btn-primary flex-1">My Dashboard</Link> : (
                <>
                  <Link to="/login" className="btn-outline flex-1">Login</Link>
                  <Link to="/citizen-report" className="btn-amber flex-1">Report a Problem</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <Outlet />
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
              JanSetu is an end-to-end civic problem-to-resolution platform — evidence, verification, jurisdiction, government action, ground investigation, execution, deadlines, resolution verification and closure in one traceable case lifecycle.
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Platform</p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li><Link to="/how-it-works" className="hover:text-brand-700">How It Works</Link></li>
              <li><Link to="/citizen-report" className="hover:text-brand-700">Report a Problem</Link></li>
              <li><Link to="/register" className="hover:text-brand-700">Become a JS Member</Link></li>
              <li><Link to="/register" className="hover:text-brand-700">Business / Contractor</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Trust</p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li>Transparent, rule-based scores</li>
              <li>GPS + timestamp evidence trail</li>
              <li>Audit log on every action</li>
              <li>No paid tender selling — ever</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">© 2026 JanSetu · Demo build for civic-tech showcase</div>
      </footer>
    </div>
  );
}
=======
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Waypoints, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth, homeFor } from '../store';

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-800 text-civic-500"><Waypoints size={20} /></span>
      <span>
        <span className={`block text-lg font-extrabold leading-none tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>JanSetu</span>
        <span className={`block text-[10px] font-medium leading-tight ${light ? 'text-slate-300' : 'text-slate-500'}`}>Citizen Report → Government Action</span>
      </span>
    </Link>
  );
}

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100'}`}>{n.label}</NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <Link to={homeFor(user.role)} className="btn-primary">My Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-outline">Login</Link>
                <Link to="/citizen-report" className="btn-amber">Report a Problem</Link>
              </>
            )}
          </div>
          <button className="btn-ghost md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">{n.label}</NavLink>
            ))}
            <div className="mt-2 flex gap-2">
              {user ? <Link to={homeFor(user.role)} className="btn-primary flex-1">My Dashboard</Link> : (
                <>
                  <Link to="/login" className="btn-outline flex-1">Login</Link>
                  <Link to="/citizen-report" className="btn-amber flex-1">Report a Problem</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <Outlet />
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
              JanSetu is an end-to-end civic problem-to-resolution platform — evidence, verification, jurisdiction, government action, ground investigation, execution, deadlines, resolution verification and closure in one traceable case lifecycle.
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Platform</p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li><Link to="/how-it-works" className="hover:text-brand-700">How It Works</Link></li>
              <li><Link to="/citizen-report" className="hover:text-brand-700">Report a Problem</Link></li>
              <li><Link to="/register" className="hover:text-brand-700">Become a JS Member</Link></li>
              <li><Link to="/register" className="hover:text-brand-700">Business / Contractor</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Trust</p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li>Transparent, rule-based scores</li>
              <li>GPS + timestamp evidence trail</li>
              <li>Audit log on every action</li>
              <li>No paid tender selling — ever</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">© 2026 JanSetu · Demo build for civic-tech showcase</div>
      </footer>
    </div>
  );
}
>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
