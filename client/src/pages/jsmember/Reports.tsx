import { useEffect, useState } from 'react';
import { FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, EmptyState, Spinner } from '../../components/ui';
import { StatusBadge } from '../../components/StatusTimeline';
import { fmtDateTime } from '../../constants';
import type { Assignment } from '../../types';

export default function JsReports() {
  const [mine, setMine] = useState<Assignment[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => { api.get('/assignments').then((r) => setMine(r.mine)); }, []);
  if (!mine) return <Spinner />;
  const withReports = mine.filter((a) => a.report);

  return (
    <div>
      <PageHeader title="My Reports" sub="Every field report you submitted, with its JanSetu and government review status." />
      {withReports.length === 0 ? (
        <EmptyState icon={<FileText size={36} />} title="No reports yet" sub="Complete a site visit and submit your first field report." />
      ) : (
        <div className="space-y-3">
          {withReports.map((a) => (
            <div key={a.id} className="card-p">
              <button className="flex w-full flex-wrap items-center gap-2 text-left" onClick={() => setOpenId(openId === a.id ? null : a.id)}>
                <span className="font-mono text-xs font-bold text-brand-800">{a.id}</span>
                <StatusBadge status={a.status} cls="bg-violet-100 text-violet-800" />
                <span className="text-xs text-slate-500">{a.complaint?.id} · {a.complaint?.category} · submitted {fmtDateTime(a.report!.submittedAt)}</span>
                <span className="ml-auto">
                  {a.status === 'report_verified' && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 size={12} /> JanSetu verified</span>}
                  {a.status === 'completed' && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={12} /> Accepted by government</span>}
                  {a.status === 'correction_required' && <span className="flex items-center gap-1 text-xs font-semibold text-rose-600"><AlertTriangle size={12} /> Corrections needed</span>}
                </span>
              </button>
              {openId === a.id && (
                <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-700">
                  {[
                    ['Condition', a.report!.condition], ['Measurements', a.report!.measurements], ['Observations', a.report!.observations],
                    ['Probable cause', a.report!.probableCause], ['Recommended action', a.report!.recommendedAction],
                    ['Required resources', a.report!.requiredResources], ['Traffic impact', a.report!.trafficImpact], ['Safety concerns', a.report!.safetyConcerns],
                  ].map(([k, v]) => v ? <p key={k} className="mt-1.5"><b className="text-slate-500">{k}:</b> {v}</p> : null)}
                  <p className="mt-1.5"><b className="text-slate-500">Severity:</b> {a.report!.severity} {a.report!.gpsVerified && <span className="badge bg-emerald-100 text-emerald-800">GPS verified</span>}</p>
                  <div className="mt-2 flex gap-2">{a.report!.images.map((img) => <img key={img} src={img} className="h-20 w-28 rounded object-cover" alt="" />)}</div>
                  {a.reviewNote && <p className="mt-2 text-xs text-rose-600">Review note: {a.reviewNote}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
