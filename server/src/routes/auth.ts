import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDB, saveDB } from '../store';
import { signToken, publicUser, requireAuth, AuthedRequest } from '../auth';
import { uuid, nowISO, audit, addScore } from '../lib';
import type { User, Role } from '../types';

const router = Router();

/** Quick-login list for the demo/hackathon */
router.get('/demo-accounts', (_req, res) => {
  const db = getDB();
  const pick = (email: string) => {
    const u = db.users.find((x) => x.email === email)!;
    return { role: u.role, name: u.name, email: u.email };
  };
  res.json({
    accounts: [
      { ...pick('citizen@jansetu.in'), password: 'Citizen@123', label: 'Citizen — Ravi Sharma' },
      { ...pick('member@jansetu.in'), password: 'Member@123', label: 'JS Member — Amit Patel' },
      { ...pick('officer@jansetu.in'), password: 'Gov@123', label: 'Gov Officer — S.K. Dwivedi' },
      { ...pick('contractor@buildwell.in'), password: 'Build@123', label: 'Contractor — BuildWell Infra' },
      { ...pick('admin@jansetu.in'), password: 'Admin@123', label: 'Admin — Dr. Anil Mehta' },
    ],
  });
});

router.post('/register', async (req, res) => {
  const db = getDB();
  const { name, email, phone, password, role, skills, experience, areaName, businessName, gstNumber, registrationNumber } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
  const allowed: Role[] = ['citizen', 'jsmember', 'contractor'];
  if (!allowed.includes(role)) return res.status(400).json({ error: 'Choose a valid role. Government and Admin accounts are provisioned by JanSetu Admin.' });
  if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (db.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }
  const user: User = {
    id: uuid(),
    name, email, phone: phone || '',
    passwordHash: bcrypt.hashSync(password, 8),
    role,
    verified: role === 'citizen',
    active: true,
    createdAt: nowISO(),
  };
  if (role === 'jsmember') {
    user.skills = String(skills || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    user.experience = experience || '';
    user.baseLocation = { lat: 22.7533 + (Math.random() - 0.5) * 0.05, lng: 75.8933 + (Math.random() - 0.5) * 0.05, area: areaName || 'Indore' };
    user.trustScore = 50;
  }
  if (role === 'contractor') {
    user.businessName = businessName || name;
    user.gstNumber = gstNumber || '';
    user.registrationNumber = registrationNumber || '';
    user.verified = false; // needs admin verification before bidding
  }
  db.users.push(user);
  audit(user, 'USER_REGISTERED', `${role}:${email}`);
  saveDB();
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const db = getDB();
  const { email, password } = req.body || {};
  const user = db.users.find((u) => u.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(String(password || ''), user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (!user.active) return res.status(403).json({ error: 'This account has been deactivated by the administrator.' });
  saveDB();
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.get('/me', requireAuth, (req: AuthedRequest, res) => {
  res.json({ user: publicUser(req.user!) });
});

router.post('/change-password', requireAuth, (req: AuthedRequest, res) => {
  const { current, next } = req.body || {};
  const db = getDB();
  const u = db.users.find((x) => x.id === req.user!.id)!;
  if (!bcrypt.compareSync(String(current || ''), u.passwordHash)) return res.status(400).json({ error: 'Current password is incorrect' });
  if (String(next || '').length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
  u.passwordHash = bcrypt.hashSync(next, 8);
  audit(u, 'PASSWORD_CHANGED', u.email);
  saveDB();
  res.json({ ok: true });
});

export default router;
