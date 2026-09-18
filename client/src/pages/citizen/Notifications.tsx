import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { api } from '../../api';
import { PageHeader, EmptyState } from '../../components/ui';
import type { Notification } from '../../types';
import { fmtDateTime } from '../../constants';

export default function Notifications() {
  const [notes, setNotes] = useState<Notification[] | null>(null);
  useEffect(() => {
    api.get('/notifications').then((r) => { setNotes(r.notifications); api.post('/notifications/read-all'); });
  }, []);
  return (
    <div>
      <PageHeader title="Notifications" sub="Stage changes, deadlines, assignments and verification requests." right={
        <button className="btn-outline btn-sm" onClick={async () => { await api.post('/notifications/read-all'); setNotes((n) => n?.map((x) => ({ ...x, read: true })) || null); }}><CheckCheck size={14} /> Mark all read</button>
      } />
      {!notes ? null : notes.length === 0 ? (
        <EmptyState icon={<Bell size={36} />} title="Nothing yet" sub="You will be notified at every workflow stage of your cases." />
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className={`card flex items-start gap-3 p-4 ${n.read ? '' : 'border-l-4 border-l-brand-700'}`}>
              <Bell size={16} className="mt-0.5 shrink-0 text-brand-700" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">{n.title}</p>
                <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>
                <p className="mt-1 text-xs text-slate-400">{fmtDateTime(n.at)}</p>
              </div>
              {n.link && <Link to={n.link} className="btn-outline btn-sm shrink-0">Open</Link>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
