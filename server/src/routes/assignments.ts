<<<<<<< HEAD
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getDB, saveDB, UPLOAD_DIR } from '../store';
import { requireAuth, requireRole, AuthedRequest } from '../auth';
import { nowISO, haversineKm, pushTimeline, notify, notifyOrg, audit, addScore, sweepOverdue } from '../lib';

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

/** JS Member: available + mine (with match info). Gov/admin: all. */
router.get('/', (req: AuthedRequest, res) => {
  sweepOverdue();
  const db = getDB();
  const u = req.user!;
  if (u.role === 'jsmember') {
    const available = db.assignments
      .filter((a) => a.status === 'open')
      .map((a) => {
        const c = db.complaints.find((x) => x.id === a.complaintId)!;
        const dist = u.baseLocation ? haversineKm(u.baseLocation, c.gps) : null;
        const skillMatch = (u.skills || []).filter((s) => a.skillsRequired.some((r) => s.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(s.toLowerCase())));
        return { ...a, complaint: c, distanceKm: dist ? Math.round(dist * 10) / 10 : null, skillMatch, matchScore: Math.round(skillMatch.length * 30 + (dist !== null ? Math.max(0, 40 - dist * 4) : 10) + (u.trustScore || 50) * 0.3) };
      })
      .sort((x, y) => y.matchScore - x.matchScore);
    const mine = db.assignments.filter((a) => a.jsmemberId === u.id).map((a) => ({ ...a, complaint: db.complaints.find((x) => x.id === a.complaintId) }));
    return res.json({ available, mine });
  }
  res.json({ all: db.assignments.map((a) => ({ ...a, complaint: db.complaints.find((x) => x.id === a.complaintId) })) });
});

router.post('/:id/accept', requireRole('jsmember'), (req: AuthedRequest, res) => {
  sweepOverdue();
  const db = getDB();
  const a = db.assignments.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'Assignment not found' });
  if (a.status !== 'open') return res.status(400).json({ error: 'This assignment is no longer available' });
  if (!req.user!.verified) return res.status(403).json({ error: 'Your JS Member account is pending verification' });
  a.jsmemberId = req.user!.id;
  a.status = 'accepted';
  const c = db.complaints.find((x) => x.id === a.complaintId)!;
  pushTimeline(c, 'field_assignment_accepted', req.user!.id, req.user!.name, `Accepted by JS Member ${req.user!.name}`);
  pushTimeline(c, 'site_visit_pending', 'system', 'JanSetu', 'Site visit window opened — start the visit and capture fresh evidence');
  if (c.routedTo) notifyOrg(c.routedTo.orgId, `Assignment accepted: ${c.id}`, `${req.user!.name} accepted assignment ${a.id}. Site visit pending.`, `/gov/complaints/${c.id}`);
  notify(c.citizenId, 'JS Member assigned', `${req.user!.name} accepted the field assessment for ${c.id}.`, `/citizen/complaints/${c.id}`);
  audit(req.user, 'ASSIGNMENT_ACCEPTED', a.id);
  saveDB();
  res.json({ assignment: a });
});

/** START SITE VISIT — records fresh GPS + timestamp (proof of presence) */
router.post('/:id/start-visit', requireRole('jsmember'), (req: AuthedRequest, res) => {
  const db = getDB();
  const a = db.assignments.find((x) => x.id === req.params.id && x.jsmemberId === req.user!.id);
  if (!a) return res.status(404).json({ error: 'Assignment not found for you' });
  if (a.status !== 'accepted') return res.status(400).json({ error: 'Accept the assignment first' });
  const lat = Number((req.body || {}).lat), lng = Number((req.body || {}).lng);
  const c = db.complaints.find((x) => x.id === a.complaintId)!;
  const distKm = haversineKm({ lat, lng }, c.gps);
  a.siteVisit = { at: nowISO(), gps: { lat, lng }, gpsVerified: distKm < 2 };
  a.status = 'site_visit_started';
  pushTimeline(c, 'site_visit_pending', req.user!.id, req.user!.name, `Site visit started — GPS ${lat.toFixed(4)}, ${lng.toFixed(4)} (${Math.round(distKm * 1000)} m from reported spot)`);
  audit(req.user, 'SITE_VISIT_STARTED', `${a.id} (${a.siteVisit!.gpsVerified ? 'GPS verified' : `GPS ${Math.round(distKm * 1000)} m from reported spot`})`);
  saveDB();
  res.json({ assignment: a, distanceM: Math.round(distKm * 1000) });
});

