import { Link } from 'react-router-dom';
import { Camera, ShieldCheck, GitBranch, ClipboardCheck, Landmark, HardHat, FileCheck2, RefreshCcw, Bell, Timer } from 'lucide-react';

const STEPS = [
  { n: 1, icon: Camera, t: 'Citizen captures the problem', d: 'Camera opens, JanSetu automatically records current device GPS, timestamp and photo. Optional: category, description, voice note, extra photos.' },
  { n: 2, icon: ShieldCheck, t: 'JanSetu verification', d: 'AI suggests a category (a signal, never a decision). Duplicate detection compares GPS proximity, category and time against nearby cases. Community confirmations strengthen evidence — but community clicks never replace official government review.' },
  { n: 3, icon: GitBranch, t: 'Routing engine', d: 'Problem + GPS + jurisdiction + department + configured rules decide the responsible authority. Every case shows its routing explanation — no black box.' },
  { n: 4, icon: ClipboardCheck, t: 'Government review', d: 'The responsible official sees the full case file: evidence, GPS, community support, duplicates, history. They decide: is field/technical assessment required?' },
  { n: 5, icon: ClipboardCheck, t: 'Path A — direct action', d: 'No verification needed → government action with existing resources → work started → progress → completion → resolution evidence → government verification → citizen verification.' },
  { n: 6, icon: ClipboardCheck, t: 'Path B — JS Member assessment', d: 'Government requests ground verification → JanSetu matches eligible JS Members by location, skills, availability and Field Trust Score → member accepts → START SITE VISIT records fresh GPS → fresh photos → field investigation → technical report.' },
  { n: 7, icon: Landmark, t: 'Report review & decision', d: 'JanSetu auto-checks the report (completeness, GPS, evidence). Government then chooses: government resources, technical/specialist execution, or a contractor project with a transparent procurement record.' },
  { n: 8, icon: HardHat, t: 'Execution & deadlines', d: 'Contractor submits progress evidence; every stage carries a configured deadline with reminders and OVERDUE escalation via the configured administrative process.' },
  { n: 9, icon: FileCheck2, t: 'Resolution & citizen verification', d: 'Government submits completion photo, date and details → RESOLUTION SUBMITTED → GOVERNMENT VERIFIED → the citizen is asked: has this problem actually been solved?' },
  { n: 10, icon: RefreshCcw, t: 'Close or re-complain', d: 'YES → case closes and scores update. NO → fresh image + GPS + reason → case reopens → government notified → further action. The loop continues until reality matches the record.' },
];

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900">How JanSetu Works</h1>
      <p className="mt-3 text-slate-600">
        One pothole, one case, one traceable lifecycle. Every stage below is implemented in this platform —
        with deadlines, notifications, evidence requirements and transparent scoring.
      </p>
      <div className="mt-10 space-y-4">
        {STEPS.map((s) => (
          <div key={s.n} className="card-p flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-800 font-bold text-civic-500">{s.n}</span>
              {s.n < STEPS.length && <span className="mt-1 w-px flex-1 bg-slate-200" />}
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-bold text-slate-800"><s.icon size={16} className="text-brand-700" /> {s.t}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="card-p">
          <p className="flex items-center gap-2 font-bold text-slate-800"><Timer size={16} className="text-civic-600" /> Deadline system</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Each stage carries a configured deadline — complaint review, JS Member assessment, government decision, resolution. Users see “7 days remaining”, “2 days remaining”, “Deadline tomorrow” and <b>OVERDUE</b>. Missed JS Member assignments are returned and reassigned; overdue government cases are escalated through the configured administrative process — the platform never claims authority over officials.
          </p>
        </div>
        <div className="card-p">
          <p className="flex items-center gap-2 font-bold text-slate-800"><Bell size={16} className="text-civic-600" /> Trust scores</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            <b>Civil Score</b> rewards verified reports, useful confirmations and accurate resolution feedback. <b>Field Trust Score</b> rewards GPS-verified site visits, accepted reports and on-time submissions. <b>Contractor Performance</b> records government-verified completions. All scores are rule-based and explainable — visible inside each portal.
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-xl bg-brand-900 p-8 text-center text-white">
        <p className="text-sm uppercase tracking-widest text-civic-500">The one-line workflow</p>
        <p className="mx-auto mt-3 max-w-3xl text-lg font-semibold leading-relaxed">
          Citizen reports → JanSetu verifies → Government routes & reviews → JS Member assesses when required → Government decides how to solve → Government/Contractor executes → JanSetu tracks deadlines → Resolution is verified → Citizen confirms → Case closes or is re-complained.
        </p>
        <Link to="/citizen-report" className="btn-amber mt-6 !px-6 !py-3">REPORT A PROBLEM</Link>
      </div>
    </div>
  );
}
