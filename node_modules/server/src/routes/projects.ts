import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getDB, saveDB, UPLOAD_DIR } from '../store';
import { requireAuth, requireRole, AuthedRequest } from '../auth';
import { nowISO, daysUntil, pushTimeline, notify, notifyOrg, audit, sweepOverdue } from '../lib';

const router = Router();
router.use(requireAuth);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname) || '.pdf'}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const files = (req: AuthedRequest) => ((req.files as any[]) || []).map((f) => `/uploads/${f.filename}`);

/** Projects visible by role */
router.get('/', (req: AuthedRequest, res) => {
  sweepOverdue();
  const db = getDB();
  const u = req.user!;
  const decorate = (p: any) => ({
    ...p,
    bids: db.bids.filter((b) => b.projectId === p.id).map((b) => ({ ...b, contractorName: db.users.find((x) => x.id === b.contractorId)?.businessName || '' })),
    complaint: db.complaints.find((c) => c.id === p.complaintId),
    daysLeft: daysUntil(p.bidDeadlineAt),
  });
  if (u.role === 'contractor') {
    const open = db.projects.filter((p) => p.status === 'open_bidding').map(decorate);
    const mine = db.projects.filter((p) => p.awardedContractorId === u.id).map(decorate);
    const myBids = db.bids.filter((b) => b.contractorId === u.id).map((b) => ({ ...b, project: db.projects.find((p) => p.id === b.projectId) }));
    return res.json({ open, mine, myBids });
  }
  res.json({ all: db.projects.map(decorate) });
});

/** Contractor submits a bid (verified contractors only) */
router.post('/:id/bid', requireRole('contractor'), upload.array('documents', 5), (req: AuthedRequest, res) => {
  const db = getDB();
  const p = db.projects.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  if (p.status !== 'open_bidding') return res.status(400).json({ error: 'Bid window is closed for this project' });
  if (!req.user!.verified) return res.status(403).json({ error: 'Your business is pending JanSetu verification. An admin must verify it before you can bid.' });
  if (db.bids.some((b) => b.projectId === p.id && b.contractorId === req.user!.id)) return res.status(400).json({ error: 'You have already submitted a bid for this project' });
  const b = req.body || {};
  const amount = Number(b.amount);
  if (!amount || amount <= 0) return res.status(400).json({ error: 'A valid bid amount is required' });
  const bid = {
    id: `BD-2026-${String(db.bids.length + 1).padStart(3, '0')}`,
    projectId: p.id, contractorId: req.user!.id, amount,
    proposal: b.proposal || '', timelineDays: Number(b.timelineDays) || 30,
    documents: files(req).length ? files(req) : ['(no files attached)'],
    status: 'submitted' as const, submittedAt: nowISO(),
  };
  db.bids.push(bid);
  const creator = db.users.find((x) => x.id === p.createdBy);
  if (creator?.orgId) notifyOrg(creator.orgId, `New bid on ${p.code}`, `${req.user!.businessName} bid ₹${amount.toLocaleString('en-IN')} (${bid.timelineDays} days).`, '/gov/projects');
  audit(req.user, 'BID_SUBMITTED', `${bid.id} on ${p.code}`);
  saveDB();
  res.json({ bid });
});