/** Submit field report → JanSetu auto-review → verified | correction required */
router.post('/:id/report', requireRole('jsmember'), upload.array('images', 5), (req: AuthedRequest, res) => {
  const db = getDB();
  const a = db.assignments.find((x) => x.id === req.params.id && x.jsmemberId === req.user!.id);
  if (!a) return res.status(404).json({ error: 'Assignment not found for you' });
  if (!['accepted', 'site_visit_started', 'correction_required'].includes(a.status)) return res.status(400).json({ error: 'Start the site visit first' });
  const b = req.body || {};
  const required = ['condition', 'measurements', 'observations', 'probableCause', 'recommendedAction'];
  const missing = required.filter((k) => !String(b[k] || '').trim());
  const imgs = files(req);
  const issues: string[] = [];
  if (missing.length) issues.push(`Missing fields: ${missing.join(', ')}`);
  if (!a.siteVisit) issues.push('Site visit was not started — GPS evidence missing');
  if (!imgs.length && !a.report?.images?.length) issues.push('At least one fresh site photograph is required');
  const c = db.complaints.find((x) => x.id === a.complaintId)!;
  const gpsVerified = a.siteVisit ? haversineKm(a.siteVisit.gps, c.gps) < 2 : false;

  const report = {
    condition: b.condition || '', measurements: b.measurements || '', observations: b.observations || '',
    probableCause: b.probableCause || '', severity: b.severity || 'medium',
    recommendedAction: b.recommendedAction || '', requiredResources: b.requiredResources || '',
    trafficImpact: b.trafficImpact || '', safetyConcerns: b.safetyConcerns || '',
    images: imgs.length ? imgs : (a.report?.images || []),
    submittedAt: nowISO(), gpsVerified,
  };
  a.report = report;
  const onTime = Date.now() < new Date(a.deadlineAt).getTime();

  if (issues.length) {
    a.status = 'correction_required';
    a.reviewNote = issues.join(' • ');
    pushTimeline(c, 'correction_required', 'system', 'JanSetu', `Report checks failed: ${issues.join('; ')}`);
    notify(req.user!.id, 'CORRECTION REQUIRED', `Your report for ${c.id} needs corrections: ${issues.join('; ')}`, '/jsmember/reports');
    audit(req.user, 'REPORT_CORRECTION_REQUIRED', `${a.id}: ${issues.join('; ')}`);
    saveDB();
    return res.json({ assignment: a, correctionRequired: true, issues });
  }

  a.status = 'report_submitted';
  pushTimeline(c, 'site_visit_verified', req.user!.id, req.user!.name, `Fresh GPS + ${report.images.length} fresh photo(s) captured at site${gpsVerified ? ' (GPS verified ✓)' : ''}`);
  pushTimeline(c, 'report_submitted', req.user!.id, req.user!.name, 'Field report submitted with measurements and recommendation');
  pushTimeline(c, 'report_review', 'system', 'JanSetu', 'JanSetu checks passed — evidence complete, GPS consistent. Awaiting government review.');
  a.status = 'report_verified';
  addScore(req.user!, gpsVerified ? 3 : 1, 'Field report accepted by JanSetu checks');
  if (onTime) addScore(req.user!, 1, 'On-time report submission');
  if (c.routedTo) notifyOrg(c.routedTo.orgId, `Technical report ready: ${c.id}`, `Field report by ${req.user!.name} passed JanSetu checks — review the report.`, `/gov/complaints/${c.id}`);
  notify(c.citizenId, 'Field assessment completed', `${req.user!.name} submitted a technical report for ${c.id}. It is now with the government.`, `/citizen/complaints/${c.id}`);
  audit(req.user, 'FIELD_REPORT_SUBMITTED', `${a.id} → ${c.id}`);
  saveDB();
  res.json({ assignment: a, correctionRequired: false });
});

