<<<<<<< HEAD
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import express from 'express';

// Set before dynamic imports: this script must never load the application's data.
const directory = mkdtempSync(path.join(tmpdir(), 'jansetu-regression-'));
process.env.JANSETU_DATA_DIR = directory;
process.env.JWT_SECRET = randomBytes(48).toString('hex');
let server;
try {
  const { loadDB, getDB, saveDB } = await import('../src/store.ts');
  const { signToken } = await import('../src/auth.ts');
  const { default: complaints } = await import('../src/routes/complaints.ts');
  const { default: projects } = await import('../src/routes/projects.ts');
  const user = (id, role) => ({ id, role, name: id, email: `${id}@example.invalid`, phone: '', passwordHash: '', verified: true, active: true, createdAt: new Date().toISOString(), orgId: role === 'government' ? 'test-org' : undefined });
  const citizen = user('test-citizen', 'citizen');
  const contractor = user('test-contractor', 'contractor');
  const government = user('test-government', 'government');
  loadDB(() => ({ users: [citizen, contractor, government], complaints: [], assignments: [], actions: [], projects: [], bids: [], orgs: [], routingRules: [], notifications: [], auditLogs: [], messages: [], counters: { complaint: 0, project: 0 } }));
  const app = express();
  app.use(express.json());
  app.use('/complaints', complaints);
  app.use('/projects', projects);
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (url, actor, body) => {
    const form = body instanceof FormData;
    const response = await fetch(base + url, { method: body === undefined ? 'GET' : 'POST', headers: { Authorization: `Bearer ${signToken(actor)}`, ...(!form && body !== undefined ? { 'Content-Type': 'application/json' } : {}) }, body: body === undefined ? undefined : form ? body : JSON.stringify(body), signal: AbortSignal.timeout(10000) });
    const result = await response.json();
    assert.equal(response.status, 200, `${url}: ${result.error || response.status}`);
    return result;
  };
  const photo = () => new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH0sAAAAASUVORK5CYII=', 'base64')], { type: 'image/png' });
  const form = new FormData();
  form.append('images', photo(), 'test.png');
  form.append('lat', '22.72'); form.append('lng', '75.86');
  form.append('category', 'Road Damage'); form.append('description', 'Regression test report');
  const created = (await request('/complaints', citizen, form)).complaint;
  assert.ok(created.id);
  assert.ok((await request('/complaints', citizen)).complaints.some(c => c.id === created.id));
  console.log('PASS: submission appears in citizen complaint list');
  loadDB(() => { throw new Error('Expected persisted database'); });
  assert.equal((await request(`/complaints/${created.id}`, citizen)).complaint.description, 'Regression test report');
  console.log('PASS: complaint survives database reload from disk');
  const db = getDB();
  const complaint = db.complaints.find(c => c.id === created.id);
  complaint.status = 'work_in_progress';
  complaint.routedTo = { orgId: 'test-org', orgName: 'Test organization', department: 'Test' };
  complaint.projectId = 'test-project';
  db.projects.push({ id: 'test-project', code: 'TEST', complaintId: complaint.id, title: 'Test', scope: '', category: complaint.category, location: '', gps: complaint.gps, budgetEstimate: 1, eligibility: '', bidDeadlineAt: new Date().toISOString(), documents: [], status: 'awarded', createdBy: government.id, awardedContractorId: contractor.id, progress: [], createdAt: new Date().toISOString() });
  saveDB();
  await request('/projects/test-project/complete', contractor, {});
  assert.equal((await request(`/complaints/${created.id}`, government)).complaint.status, 'work_in_progress');
  console.log('PASS: contractor completion keeps government resolution available');
  const resolution = new FormData();
  resolution.append('photo', photo(), 'completion.png');
  resolution.append('details', 'Test completion');
  const resolved = (await request(`/complaints/${created.id}/resolve`, government, resolution)).complaint;
  assert.equal(resolved.status, 'citizen_verification');
  assert.ok(resolved.govVerifiedAt && resolved.resolution.photo);
  loadDB(() => { throw new Error('Expected persisted database'); });
  assert.equal(getDB().complaints[0].status, 'citizen_verification');
  console.log('PASS: government resolution accepted and persisted');
  console.log('REGRESSION: PASS');
} catch (error) {
  console.error('REGRESSION: FAIL', error);
  process.exitCode = 1;
} finally {
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  rmSync(directory, { recursive: true, force: true });
}
=======
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import express from 'express';

