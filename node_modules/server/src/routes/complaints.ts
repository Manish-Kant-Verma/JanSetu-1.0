import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getDB, saveDB, nextComplaintId, UPLOAD_DIR } from '../store';
import { requireAuth, requireRole, AuthedRequest } from '../auth';
import { nowISO, haversineKm, aiClassify, routeComplaint, pushTimeline, notify, notifyOrg, notifyRole, audit, addScore, sweepOverdue, canSeeComplaint, SKILL_MAP } from '../lib';
import type { Complaint } from '../types';

const router = Router();
router.use(requireAuth);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname) || '.jpg'}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /image\//.test(file.mimetype)),
});

const files = (req: AuthedRequest) => ((req.files as any[]) || []).map((f) => `/uploads/${f.filename}`);

/** Role-scoped complaint list */
router.get('/', (req: AuthedRequest, res) => {
  sweepOverdue();
  const db = getDB();
  const u = req.user!;
  let list = db.complaints.filter((c) => canSeeComplaint(u, c));
  const { status, category, q } = req.query as any;
  if (status) list = list.filter((c) => c.status === status);
  if (category) list = list.filter((c) => c.category === category);
  if (q) list = list.filter((c) => `${c.id} ${c.category} ${c.areaName} ${c.description}`.toLowerCase().includes(String(q).toLowerCase()));
  list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ complaints: list });
});

router.get('/:id', (req: AuthedRequest, res) => {
  sweepOverdue();
  const db = getDB();
  const c = db.complaints.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Complaint not found' });
  if (!canSeeComplaint(req.user!, c)) return res.status(403).json({ error: 'You do not have access to this complaint' });
  const assignment = db.assignments.find((a) => a.complaintId === c.id);
  const action = db.actions.find((a) => a.id === c.actionId);
  const project = db.projects.find((p) => p.complaintId === c.id);
  const linked = db.complaints.filter((x) => x.linkedTo === c.id).map((x) => x.id);
  res.json({ complaint: c, assignment: assignment || null, action: action || null, project: project || null, linkedEvidence: linked });
});

/** AI signal + duplicate + routing preview (nothing is saved) */
router.post('/precheck', (req: AuthedRequest, res) => {
  const db = getDB();
  const { lat, lng, category, description } = req.body || {};
  const ai = aiClassify(description || '', category);
  const gps = { lat: Number(lat), lng: Number(lng) };
  const nearby = db.complaints
    .filter((c) => !['closed', 'rejected', 'duplicate'].includes(c.status))
    .filter((c) => haversineKm(gps, c.gps) < 0.15)
    .filter((c) => c.category === ai.category || c.category === category)
    .filter((c) => Date.now() - new Date(c.createdAt).getTime() < 60 * 86400000)
    .map((c) => ({
      id: c.id, category: c.category, areaName: c.areaName,
      distanceM: Math.round(haversineKm(gps, c.gps) * 1000),
      createdAt: c.createdAt, confirmations: c.community.length, status: c.status, image: c.images[0],
    }));
  const preview = routeComplaint({
    category: ai.category, description: description || '', areaName: 'your area',
    jurisdiction: { village: '', district: 'Indore', state: 'Madhya Pradesh' },
    createdAt: nowISO(), timeline: [], community: [], overdueFlags: [], images: [],
  } as unknown as Complaint);
  res.json({ ai, duplicates: nearby, routingPreview: preview ? { orgName: preview.routedTo!.orgName, department: preview.routedTo!.department } : null });
});

