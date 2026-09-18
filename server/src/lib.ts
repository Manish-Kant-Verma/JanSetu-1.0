<<<<<<< HEAD
import crypto from 'crypto';
import type { Complaint, ComplaintStatus, TimelineEntry, User } from './types';
import { getDB } from './store';

export const uuid = () => crypto.randomUUID();
export const nowISO = () => new Date().toISOString();
export const addDays = (d: Date | string, n: number) => new Date(new Date(d).getTime() + n * 86400000).toISOString();
export const daysUntil = (iso?: string) => (iso ? Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000) : null);


export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export const CATEGORIES = ['Road Damage', 'Garbage', 'Drainage', 'Streetlight', 'Water Leakage', 'Public Infrastructure', 'Other'] as const;

export const SKILL_MAP: Record<string, string[]> = {
  'Road Damage': ['civil', 'road assessment', 'infrastructure'],
  Garbage: ['sanitation', 'environment'],
  Drainage: ['civil', 'environment'],
  Streetlight: ['electrical', 'infrastructure'],
  'Water Leakage': ['civil', 'plumbing'],
  'Public Infrastructure': ['civil', 'surveying'],
  Other: ['surveying'],
};

/** AI category signal (demo). Keywords only — recommendations, never final decisions. */
export function aiClassify(description: string, chosen?: string) {
  const t = (description || '').toLowerCase();
  const map: [string, string[]][] = [
    ['Road Damage', ['pothole', 'road', 'crack', 'asphalt', 'broken road', 'speed breaker', 'bump']],
    ['Garbage', ['garbage', 'trash', 'waste', 'dump', 'litter', 'dustbin', 'stink', 'garbage pile']],
    ['Drainage', ['drain', 'sewage', 'clog', 'overflow', 'open drain', 'gutter']],
    ['Streetlight', ['streetlight', 'street light', 'lamp', 'light not', 'pole', 'dark road']],
    ['Water Leakage', ['water', 'leak', 'pipeline', 'pipe', 'tap', 'waterlogging']],
    ['Public Infrastructure', ['footpath', 'bridge', 'wall', 'park', 'bus stop', 'signboard', 'divider']],
  ];
  if (chosen && chosen !== 'Other') {
    return { category: chosen, confidence: 0.97, signals: ['Citizen selected category', 'Keyword cross-check in description'] };
  }
  for (const [cat, kws] of map) {
    const hits = kws.filter((k) => t.includes(k));
    if (hits.length) {
      return {
        category: cat,
        confidence: Math.round((0.7 + Math.min(0.27, hits.length * 0.09)) * 100) / 100,
        signals: [`Description keywords: ${hits.join(', ')}`, 'Image pattern (simulated)', 'Category model v0.9 (demo)'],
      };
    }
  }
  return { category: 'Public Infrastructure', confidence: 0.55, signals: ['Fallback heuristic — no strong match'] };
}

/** Routing engine: category + keywords + jurisdiction → org/department + SLA */
export function routeComplaint(c: Complaint) {
  const db = getDB();
  const rules = db.routingRules.filter((r) => r.active);
  let rule = rules.find((r) => r.category === c.category)
    || rules.find((r) => r.keywords.some((k) => c.description.toLowerCase().includes(k)))
    || rules.find((r) => r.category === 'Other');
  if (!rule) return null;
  const org = db.orgs.find((o) => o.id === rule!.orgId);
  if (!org) return null;
  const levelLabel = org.level === 'district' ? 'District — ' : org.level === 'village' ? 'Village/Panchayat — ' : org.level === 'block' ? 'Block — ' : 'State — ';
  return {
    routedTo: { orgId: org.id, orgName: org.name, department: rule.department, ruleId: rule.id },
    explanation: `Problem: ${c.category} • Location: ${c.areaName} • Jurisdiction: ${levelLabel}${c.jurisdiction.district} • Department: ${rule.department} • Routing based on configured government rules`,
    reviewDeadlineAt: addDays(c.createdAt, rule.reviewDays),
    resolutionDeadlineAt: addDays(c.createdAt, rule.slaDays),
  };
}

export function pushTimeline(c: Complaint, status: ComplaintStatus, by: string, byName?: string, note?: string) {
  const entry: TimelineEntry = { status, at: nowISO(), by, byName, note };
  c.timeline.push(entry);
  c.status = status;
}