/** Government awards a bid → procurement decision recorded */
router.post('/:id/award', requireRole('government'), (req: AuthedRequest, res) => {
  const db = getDB();
  const p = db.projects.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const bid = db.bids.find((b) => b.id === req.body?.bidId && b.projectId === p.id);
  if (!bid) return res.status(400).json({ error: 'Select a valid bid to award' });
  if (p.status !== 'open_bidding' && p.status !== 'evaluation') return res.status(400).json({ error: 'This project is not in the bidding stage' });
  const contractor = db.users.find((u) => u.id === bid.contractorId);
  if (!contractor?.verified) return res.status(400).json({ error: 'This contractor is not verified by JanSetu Admin' });
  p.awardedBidId = bid.id;
  p.awardedContractorId = contractor.id;
  p.status = 'awarded';
  db.bids.filter((b) => b.projectId === p.id).forEach((b) => { b.status = b.id === bid.id ? 'accepted' : 'rejected'; });
  const c = db.complaints.find((x) => x.id === p.complaintId);
  if (c) {
    pushTimeline(c, 'contractor_selected', req.user!.id, req.user!.name, `${contractor.businessName} selected through applicable process (bid ${bid.id})`);
    pushTimeline(c, 'work_in_progress', req.user!.id, req.user!.name, 'Awaiting contractor mobilisation');
  }
  notify(contractor.id, 'Project awarded to you', `${p.code} — ${p.title}. Start execution and submit progress evidence.`, '/contractor/projects');
  db.bids.filter((b) => b.projectId === p.id && b.contractorId !== contractor.id).forEach((b) => {
    if (b.status === 'rejected') notify(b.contractorId, 'Bid not selected', `${p.code}: your bid was not selected. The government selection followed the applicable procurement procedure.`, '/contractor/bids');
  });
  audit(req.user, 'BID_AWARDED', `${p.code} → ${contractor.businessName}`);
  saveDB();
  res.json({ project: p });
});

/** Contractor posts progress with evidence */
router.post('/:id/progress', requireRole('contractor'), upload.array('images', 4), (req: AuthedRequest, res) => {
  const db = getDB();
  const p = db.projects.find((x) => x.id === req.params.id && x.awardedContractorId === req.user!.id);
  if (!p) return res.status(404).json({ error: 'Project not found for your business' });
  if (!['awarded', 'in_progress'].includes(p.status)) return res.status(400).json({ error: 'Project is not in execution' });
  const pct = Math.max(0, Math.min(99, Number(req.body?.percent) || 0));
  p.status = 'in_progress';
  p.progress.push({ at: nowISO(), percent: pct, note: req.body?.note || '', images: files(req) });
  const c = db.complaints.find((x) => x.id === p.complaintId);
  if (c) {
    pushTimeline(c, 'work_in_progress', req.user!.id, req.user!.businessName || 'Contractor', `Progress ${pct}% — ${req.body?.note || 'update'}`);
    notify(c.citizenId, 'Progress update', `${c.id}: ${pct}% — ${req.body?.note || 'work progressing'}.`, `/citizen/complaints/${c.id}`);
  }
  if (p.createdBy) notify(p.createdBy, `Progress on ${p.code}`, `${pct}% — ${req.body?.note || 'update'}`, '/gov/projects');
  audit(req.user, 'PROJECT_PROGRESS', `${p.code} ${pct}%`);
  saveDB();
  res.json({ project: p });
});

/** Contractor marks work complete → government must submit resolution */
router.post('/:id/complete', requireRole('contractor'), (req: AuthedRequest, res) => {
  const db = getDB();
  const p = db.projects.find((x) => x.id === req.params.id && x.awardedContractorId === req.user!.id);
  if (!p) return res.status(404).json({ error: 'Project not found for your business' });
  if (p.status !== 'in_progress' && p.status !== 'awarded') return res.status(400).json({ error: 'Project is not in execution' });
  p.status = 'completed';
  p.completedAt = nowISO();
  p.progress.push({ at: nowISO(), percent: 100, note: req.body?.note || 'Work completed', images: [] });
  const c = db.complaints.find((x) => x.id === p.complaintId);
  if (c) {
    pushTimeline(c, 'work_in_progress', req.user!.id, req.user!.businessName || 'Contractor', 'Contractor marked work complete — awaiting government verification');
    if (p.createdBy) notify(p.createdBy, `Work completed: ${p.code}`, 'Submit resolution evidence for the complaint to send it to citizen verification.', `/gov/complaints/${c.id}`);
  }
  audit(req.user, 'PROJECT_COMPLETED', p.code);
  saveDB();
  res.json({ project: p });
});

export default router;

