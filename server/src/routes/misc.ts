<<<<<<< HEAD
import { Router } from 'express';
import { getDB, saveDB } from '../store';
import { requireAuth, AuthedRequest } from '../auth';
import { nowISO, uuid, audit, haversineKm } from '../lib';
import { reverseGeocode, GeocodingError } from '../geocoding';

const router = Router();

router.post('/geocode/reverse', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const location = await reverseGeocode(req.body?.lat, req.body?.lng);
    res.json({ location });
  } catch (error) {
    const status = error instanceof GeocodingError ? error.status : 503;
    res.status(status).json({ error: error instanceof GeocodingError ? error.message : 'Address lookup is unavailable. Enter the address manually.' });
  }
});

/** ---------- Notifications ---------- */
router.get('/notifications', requireAuth, (req: AuthedRequest, res) => {
  const db = getDB();
  const list = db.notifications.filter((n) => n.userId === req.user!.id);
  res.json({ notifications: list, unread: list.filter((n) => !n.read).length });
});

router.post('/notifications/read-all', requireAuth, (req: AuthedRequest, res) => {
  const db = getDB();
  db.notifications.filter((n) => n.userId === req.user!.id).forEach((n) => { n.read = true; });
  saveDB();
  res.json({ ok: true });
});

router.post('/notifications/:id/read', requireAuth, (req: AuthedRequest, res) => {
  const db = getDB();
  const n = db.notifications.find((x) => x.id === req.params.id && x.userId === req.user!.id);
  if (n) { n.read = true; saveDB(); }
  res.json({ ok: true });
});

/** ---------- Scores (transparent, rule-based) ---------- */
router.get('/scores/me', requireAuth, (req: AuthedRequest, res) => {
  const db = getDB();
  const u = req.user!;
  if (u.role === 'citizen') {
    const mine = db.complaints.filter((c) => c.citizenId === u.id);
    const resolved = mine.filter((c) => c.status === 'closed').length;
    const active = mine.filter((c) => !['closed', 'rejected'].includes(c.status)).length;
    const confirmations = db.complaints.filter((c) => c.community.some((x) => x.userId === u.id)).length;
    const spam = mine.filter((c) => c.status === 'rejected').length;
    return res.json({
      role: 'citizen', score: u.civilScore ?? 50,
      breakdown: [
        { label: 'Verified reports submitted', points: Math.min(30, mine.length * 3), max: 30, detail: `${mine.length} report(s) with photo + GPS` },
        { label: 'Resolution confirmations', points: Math.min(25, resolved * 8), max: 25, detail: `${resolved} resolution(s) you confirmed` },
        { label: 'Useful community confirmations', points: Math.min(20, confirmations * 2), max: 20, detail: `${confirmations} confirmation(s) on other cases` },
        { label: 'Active quality cases', points: Math.min(15, active * 3), max: 15, detail: `${active} case(s) currently in the workflow` },
        { label: 'Spam / rejected reports', points: -spam * 5, max: 0, detail: `${spam} rejected report(s)` },
      ],
      history: (u.civilHistory || []).slice(-10).reverse(),
    });
  }
  res.json({ role: u.role, score: null, breakdown: [], history: [] });
});

router.get('/scores/jsmember', requireAuth, (req: AuthedRequest, res) => {
  const db = getDB();
  const u = req.user!;
  const mine = db.assignments.filter((a) => a.jsmemberId === u.id);
  const completed = mine.filter((a) => a.status === 'completed' || a.status === 'report_verified').length;
  const corrections = mine.filter((a) => a.status === 'correction_required').length;
  const visits = mine.filter((a) => a.siteVisit?.gpsVerified).length;
  res.json({
    role: 'jsmember', score: u.trustScore ?? 50,
    breakdown: [
      { label: 'Verified site visits (GPS ✓)', points: Math.min(25, visits * 5), max: 25, detail: `${visits} GPS-verified visit(s)` },
      { label: 'Accepted field reports', points: Math.min(35, completed * 7), max: 35, detail: `${completed} report(s) accepted` },
      { label: 'On-time submissions', points: Math.min(20, mine.filter((a) => a.report && new Date(a.report.submittedAt) < new Date(a.deadlineAt)).length * 5), max: 20, detail: 'Reports submitted before deadline' },
      { label: 'Report corrections', points: -corrections * 4, max: 0, detail: `${corrections} correction cycle(s)` },
    ],
    history: (u.trustHistory || []).slice(-10).reverse(),
  });
});

