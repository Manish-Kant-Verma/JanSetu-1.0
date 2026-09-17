import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mic, MapPin, ArrowRight, ArrowLeft, CheckCircle2, Copy, Send } from 'lucide-react';
import { api } from '../../api';
import { UploadBox } from '../../components/UploadBox';
import { Alert, Field, PageHeader, ProgressBar } from '../../components/ui';
import { CATEGORIES, DEMO_GPS } from '../../constants';

interface Precheck { ai: { category: string; confidence: number; signals: string[] }; duplicates: { id: string; category: string; areaName: string; distanceM: number; confirmations: number; status: string; createdAt: string; image?: string }[]; routingPreview: { orgName: string; department: string } | null }

export default function ReportProblem({ full }: { full?: boolean }) {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [gps, setGps] = useState<{ lat: number; lng: number; area?: string; auto: boolean } | null>(null);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [gpsErr, setGpsErr] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [areaName, setAreaName] = useState('');
  const [listening, setListening] = useState(false);
  const [precheck, setPrecheck] = useState<Precheck | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<{ id: string } | null>(null);
  const [linkTo, setLinkTo] = useState<string | null>(null);

  const detectGps = () => {
    setGpsErr('');
    setGpsBusy(true);
    if (!navigator.geolocation) {
      setGpsErr('GPS not available in this browser — use a demo location below.');
      setGpsBusy(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, auto: true }); setGpsBusy(false); },
      () => { setGpsErr('Location permission denied — pick a demo location below to continue.'); setGpsBusy(false); },
      { timeout: 8000 },
    );
  };

  const voiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setErr('Voice input is not supported in this browser.'); return; }
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e: any) => setDescription((d) => `${d} ${e.results[0][0].transcript}`.trim());
    rec.start();
  };

  const runPrecheck = async () => {
    if (!gps) { setErr('GPS location is required — JanSetu attaches it automatically.'); return; }
    setBusy(true);
    setErr('');
    try {
      const pc: Precheck = await api.post('/complaints/precheck', { lat: gps.lat, lng: gps.lng, category, description });
      setPrecheck(pc);
      setStep(3);
    } catch (ex: any) { setErr(ex.message); } finally { setBusy(false); }
  };

  const submit = async (linked?: string | null) => {
    setBusy(true);
    setErr('');
    try {
      const fd = new FormData();
      images.forEach((img) => fd.append('images', img));
      fd.append('lat', String(gps!.lat));
      fd.append('lng', String(gps!.lng));
      fd.append('category', category);
      fd.append('description', description);
      fd.append('areaName', areaName || gps!.area || '');
      if (linked) fd.append('linkedTo', linked);
      const { complaint } = await api.postForm('/complaints', fd);
      setDone(complaint);
      setLinkTo(linked || null);
    } catch (ex: any) { setErr(ex.message); } finally { setBusy(false); }
  };

  if (done) {
    return (
      <div className={`mx-auto max-w-lg ${full ? 'py-12' : ''}`}>
        <div className="card-p text-center">
          <CheckCircle2 size={52} className="mx-auto text-emerald-500" />
          <h2 className="mt-3 text-xl font-bold text-slate-900">Complaint registered</h2>
          <p className="mt-1 text-sm text-slate-500">Your unique complaint ID — keep it to track the case:</p>
          <p className="mt-3 rounded-xl bg-brand-900 px-6 py-4 font-mono text-2xl font-bold tracking-wider text-civic-500">{done.id}</p>
          {linkTo && <p className="mt-3 text-sm text-slate-500">Your evidence was linked to existing case <b>{linkTo}</b> as a confirmation of the same problem.</p>}
          {precheck?.routingPreview && <p className="mt-3 text-sm text-slate-500">Routing preview: <b>{precheck.routingPreview.orgName} — {precheck.routingPreview.department}</b></p>}
          <div className="mt-6 flex flex-col gap-2">
            <button className="btn-primary" onClick={() => nav(`/citizen/complaints/${done.id}`)}>Track this complaint</button>
            <button className="btn-outline" onClick={() => { setDone(null); setStep(1); setImages([]); setPrecheck(null); setDescription(''); setCategory(''); }}>Report another problem</button>
            <button className="btn-ghost" onClick={() => nav('/citizen')}>Back to dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const StepDots = (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Step {step} of 3</span>
        <span>{step === 1 ? 'Capture' : step === 2 ? 'Details' : 'Review & submit'}</span>
      </div>
      <ProgressBar percent={(step / 3) * 100} tone="bg-civic-500" />
    </div>
  );

  return (
    <div className={`mx-auto max-w-xl ${full ? 'py-12' : ''}`}>
      {StepDots}
      {err && <div className="mb-4"><Alert tone="error">{err}</Alert></div>}

      {step === 1 && (
        <div className="card-p space-y-4">
          <p className="flex items-center gap-2 font-bold text-slate-800"><Camera size={17} className="text-brand-700" /> Capture the problem</p>
          <UploadBox images={images} onChange={setImages} max={4} label="Take photo" />
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"><MapPin size={14} className="text-civic-600" /> Current GPS</p>
            {!gps ? (
              <button type="button" className="btn-outline btn-sm mt-2" onClick={detectGps} disabled={gpsBusy}>{gpsBusy ? 'Detecting…' : 'Auto-detect GPS'}</button>
            ) : (
              <p className="mt-1.5 text-xs text-slate-600">
                {gps.auto ? '📡 Device GPS: ' : '📍 Using demo location: '}
                <b>{gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}</b>{gps.area ? ` — ${gps.area}` : ''}
              </p>
            )}
            {gpsErr && <p className="mt-1.5 text-xs text-rose-600">{gpsErr}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Demo locations:</span>
              {Object.entries(DEMO_GPS).map(([k, v]) => (
                <button key={k} type="button" className="badge bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700" onClick={() => setGps({ ...v, auto: false })}>
                  {v.area.split(',')[0]}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-primary w-full" onClick={() => { if (!images.length) { setErr('A photo of the problem is required — it is your evidence.'); return; } setErr(''); setStep(2); }}>Continue <ArrowRight size={15} /></button>
        </div>
      )}

      {step === 2 && (
        <div className="card-p space-y-4">
          <p className="font-bold text-slate-800">Optional details</p>
          <Field label="Problem category" hint="Leave on auto and JanSetu will suggest one from your photo + description.">
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Auto-detect (recommended)</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Description (optional)">
            <div className="flex gap-2">
              <textarea className="input min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What exactly is wrong? Since when? Who is affected?" />
              <button type="button" onClick={voiceInput} title="Voice input" className={`btn-outline shrink-0 ${listening ? '!border-rose-400 !text-rose-600' : ''}`}><Mic size={16} /></button>
            </div>
          </Field>
          <Field label="Area / landmark name (optional)">
            <input className="input" value={areaName} onChange={(e) => setAreaName(e.target.value)} placeholder="e.g. Vijay Nagar Square" />
          </Field>
          <div className="flex gap-2">
            <button className="btn-outline flex-1" onClick={() => setStep(1)}><ArrowLeft size={15} /> Back</button>
            <button className="btn-primary flex-1" onClick={runPrecheck} disabled={busy}>{busy ? 'Checking…' : 'Review report'}</button>
          </div>
        </div>
      )}

      {step === 3 && precheck && (
        <div className="card-p space-y-4">
          <p className="font-bold text-slate-800">Review your report</p>
          <div className="flex gap-3">
            {images[0] && <img src={URL.createObjectURL(images[0])} alt="" className="h-20 w-24 rounded-lg object-cover" />}
            <div className="text-sm text-slate-600">
              <p><span className="badge bg-slate-100 text-slate-700">{precheck.ai.category}</span> <span className="ml-1 text-xs">AI signal {Math.round(precheck.ai.confidence * 100)}% {category ? '(you confirmed)' : '(suggested)'}</span></p>
              <p className="mt-1.5"><b>GPS:</b> {gps!.lat.toFixed(5)}, {gps!.lng.toFixed(5)}</p>
              {description && <p className="mt-1 line-clamp-2">{description}</p>}
              {precheck.routingPreview && <p className="mt-1.5 text-xs">Will be routed to: <b>{precheck.routingPreview.orgName} — {precheck.routingPreview.department}</b></p>}
            </div>
          </div>

          {precheck.duplicates.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <p className="flex items-center gap-1.5 text-sm font-bold text-amber-900"><Copy size={14} /> Possible existing complaint{precheck.duplicates.length > 1 ? 's' : ''} nearby</p>
              {precheck.duplicates.slice(0, 3).map((d) => (
                <div key={d.id} className="mt-2 flex items-center gap-2 rounded-lg bg-white p-2">
                  {d.image && <img src={d.image} alt="" className="h-10 w-14 rounded object-cover" />}
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-mono font-bold text-brand-800">{d.id}</p>
                    <p className="text-slate-500">{d.category} · {d.distanceM} m away · {d.confirmations} confirmation(s) · {d.status.replace(/_/g, ' ')}</p>
                  </div>
                  <button className="btn-amber btn-sm" onClick={() => submit(d.id)} disabled={busy}>Same problem</button>
                </div>
              ))}
              <p className="mt-2 text-[11px] text-amber-800">If it is the same problem, your evidence strengthens the existing case. Community clicks never replace official government review.</p>
            </div>
          )}

          <div className="flex gap-2">
            <button className="btn-outline flex-1" onClick={() => setStep(2)} disabled={busy}><ArrowLeft size={15} /> Back</button>
            <button className="btn-primary flex-1" onClick={() => submit(null)} disabled={busy}><Send size={15} /> {busy ? 'Submitting…' : 'Submit as new problem'}</button>
          </div>
        </div>
      )}
    </div>
  );
}



