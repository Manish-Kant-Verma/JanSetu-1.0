import { ShieldCheck, Landmark, Users, HardHat, Scale, Database, Globe2, Cpu } from 'lucide-react';

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900">About JanSetu</h1>
      <p className="mt-3 text-lg text-slate-600">From Citizen Report to Government Action.</p>

      <div className="mt-8 card-p">
        <p className="text-sm leading-relaxed text-slate-600">
          JanSetu is a civic problem-to-resolution platform that connects <b>Citizens → JanSetu → Government → JS Members → Contractors/Businesses → Resolution</b>.
          It does not merely collect complaints — it creates a complete, traceable workflow from reporting a problem to verifying its resolution,
          connecting evidence, verification, jurisdiction, government action, ground investigation, technical reporting, execution, deadline tracking
          and citizen verification into one digital case lifecycle.
        </p>
      </div>

      <h2 className="mt-10 text-xl font-bold text-slate-900">Five solution layers</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {[
          ['Layer 1 — Citizen Reporting', 'Photo, current GPS, optional description/category/voice and additional evidence — reporting stays simple.'],
          ['Layer 2 — JanSetu Verification', 'Image, location, duplicates, nearby complaints, category, community confirmations, evidence quality.'],
          ['Layer 3 — Government Routing & Action', 'Problem + GPS + jurisdiction + department + configured rules identify the responsible route.'],
          ['Layer 4 — JS Member Field Verification', 'Government → JanSetu → verified member → site visit → fresh evidence → field report → government.'],
          ['Layer 5 — Resolution', 'Government resources, technical execution or contractor projects — tracked to verified closure.'],
        ].map(([t, d]) => (
          <div key={t} className="card-p"><p className="font-bold text-slate-800">{t}</p><p className="mt-1 text-sm text-slate-600">{d}</p></div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold text-slate-900">Principles we do not compromise</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="card-p flex gap-3"><Scale className="mt-0.5 shrink-0 text-civic-600" size={18} /><p className="text-sm text-slate-600"><b>JS Members never earn money on JanSetu.</b> No wallet, no per-report fee. Their value is verified civic participation and reliable ground truth.</p></div>
        <div className="card-p flex gap-3"><Landmark className="mt-0.5 shrink-0 text-civic-600" size={18} /><p className="text-sm text-slate-600"><b>JanSetu does not sell government tenders.</b> Contractors never pay to win projects; procurement decisions remain with government under applicable rules.</p></div>
        <div className="card-p flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-civic-600" size={18} /><p className="text-sm text-slate-600"><b>Community clicks are signals, not findings.</b> Government retains official review authority on every case.</p></div>
        <div className="card-p flex gap-3"><Database className="mt-0.5 shrink-0 text-civic-600" size={18} /><p className="text-sm text-slate-600"><b>Everything is auditable.</b> Every status change, route, decision and score event is logged with actor and timestamp.</p></div>
      </div>

      <h2 className="mt-10 text-xl font-bold text-slate-900">Technology</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-p"><Cpu size={18} className="text-brand-700" /><p className="mt-2 font-bold text-slate-800">Interface</p><p className="text-xs text-slate-500">React + TypeScript + Tailwind, responsive for mobile reporting</p></div>
        <div className="card-p"><Database size={18} className="text-brand-700" /><p className="mt-2 font-bold text-slate-800">Platform</p><p className="text-xs text-slate-500">REST API with JWT auth, role-based access, JSON case store (swap-ready for PostgreSQL)</p></div>
        <div className="card-p"><Globe2 size={18} className="text-brand-700" /><p className="mt-2 font-bold text-slate-800">GIS</p><p className="text-xs text-slate-500">GPS capture, distance/duplicate calculation, jurisdiction plotting</p></div>
        <div className="card-p"><Users size={18} className="text-brand-700" /><p className="mt-2 font-bold text-slate-800">Intelligence</p><p className="text-xs text-slate-500">Category signals, duplicate detection, member matching, transparent scores</p></div>
      </div>
    </div>
  );
}
