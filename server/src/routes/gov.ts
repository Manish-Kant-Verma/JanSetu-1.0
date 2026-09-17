import { Router } from 'express';
import { getDB, saveDB } from '../store';
import { requireAuth, requireRole, AuthedRequest } from '../auth';
import { nowISO, daysUntil, pushTimeline, notify, audit, addScore, sweepOverdue } from '../lib';

const router = Router();
router.use(requireAuth, requireRole('government'));

/** Dashboard overview: stage counters, overdue list, upcoming deadlines */
router.get('/overview', (req: AuthedRequest, res) => {
  sweepOverdue();
  const db = getDB();
  const u = req.user!;
  const mine = db.complaints.filter((c) => !u.orgId || c.routedTo?.orgId === u.orgId);
  const stageCount = (s: string[]) => mine.filter((c) => s.includes(c.status)).length;
  const waiting = stageCount(['submitted', 'under_review', 'verification_required', 'community_verification', 'verified', 'forwarded_to_government', 'reopened']);
  const field = stageCount(['technical_assessment_required', 'field_assignment_created', 'field_assignment_accepted', 'site_visit_pending', 'site_visit_verified', 'report_submitted', 'report_review', 'correction_required']);
  const decided = stageCount(['technical_report_approved', 'government_decision', 'government_direct_action', 'contractor_required', 'project_created', 'bidding', 'contractor_selected', 'work_in_progress']);
  const verifying = stageCount(['resolution_submitted', 'government_verified', 'citizen_verification']);
  const closed = stageCount(['closed']);
  const overdue = mine.filter((c) => c.overdueFlags.length && !['closed', 'rejected'].includes(c.status));
  const deadlines = mine
    .filter((c) => !['closed', 'rejected'].includes(c.status))
    .map((c) => ({ id: c.id, category: c.category, areaName: c.areaName, reviewDeadlineAt: c.reviewDeadlineAt, resolutionDeadlineAt: c.resolutionDeadlineAt, reviewDays: daysUntil(c.reviewDeadlineAt), resolutionDays: daysUntil(c.resolutionDeadlineAt), status: c.status }))
    .sort((a, b) => (a.reviewDays ?? 99) - (b.reviewDays ?? 99))
    .slice(0, 20);
  const reportsAwaiting = db.assignments.filter((a) => a.status === 'report_verified' && mine.some((c) => c.id === a.complaintId));
  res.json({ stats: { total: mine.length, waiting, field, decided, verifying, closed, overdue: overdue.length }, overdue, deadlines, reportsAwaitingCount: reportsAwaiting.length });
});

/** Government reviews a JS Member technical report: approve or correction */
router.post('/assignments/:id/review', (req: AuthedRequest, res) => {
  const db = getDB();
  const a = db.assignments.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'Assignment not found' });
  const { decision, note } = req.body || {};
  const c = db.complaints.find((x) => x.id === a.complaintId);
  if (!c) return res.status(404).json({ error: 'Complaint not found' });
  if (a.status !== 'report_verified') return res.status(400).json({ error: 'This report is not awaiting review' });
  if (decision === 'approve') {
    a.status = 'completed';
    pushTimeline(c, 'technical_report_approved', req.user!.id, req.user!.name, note || 'Technical report approved — decision on execution pending');
    pushTimeline(c, 'government_decision', 'system', 'JanSetu', 'Government to decide execution route');
    addScore(db.users.find((x) => x.id === a.jsmemberId)!, 5, 'Field report accepted by government');
    notify(a.jsmemberId!, 'Report accepted by government', `Your field report for ${c.id} was approved.`, '/jsmember/reports');
    audit(req.user, 'REPORT_APPROVED', c.id);
  } else {
    a.status = 'correction_required';
    a.reviewNote = note || 'Report needs corrections';
    pushTimeline(c, 'correction_required', req.user!.id, req.user!.name, `Government requested corrections: ${note || 'incomplete report'}`);
    addScore(db.users.find((x) => x.id === a.jsmemberId)!, -2, 'Government requested report corrections');
    notify(a.jsmemberId!, 'CORRECTION REQUIRED', `${c.id}: ${note || 'Report needs corrections'}`, '/jsmember/reports');
    audit(req.user, 'REPORT_CORRECTION_REQUESTED', c.id);
  }
  saveDB();
  res.json({ assignment: a });
});

/** Progress on a government action */
router.post('/actions/:id/progress', (req: AuthedRequest, res) => {
  const db = getDB();
  const act = db.actions.find((x) => x.id === req.params.id);
  if (!act) return res.status(404).json({ error: 'Action not found' });
  const { percent, note } = req.body || {};
  const pct = Math.max(0, Math.min(100, Number(percent) || 0));
  act.progress.push({ at: nowISO(), percent: pct, note: note || '' });
  act.status = pct >= 100 ? 'resolution_submitted' : 'in_progress';
  const c = db.complaints.find((x) => x.id === act.complaintId);
  if (c) {
    pushTimeline(c, 'work_in_progress', req.user!.id, req.user!.name, `Progress ${pct}% — ${note || 'update'}`);
    notify(c.citizenId, 'Progress update', `${c.id}: ${pct}% — ${note || 'work progressing'}.`, `/citizen/complaints/${c.id}`);
  }
  audit(req.user, 'ACTION_PROGRESS', `${act.id} ${pct}%`);
  saveDB();
  res.json({ action: act });
});

export default router;