export default router;

=======
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getDB, saveDB, UPLOAD_DIR } from '../store';
import { requireAuth, requireRole, AuthedRequest } from '../auth';
import { nowISO, haversineKm, pushTimeline, notify, notifyOrg, audit, addScore, sweepOverdue } from '../lib';

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

/** JS Member: available + mine (with match info). Gov/admin: all. */
router.get('/', (req: AuthedRequest, res) => {
  sweepOverdue();
  const db = getDB();
  const u = req.user!;
  if (u.role === 'jsmember') {
    const available = db.assignments
      .filter((a) => a.status === 'open')
      .map((a) => {
        const c = db.complaints.find((x) => x.id === a.complaintId)!;
        const dist = u.baseLocation ? haversineKm(u.baseLocation, c.gps) : null;
        const skillMatch = (u.skills || []).filter((s) => a.skillsRequired.some((r) => s.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(s.toLowerCase())));
        return { ...a, complaint: c, distanceKm: dist ? Math.round(dist * 10) / 10 : null, skillMatch, matchScore: Math.round(skillMatch.length * 30 + (dist !== null ? Math.max(0, 40 - dist * 4) : 10) + (u.trustScore || 50) * 0.3) };
      })
      .sort((x, y) => y.matchScore - x.matchScore);
    const mine = db.assignments.filter((a) => a.jsmemberId === u.id).map((a) => ({ ...a, complaint: db.complaints.find((x) => x.id === a.complaintId) }));
    return res.json({ available, mine });
  }
  res.json({ all: db.assignments.map((a) => ({ ...a, complaint: db.complaints.find((x) => x.id === a.complaintId) })) });
});

router.post('/:id/accept', requireRole('jsmember'), (req: AuthedRequest, res) => {
  sweepOverdue();
  const db = getDB();
  const a = db.assignments.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'Assignment not found' });
  if (a.status !== 'open') return res.status(400).json({ error: 'This assignment is no longer available' });
  if (!req.user!.verified) return res.status(403).json({ error: 'Your JS Member account is pending verification' });
  a.jsmemberId = req.user!.id;
  a.status = 'accepted';
  const c = db.complaints.find((x) => x.id === a.complaintId)!;
  pushTimeline(c, 'field_assignment_accepted', req.user!.id, req.user!.name, `Accepted by JS Member ${req.user!.name}`);
  pushTimeline(c, 'site_visit_pending', 'system', 'JanSetu', 'Site visit window opened — start the visit and capture fresh evidence');
  if (c.routedTo) notifyOrg(c.routedTo.orgId, `Assignment accepted: ${c.id}`, `${req.user!.name} accepted assignment ${a.id}. Site visit pending.`, `/gov/complaints/${c.id}`);
  notify(c.citizenId, 'JS Member assigned', `${req.user!.name} accepted the field assessment for ${c.id}.`, `/citizen/complaints/${c.id}`);
  audit(req.user, 'ASSIGNMENT_ACCEPTED', a.id);
  saveDB();
  res.json({ assignment: a });
});

/** START SITE VISIT — records fresh GPS + timestamp (proof of presence) */
router.post('/:id/start-visit', requireRole('jsmember'), (req: AuthedRequest, res) => {
  const db = getDB();
  const a = db.assignments.find((x) => x.id === req.params.id && x.jsmemberId === req.user!.id);
  if (!a) return res.status(404).json({ error: 'Assignment not found for you' });
  if (a.status !== 'accepted') return res.status(400).json({ error: 'Accept the assignment first' });
  const lat = Number((req.body || {}).lat), lng = Number((req.body || {}).lng);
  const c = db.complaints.find((x) => x.id === a.complaintId)!;
  const distKm = haversineKm({ lat, lng }, c.gps);
  a.siteVisit = { at: nowISO(), gps: { lat, lng }, gpsVerified: distKm < 2 };
  a.status = 'site_visit_started';
  pushTimeline(c, 'site_visit_pending', req.user!.id, req.user!.name, `Site visit started — GPS ${lat.toFixed(4)}, ${lng.toFixed(4)} (${Math.round(distKm * 1000)} m from reported spot)`);
  audit(req.user, 'SITE_VISIT_STARTED', `${a.id} (${a.siteVisit!.gpsVerified ? 'GPS verified' : `GPS ${Math.round(distKm * 1000)} m from reported spot`})`);
  saveDB();
  res.json({ assignment: a, distanceM: Math.round(distKm * 1000) });
});

