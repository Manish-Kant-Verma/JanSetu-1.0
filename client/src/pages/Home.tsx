<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, MapPin, ShieldCheck, Landmark, Users, HardHat, Trophy, FileCheck2, ClipboardCheck, GitBranch, Timer, RefreshCcw } from 'lucide-react';
import { useAuth, homeFor } from '../store';

const FLOW = [
  { icon: Camera, t: 'SEE & CAPTURE', d: 'Citizen photographs the problem — GPS and timestamp attach automatically.' },
  { icon: ShieldCheck, t: 'VERIFY', d: 'Image, location, duplicates, evidence quality and community confirmations.' },
  { icon: GitBranch, t: 'ROUTE', d: 'Problem + GPS + jurisdiction + department via configured government rules.' },
  { icon: ClipboardCheck, t: 'ASSESS', d: 'Verified JS Member visits — fresh GPS, fresh photos, field report.' },
  { icon: Landmark, t: 'DECIDE', d: 'Government chooses: own resources, specialist, or contractor project.' },
  { icon: HardHat, t: 'SOLVE', d: 'Work executes with deadlines, progress evidence and notifications.' },
  { icon: FileCheck2, t: 'TRACK & VERIFY', d: 'Resolution evidence submitted; government verifies; citizen confirms.' },
  { icon: RefreshCcw, t: 'CLOSE OR REOPEN', d: 'YES → case closes. NO → re-complaint reopens the loop with fresh evidence.' },
];

const ROLES = [
  { icon: Users, t: 'Citizens', d: 'Report in 30 seconds, support real problems, track every step, verify the fix.', to: '/register' },
  { icon: ShieldCheck, t: 'JS Members', d: 'Verified volunteers providing ground-level truth. No earnings — civic trust instead.', to: '/register' },
  { icon: Landmark, t: 'Government', d: 'Complete case files, technical reports, deadlines and one decision surface.', to: '/login' },
  { icon: HardHat, t: 'Contractors', d: 'Discover eligible projects and bid — selection follows applicable procurement rules.', to: '/register' },
];

const PROBLEMS = ['Citizens don\u2019t know where to report', 'Insufficient evidence in complaints', 'The same problem gets reported again and again', 'Location and jurisdiction stay unclear', 'Departments receive incomplete information', 'Some problems need physical/technical verification', 'Citizens cannot track what happened next', 'Deadlines pass silently', '\u201CResolved\u201D on paper, broken on the ground'];

const SOLUTIONS = ['Every report carries photo + GPS + timestamp evidence', 'Duplicates and community confirmations strengthen cases before routing', 'Routing shows exactly why a case reached a department', 'Verified JS Members supply ground truth when needed', 'Every stage carries a deadline — overdue is visible', 'Resolution requires completion evidence', 'The citizen makes the final verification call'];

