import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import express from 'express';

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'jansetu-approval-'));
process.env.JANSETU_DATA_DIR = temp;
const { loadDB, getDB } = await import('../src/store');
const { buildSeed } = await import('../src/seed');
const { signToken } = await import('../src/auth');
const { default: govRoutes } = await import('../src/routes/gov');
const { default: complaintRoutes } = await import('../src/routes/complaints');
const app = express();
app.use(express.json());
app.use('/api/gov', govRoutes);
app.use('/api/complaints', complaintRoutes);
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
const address = server.address();
assert(address && typeof address !== 'string');
const base = `http://127.0.0.1:${address.port}/api`;

try {
  for (const decision of ['direct', 'contractor']) {
    fs.rmSync(path.join(temp, 'db.json'), { force: true });
    const db = loadDB(buildSeed);
    const assignment = db.assignments.find((a) => a.status === 'report_verified')!;
    const complaint = db.complaints.find((c) => c.id === assignment.complaintId)!;
    const official = db.users.find((u) => u.role === 'government' && u.orgId === complaint.routedTo?.orgId)!;
    assert(official);
    const token = signToken(official);
    const post = async (url: string, body: object) => {
      const response = await fetch(base + url, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(5000),
      });
      const result = await response.json();
      assert.equal(response.status, 200, JSON.stringify(result));
      return result;
    };
    await post(`/gov/assignments/${assignment.id}/review`, { decision: 'approve' });
    assert.equal(assignment.status, 'completed');
    assert.equal(complaint.status, 'government_decision');
    assert.deepEqual(complaint.timeline.slice(-2).map((t) => t.status), ['technical_report_approved', 'government_decision']);
    await post(`/complaints/${complaint.id}/decision`, { decision, title: 'Approval workflow test' });
    assert.equal(complaint.status, decision === 'direct' ? 'government_direct_action' : 'bidding');
    assert(getDB().actions.some((a) => a.id === complaint.actionId));
    if (decision === 'contractor') assert(getDB().projects.some((p) => p.id === complaint.projectId));
    const persisted = JSON.parse(fs.readFileSync(path.join(temp, 'db.json'), 'utf8'));
    assert.equal(persisted.complaints.find((c: { id: string }) => c.id === complaint.id).status, complaint.status);
    console.log(`PASS: report approval → ${decision} decision → persisted ${complaint.status}`);
  }
} finally {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  fs.rmSync(temp, { recursive: true, force: true });
}