// Set before dynamic imports: this script must never load the application's data.
const directory = mkdtempSync(path.join(tmpdir(), 'jansetu-regression-'));
process.env.JANSETU_DATA_DIR = directory;
process.env.JWT_SECRET = randomBytes(48).toString('hex');
let server;
try {
  const { loadDB, getDB, saveDB } = await import('../src/store.ts');
  const { signToken } = await import('../src/auth.ts');
  const { default: complaints } = await import('../src/routes/complaints.ts');
  const { default: projects } = await import('../src/routes/projects.ts');
  const user = (id, role) => ({ id, role, name: id, email: `${id}@example.invalid`, phone: '', passwordHash: '', verified: true, active: true, createdAt: new Date().toISOString(), orgId: role === 'government' ? 'test-org' : undefined });
  const citizen = user('test-citizen', 'citizen');
  const contractor = user('test-contractor', 'contractor');
  const government = user('test-government', 'government');
  loadDB(() => ({ users: [citizen, contractor, government], complaints: [], assignments: [], actions: [], projects: [], bids: [], orgs: [], routingRules: [], notifications: [], auditLogs: [], messages: [], counters: { complaint: 0, project: 0 } }));
  const app = express();
  app.use(express.json());
  app.use('/complaints', complaints);
  app.use('/projects', projects);
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (url, actor, body) => {
    const form = body instanceof FormData;
    const response = await fetch(base + url, { method: body === undefined ? 'GET' : 'POST', headers: { Authorization: `Bearer ${signToken(actor)}`, ...(!form && body !== undefined ? { 'Content-Type': 'application/json' } : {}) }, body: body === undefined ? undefined : form ? body : JSON.stringify(body), signal: AbortSignal.timeout(10000) });
    const result = await response.json();
    assert.equal(response.status, 200, `${url}: ${result.error || response.status}`);
    return result;
  };
  const photo = () => new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH0sAAAAASUVORK5CYII=', 'base64')], { type: 'image/png' });
  const form = new FormData();
  form.append('images', photo(), 'test.png');
  form.append('lat', '22.72'); form.append('lng', '75.86');
  form.append('category', 'Road Damage'); form.append('description', 'Regression test report');
  const created = (await request('/complaints', citizen, form)).complaint;
  assert.ok(created.id);
  assert.ok((await request('/complaints', citizen)).complaints.some(c => c.id === created.id));
  console.log('PASS: submission appears in citizen complaint list');
  loadDB(() => { throw new Error('Expected persisted database'); });
  assert.equal((await request(`/complaints/${created.id}`, citizen)).complaint.description, 'Regression test report');
  console.log('PASS: complaint survives database reload from disk');
  const db = getDB();
  const complaint = db.complaints.find(c => c.id === created.id);
  complaint.status = 'work_in_progress';
  complaint.routedTo = { orgId: 'test-org', orgName: 'Test organization', department: 'Test' };
  complaint.projectId = 'test-project';
  db.projects.push({ id: 'test-project', code: 'TEST', complaintId: complaint.id, title: 'Test', scope: '', category: complaint.category, location: '', gps: complaint.gps, budgetEstimate: 1, eligibility: '', bidDeadlineAt: new Date().toISOString(), documents: [], status: 'awarded', createdBy: government.id, awardedContractorId: contractor.id, progress: [], createdAt: new Date().toISOString() });
  saveDB();
  await request('/projects/test-project/complete', contractor, {});
  assert.equal((await request(`/complaints/${created.id}`, government)).complaint.status, 'work_in_progress');
  console.log('PASS: contractor completion keeps government resolution available');
  const resolution = new FormData();
  resolution.append('photo', photo(), 'completion.png');
  resolution.append('details', 'Test completion');
  const resolved = (await request(`/complaints/${created.id}/resolve`, government, resolution)).complaint;
  assert.equal(resolved.status, 'citizen_verification');
  assert.ok(resolved.govVerifiedAt && resolved.resolution.photo);
  loadDB(() => { throw new Error('Expected persisted database'); });
  assert.equal(getDB().complaints[0].status, 'citizen_verification');
  console.log('PASS: government resolution accepted and persisted');
  console.log('REGRESSION: PASS');
} catch (error) {
  console.error('REGRESSION: FAIL', error);
  process.exitCode = 1;
} finally {
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  rmSync(directory, { recursive: true, force: true });
}
>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