router.get('/scores/contractor', requireAuth, (req: AuthedRequest, res) => {
  const db = getDB();
  const u = req.user!;
  const awarded = db.projects.filter((p) => p.awardedContractorId === u.id);
  const completed = awarded.filter((p) => p.status === 'completed');
  const myBids = db.bids.filter((b) => b.contractorId === u.id);
  const winRate = myBids.length ? Math.round((myBids.filter((b) => b.status === 'accepted').length / myBids.length) * 100) : 0;
  const score = Math.round(Math.min(100, 40 + completed.length * 20 + winRate * 0.2));
  res.json({
    role: 'contractor', score,
    breakdown: [
      { label: 'Government-verified completions', points: Math.min(40, completed.length * 20), max: 40, detail: `${completed.length} project(s) completed` },
      { label: 'Documented performance', points: awarded.filter((p) => p.progress.length).length * 5, max: 15, detail: 'Progress evidence submitted' },
      { label: 'Bid win record', points: Math.round(winRate * 0.2), max: 20, detail: `${winRate}% of ${myBids.length} bid(s) selected` },
      { label: 'Quality/acceptance record', points: Math.min(25, completed.length * 12), max: 25, detail: 'Acceptance without rework' },
    ],
    history: [],
    note: 'Complements — does not replace — legally applicable procurement criteria.',
  });
});

/** ---------- Nearby problems (community) ---------- */
router.get('/nearby', requireAuth, (req: AuthedRequest, res) => {
  const db = getDB();
  const lat = Number(req.query.lat), lng = Number(req.query.lng);
  const list = db.complaints
    .filter((c) => !['closed', 'rejected', 'duplicate'].includes(c.status))
    .map((c) => ({ c, dist: haversineKm({ lat, lng }, c.gps) }))
    .filter((x) => x.dist < 2)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 10)
    .map((x) => ({ id: x.c.id, category: x.c.category, areaName: x.c.areaName, status: x.c.status, confirmations: x.c.community.length, distanceM: Math.round(x.dist * 1000), createdAt: x.c.createdAt }));
  res.json({ nearby: list });
});

/** ---------- Contact form (public) ---------- */
router.post('/contact', (req, res) => {
  const db = getDB();
  const { name, email, subject, body } = req.body || {};
  if (!name || !email || !body) return res.status(400).json({ error: 'Name, email and message are required' });
  db.messages.push({ id: uuid(), name, email, subject: subject || 'General enquiry', body, at: nowISO() });
  audit(null, 'CONTACT_MESSAGE', `${name} <${email}>: ${subject || ''}`);
  saveDB();
  res.json({ ok: true });
});

export default router;

=======
import { Router } from 'express';
import { getDB, saveDB } from '../store';
import { requireAuth, AuthedRequest } from '../auth';
import { nowISO, uuid, audit, haversineKm } from '../lib';

const router = Router();

/** ---------- Notifications ---------- */
router.get('/notifications', requireAuth, (req: AuthedRequest, res) => {
  const db = getDB();
  const list = db.notifications.filter((n) => n.userId === req.user!.id);
  res.json({ notifications: list, unread: list.filter((n) => !n.read).length });
});

router.post('/notifications/read-all', requireAuth, (req: AuthedRequest, res) => {
  const db = getDB();
  db.notifications.filter((n) => n.userId === req.user!.id).forEach((n) => { n.read = true; });
  saveDB();
  res.json({ ok: true });
});

router.post('/notifications/:id/read', requireAuth, (req: AuthedRequest, res) => {
  const db = getDB();
  const n = db.notifications.find((x) => x.id === req.params.id && x.userId === req.user!.id);
  if (n) { n.read = true; saveDB(); }
  res.json({ ok: true });
});

/** ---------- Scores (transparent, rule-based) ---------- */
router.get('/scores/me', requireAuth, (req: AuthedRequest, res) => {
  const db = getDB();
  const u = req.user!;
  if (u.role === 'citizen') {
    const mine = db.complaints.filter((c) => c.citizenId === u.id);
    const resolved = mine.filter((c) => c.status === 'closed').length;
    const active = mine.filter((c) => !['closed', 'rejected'].includes(c.status)).length;
    const confirmations = db.complaints.filter((c) => c.community.some((x) => x.userId === u.id)).length;
    const spam = mine.filter((c) => c.status === 'rejected').length;
    return res.json({
      role: 'citizen', score: u.civilScore ?? 50,
      breakdown: [
        { label: 'Verified reports submitted', points: Math.min(30, mine.length * 3), max: 30, detail: `${mine.length} report(s) with photo + GPS` },
        { label: 'Resolution confirmations', points: Math.min(25, resolved * 8), max: 25, detail: `${resolved} resolution(s) you confirmed` },
        { label: 'Useful community confirmations', points: Math.min(20, confirmations * 2), max: 20, detail: `${confirmations} confirmation(s) on other cases` },
        { label: 'Active quality cases', points: Math.min(15, active * 3), max: 15, detail: `${active} case(s) currently in the workflow` },
        { label: 'Spam / rejected reports', points: -spam * 5, max: 0, detail: `${spam} rejected report(s)` },
      ],
      history: (u.civilHistory || []).slice(-10).reverse(),
    });
  }
  res.json({ role: u.role, score: null, breakdown: [], history: [] });
});