export default function Home() {
  const { user } = useAuth();
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #3b82f6 0, transparent 45%), radial-gradient(circle at 80% 70%, #f59e0b 0, transparent 40%)' }} />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2">
          <div>
            <span className="badge bg-white/10 text-civic-500">CIVIC PROBLEM → RESOLUTION PLATFORM</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              From Citizen Report to <span className="text-civic-500">Government Action</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-300">
              JanSetu does not just collect complaints. It creates one traceable case lifecycle — evidence, verification, jurisdiction, government action, ground investigation, execution, deadline tracking, resolution verification and closure.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link to={homeFor(user.role)} className="btn-amber !px-6 !py-3 text-base">Open my dashboard <ArrowRight size={18} /></Link>
              ) : (
                <>
                  <Link to="/citizen-report" className="btn-amber !px-6 !py-3 text-base">REPORT A PROBLEM <ArrowRight size={18} /></Link>
                  <Link to="/how-it-works" className="btn !border !border-white/25 !px-6 !py-3 text-base text-white hover:bg-white/10">How it works</Link>
                </>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-300">
              <span className="flex items-center gap-1.5"><MapPin size={15} className="text-civic-500" /> Auto-GPS evidence</span>
              <span className="flex items-center gap-1.5"><Timer size={15} className="text-civic-500" /> Deadline tracking</span>
              <span className="flex items-center gap-1.5"><Trophy size={15} className="text-civic-500" /> Civil Score & Field Trust Score</span>
            </div>
          </div>
          <div className="card self-center border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-widest text-civic-500">The JanSetu workflow</p>
            <div className="mt-4">
              {['SEE', 'CAPTURE', 'VERIFY', 'ROUTE', 'ASSESS', 'DECIDE', 'SOLVE', 'TRACK', 'VERIFY', 'CLOSE'].map((s, i, arr) => (
                <div key={s} className="flex items-stretch gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${i < 7 ? 'bg-civic-500 text-brand-900' : i < 9 ? 'bg-emerald-400 text-brand-900' : 'bg-white text-brand-900'}`}>{i + 1}</span>
                    {i < arr.length - 1 && <span className="w-px flex-1 bg-white/20" />}
                  </div>
                  <p className="pb-3 text-sm font-semibold tracking-wide text-slate-200">{s}{i === 6 && <span className="ml-2 font-normal text-slate-400">(government + citizen)</span>}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Why complaints die today</h2>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-600">
              {PROBLEMS.map((x) => (<li key={x} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />{x}</li>))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">One digital case lifecycle</h2>
            <div className="mt-4 space-y-2.5">
              {SOLUTIONS.map((x) => (<div key={x} className="flex gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-slate-600"><span className="mt-0.5 text-emerald-600">✓</span>{x}</div>))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900">Eight layers, one bridge</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-500">SEE → CAPTURE → VERIFY → ROUTE → ASSESS → DECIDE → SOLVE → TRACK → VERIFY → CLOSE</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((f, i) => (
              <div key={f.t} className="card-p transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><f.icon size={18} /></span>
                  <span className="text-[10px] font-bold text-slate-300">STEP {i + 1}</span>
                </div>
                <p className="mt-3 font-bold text-slate-800">{f.t}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">Built for every stakeholder</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r) => (
            <Link key={r.t} to={r.to} className="card-p group transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-civic-500/15 text-civic-600"><r.icon size={20} /></span>
              <p className="mt-3 font-bold text-slate-800">{r.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{r.d}</p>
              <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-700 opacity-0 transition group-hover:opacity-100">Open <ArrowRight size={12} /></p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-2xl bg-brand-900 px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-bold">Not a complaint box. An end-to-end resolution platform.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300">
            Evidence → Verification → Jurisdiction → Government → Ground Investigation → Technical Report → Decision → Execution → Deadline Tracking → Resolution Evidence → Citizen Verification → Re-complaint if needed.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/citizen-report" className="btn-amber !px-6 !py-3">REPORT A PROBLEM</Link>
            <Link to="/register" className="btn !border !border-white/25 !px-6 !py-3 text-white hover:bg-white/10">Join as JS Member or Business</Link>
          </div>
        </div>
      </section>
    </div>
  );
}


=======
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, MapPin, ShieldCheck, Landmark, Users, HardHat, Trophy, FileCheck2, ClipboardCheck, GitBranch, Timer, RefreshCcw } from 'lucide-react';
import { useAuth, homeFor } from '../store';

const FLOW = [
  { icon: Camera, t: 'SEE & CAPTURE', d: 'Citizen photographs the problem — GPS and timestamp attach automatically.' },
  { icon: ShieldCheck, t: 'VERIFY', d: 'Image, location, duplicates, evidence quality and community confirmations.' },
  { icon: GitBranch, t: 'ROUTE', d: 'Problem + GPS + jurisdiction + department via configured government rules.' },
  { icon: ClipboardCheck, t: 'ASSESS', d: 'Verified JS Member visits — fresh GPS, fresh photos, field report.' },
  { icon: Landmark, t: 'DECIDE', d: 'Government chooses: own resources, specialist, or contractor project.' },
  { icon: HardHat, t: 'SOLVE', d: 'Work executes with deadlines, progress evidence and notifications.' },
  { icon: FileCheck2, t: 'TRACK & VERIFY', d: 'Resolution evidence submitted; government verifies; citizen confirms.' },
  { icon: RefreshCcw, t: 'CLOSE OR REOPEN', d: 'YES → case closes. NO → re-complaint reopens the loop with fresh evidence.' },
];

const ROLES = [
  { icon: Users, t: 'Citizens', d: 'Report in 30 seconds, support real problems, track every step, verify the fix.', to: '/register' },
  { icon: ShieldCheck, t: 'JS Members', d: 'Verified volunteers providing ground-level truth. No earnings — civic trust instead.', to: '/register' },
  { icon: Landmark, t: 'Government', d: 'Complete case files, technical reports, deadlines and one decision surface.', to: '/login' },
  { icon: HardHat, t: 'Contractors', d: 'Discover eligible projects and bid — selection follows applicable procurement rules.', to: '/register' },
];

const PROBLEMS = ['Citizens don\u2019t know where to report', 'Insufficient evidence in complaints', 'The same problem gets reported again and again', 'Location and jurisdiction stay unclear', 'Departments receive incomplete information', 'Some problems need physical/technical verification', 'Citizens cannot track what happened next', 'Deadlines pass silently', '\u201CResolved\u201D on paper, broken on the ground'];

const SOLUTIONS = ['Every report carries photo + GPS + timestamp evidence', 'Duplicates and community confirmations strengthen cases before routing', 'Routing shows exactly why a case reached a department', 'Verified JS Members supply ground truth when needed', 'Every stage carries a deadline — overdue is visible', 'Resolution requires completion evidence', 'The citizen makes the final verification call'];

export default function Home() {
  const { user } = useAuth();
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #3b82f6 0, transparent 45%), radial-gradient(circle at 80% 70%, #f59e0b 0, transparent 40%)' }} />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2">
          <div>
            <span className="badge bg-white/10 text-civic-500">CIVIC PROBLEM → RESOLUTION PLATFORM</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              From Citizen Report to <span className="text-civic-500">Government Action</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-300">
              JanSetu does not just collect complaints. It creates one traceable case lifecycle — evidence, verification, jurisdiction, government action, ground investigation, execution, deadline tracking, resolution verification and closure.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link to={homeFor(user.role)} className="btn-amber !px-6 !py-3 text-base">Open my dashboard <ArrowRight size={18} /></Link>
              ) : (
                <>
                  <Link to="/citizen-report" className="btn-amber !px-6 !py-3 text-base">REPORT A PROBLEM <ArrowRight size={18} /></Link>
                  <Link to="/how-it-works" className="btn !border !border-white/25 !px-6 !py-3 text-base text-white hover:bg-white/10">How it works</Link>
                </>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-300">
              <span className="flex items-center gap-1.5"><MapPin size={15} className="text-civic-500" /> Auto-GPS evidence</span>
              <span className="flex items-center gap-1.5"><Timer size={15} className="text-civic-500" /> Deadline tracking</span>
              <span className="flex items-center gap-1.5"><Trophy size={15} className="text-civic-500" /> Civil Score & Field Trust Score</span>
            </div>
          </div>
          <div className="card self-center border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-widest text-civic-500">The JanSetu workflow</p>
            <div className="mt-4">
              {['SEE', 'CAPTURE', 'VERIFY', 'ROUTE', 'ASSESS', 'DECIDE', 'SOLVE', 'TRACK', 'VERIFY', 'CLOSE'].map((s, i, arr) => (
                <div key={s} className="flex items-stretch gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${i < 7 ? 'bg-civic-500 text-brand-900' : i < 9 ? 'bg-emerald-400 text-brand-900' : 'bg-white text-brand-900'}`}>{i + 1}</span>
                    {i < arr.length - 1 && <span className="w-px flex-1 bg-white/20" />}
                  </div>
                  <p className="pb-3 text-sm font-semibold tracking-wide text-slate-200">{s}{i === 6 && <span className="ml-2 font-normal text-slate-400">(government + citizen)</span>}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Why complaints die today</h2>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-600">
              {PROBLEMS.map((x) => (<li key={x} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />{x}</li>))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">One digital case lifecycle</h2>
            <div className="mt-4 space-y-2.5">
              {SOLUTIONS.map((x) => (<div key={x} className="flex gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-slate-600"><span className="mt-0.5 text-emerald-600">✓</span>{x}</div>))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900">Eight layers, one bridge</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-500">SEE → CAPTURE → VERIFY → ROUTE → ASSESS → DECIDE → SOLVE → TRACK → VERIFY → CLOSE</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((f, i) => (
              <div key={f.t} className="card-p transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><f.icon size={18} /></span>
                  <span className="text-[10px] font-bold text-slate-300">STEP {i + 1}</span>
                </div>
                <p className="mt-3 font-bold text-slate-800">{f.t}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">Built for every stakeholder</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r) => (
            <Link key={r.t} to={r.to} className="card-p group transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-civic-500/15 text-civic-600"><r.icon size={20} /></span>
              <p className="mt-3 font-bold text-slate-800">{r.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{r.d}</p>
              <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-700 opacity-0 transition group-hover:opacity-100">Open <ArrowRight size={12} /></p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-2xl bg-brand-900 px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-bold">Not a complaint box. An end-to-end resolution platform.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300">
            Evidence → Verification → Jurisdiction → Government → Ground Investigation → Technical Report → Decision → Execution → Deadline Tracking → Resolution Evidence → Citizen Verification → Re-complaint if needed.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/citizen-report" className="btn-amber !px-6 !py-3">REPORT A PROBLEM</Link>
            <Link to="/register" className="btn !border !border-white/25 !px-6 !py-3 text-white hover:bg-white/10">Join as JS Member or Business</Link>
          </div>
        </div>
      </section>
    </div>
  );
}


>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