export function notify(userId: string, title: string, body: string, link?: string) {
  getDB().notifications.unshift({ id: uuid(), userId, title, body, link, read: false, at: nowISO() });
}

export function notifyOrg(orgId: string, title: string, body: string, link?: string) {
  getDB().users.filter((u) => u.role === 'government' && u.orgId === orgId).forEach((u) => notify(u.id, title, body, link));
}

export function notifyRole(role: string, title: string, body: string, link?: string) {
  getDB().users.filter((u) => u.role === role && u.verified).forEach((u) => notify(u.id, title, body, link));
}

export function audit(actor: User | null | undefined, action: string, entity: string, meta?: any) {
  getDB().auditLogs.unshift({
    id: uuid(),
    actorId: actor?.id || 'system',
    actorName: actor?.name || 'System',
    action, entity, meta,
    at: nowISO(),
  });
}

export function addScore(user: User, delta: number, reason: string) {
  if (user.role === 'citizen') {
    user.civilScore = Math.max(0, Math.min(100, (user.civilScore ?? 50) + delta));
    user.civilHistory = [...(user.civilHistory || []), { at: nowISO(), delta, reason }];
  } else if (user.role === 'jsmember') {
    user.trustScore = Math.max(0, Math.min(100, (user.trustScore ?? 50) + delta));
    user.trustHistory = [...(user.trustHistory || []), { at: nowISO(), delta, reason }];
  }
}

/** Deadline sweep — flags overdue review deadlines and expires open assignments. */
export function sweepOverdue() {
  const db = getDB();
  const now = Date.now();
  const pendingOfReview = new Set<ComplaintStatus>([
    'submitted', 'under_review', 'verification_required', 'community_verification', 'verified',
    'forwarded_to_government', 'technical_assessment_required', 'field_assignment_created',
  ]);
  for (const c of db.complaints) {
    if (
      c.reviewDeadlineAt && new Date(c.reviewDeadlineAt).getTime() < now &&
      pendingOfReview.has(c.status) && !c.overdueFlags.includes('review')
    ) {
      c.overdueFlags.push('review');
      if (c.routedTo) notifyOrg(c.routedTo.orgId, `OVERDUE: ${c.id}`, `Review deadline for ${c.id} (${c.category}, ${c.areaName}) has passed. Configured escalation applies.`, `/gov/complaints/${c.id}`);
    }
    if (
      c.resolutionDeadlineAt && new Date(c.resolutionDeadlineAt).getTime() < now &&
      !['closed', 'rejected', 'duplicate'].includes(c.status) && !c.overdueFlags.includes('resolution')
    ) {
      c.overdueFlags.push('resolution');
      if (c.routedTo) notifyOrg(c.routedTo.orgId, `SLA breach: ${c.id}`, `Resolution deadline for ${c.id} has passed.`, `/gov/complaints/${c.id}`);
    }
  }
  for (const a of db.assignments) {
    if (a.status === 'open' && new Date(a.deadlineAt).getTime() < now) {
      a.status = 'expired';
      const c = db.complaints.find((x) => x.id === a.complaintId);
      if (c && c.assignmentId === a.id) {
        c.assignmentId = undefined;
        pushTimeline(c, 'technical_assessment_required', 'system', 'JanSetu', 'Assignment deadline passed — returned for reassignment to an eligible JS Member.');
        if (c.routedTo) notifyOrg(c.routedTo.orgId, `Assignment expired for ${c.id}`, 'No JS Member accepted in time. Assignment was returned to the pool for reassignment.', `/gov/complaints/${c.id}`);
      }
    }
  }
  for (const p of db.projects) {
    if (p.status === 'open_bidding' && new Date(p.bidDeadlineAt).getTime() < now) {
      p.status = 'evaluation';
    }
  }
}

export function canSeeComplaint(u: User, c: Complaint): boolean {
  if (u.role === 'admin') return true;
  if (u.role === 'citizen') return c.citizenId === u.id || !!c.linkedBy?.includes(u.id);
  if (u.role === 'government') return !u.orgId || c.routedTo?.orgId === u.orgId;
  if (u.role === 'jsmember') {
    return getDB().assignments.some((a) => a.complaintId === c.id && a.jsmemberId === u.id);
  }
  return false;
}