router.get('/scores/jsmember', requireAuth, (req: AuthedRequest, res) => {
  const db = getDB();
  const u = req.user!;
  const mine = db.assignments.filter((a) => a.jsmemberId === u.id);
  const completed = mine.filter((a) => a.status === 'completed' || a.status === 'report_verified').length;
  const corrections = mine.filter((a) => a.status === 'correction_required').length;
  const visits = mine.filter((a) => a.siteVisit?.gpsVerified).length;
  res.json({
    role: 'jsmember', score: u.trustScore ?? 50,
    breakdown: [
      { label: 'Verified site visits (GPS ✓)', points: Math.min(25, visits * 5), max: 25, detail: `${visits} GPS-verified visit(s)` },
      { label: 'Accepted field reports', points: Math.min(35, completed * 7), max: 35, detail: `${completed} report(s) accepted` },
      { label: 'On-time submissions', points: Math.min(20, mine.filter((a) => a.report && new Date(a.report.submittedAt) < new Date(a.deadlineAt)).length * 5), max: 20, detail: 'Reports submitted before deadline' },
      { label: 'Report corrections', points: -corrections * 4, max: 0, detail: `${corrections} correction cycle(s)` },
    ],
    history: (u.trustHistory || []).slice(-10).reverse(),
  });
});

router.get('/scores/contractor', requireAuth, (req: AuthedRequest, res) => {
  const db = getDB();
  const u = req.user!;
  const awarded = db.projects.filter((p) => p.awardedContractorId === u.id);
  const completed = awarded.filter((p) => p.status === 'completed');
  const myBids = db.bids.filter((b) => b.contractorId === u.id);
  const winRate = myBids.length ? Math.round((myBids.filter((b) => b.status === 'accepted').length / myBids.length) * 100) : 0;
  const score = Math.round(Math.min(100, 40 + completed.length * 20 + winRate * 0.2));
  res.json({
    role: 'contractor', score,
    breakdown: [
      { label: 'Government-verified completions', points: Math.min(40, completed.length * 20), max: 40, detail: `${completed.length} project(s) completed` },
      { label: 'Documented performance', points: awarded.filter((p) => p.progress.length).length * 5, max: 15, detail: 'Progress evidence submitted' },
      { label: 'Bid win record', points: Math.round(winRate * 0.2), max: 20, detail: `${winRate}% of ${myBids.length} bid(s) selected` },
      { label: 'Quality/acceptance record', points: Math.min(25, completed.length * 12), max: 25, detail: 'Acceptance without rework' },
    ],
    history: [],
    note: 'Complements — does not replace — legally applicable procurement criteria.',
  });
});

/** ---------- Nearby problems (community) ---------- */
router.get('/nearby', requireAuth, (req: AuthedRequest, res) => {
  const db = getDB();
  const lat = Number(req.query.lat), lng = Number(req.query.lng);
  const list = db.complaints
    .filter((c) => !['closed', 'rejected', 'duplicate'].includes(c.status))
    .map((c) => ({ c, dist: haversineKm({ lat, lng }, c.gps) }))
    .filter((x) => x.dist < 2)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 10)
    .map((x) => ({ id: x.c.id, category: x.c.category, areaName: x.c.areaName, status: x.c.status, confirmations: x.c.community.length, distanceM: Math.round(x.dist * 1000), createdAt: x.c.createdAt }));
  res.json({ nearby: list });
});

/** ---------- Contact form (public) ---------- */
router.post('/contact', (req, res) => {
  const db = getDB();
  const { name, email, subject, body } = req.body || {};
  if (!name || !email || !body) return res.status(400).json({ error: 'Name, email and message are required' });
  db.messages.push({ id: uuid(), name, email, subject: subject || 'General enquiry', body, at: nowISO() });
  audit(null, 'CONTACT_MESSAGE', `${name} <${email}>: ${subject || ''}`);
  saveDB();
  res.json({ ok: true });
});

export default router;

>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
