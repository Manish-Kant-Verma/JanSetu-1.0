import { useEffect, useState } from 'react';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, EmptyState, Spinner } from '../../components/ui';
import { BID_STATUS_CLS, inr, fmtDate } from '../../constants';
import type { Bid } from '../../types';

export default function MyBids() {
  const [bids, setBids] = useState<Bid[] | null>(null);
  useEffect(() => { api.get('/projects').then((r) => setBids(r.myBids)); }, []);
  if (!bids) return <Spinner />;
  return (
    <div>
      <PageHeader title="My Bids" sub="Full bid history with outcomes. Unsuccessful bids are notified transparently." />
      {bids.length === 0 ? (
        <EmptyState icon={<FileText size={36} />} title="No bids yet" sub="Browse opportunities and submit your first technical proposal." />
      ) : (
        <div className="space-y-3">
          {bids.map((b) => (
            <div key={b.id} className="card-p flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-bold text-brand-800">{b.id}</span>
              <span className={`badge ${BID_STATUS_CLS[b.status]}`}>{b.status}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">{b.project?.code} — {b.project?.title}</p>
                <p className="text-xs text-slate-500">Submitted {fmtDate(b.submittedAt)} · {inr(b.amount)} · {b.timelineDays} days · docs: {b.documents.join(', ')}</p>
                {b.proposal && <p className="mt-1 line-clamp-1 text-xs text-slate-500">{b.proposal}</p>}
              </div>
              {b.status === 'accepted' && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 size={13} /> Selected</span>}
              {b.status === 'rejected' && <span className="flex items-center gap-1 text-xs text-slate-400"><XCircle size={13} /> Not selected</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