=======
import crypto from 'crypto';
import type { Complaint, ComplaintStatus, TimelineEntry, User } from './types';
import { getDB } from './store';

export const uuid = () => crypto.randomUUID();
export const nowISO = () => new Date().toISOString();
export const addDays = (d: Date | string, n: number) => new Date(new Date(d).getTime() + n * 86400000).toISOString();
export const daysUntil = (iso?: string) => (iso ? Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000) : null);

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export const CATEGORIES = ['Road Damage', 'Garbage', 'Drainage', 'Streetlight', 'Water Leakage', 'Public Infrastructure', 'Other'] as const;

export const SKILL_MAP: Record<string, string[]> = {
  'Road Damage': ['civil', 'road assessment', 'infrastructure'],
  Garbage: ['sanitation', 'environment'],
  Drainage: ['civil', 'environment'],
  Streetlight: ['electrical', 'infrastructure'],
  'Water Leakage': ['civil', 'plumbing'],
  'Public Infrastructure': ['civil', 'surveying'],
  Other: ['surveying'],
};

/** AI category signal (demo). Keywords only — recommendations, never final decisions. */
export function aiClassify(description: string, chosen?: string) {
  const t = (description || '').toLowerCase();
  const map: [string, string[]][] = [
    ['Road Damage', ['pothole', 'road', 'crack', 'asphalt', 'broken road', 'speed breaker', 'bump']],
    ['Garbage', ['garbage', 'trash', 'waste', 'dump', 'litter', 'dustbin', 'stink', 'garbage pile']],
    ['Drainage', ['drain', 'sewage', 'clog', 'overflow', 'open drain', 'gutter']],
    ['Streetlight', ['streetlight', 'street light', 'lamp', 'light not', 'pole', 'dark road']],
    ['Water Leakage', ['water', 'leak', 'pipeline', 'pipe', 'tap', 'waterlogging']],
    ['Public Infrastructure', ['footpath', 'bridge', 'wall', 'park', 'bus stop', 'signboard', 'divider']],
  ];
  if (chosen && chosen !== 'Other') {
    return { category: chosen, confidence: 0.97, signals: ['Citizen selected category', 'Keyword cross-check in description'] };
  }
  for (const [cat, kws] of map) {
    const hits = kws.filter((k) => t.includes(k));
    if (hits.length) {
      return {
        category: cat,
        confidence: Math.round((0.7 + Math.min(0.27, hits.length * 0.09)) * 100) / 100,
        signals: [`Description keywords: ${hits.join(', ')}`, 'Image pattern (simulated)', 'Category model v0.9 (demo)'],
      };
    }
  }
  return { category: 'Public Infrastructure', confidence: 0.55, signals: ['Fallback heuristic — no strong match'] };
}

/** Routing engine: category + keywords + jurisdiction → org/department + SLA */
export function routeComplaint(c: Complaint) {
  const db = getDB();
  const rules = db.routingRules.filter((r) => r.active);
  let rule = rules.find((r) => r.category === c.category)
    || rules.find((r) => r.keywords.some((k) => c.description.toLowerCase().includes(k)))
    || rules.find((r) => r.category === 'Other');
  if (!rule) return null;
  const org = db.orgs.find((o) => o.id === rule!.orgId);
  if (!org) return null;
  const levelLabel = org.level === 'district' ? 'District — ' : org.level === 'village' ? 'Village/Panchayat — ' : org.level === 'block' ? 'Block — ' : 'State — ';
  return {
    routedTo: { orgId: org.id, orgName: org.name, department: rule.department, ruleId: rule.id },
    explanation: `Problem: ${c.category} • Location: ${c.areaName} • Jurisdiction: ${levelLabel}${c.jurisdiction.district} • Department: ${rule.department} • Routing based on configured government rules`,
    reviewDeadlineAt: addDays(c.createdAt, rule.reviewDays),
    resolutionDeadlineAt: addDays(c.createdAt, rule.slaDays),
  };
}

export function pushTimeline(c: Complaint, status: ComplaintStatus, by: string, byName?: string, note?: string) {
  const entry: TimelineEntry = { status, at: nowISO(), by, byName, note };
  c.timeline.push(entry);
  c.status = status;
}