/** Create complaint (citizen). Optional `linkedTo` = duplicate id confirmed by the citizen. */
router.post('/', requireRole('citizen'), upload.array('images', 4), (req: AuthedRequest, res) => {
  const db = getDB();
  const b = req.body || {};
  const imagePaths = files(req);
  if (!imagePaths.length) return res.status(400).json({ error: 'A photo of the problem is required' });
  const lat = Number(b.lat), lng = Number(b.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return res.status(400).json({ error: 'GPS location is required' });

  const ai = aiClassify(b.description || '', b.category);
  const id = nextComplaintId();
  const c: Complaint = {
    id, numericId: db.counters.complaint, citizenId: req.user!.id,
    category: b.category || ai.category,
    description: b.description || '',
    images: imagePaths,
    gps: { lat, lng },
    areaName: b.areaName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    createdAt: nowISO(),
    status: 'submitted', priority: ['Road Damage', 'Water Leakage'].includes(ai.category) ? 'high' : 'medium',
    jurisdiction: { village: b.areaName || 'Indore Ward', district: 'Indore', state: 'Madhya Pradesh' },
    aiSuggestion: ai,
    community: [], overdueFlags: [],
    linkedTo: b.linkedTo || undefined,
    timeline: [],
  };
  const route = routeComplaint(c);
  if (route) {
    c.routedTo = route.routedTo;
    c.routingExplanation = route.explanation;
    c.reviewDeadlineAt = route.reviewDeadlineAt;
    c.resolutionDeadlineAt = route.resolutionDeadlineAt;
  }
  pushTimeline(c, 'submitted', req.user!.id, req.user!.name, `GPS ${lat.toFixed(4)}, ${lng.toFixed(4)} captured automatically`);
  pushTimeline(c, 'under_review', 'system', 'JanSetu', 'Automated verification: image ✓ GPS ✓');

  if (c.linkedTo) {
    const dup = db.complaints.find((x) => x.id === c.linkedTo);
    if (dup) {
      dup.linkedBy = [...(dup.linkedBy || []), req.user!.id];
      dup.community.push({ userId: req.user!.id, userName: req.user!.name, at: nowISO(), image: imagePaths[0] });
      pushTimeline(dup, dup.status, req.user!.id, req.user!.name, `Supporting evidence linked by ${c.id} (same problem confirmed)`);
      c.aiSuggestion = { ...ai, signals: [...ai.signals, `Linked to existing case ${dup.id} within ${Math.round(haversineKm(c.gps, dup.gps) * 1000)} m`] };
      notify(dup.citizenId, 'Supporting evidence added to your report', `${req.user!.name} confirmed the same problem and linked photo evidence to ${dup.id}.`, `/citizen/complaints/${dup.id}`);
    }
  }
  if (route?.routedTo) {
    notifyOrg(route.routedTo.orgId, `New complaint received: ${id}`, `${c.category} at ${c.areaName} — awaiting JanSetu verification and government review.`, `/gov/complaints/${id}`);
  }
  db.complaints.push(c);
  audit(req.user, 'COMPLAINT_CREATED', id, { category: c.category, linkedTo: c.linkedTo || null });
  addScore(req.user!, 2, 'Verified report submitted (photo + GPS)');
  saveDB();
  res.json({ complaint: c });
});

/** Community verification — any verified user who is not the reporter */
router.post('/:id/confirm', (req: AuthedRequest, res) => {
  sweepOverdue();
  const db = getDB();
  const c = db.complaints.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Complaint not found' });
  if (c.citizenId === req.user!.id) return res.status(400).json({ error: 'You cannot confirm your own report' });
  if (c.community.some((x) => x.userId === req.user!.id)) return res.status(400).json({ error: 'You have already confirmed this problem' });
  if (['closed', 'rejected', 'duplicate'].includes(c.status)) return res.status(400).json({ error: 'This case is no longer active' });

  c.community.push({ userId: req.user!.id, userName: req.user!.name, at: nowISO(), image: (req.body || {}).image || undefined });
  if (c.status === 'under_review' || c.status === 'submitted') pushTimeline(c, 'community_verification', 'system', 'JanSetu', 'Opened for community confirmation');
  if (c.community.length >= 3 && c.status !== 'verified') {
    pushTimeline(c, 'verified', 'system', 'JanSetu', `${c.community.length} verified users confirmed this problem`);
    if (c.routedTo) pushTimeline(c, 'forwarded_to_government', 'system', 'JanSetu Routing Engine', `Routed to ${c.routedTo.orgName} — ${c.routedTo.department}`);
    notify(c.citizenId, 'Your report is verified', `${c.community.length} citizens confirmed your problem. Case ${c.id} is now forwarded to ${c.routedTo?.orgName}.`, `/citizen/complaints/${c.id}`);
    notifyOrg(c.routedTo!.orgId, `Verified complaint: ${c.id}`, `${c.category} at ${c.areaName} — ${c.community.length} community confirmations.`, `/gov/complaints/${c.id}`);
  } else {
    notify(c.citizenId, 'Someone confirmed your report', `${req.user!.name} confirmed the same problem on ${c.id} (${c.community.length} total).`, `/citizen/complaints/${c.id}`);
  }
  addScore(req.user!, 1, 'Useful community confirmation');
  audit(req.user, 'COMMUNITY_CONFIRMED', c.id);
  saveDB();
  res.json({ complaint: c });
});

/** Citizen verifies (or rejects) the resolution */
router.post('/:id/verify-resolution', requireRole('citizen'), (req: AuthedRequest, res) => {
  const db = getDB();
  const c = db.complaints.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Complaint not found' });
  if (c.citizenId !== req.user!.id) return res.status(403).json({ error: 'Only the reporting citizen can verify this resolution' });
  if (c.status !== 'citizen_verification') return res.status(400).json({ error: 'This complaint is not awaiting citizen verification' });
  const confirmed = !!(req.body || {}).confirmed;
  c.citizenVerification = { confirmed, at: nowISO(), reopenReason: (req.body || {}).reopenReason || undefined };
  if (confirmed) {
    pushTimeline(c, 'closed', req.user!.id, req.user!.name, 'Citizen confirmed the problem is resolved ✓');
    c.closedAt = nowISO();
    addScore(req.user!, 5, 'Resolution confirmation accepted');
    if (c.routedTo) notifyOrg(c.routedTo.orgId, `Case closed: ${c.id}`, `${req.user!.name} confirmed the resolution. Case closed successfully.`, `/gov/complaints/${c.id}`);
  } else {
    pushTimeline(c, 'reopened', req.user!.id, req.user!.name, `Re-complaint: ${(req.body || {}).reopenReason || 'citizen reports problem is not solved'}`);
    if (c.routedTo) notifyOrg(c.routedTo.orgId, `RE-COMPLAINT: ${c.id}`, `${req.user!.name} rejected the resolution: ${(req.body || {}).reopenReason || 'not solved'}. Review required.`, `/gov/complaints/${c.id}`);
  }
  audit(req.user, confirmed ? 'CITIZEN_VERIFIED_CLOSURE' : 'CITIZEN_REJECTED_RESOLUTION', c.id);
  saveDB();
  res.json({ complaint: c });
});

/** Government: force/manual route */
router.post('/:id/route', requireRole('government'), (req: AuthedRequest, res) => {
  const db = getDB();
  const c = db.complaints.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Complaint not found' });
  const { orgId, department } = req.body || {};
  const org = db.orgs.find((o) => o.id === orgId);
  if (!org || !department) return res.status(400).json({ error: 'Organisation and department are required' });
  c.routedTo = { orgId: org.id, orgName: org.name, department };
  c.routingExplanation = `Problem: ${c.category} • Location: ${c.areaName} • Jurisdiction: District — ${c.jurisdiction.district} • Department: ${department} • Routed manually by ${req.user!.name}`;
  pushTimeline(c, 'forwarded_to_government', req.user!.id, req.user!.name, `Routed to ${org.name} — ${department}`);
  notify(c.citizenId, 'Your complaint reached the government', `${c.id} was routed to ${org.name} — ${department}.`, `/citizen/complaints/${c.id}`);
  audit(req.user, 'COMPLAINT_ROUTED', `${c.id} → ${org.name}/${department}`);
  saveDB();
  res.json({ complaint: c });
});

/** Government decision on a reviewed complaint: direct action | field assessment | contractor */
router.post('/:id/decision', requireRole('government'), (req: AuthedRequest, res) => {
  const db = getDB();
  const c = db.complaints.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Complaint not found' });
  const { decision, details, deadlineDays, title, scope, budget, eligibility, bidDays, assigneeId } = req.body || {};
  const dd = Number(deadlineDays) || 7;
  if (decision === 'direct') {
    const action = {
      id: `ACT-2026-${String(db.actions.length + 1).padStart(3, '0')}`,
      complaintId: c.id, type: 'government_resources' as const,
      title: title || `${c.category} action — ${c.areaName}`,
      details: details || 'To be handled with existing government resources/process.',
      status: 'planned' as const, createdAt: nowISO(), deadlineAt: new Date(Date.now() + dd * 86400000).toISOString(),
      progress: [],
    };
    db.actions.push(action);
    c.actionId = action.id;
    pushTimeline(c, 'government_decision', req.user!.id, req.user!.name, 'Decision: direct government action');
    pushTimeline(c, 'government_direct_action', req.user!.id, req.user!.name, `${action.title} — deadline ${dd} days`);
    notify(c.citizenId, 'Government action started', `${c.id}: ${action.title}. Deadline: ${new Date(action.deadlineAt).toLocaleDateString('en-IN')}.`, `/citizen/complaints/${c.id}`);
    audit(req.user, 'GOV_ACTION_CREATED', `${c.id} → ${action.id}`);
  } else if (decision === 'field') {
    const assignment = {
      id: `AS-2026-${String(db.assignments.length + 1).padStart(3, '0')}`,
      complaintId: c.id, skillsRequired: SKILL_MAP[c.category] || ['surveying'],
      status: 'open' as const, createdAt: nowISO(),
      deadlineAt: new Date(Date.now() + (Number(deadlineDays) || 2) * 86400000).toISOString(),
    };
    db.assignments.push(assignment);
    c.assignmentId = assignment.id;
    pushTimeline(c, 'technical_assessment_required', req.user!.id, req.user!.name, details || 'Ground/technical verification required before action');
    pushTimeline(c, 'field_assignment_created', 'system', 'JanSetu', `Assignment ${assignment.id} published to eligible JS Members`);
    notifyRole('jsmember', 'New assignment available', `${assignment.id} — ${c.category} assessment at ${c.areaName}. Check Available Assignments.`, '/jsmember/assignments');
    audit(req.user, 'ASSESSMENT_REQUESTED', c.id);
  } else if (decision === 'contractor') {
    const project = {
      id: `PRJ-2026-${String(db.counters.project + 1).padStart(3, '0')}`,
      code: `PRJ-2026-${String(db.counters.project + 1).padStart(3, '0')}`,
      complaintId: c.id, title: title || `${c.category} work — ${c.areaName}`,
      scope: scope || details || 'Scope as per technical report.',
      category: c.category, location: c.areaName, gps: c.gps,
      budgetEstimate: Number(budget) || 100000,
      eligibility: eligibility || 'Registered contractors with relevant works experience; valid GST.',
      bidDeadlineAt: new Date(Date.now() + (Number(bidDays) || 7) * 86400000).toISOString(),
      documents: ['Technical report ' + c.id], status: 'open_bidding' as const,
      createdBy: req.user!.id, progress: [], createdAt: nowISO(),
    };
    db.counters.project += 1;
    db.projects.push(project);
    c.projectId = project.id;
    const action = {
      id: `ACT-2026-${String(db.actions.length + 1).padStart(3, '0')}`,
      complaintId: c.id, type: 'contractor' as const,
      title: project.title, details: `Executed via project ${project.code}.`,
      status: 'planned' as const, createdAt: nowISO(), deadlineAt: project.bidDeadlineAt, progress: [],
    };
    db.actions.push(action);
    c.actionId = action.id;
    pushTimeline(c, 'government_decision', req.user!.id, req.user!.name, 'Decision: contractor execution required');
    pushTimeline(c, 'contractor_required', req.user!.id, req.user!.name, 'Project created for procurement');
    pushTimeline(c, 'project_created', req.user!.id, req.user!.name, `${project.code} published with eligibility criteria`);
    pushTimeline(c, 'bidding', 'system', 'JanSetu', 'Bid window open');
    notifyRole('contractor', 'New project open for bidding', `${project.code} — ${project.title}. Bid deadline ${new Date(project.bidDeadlineAt).toLocaleDateString('en-IN')}.`, '/contractor/opportunities');
    audit(req.user, 'PROJECT_CREATED', project.code);
  } else {
    return res.status(400).json({ error: 'decision must be: direct | field | contractor' });
  }
  saveDB();
  res.json({ complaint: c });
});

/** Government submits resolution evidence → verified → citizen verification */
router.post('/:id/resolve', requireRole('government'), upload.single('photo'), (req: AuthedRequest, res) => {
  const db = getDB();
  const c = db.complaints.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Complaint not found' });
  if (!['government_direct_action', 'work_in_progress', 'government_decision', 'reopened', 'technical_report_approved'].includes(c.status)) {
    return res.status(400).json({ error: 'This complaint is not in an executable stage yet' });
  }
  const b = req.body || {};
  const photo = (req as any).file ? `/uploads/${(req as any).file.filename}` : null;
  if (!photo) return res.status(400).json({ error: 'A completion photograph is required' });
  c.resolution = { photo, date: b.date || new Date().toISOString().slice(0, 10), details: b.details || 'Work completed.', submittedAt: nowISO() };
  if (c.actionId) {
    const act = db.actions.find((a) => a.id === c.actionId);
    if (act) act.status = 'resolution_submitted';
  }
  if (c.projectId) {
    const p = db.projects.find((x) => x.id === c.projectId);
    if (p) { p.status = 'completed'; p.completedAt = nowISO(); p.progress.push({ at: nowISO(), percent: 100, note: 'Work completed — resolution evidence submitted', images: [photo] }); }
  }
  pushTimeline(c, 'work_in_progress', req.user!.id, req.user!.name, 'Execution completed');
  pushTimeline(c, 'resolution_submitted', req.user!.id, req.user!.name, b.details || 'Completion photo + details submitted');
  pushTimeline(c, 'government_verified', req.user!.id, req.user!.name, 'Work verified by department');
  c.govVerifiedAt = nowISO();
  pushTimeline(c, 'citizen_verification', 'system', 'JanSetu', 'Asked citizen: has this problem actually been solved?');
  notify(c.citizenId, 'Resolution submitted — please verify', `${c.id}: the government has submitted resolution evidence. Please confirm whether the problem is actually solved.`, `/citizen/complaints/${c.id}`);
  audit(req.user, 'RESOLUTION_SUBMITTED', c.id);
  saveDB();
  res.json({ complaint: c });
});

export default router;





