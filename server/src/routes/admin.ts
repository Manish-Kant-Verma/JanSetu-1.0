import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDB, saveDB } from '../store';
import { requireAuth, requireRole, AuthedRequest, publicUser } from '../auth';
import { uuid, nowISO, notify, audit, sweepOverdue } from '../lib';
import type { Org, RoutingRule, User } from '../types';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/overview', (req: AuthedRequest, res) => {
  sweepOverdue();
  const db = getDB();
  res.json({
    stats: {
      users: db.users.length,
      citizens: db.users.filter((u) => u.role === 'citizen').length,
      jsmembers: db.users.filter((u) => u.role === 'jsmember').length,
      pendingJsmembers: db.users.filter((u) => u.role === 'jsmember' && !u.verified).length,
      contractors: db.users.filter((u) => u.role === 'contractor').length,
      pendingContractors: db.users.filter((u) => u.role === 'contractor' && !u.verified).length,
      complaints: db.complaints.length,
      active: db.complaints.filter((c) => !['closed', 'rejected'].includes(c.status)).length,
      closed: db.complaints.filter((c) => c.status === 'closed').length,
      overdue: db.complaints.filter((c) => c.overdueFlags.length && !['closed', 'rejected'].includes(c.status)).length,
      projects: db.projects.length,
      openProjects: db.projects.filter((p) => p.status === 'open_bidding').length,
    },
  });
});

router.get('/users', (req: AuthedRequest, res) => {
  const db = getDB();
  const { role, verified, q } = req.query as any;
  let list = db.users.map((u) => ({ ...publicUser(u) }));
  if (role) list = list.filter((u) => u.role === role);
  if (verified === 'true') list = list.filter((u) => u.verified);
  if (verified === 'false') list = list.filter((u) => !u.verified);
  if (q) list = list.filter((u) => `${u.name} ${u.email} ${u.businessName || ''}`.toLowerCase().includes(String(q).toLowerCase()));
  res.json({ users: list });
});

router.post('/users', (req: AuthedRequest, res) => {
  const db = getDB();
  const { name, email, phone, password, role, orgId, department, designation } = req.body || {};
  if (!['government', 'admin'].includes(role)) return res.status(400).json({ error: 'Admins can only create government or admin accounts here' });
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
  if (db.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) return res.status(409).json({ error: 'Email already exists' });
  const u: User = {
    id: uuid(), name, email, phone: phone || '',
    passwordHash: bcrypt.hashSync(password, 8),
    role, verified: true, active: true, createdAt: nowISO(),
    orgId, department, designation,
  };
  db.users.push(u);
  audit(req.user, 'OFFICIAL_ACCOUNT_CREATED', `${role}:${email}`);
  saveDB();
  res.json({ user: publicUser(u) });
});

router.post('/users/:id/verify', (req: AuthedRequest, res) => {
  const db = getDB();
  const u = db.users.find((x) => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  u.verified = !u.verified;
  notify(u.id, u.verified ? 'Account verified ✓' : 'Verification revoked', u.verified ? `Your ${u.role} account is now verified by JanSetu.` : 'Your verification was revoked — contact JanSetu support.', u.role === 'jsmember' ? '/jsmember' : u.role === 'contractor' ? '/contractor' : '/');
  audit(req.user, u.verified ? 'USER_VERIFIED' : 'USER_UNVERIFIED', `${u.role}:${u.email}`);
  saveDB();
  res.json({ user: publicUser(u) });
});

router.post('/users/:id/toggle-active', (req: AuthedRequest, res) => {
  const db = getDB();
  const u = db.users.find((x) => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  if (u.id === req.user!.id) return res.status(400).json({ error: 'You cannot deactivate your own account' });
  u.active = !u.active;
  audit(req.user, u.active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', `${u.role}:${u.email}`);
  saveDB();
  res.json({ user: publicUser(u) });
});

router.get('/orgs', (_req, res) => res.json({ orgs: getDB().orgs }));

router.post('/orgs', (req: AuthedRequest, res) => {
  const db = getDB();
  const { name, type, level, district, state, departments } = req.body || {};
  if (!name || !type || !level) return res.status(400).json({ error: 'Name, type and level are required' });
  const org: Org = {
    id: uuid(), name, type, level, district: district || 'Indore', state: state || 'Madhya Pradesh',
    departments: String(departments || '').split(',').map((s: string) => s.trim()).filter(Boolean),
  };
  db.orgs.push(org);
  audit(req.user, 'ORG_ADDED', org.name);
  saveDB();
  res.json({ org });
});

router.get('/routing-rules', (_req, res) => res.json({ rules: getDB().routingRules }));

router.post('/routing-rules', (req: AuthedRequest, res) => {
  const db = getDB();
  const { category, keywords, orgId, department, slaDays, reviewDays } = req.body || {};
  if (!category || !orgId || !department) return res.status(400).json({ error: 'Category, organisation and department are required' });
  const rule: RoutingRule = {
    id: uuid(), category, keywords: String(keywords || '').split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean),
    level: 'any', orgId, department, slaDays: Number(slaDays) || 7, reviewDays: Number(reviewDays) || 2, active: true,
  };
  db.routingRules.push(rule);
  audit(req.user, 'ROUTING_RULE_ADDED', `${category} → ${department}`);
  saveDB();
  res.json({ rule });
});

router.post('/routing-rules/:id/toggle', (req: AuthedRequest, res) => {
  const db = getDB();
  const r = db.routingRules.find((x) => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Rule not found' });
  r.active = !r.active;
  audit(req.user, 'ROUTING_RULE_TOGGLED', `${r.category} → active:${r.active}`);
  saveDB();
  res.json({ rule: r });
});

router.get('/audit', (req: AuthedRequest, res) => {
  const db = getDB();
  const { q } = req.query as any;
  let list = db.auditLogs;
  if (q) list = list.filter((l) => `${l.actorName} ${l.action} ${l.entity}`.toLowerCase().includes(String(q).toLowerCase()));
  res.json({ logs: list.slice(0, 300) });
});

export default router;

