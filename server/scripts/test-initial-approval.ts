import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import express from 'express';

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'jansetu-initial-approval-'));
process.env.JANSETU_DATA_DIR = temp;
const { loadDB } = await import('../src/store');
const { buildSeed } = await import('../src/seed');
const { signToken } = await import('../src/auth');
const { default: complaintRoutes } = await import('../src/routes/complaints');
const app = express();
app.use(express.json());
app.use('/api/complaints', complaintRoutes);
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
const address = server.address();
assert(address && typeof address !== 'string');
const base = `http://127.0.0.1:${address.port}/api/complaints`;

try {
  for (const status of ['submitted', 'under_review', 'verification_required', 'community_verification', 'verified'] as const) {
    for (const decision of ['direct', 'field', 'contractor']) {
      fs.rmSync(path.join(temp, 'db.json'), { force: true });
      const db = loadDB(buildSeed);
      const c = db.complaints.find((item) => item.status === 'under_review' && item.routedTo)!;
      assert(c);
      c.status = status;
      const official = db.users.find((u) => u.role === 'government' && u.orgId === c.routedTo!.orgId)!;
      const citizen = db.users.find((u) => u.id === c.citizenId)!;
      assert(official && citizen);
      const request = async (suffix: string, body?: object, user = official, expected = 200) => {
        const response = await fetch(`${base}/${c.id}${suffix}`, {
          method: body ? 'POST' : 'GET',
          headers: { Authorization: `Bearer ${signToken(user)}`, 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(5000),
        });
        const result = await response.json() as { complaint: { status: string }; error?: string };
        assert.equal(response.status, expected, JSON.stringify(result));
        return result;
      };
      await request('/approve', {}, citizen, 403);
      await request('/approve', { note: 123 }, official, 400);
      assert.equal(c.status, status);
      await request('/approve', { note: 'Evidence reviewed by official' });
      assert.deepEqual(c.timeline.slice(-2).map((t) => t.status), ['verified', 'forwarded_to_government']);
      assert.equal((await request('')).complaint.status, 'forwarded_to_government');
      assert(db.notifications.some((n) => n.userId === citizen.id && n.title === 'Complaint approved and forwarded'));
      assert(db.auditLogs.some((a) => a.action === 'COMPLAINT_APPROVED' && a.entity === c.id));
      const timelineLength = c.timeline.length;
      await request('/approve', {}, official, 409);
      assert.equal(c.timeline.length, timelineLength);
      await request('/decision', { decision, title: 'Initial approval test' });
      const expectedStatus = decision === 'direct' ? 'government_direct_action' : decision === 'field' ? 'field_assignment_created' : 'bidding';
      assert.equal((await request('')).complaint.status, expectedStatus);
      await request('/approve', {}, official, 409);
      const persisted = JSON.parse(fs.readFileSync(path.join(temp, 'db.json'), 'utf8'));
      assert.equal(persisted.complaints.find((item: { id: string }) => item.id === c.id).status, expectedStatus);
      console.log(`PASS: ${status} → approved and forwarded → ${decision}; refresh, notifications, audit, persistence and guards`);
    }
  }
} finally {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  fs.rmSync(temp, { recursive: true, force: true });
}
