export const CATEGORIES = ['Road Damage', 'Garbage', 'Drainage', 'Streetlight', 'Water Leakage', 'Public Infrastructure', 'Other'];

export const STATUS_META: Record<string, { label: string; cls: string; step: number }> = {
  submitted: { label: 'SUBMITTED', cls: 'bg-slate-100 text-slate-700', step: 0 },
  under_review: { label: 'UNDER REVIEW', cls: 'bg-slate-100 text-slate-700', step: 1 },
  verification_required: { label: 'VERIFICATION REQUIRED', cls: 'bg-amber-100 text-amber-800', step: 2 },
  community_verification: { label: 'COMMUNITY VERIFICATION', cls: 'bg-amber-100 text-amber-800', step: 2 },
  verified: { label: 'VERIFIED', cls: 'bg-sky-100 text-sky-800', step: 3 },
  forwarded_to_government: { label: 'FORWARDED TO GOVERNMENT', cls: 'bg-sky-100 text-sky-800', step: 4 },
  technical_assessment_required: { label: 'TECHNICAL ASSESSMENT REQUIRED', cls: 'bg-violet-100 text-violet-800', step: 5 },
  field_assignment_created: { label: 'FIELD ASSIGNMENT CREATED', cls: 'bg-violet-100 text-violet-800', step: 6 },
  field_assignment_accepted: { label: 'FIELD ASSIGNMENT ACCEPTED', cls: 'bg-violet-100 text-violet-800', step: 7 },
  site_visit_pending: { label: 'SITE VISIT PENDING', cls: 'bg-violet-100 text-violet-800', step: 8 },
  site_visit_verified: { label: 'SITE VISIT VERIFIED', cls: 'bg-violet-100 text-violet-800', step: 9 },
  report_submitted: { label: 'REPORT SUBMITTED', cls: 'bg-violet-100 text-violet-800', step: 10 },
  report_review: { label: 'REPORT REVIEW', cls: 'bg-violet-100 text-violet-800', step: 11 },
  correction_required: { label: 'CORRECTION REQUIRED', cls: 'bg-rose-100 text-rose-700', step: 11 },
  technical_report_approved: { label: 'TECHNICAL REPORT APPROVED', cls: 'bg-emerald-100 text-emerald-800', step: 12 },
  government_decision: { label: 'GOVERNMENT DECISION', cls: 'bg-emerald-100 text-emerald-800', step: 13 },
  government_direct_action: { label: 'GOVERNMENT DIRECT ACTION', cls: 'bg-emerald-100 text-emerald-800', step: 14 },
  contractor_required: { label: 'CONTRACTOR REQUIRED', cls: 'bg-orange-100 text-orange-800', step: 14 },
  project_created: { label: 'PROJECT CREATED', cls: 'bg-orange-100 text-orange-800', step: 15 },
  bidding: { label: 'BIDDING / PROCUREMENT', cls: 'bg-orange-100 text-orange-800', step: 16 },
  contractor_selected: { label: 'CONTRACTOR SELECTED', cls: 'bg-orange-100 text-orange-800', step: 17 },
  work_in_progress: { label: 'WORK IN PROGRESS', cls: 'bg-orange-100 text-orange-800', step: 18 },
  resolution_submitted: { label: 'RESOLUTION SUBMITTED', cls: 'bg-teal-100 text-teal-800', step: 19 },
  government_verified: { label: 'GOVERNMENT VERIFIED', cls: 'bg-teal-100 text-teal-800', step: 20 },
  citizen_verification: { label: 'CITIZEN VERIFICATION', cls: 'bg-amber-100 text-amber-800', step: 21 },
  closed: { label: 'CLOSED ✓', cls: 'bg-emerald-100 text-emerald-800', step: 22 },
  reopened: { label: 'RE-OPENED', cls: 'bg-rose-100 text-rose-700', step: 12 },
  duplicate: { label: 'DUPLICATE', cls: 'bg-slate-200 text-slate-600', step: 0 },
  rejected: { label: 'REJECTED', cls: 'bg-rose-100 text-rose-700', step: 0 },
};

export const statusMeta = (s: string) => STATUS_META[s] || { label: s.replace(/_/g, ' ').toUpperCase(), cls: 'bg-slate-100 text-slate-700', step: 0 };

export const ACTION_STATUS_CLS: Record<string, string> = {
  planned: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-orange-100 text-orange-800',
  resolution_submitted: 'bg-teal-100 text-teal-800',
  verified: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-emerald-100 text-emerald-800',
};

export const PROJECT_STATUS_CLS: Record<string, string> = {
  open_bidding: 'bg-amber-100 text-amber-800',
  evaluation: 'bg-sky-100 text-sky-800',
  awarded: 'bg-violet-100 text-violet-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-emerald-100 text-emerald-800',
};

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  open_bidding: 'OPEN FOR BIDDING',
  evaluation: 'BID EVALUATION',
  awarded: 'AWARDED',
  in_progress: 'WORK IN PROGRESS',
  completed: 'COMPLETED',
};

export const BID_STATUS_CLS: Record<string, string> = {
  submitted: 'bg-sky-100 text-sky-800',
  under_review: 'bg-amber-100 text-amber-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-700',
};

export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
export const timeAgo = (iso?: string) => {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  const d = Math.floor(s / 86400);
  return d === 1 ? 'yesterday' : `${d} days ago`;
};
export const inr = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;
export const daysBetween = (a: Date | string, b: Date | string) => Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

export const DEMO_GPS = {
  vijayNagar: { lat: 22.7533, lng: 75.8933, area: 'Vijay Nagar Square, Indore' },
  palasia: { lat: 22.7599, lng: 75.8895, area: 'Palasia Square, Indore' },
  bhawarkuan: { lat: 22.7248, lng: 75.8839, area: 'Bhawarkuan Road, Indore' },
  default: { lat: 22.7196, lng: 75.8577, area: 'Rajwada, Indore' },
};