/** Submit field report → JanSetu auto-review → verified | correction required */
router.post('/:id/report', requireRole('jsmember'), upload.array('images', 5), (req: AuthedRequest, res) => {
  const db = getDB();
  const a = db.assignments.find((x) => x.id === req.params.id && x.jsmemberId === req.user!.id);
  if (!a) return res.status(404).json({ error: 'Assignment not found for you' });
  if (!['accepted', 'site_visit_started', 'correction_required'].includes(a.status)) return res.status(400).json({ error: 'Start the site visit first' });
  const b = req.body || {};
  const required = ['condition', 'measurements', 'observations', 'probableCause', 'recommendedAction'];
  const missing = required.filter((k) => !String(b[k] || '').trim());
  const imgs = files(req);
  const issues: string[] = [];
  if (missing.length) issues.push(`Missing fields: ${missing.join(', ')}`);
  if (!a.siteVisit) issues.push('Site visit was not started — GPS evidence missing');
  if (!imgs.length && !a.report?.images?.length) issues.push('At least one fresh site photograph is required');
  const c = db.complaints.find((x) => x.id === a.complaintId)!;
  const gpsVerified = a.siteVisit ? haversineKm(a.siteVisit.gps, c.gps) < 2 : false;

  const report = {
    condition: b.condition || '', measurements: b.measurements || '', observations: b.observations || '',
    probableCause: b.probableCause || '', severity: b.severity || 'medium',
    recommendedAction: b.recommendedAction || '', requiredResources: b.requiredResources || '',
    trafficImpact: b.trafficImpact || '', safetyConcerns: b.safetyConcerns || '',
    images: imgs.length ? imgs : (a.report?.images || []),
    submittedAt: nowISO(), gpsVerified,
  };
  a.report = report;
  const onTime = Date.now() < new Date(a.deadlineAt).getTime();

  if (issues.length) {
    a.status = 'correction_required';
    a.reviewNote = issues.join(' • ');
    pushTimeline(c, 'correction_required', 'system', 'JanSetu', `Report checks failed: ${issues.join('; ')}`);
    notify(req.user!.id, 'CORRECTION REQUIRED', `Your report for ${c.id} needs corrections: ${issues.join('; ')}`, '/jsmember/reports');
    audit(req.user, 'REPORT_CORRECTION_REQUIRED', `${a.id}: ${issues.join('; ')}`);
    saveDB();
    return res.json({ assignment: a, correctionRequired: true, issues });
  }

  a.status = 'report_submitted';
  pushTimeline(c, 'site_visit_verified', req.user!.id, req.user!.name, `Fresh GPS + ${report.images.length} fresh photo(s) captured at site${gpsVerified ? ' (GPS verified ✓)' : ''}`);
  pushTimeline(c, 'report_submitted', req.user!.id, req.user!.name, 'Field report submitted with measurements and recommendation');
  pushTimeline(c, 'report_review', 'system', 'JanSetu', 'JanSetu checks passed — evidence complete, GPS consistent. Awaiting government review.');
  a.status = 'report_verified';
  addScore(req.user!, gpsVerified ? 3 : 1, 'Field report accepted by JanSetu checks');
  if (onTime) addScore(req.user!, 1, 'On-time report submission');
  if (c.routedTo) notifyOrg(c.routedTo.orgId, `Technical report ready: ${c.id}`, `Field report by ${req.user!.name} passed JanSetu checks — review the report.`, `/gov/complaints/${c.id}`);
  notify(c.citizenId, 'Field assessment completed', `${req.user!.name} submitted a technical report for ${c.id}. It is now with the government.`, `/citizen/complaints/${c.id}`);
  audit(req.user, 'FIELD_REPORT_SUBMITTED', `${a.id} → ${c.id}`);
  saveDB();
  res.json({ assignment: a, correctionRequired: false });
});

export default router;

>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
