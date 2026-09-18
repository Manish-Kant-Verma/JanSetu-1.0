import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { User, Role } from './types';
import { getDB } from './store';

const SECRET = process.env.JWT_SECRET || 'jansetu-demo-secret-key';

export function signToken(u: User): string {
  return jwt.sign({ id: u.id, role: u.role }, SECRET, { expiresIn: '7d' });
}

export interface AuthedRequest extends Request { user?: User }

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(h.slice(7), SECRET) as { id: string };
    const user = getDB().users.find((u) => u.id === payload.id);
    if (!user || !user.active) return res.status(401).json({ error: 'Account is inactive or missing' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session. Please login again.' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.role !== 'admin' && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Your role is not permitted to perform this action' });
    }
    next();
  };
}

export function publicUser(u: User) {
  const { passwordHash, ...rest } = u;
  return rest;
}