export function notify(userId: string, title: string, body: string, link?: string) {
  getDB().notifications.unshift({ id: uuid(), userId, title, body, link, read: false, at: nowISO() });
}

export function notifyOrg(orgId: string, title: string, body: string, link?: string) {
  getDB().users.filter((u) => u.role === 'government' && u.orgId === orgId).forEach((u) => notify(u.id, title, body, link));
}

export function notifyRole(role: string, title: string, body: string, link?: string) {
  getDB().users.filter((u) => u.role === role && u.verified).forEach((u) => notify(u.id, title, body, link));
}

export function audit(actor: User | null | undefined, action: string, entity: string, meta?: any) {
  getDB().auditLogs.unshift({
    id: uuid(),
    actorId: actor?.id || 'system',
    actorName: actor?.name || 'System',
    action, entity, meta,
    at: nowISO(),
  });
}

export function addScore(user: User, delta: number, reason: string) {
  if (user.role === 'citizen') {
    user.civilScore = Math.max(0, Math.min(100, (user.civilScore ?? 50) + delta));
    user.civilHistory = [...(user.civilHistory || []), { at: nowISO(), delta, reason }];
  } else if (user.role === 'jsmember') {
    user.trustScore = Math.max(0, Math.min(100, (user.trustScore ?? 50) + delta));
    user.trustHistory = [...(user.trustHistory || []), { at: nowISO(), delta, reason }];
  }
}

/** Deadline sweep — flags overdue review deadlines and expires open assignments. */
export function sweepOverdue() {
  const db = getDB();
  const now = Date.now();
  const pendingOfReview = new Set<ComplaintStatus>([
    'submitted', 'under_review', 'verification_required', 'community_verification', 'verified',
    'forwarded_to_government', 'technical_assessment_required', 'field_assignment_created',
  ]);
  for (const c of db.complaints) {
    if (
      c.reviewDeadlineAt && new Date(c.reviewDeadlineAt).getTime() < now &&
      pendingOfReview.has(c.status) && !c.overdueFlags.includes('review')
    ) {
      c.overdueFlags.push('review');
      if (c.routedTo) notifyOrg(c.routedTo.orgId, `OVERDUE: ${c.id}`, `Review deadline for ${c.id} (${c.category}, ${c.areaName}) has passed. Configured escalation applies.`, `/gov/complaints/${c.id}`);
    }
    if (
      c.resolutionDeadlineAt && new Date(c.resolutionDeadlineAt).getTime() < now &&
      !['closed', 'rejected', 'duplicate'].includes(c.status) && !c.overdueFlags.includes('resolution')
    ) {
      c.overdueFlags.push('resolution');
      if (c.routedTo) notifyOrg(c.routedTo.orgId, `SLA breach: ${c.id}`, `Resolution deadline for ${c.id} has passed.`, `/gov/complaints/${c.id}`);
    }
  }
  for (const a of db.assignments) {
    if (a.status === 'open' && new Date(a.deadlineAt).getTime() < now) {
      a.status = 'expired';
      const c = db.complaints.find((x) => x.id === a.complaintId);
      if (c && c.assignmentId === a.id) {
        c.assignmentId = undefined;
        pushTimeline(c, 'technical_assessment_required', 'system', 'JanSetu', 'Assignment deadline passed — returned for reassignment to an eligible JS Member.');
        if (c.routedTo) notifyOrg(c.routedTo.orgId, `Assignment expired for ${c.id}`, 'No JS Member accepted in time. Assignment was returned to the pool for reassignment.', `/gov/complaints/${c.id}`);
      }
    }
  }
  for (const p of db.projects) {
    if (p.status === 'open_bidding' && new Date(p.bidDeadlineAt).getTime() < now) {
      p.status = 'evaluation';
    }
  }
}

export function canSeeComplaint(u: User, c: Complaint): boolean {
  if (u.role === 'admin') return true;
  if (u.role === 'citizen') return c.citizenId === u.id || !!c.linkedBy?.includes(u.id);
  if (u.role === 'government') return !u.orgId || c.routedTo?.orgId === u.orgId;
  if (u.role === 'jsmember') {
    return getDB().assignments.some((a) => a.complaintId === c.id && a.jsmemberId === u.id);
  }
  return false;
}

>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
