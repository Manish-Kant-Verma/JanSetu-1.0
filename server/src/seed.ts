import bcrypt from 'bcryptjs';
import fs from 'fs';
import { UPLOAD_DIR } from './store';
import type { DB, User, Org, RoutingRule } from './types';
import { uuid, addDays, nowISO } from './lib';

const hash = (p: string) => bcrypt.hashSync(p, 8);

function seedImage(file: string, color: string, label: string, sub: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">
<rect width="100%" height="100%" fill="#${color}"/>
<rect x="24" y="24" width="752" height="452" fill="none" stroke="#ffffff55" stroke-width="4" stroke-dasharray="14 10" rx="18"/>
<text x="50%" y="42%" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="#ffffff">${label}</text>
<text x="50%" y="54%" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#ffffffcc">${sub}</text>
<text x="50%" y="66%" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" fill="#ffffff88">JanSetu evidence placeholder — demo data</text>
</svg>`;
  fs.writeFileSync(`${UPLOAD_DIR}/${file}`, svg);
  return `/uploads/${file}`;
}

const d = (days: number, hours = 0) => addDays(nowISO(), days + hours / 24);

export function buildSeed(): DB {
  // ---------- evidence placeholder images ----------
  const img = {
    c1: seedImage('seed-1.svg', '1e3a5f', 'Deep pothole — Vijay Nagar Sq.', 'JS-2026-000001 • Road Damage'),
    c2: seedImage('seed-2.svg', '4a5d23', 'Garbage pile — Palasia', 'JS-2026-000002 • Garbage'),
    c3: seedImage('seed-3.svg', '5f3a1e', 'Streetlight pole — dark stretch', 'JS-2026-000003 • Streetlight'),
    c3b: seedImage('seed-3b.svg', '3a5f1e', 'Fresh site evidence — JS Member', 'JS-2026-000003 • Field visit'),
    c4: seedImage('seed-4.svg', '1e4a5f', 'Water pipeline leak', 'JS-2026-000004 • Water Leakage'),
    c5: seedImage('seed-5.svg', '234a5d', 'Clogged drainage — Rajwada', 'JS-2026-000005 • Drainage'),
    c5b: seedImage('seed-5-after.svg', '1e5f3a', 'RESOLVED — drainage cleared', 'JS-2026-000005 • Completion evidence'),
    c6: seedImage('seed-6.svg', '5f1e3a', 'Damaged road stretch', 'JS-2026-000006 • Road Damage'),
    c7: seedImage('seed-7.svg', '4a235d', 'Broken footpath slabs', 'JS-2026-000007 • Public Infrastructure'),
    c8: seedImage('seed-8.svg', '5d4a23', 'Uncollected garbage — Vijay Nagar', 'JS-2026-000008 • Garbage'),
  };
  return buildSeedData(img);
}

function buildSeedData(img: Record<string, string>): DB {
  const db: DB = {
    users: seedUsers(), orgs: seedOrgs(), routingRules: seedRules(),
    complaints: [], assignments: [], actions: [], projects: [], bids: [],
    notifications: [], auditLogs: [], messages: [], counters: { complaint: 8, project: 2 },
  };
  seedComplaints(db, img);
  seedWorkflow(db, img);
  return db;
}


function seedOrgs(): Org[] {
  return [
    { id: 'org-imc', name: 'Indore Municipal Corporation', type: 'Municipal Corporation', level: 'district', district: 'Indore', state: 'Madhya Pradesh', departments: ['Roads & Infrastructure', 'Sanitation & Waste Management', 'Water & Sewerage', 'Street Lighting', 'Drainage & Storm Water'], contactEmail: 'control@imc.gov.in' },
    { id: 'org-pwd', name: 'State PWD (Roads & Bridges)', type: 'State Department', level: 'state', district: 'Indore', state: 'Madhya Pradesh', departments: ['Roads & Bridges'], contactEmail: 'roads@pwd.gov.in' },
    { id: 'org-panchayat', name: 'Gram Panchayat — Betma', type: 'Panchayat', level: 'village', district: 'Indore', state: 'Madhya Pradesh', departments: ['Village Works', 'Water Supply', 'Sanitation'], contactEmail: 'sarpanch@betma.gov.in' },
  ];
}

function seedRules(): RoutingRule[] {
  return [
    { id: uuid(), category: 'Road Damage', keywords: ['pothole', 'road'], level: 'any', orgId: 'org-imc', department: 'Roads & Infrastructure', slaDays: 7, reviewDays: 2, active: true },
    { id: uuid(), category: 'Garbage', keywords: ['garbage', 'waste'], level: 'any', orgId: 'org-imc', department: 'Sanitation & Waste Management', slaDays: 3, reviewDays: 1, active: true },
    { id: uuid(), category: 'Drainage', keywords: ['drain', 'sewage'], level: 'any', orgId: 'org-imc', department: 'Drainage & Storm Water', slaDays: 5, reviewDays: 2, active: true },
    { id: uuid(), category: 'Streetlight', keywords: ['streetlight', 'lamp'], level: 'any', orgId: 'org-imc', department: 'Street Lighting', slaDays: 4, reviewDays: 2, active: true },
    { id: uuid(), category: 'Water Leakage', keywords: ['water', 'pipeline'], level: 'any', orgId: 'org-imc', department: 'Water & Sewerage', slaDays: 5, reviewDays: 2, active: true },
    { id: uuid(), category: 'Public Infrastructure', keywords: ['footpath', 'bridge', 'park'], level: 'any', orgId: 'org-imc', department: 'Roads & Infrastructure', slaDays: 10, reviewDays: 3, active: true },
    { id: uuid(), category: 'Other', keywords: [], level: 'any', orgId: 'org-imc', department: 'Roads & Infrastructure', slaDays: 10, reviewDays: 3, active: true },
  ];
}

function seedUsers(): User[] {
  const users: User[] = [
    { id: 'u-admin', name: 'Dr. Anil Mehta', email: 'admin@jansetu.in', phone: '+91 90000 00001', passwordHash: hash('Admin@123'), role: 'admin', verified: true, active: true, createdAt: d(-90) },
    { id: 'u-c1', name: 'Ravi Sharma', email: 'citizen@jansetu.in', phone: '+91 98260 11111', passwordHash: hash('Citizen@123'), role: 'citizen', verified: true, active: true, createdAt: d(-80), civilScore: 83, civilHistory: [
      { at: d(-30), delta: 5, reason: 'Resolution confirmation — drainage complaint' },
      { at: d(-20), delta: 3, reason: 'Verified report with clear photo + GPS' },
      { at: d(-10), delta: 2, reason: 'Useful community confirmation' },
      { at: d(-60), delta: 3, reason: 'Verified report with clear photo + GPS' },
    ] },
    { id: 'u-c2', name: 'Priya Verma', email: 'citizen2@jansetu.in', phone: '+91 98260 22222', passwordHash: hash('Citizen@123'), role: 'citizen', verified: true, active: true, createdAt: d(-70), civilScore: 76, civilHistory: [{ at: d(-12), delta: 4, reason: 'Verified report with clear photo + GPS' }] },
    { id: 'u-c3', name: 'Mohit Yadav', email: 'mohit@jansetu.in', phone: '+91 98260 33333', passwordHash: hash('Citizen@123'), role: 'citizen', verified: true, active: true, createdAt: d(-65), civilScore: 64 },
    { id: 'u-c4', name: 'Sara Khan', email: 'sara@jansetu.in', phone: '+91 98260 44444', passwordHash: hash('Citizen@123'), role: 'citizen', verified: true, active: true, createdAt: d(-60), civilScore: 71 },
    { id: 'u-c5', name: 'Anita Deshmukh', email: 'anita@jansetu.in', phone: '+91 98260 55555', passwordHash: hash('Citizen@123'), role: 'citizen', verified: true, active: true, createdAt: d(-55), civilScore: 58 },
    { id: 'u-c6', name: 'Vikram Singh', email: 'vikram@jansetu.in', phone: '+91 98260 66666', passwordHash: hash('Citizen@123'), role: 'citizen', verified: true, active: true, createdAt: d(-50), civilScore: 61 },
    { id: 'u-m1', name: 'Amit Patel', email: 'member@jansetu.in', phone: '+91 98260 77777', passwordHash: hash('Member@123'), role: 'jsmember', verified: true, active: true, createdAt: d(-75), skills: ['civil', 'road assessment', 'infrastructure', 'electrical'], experience: 'Civil engineer (BE), 6 yrs site supervision — road, drainage and streetlight works', baseLocation: { lat: 22.7533, lng: 75.8933, area: 'Vijay Nagar, Indore' }, trustScore: 91, trustHistory: [
      { at: d(-9), delta: 5, reason: 'Field report accepted by government (on time)' },
      { at: d(-9), delta: 2, reason: 'GPS-verified site visit' },
      { at: d(-25), delta: 5, reason: 'Field report accepted by government (on time)' },
      { at: d(-40), delta: 3, reason: 'On-time assignment completion' },
    ] },
    { id: 'u-m2', name: 'Neha Joshi', email: 'member2@jansetu.in', phone: '+91 98260 88888', passwordHash: hash('Member@123'), role: 'jsmember', verified: true, active: true, createdAt: d(-40), skills: ['surveying', 'environment', 'sanitation'], experience: 'Environment science student — waste-mapping volunteer projects', baseLocation: { lat: 22.7599, lng: 75.8895, area: 'Palasia, Indore' }, trustScore: 68, trustHistory: [{ at: d(-15), delta: 4, reason: 'GPS-verified site visit' }] },
    { id: 'u-g1', name: 'S.K. Dwivedi', email: 'officer@jansetu.in', phone: '+91 98260 99999', passwordHash: hash('Gov@123'), role: 'government', verified: true, active: true, createdAt: d(-85), orgId: 'org-imc', department: 'Roads & Infrastructure', designation: 'Executive Engineer' },
    { id: 'u-g2', name: 'Kavita Rao', email: 'officer2@jansetu.in', phone: '+91 98261 00000', passwordHash: hash('Gov@123'), role: 'government', verified: true, active: true, createdAt: d(-85), orgId: 'org-imc', department: 'Sanitation & Waste Management', designation: 'Zonal Sanitation Officer' },
    { id: 'u-k1', name: 'Rajesh Buildwell', email: 'contractor@buildwell.in', phone: '+91 98262 11111', passwordHash: hash('Build@123'), role: 'contractor', verified: true, active: true, createdAt: d(-70), businessName: 'BuildWell Infra Pvt Ltd', gstNumber: '23ABCDE1234F1Z5', registrationNumber: 'MP/ROADS/2011/4471', documents: ['GST certificate', 'MP Road works registration', 'PAN card'] },
    { id: 'u-k2', name: 'Mahesh Patidar', email: 'shreeram@contractor.in', phone: '+91 98262 22222', passwordHash: hash('Build@123'), role: 'contractor', verified: false, active: true, createdAt: d(-5), businessName: 'Shree Ram Constructions', gstNumber: '23PQRSX6789K1Z2', registrationNumber: 'Pending submission', documents: ['GST certificate'] },
  ];
  return users;
}

type Tl = [status: any, at: string, by: string, byName: string, note?: string];
const tl = (arr: Tl[]) => arr.map(([status, at, by, byName, note]) => ({ status, at, by, byName, note }));

function seedComplaints(db: DB, img: Record<string, string>) {
  const mk = (o: any) => db.complaints.push(o);

  // C1 — the hero demo case: pothole, community verified, waiting for government action
  mk({
    id: 'JS-2026-000001', numericId: 1, citizenId: 'u-c1', category: 'Road Damage',
    description: 'Large pothole almost 1 metre wide on the main road near Vijay Nagar square. Two-wheelers are swerving dangerously around it. Worsening every day.',
    images: [img.c1], gps: { lat: 22.7533, lng: 75.8933 }, areaName: 'Vijay Nagar Square, Indore',
    createdAt: d(-2), status: 'forwarded_to_government', priority: 'high',
    jurisdiction: { village: 'Ward 14 — Vijay Nagar', district: 'Indore', state: 'Madhya Pradesh' },
    routedTo: { orgId: 'org-imc', orgName: 'Indore Municipal Corporation', department: 'Roads & Infrastructure', ruleId: 'rule-road' },
    routingExplanation: 'Problem: Road Damage • Location: Vijay Nagar Square • Jurisdiction: District — Indore • Department: Roads & Infrastructure • Routing based on configured government rules',
    reviewDeadlineAt: d(0, -4), resolutionDeadlineAt: d(5), overdueFlags: [],
    aiSuggestion: { category: 'Road Damage', confidence: 0.94, signals: ['Description keywords: pothole, road', 'Image pattern (simulated)', 'Category model v0.9 (demo)'] },
    community: [
      { userId: 'u-c2', userName: 'Priya Verma', at: d(-2, 2) },
      { userId: 'u-c3', userName: 'Mohit Yadav', at: d(-2, 3) },
      { userId: 'u-c4', userName: 'Sara Khan', at: d(-2, 4) },
      { userId: 'u-c5', userName: 'Anita Deshmukh', at: d(-1) },
      { userId: 'u-c6', userName: 'Vikram Singh', at: d(-1, 2) },
    ],
    timeline: tl([
      ['submitted', d(-2), 'u-c1', 'Ravi Sharma', 'GPS 22.7533, 75.8933 captured automatically'],
      ['under_review', d(-2), 'system', 'JanSetu', 'Automated checks: image ✓ location ✓'],
      ['community_verification', d(-2, 1), 'system', 'JanSetu', 'Nearby reports detected — opened for community confirmation'],
      ['verified', d(-1, 3), 'system', 'JanSetu', '5 verified users confirmed this problem'],
      ['forwarded_to_government', d(-1, 3), 'system', 'JanSetu Routing Engine', 'Routed to Indore Municipal Corporation — Roads & Infrastructure'],
    ]),
  });

  // C2 — garbage: gov requested field assessment, assignment open for JS Members
  mk({
    id: 'JS-2026-000002', numericId: 2, citizenId: 'u-c2', category: 'Garbage',
    description: 'Household garbage dumped on the roadside divider near Palasia square for three days. Foul smell, stray cattle spreading it on the road.',
    images: [img.c2], gps: { lat: 22.7599, lng: 75.8895 }, areaName: 'Palasia Square, Indore',
    createdAt: d(-1, 6), status: 'field_assignment_created', priority: 'medium',
    jurisdiction: { village: 'Ward 9 — Palasia', district: 'Indore', state: 'Madhya Pradesh' },
    routedTo: { orgId: 'org-imc', orgName: 'Indore Municipal Corporation', department: 'Sanitation & Waste Management' },
    routingExplanation: 'Problem: Garbage • Location: Palasia Square • Jurisdiction: District — Indore • Department: Sanitation & Waste Management • Routing based on configured government rules',
    reviewDeadlineAt: d(0, 12), resolutionDeadlineAt: d(2), overdueFlags: [],
    aiSuggestion: { category: 'Garbage', confidence: 0.91, signals: ['Description keywords: garbage, dumped', 'Image pattern (simulated)'] },
    community: [{ userId: 'u-c3', userName: 'Mohit Yadav', at: d(-1, 5) }],
    timeline: tl([
      ['submitted', d(-1, 6), 'u-c2', 'Priya Verma', 'GPS captured automatically'],
      ['under_review', d(-1, 6), 'system', 'JanSetu', 'Automated checks passed'],
      ['forwarded_to_government', d(-1, 4), 'system', 'JanSetu Routing Engine', 'Routed to IMC — Sanitation & Waste Management'],
      ['technical_assessment_required', d(-1, 2), 'u-g2', 'Kavita Rao', 'Extent of dumping ground encroachment needs ground verification'],
      ['field_assignment_created', d(-1), 'system', 'JanSetu', 'Assignment AS-2026-002 published to eligible JS Members'],
    ]),
  });

  // C3 — streetlight: JS member completed report, awaiting government review
  mk({
    id: 'JS-2026-000003', numericId: 3, citizenId: 'u-c3', category: 'Streetlight',
    description: 'Three streetlight poles not working for two weeks on the road from Bhawarkuan square towards the college. Completely dark after 8 PM, unsafe for women students.',
    images: [img.c3], gps: { lat: 22.7248, lng: 75.8839 }, areaName: 'Bhawarkuan Road, Indore',
    createdAt: d(-4), status: 'report_review', priority: 'high',
    jurisdiction: { village: 'Ward 22 — Bhawarkuan', district: 'Indore', state: 'Madhya Pradesh' },
    routedTo: { orgId: 'org-imc', orgName: 'Indore Municipal Corporation', department: 'Street Lighting' },
    routingExplanation: 'Problem: Streetlight • Location: Bhawarkuan Road • Jurisdiction: District — Indore • Department: Street Lighting • Routing based on configured government rules',
    reviewDeadlineAt: d(-1), resolutionDeadlineAt: d(0), overdueFlags: [],
    aiSuggestion: { category: 'Streetlight', confidence: 0.89, signals: ['Description keywords: streetlight, dark'] },
    community: [{ userId: 'u-c4', userName: 'Sara Khan', at: d(-3, 6) }, { userId: 'u-c1', userName: 'Ravi Sharma', at: d(-3) }],
    timeline: tl([
      ['submitted', d(-4), 'u-c3', 'Mohit Yadav', 'GPS captured automatically'],
      ['under_review', d(-4), 'system', 'JanSetu', 'Automated checks passed'],
      ['forwarded_to_government', d(-3, 18), 'system', 'JanSetu Routing Engine', 'Routed to IMC — Street Lighting'],
      ['technical_assessment_required', d(-3, 12), 'u-g1', 'S.K. Dwivedi', 'Need exact pole numbers and wiring condition before repair estimate'],
      ['field_assignment_created', d(-3, 10), 'system', 'JanSetu', 'Assignment AS-2026-003 published'],
      ['field_assignment_accepted', d(-3), 'u-m1', 'Amit Patel', 'Accepted by JS Member #M-1042'],
      ['site_visit_pending', d(-3), 'system', 'JanSetu', 'Site visit window opened'],
      ['site_visit_verified', d(-2, 8), 'u-m1', 'Amit Patel', 'Fresh GPS + 2 fresh photos captured at site'],
      ['report_submitted', d(-2, 6), 'u-m1', 'Amit Patel', 'Field report submitted with measurements'],
      ['report_review', d(-2, 6), 'system', 'JanSetu', 'JanSetu checks passed — report verified, awaiting government review'],
    ]),
  });

  // C4 — water leakage: gov decided contractor route, project open for bidding
  mk({
    id: 'JS-2026-000004', numericId: 4, citizenId: 'u-c1', category: 'Water Leakage',
    description: 'Main pipeline leaking near Sudama Nagar gate — clean water spreading across the road for a week, wasted 24x7. Road surface is caving in at the edges.',
    images: [img.c4], gps: { lat: 22.735, lng: 75.88 }, areaName: 'Sudama Nagar Gate, Indore',
    createdAt: d(-6), status: 'bidding', priority: 'high',
    jurisdiction: { village: 'Ward 31 — Sudama Nagar', district: 'Indore', state: 'Madhya Pradesh' },
    routedTo: { orgId: 'org-imc', orgName: 'Indore Municipal Corporation', department: 'Water & Sewerage' },
    routingExplanation: 'Problem: Water Leakage • Location: Sudama Nagar • Jurisdiction: District — Indore • Department: Water & Sewerage • Routing based on configured government rules',
    reviewDeadlineAt: d(-4), resolutionDeadlineAt: d(-1), overdueFlags: [],
    aiSuggestion: { category: 'Water Leakage', confidence: 0.92, signals: ['Description keywords: pipeline, leak, water'] },
    community: [{ userId: 'u-c2', userName: 'Priya Verma', at: d(-5) }],
    timeline: tl([
      ['submitted', d(-6), 'u-c1', 'Ravi Sharma', 'GPS captured automatically'],
      ['under_review', d(-6), 'system', 'JanSetu', 'Automated checks passed'],
      ['verified', d(-5), 'system', 'JanSetu', '2 verified users confirmed this problem'],
      ['forwarded_to_government', d(-5), 'system', 'JanSetu Routing Engine', 'Routed to IMC — Water & Sewerage'],
      ['technical_assessment_required', d(-4, 12), 'u-g1', 'S.K. Dwivedi', 'Pipeline replacement feasibility needs on-site verification'],
      ['field_assignment_created', d(-4, 10), 'system', 'JanSetu', 'Assignment published to eligible JS Members'],
      ['field_assignment_accepted', d(-4), 'u-m1', 'Amit Patel', 'Accepted by JS Member #M-1042'],
      ['site_visit_verified', d(-3, 12), 'u-m1', 'Amit Patel', 'Fresh GPS + photos captured at site'],
      ['report_submitted', d(-3, 10), 'u-m1', 'Amit Patel', 'Field report: 30 m pipeline replacement needed'],
      ['report_review', d(-3, 10), 'system', 'JanSetu', 'JanSetu checks passed'],
      ['technical_report_approved', d(-2, 12), 'u-g1', 'S.K. Dwivedi', 'Report approved — technical scope beyond internal resources'],
      ['government_decision', d(-2, 12), 'u-g1', 'S.K. Dwivedi', 'Decision: contractor execution required'],
      ['contractor_required', d(-2, 12), 'u-g1', 'S.K. Dwivedi', 'Project created for procurement'],
      ['project_created', d(-2), 'u-g1', 'S.K. Dwivedi', 'Project PRJ-2026-001 published with eligibility criteria'],
      ['bidding', d(-2), 'system', 'JanSetu', 'Bid window open — deadline in 5 days'],
    ]),
  });

  // C5 — drainage: fully closed case (resolution + citizen verification)
  mk({
    id: 'JS-2026-000005', numericId: 5, citizenId: 'u-c2', category: 'Drainage',
    description: 'Open drain completely clogged near Rajwada market lane. Stagnant water flooding shop entrances, mosquito breeding.',
    images: [img.c5], gps: { lat: 22.7196, lng: 75.8577 }, areaName: 'Rajwada Market, Indore',
    createdAt: d(-8), status: 'closed', priority: 'medium',
    jurisdiction: { village: 'Ward 5 — Rajwada', district: 'Indore', state: 'Madhya Pradesh' },
    routedTo: { orgId: 'org-imc', orgName: 'Indore Municipal Corporation', department: 'Drainage & Storm Water' },
    routingExplanation: 'Problem: Drainage • Location: Rajwada • Jurisdiction: District — Indore • Department: Drainage & Storm Water • Routing based on configured government rules',
    reviewDeadlineAt: d(-6), resolutionDeadlineAt: d(-3), overdueFlags: [],
    aiSuggestion: { category: 'Drainage', confidence: 0.88, signals: ['Description keywords: drain, clogged'] },
    community: [{ userId: 'u-c1', userName: 'Ravi Sharma', at: d(-7) }, { userId: 'u-c4', userName: 'Sara Khan', at: d(-7, 4) }],
    timeline: tl([
      ['submitted', d(-8), 'u-c2', 'Priya Verma', 'GPS captured automatically'],
      ['under_review', d(-8), 'system', 'JanSetu', 'Automated checks passed'],
      ['verified', d(-7), 'system', 'JanSetu', '2 verified users confirmed this problem'],
      ['forwarded_to_government', d(-7), 'system', 'JanSetu Routing Engine', 'Routed to IMC — Drainage & Storm Water'],
      ['government_decision', d(-6), 'u-g2', 'Kavita Rao', 'Decision: direct action with existing municipal jetting machine'],
      ['government_direct_action', d(-6), 'u-g2', 'Kavita Rao', 'Action created — deadline 3 days'],
      ['work_in_progress', d(-5), 'u-g2', 'Kavita Rao', 'Jetting machine deployed'],
      ['resolution_submitted', d(-3), 'u-g2', 'Kavita Rao', 'Completion photo + details submitted'],
      ['government_verified', d(-3), 'u-g2', 'Kavita Rao', 'Work verified by department'],
      ['citizen_verification', d(-3), 'system', 'JanSetu', 'Asked citizen: has this problem actually been solved?'],
      ['closed', d(-2), 'u-c2', 'Priya Verma', 'Citizen confirmed the problem is resolved ✓'],
    ]),
    resolution: { photo: img.c5b, date: d(-3), details: 'Drain desilted with jetting machine, 2 trips of silt removed, grating replaced.', submittedAt: d(-3) },
    govVerifiedAt: d(-3), closedAt: d(-2),
    citizenVerification: { confirmed: true, at: d(-2) },
  });

  // C6 — road: contractor project awarded and in progress
  mk({
    id: 'JS-2026-000006', numericId: 6, citizenId: 'u-c3', category: 'Road Damage',
    description: 'Bhawarkuan main road stretch heavily damaged after water pipeline excavation. Gravel and dust everywhere, 200 metres of unusable road.',
    images: [img.c6], gps: { lat: 22.7255, lng: 75.8845 }, areaName: 'Bhawarkuan Main Road, Indore',
    createdAt: d(-12), status: 'work_in_progress', priority: 'high',
    jurisdiction: { village: 'Ward 22 — Bhawarkuan', district: 'Indore', state: 'Madhya Pradesh' },
    routedTo: { orgId: 'org-imc', orgName: 'Indore Municipal Corporation', department: 'Roads & Infrastructure' },
    routingExplanation: 'Problem: Road Damage • Location: Bhawarkuan • Jurisdiction: District — Indore • Department: Roads & Infrastructure • Routing based on configured government rules',
    reviewDeadlineAt: d(-10), resolutionDeadlineAt: d(3), overdueFlags: [],
    aiSuggestion: { category: 'Road Damage', confidence: 0.9, signals: ['Description keywords: road, damaged'] },
    community: [{ userId: 'u-c1', userName: 'Ravi Sharma', at: d(-11) }],
    timeline: tl([
      ['submitted', d(-12), 'u-c3', 'Mohit Yadav', 'GPS captured automatically'],
      ['under_review', d(-12), 'system', 'JanSetu', 'Automated checks passed'],
      ['forwarded_to_government', d(-11), 'system', 'JanSetu Routing Engine', 'Routed to IMC — Roads & Infrastructure'],
      ['technical_assessment_required', d(-10), 'u-g1', 'S.K. Dwivedi', 'Restoration scope needs independent measurement'],
      ['field_assignment_created', d(-9, 18), 'system', 'JanSetu', 'Assignment published'],
      ['field_assignment_accepted', d(-9, 12), 'u-m1', 'Amit Patel', 'Accepted by JS Member #M-1042'],
      ['site_visit_verified', d(-9), 'u-m1', 'Amit Patel', 'Fresh GPS + photos captured'],
      ['report_submitted', d(-8, 18), 'u-m1', 'Amit Patel', 'Field report: 200 m × 5.5 m full-width restoration'],
      ['report_review', d(-8, 18), 'system', 'JanSetu', 'JanSetu checks passed'],
      ['technical_report_approved', d(-8), 'u-g1', 'S.K. Dwivedi', 'Report approved'],
      ['government_decision', d(-8), 'u-g1', 'S.K. Dwivedi', 'Decision: contractor execution required'],
      ['contractor_required', d(-8), 'u-g1', 'S.K. Dwivedi', 'Project created for procurement'],
      ['project_created', d(-7), 'u-g1', 'S.K. Dwivedi', 'PRJ-2026-002 published'],
      ['bidding', d(-7), 'system', 'JanSetu', '2 bids received'],
      ['contractor_selected', d(-4), 'u-g1', 'S.K. Dwivedi', 'BuildWell Infra selected through applicable process'],
      ['work_in_progress', d(-3), 'u-k1', 'BuildWell Infra', 'Site mobilisation complete — work started'],
    ]),
  });

  // C7 — re-complaint: case reopened after failed repair
  mk({
    id: 'JS-2026-000007', numericId: 7, citizenId: 'u-c1', category: 'Public Infrastructure',
    description: 'Footpath slabs near Palasia were "repaired" 3 weeks ago — already broken again and worse than before. Iron rods sticking out, dangerous for pedestrians.',
    images: [img.c7], gps: { lat: 22.7592, lng: 75.889 }, areaName: 'Palasia Square, Indore',
    createdAt: d(-1), status: 'reopened', priority: 'high',
    jurisdiction: { village: 'Ward 9 — Palasia', district: 'Indore', state: 'Madhya Pradesh' },
    routedTo: { orgId: 'org-imc', orgName: 'Indore Municipal Corporation', department: 'Roads & Infrastructure' },
    routingExplanation: 'Problem: Public Infrastructure • Location: Palasia • Jurisdiction: District — Indore • Department: Roads & Infrastructure • Routing based on configured government rules',
    reviewDeadlineAt: d(1), resolutionDeadlineAt: d(8), overdueFlags: [],
    aiSuggestion: { category: 'Public Infrastructure', confidence: 0.87, signals: ['Description keywords: footpath, broken'] },
    community: [{ userId: 'u-c4', userName: 'Sara Khan', at: d(-1, 2) }],
    timeline: tl([
      ['submitted', d(-30), 'u-c1', 'Ravi Sharma', 'Original footpath complaint'],
      ['closed', d(-20), 'u-c1', 'Ravi Sharma', 'Marked resolved after partial repair'],
      ['citizen_verification', d(-1), 'u-c1', 'Ravi Sharma', 'Re-complaint: repair failed within weeks'],
      ['reopened', d(-1), 'u-c1', 'Ravi Sharma', 'Fresh evidence + GPS captured. Government notified for review'],
    ]),
    citizenVerification: { confirmed: false, at: d(-1), reopenReason: 'Footpath repair covered only half the stretch; slabs broken again within a week' },
  });

  // C8 — garbage, fresh, sitting at under_review + OVERDUE (for deadline demo)
  mk({
    id: 'JS-2026-000008', numericId: 8, citizenId: 'u-c4', category: 'Garbage',
    description: 'Garbage not collected from Vijay Nagar lane 7 bins for 4 days. Bins overflowing onto the road.',
    images: [img.c8], gps: { lat: 22.752, lng: 75.894 }, areaName: 'Vijay Nagar Lane 7, Indore',
    createdAt: d(-3), status: 'under_review', priority: 'medium',
    jurisdiction: { village: 'Ward 14 — Vijay Nagar', district: 'Indore', state: 'Madhya Pradesh' },
    routedTo: { orgId: 'org-imc', orgName: 'Indore Municipal Corporation', department: 'Sanitation & Waste Management' },
    routingExplanation: 'Problem: Garbage • Location: Vijay Nagar • Jurisdiction: District — Indore • Department: Sanitation & Waste Management • Routing based on configured government rules',
    reviewDeadlineAt: d(-2), resolutionDeadlineAt: d(0), overdueFlags: ['review'],
    aiSuggestion: { category: 'Garbage', confidence: 0.9, signals: ['Description keywords: garbage, bins'] },
    community: [],
    timeline: tl([
      ['submitted', d(-3), 'u-c4', 'Sara Khan', 'GPS captured automatically'],
      ['under_review', d(-3), 'system', 'JanSetu', 'Automated checks passed — routed to IMC Sanitation'],
      ['under_review', d(-2), 'system', 'JanSetu', 'OVERDUE: review deadline passed'],
    ]),
  });
}

function seedWorkflow(db: DB, img: Record<string, string>) {
  // ---------- assignments ----------
  db.assignments.push(
    {
      id: 'AS-2026-002', complaintId: 'JS-2026-000002', skillsRequired: ['sanitation', 'environment'],
      status: 'open', createdAt: d(-1), deadlineAt: d(1),
    },
    {
      id: 'AS-2026-003', complaintId: 'JS-2026-000003', jsmemberId: 'u-m1', skillsRequired: ['electrical', 'infrastructure'],
      status: 'report_verified', createdAt: d(-3, 10), deadlineAt: d(-2, 10),
      siteVisit: { at: d(-2, 8), gps: { lat: 22.7249, lng: 75.8841 }, gpsVerified: true },
      report: {
        condition: 'Three consecutive streetlight poles (No. SL-2214, SL-2215, SL-2216) non-functional. Lamps intact but no supply at the control junction box.',
        measurements: 'Pole spacing 30 m; affected dark stretch ≈ 90 m; supply cable insulation damaged at 2 points.',
        observations: 'Junction box near SL-2215 has burnt connector and water ingress. Cable sheath chewed in one section. Pole no. 2216 slightly tilted.',
        probableCause: 'Ageing underground supply cable with water ingress at junction box; probable illegal tapping point nearby.',
        severity: 'high', recommendedAction: 'Replace 90 m supply cable + junction box; re-lamp 3 fittings; straighten and grout pole 2216 base.',
        requiredResources: 'Cable crew + crane lorry (1 day); material from street-lighting store.',
        trafficImpact: 'Moderate — pedestrian risk at night, low daytime impact. Night work recommended.',
        safetyConcerns: 'Open live junction box hazard; recommend cordoning during repair.',
        images: [img.c3b], submittedAt: d(-2, 6), gpsVerified: true,
      },
    },
  );

  // ---------- government actions ----------
  db.actions.push(
    {
      id: 'ACT-2026-001', complaintId: 'JS-2026-000005', type: 'government_resources',
      title: 'Drain desilting — Rajwada market lane', details: 'Deploy jetting machine + 2 labour trips; replace grating.',
      status: 'completed', createdAt: d(-6), deadlineAt: d(-3),
      progress: [
        { at: d(-5), percent: 30, note: 'Jetting machine deployed' },
        { at: d(-4), percent: 70, note: 'Silt removal trip 2 of 2' },
        { at: d(-3), percent: 100, note: 'Grating replaced; site cleaned' },
      ],
    },
    {
      id: 'ACT-2026-002', complaintId: 'JS-2026-000006', type: 'contractor',
      title: 'Bhawarkuan road restoration (200 m)', details: 'Executed by BuildWell Infra Pvt Ltd under PRJ-2026-002.',
      status: 'in_progress', createdAt: d(-8), deadlineAt: d(3),
      progress: [
        { at: d(-3), percent: 40, note: 'Mobilisation and base preparation' },
        { at: d(-1), percent: 65, note: 'DPC layer laid on 120 m' },
      ],
    },
  );

  // ---------- projects + bids ----------
  db.projects.push(
    {
      id: 'PRJ-2026-001', code: 'PRJ-2026-001', complaintId: 'JS-2026-000004',
      title: 'Water pipeline replacement — Sudama Nagar gate (30 m)',
      scope: 'Replace 30 m ageing distribution pipeline with 110 mm PVC, reinstate road surface, pressure test line.',
      category: 'Water Leakage', location: 'Sudama Nagar Gate, Indore', gps: { lat: 22.735, lng: 75.88 },
      budgetEstimate: 480000, eligibility: 'Registered contractors with water/sewerage works experience; valid GST + MP registration.',
      bidDeadlineAt: d(5), documents: ['Technical report JS-2026-000004', 'BOQ draft'], status: 'open_bidding',
      createdBy: 'u-g1', progress: [], createdAt: d(-2),
    },
    {
      id: 'PRJ-2026-002', code: 'PRJ-2026-002', complaintId: 'JS-2026-000006',
      title: 'Road restoration — Bhawarkuan Main Road (200 m × 5.5 m)',
      scope: 'Full-width restoration: base repair, DPC, bituminous carpeting as per JS Member report PR/JS-2026-000006.',
      category: 'Road Damage', location: 'Bhawarkuan Main Road, Indore', gps: { lat: 22.7255, lng: 75.8845 },
      budgetEstimate: 950000, eligibility: 'Contractors registered for road works with IMC; valid GST.',
      bidDeadlineAt: d(-6), documents: ['Technical report JS-2026-000006', 'Field measurements'], status: 'in_progress',
      createdBy: 'u-g1', awardedBidId: 'BD-2026-002', awardedContractorId: 'u-k1',
      progress: [
        { at: d(-3), percent: 40, note: 'Mobilisation and base preparation', images: [] },
        { at: d(-1), percent: 65, note: 'DPC layer laid on 120 m', images: [] },
      ],
      createdAt: d(-7),
    },
  );

  db.bids.push(
    {
      id: 'BD-2026-001', projectId: 'PRJ-2026-001', contractorId: 'u-k1', amount: 520000,
      proposal: 'Replace 30 m line in 3 working days; includes reinstatement + 6-month workmanship warranty.',
      timelineDays: 21, documents: ['Technical proposal.pdf', 'Rate analysis'], status: 'submitted', submittedAt: d(-1),
    },
    {
      id: 'BD-2026-002', projectId: 'PRJ-2026-002', contractorId: 'u-k1', amount: 920000,
      proposal: 'Full-width restoration in 18 days incl. 7-day curing; borrow-pit material certified.',
      timelineDays: 18, documents: ['Work plan', 'Rate analysis'], status: 'accepted', submittedAt: d(-6, 12),
    },
    {
      id: 'BD-2026-003', projectId: 'PRJ-2026-002', contractorId: 'u-k2', amount: 870000,
      proposal: 'Cheaper rate with partial-thickness restoration.', timelineDays: 20, documents: ['Quotation'], status: 'rejected', submittedAt: d(-6),
    },
  );

  // ---------- notifications ----------
  const n = (userId: string, title: string, body: string, at: string, link?: string, read = false) =>
    db.notifications.push({ id: uuid(), userId, title, body, link, read, at });

  n('u-c1', 'Your complaint reached the government', 'JS-2026-000001 (pothole, Vijay Nagar) was routed to Indore Municipal Corporation — Roads & Infrastructure.', d(-1, 3), '/citizen/complaints/JS-2026-000001');
  n('u-c1', '5 citizens confirmed your report', 'Your pothole report is now community-verified. Evidence strength increased.', d(-1, 3), '/citizen/complaints/JS-2026-000001');
  n('u-g1', 'New complaint received', 'JS-2026-000001 — Road Damage, Vijay Nagar. Community verified (5 confirmations).', d(-1, 3), '/gov/complaints/JS-2026-000001');
  n('u-g1', 'Technical report awaiting review', 'JS-2026-000003 — Streetlight field report by JS Member #M-1042 passed JanSetu checks.', d(-2, 6), '/gov/reports');
  n('u-g1', 'OVERDUE: JS-2026-000008', 'Review deadline passed for garbage complaint (Vijay Nagar Lane 7). Configured escalation applies.', d(-2), '/gov/deadlines');
  n('u-g2', 'OVERDUE: JS-2026-000008', 'Review deadline passed for garbage complaint (Vijay Nagar Lane 7).', d(-2), '/gov/deadlines');
  n('u-m1', 'New assignment available', 'AS-2026-002 — Garbage assessment at Palasia Square matches your skills (sanitation, environment).', d(-1), '/jsmember/assignments');
  n('u-m1', 'Report verified by JanSetu', 'Your field report for JS-2026-000003 passed all checks and was sent to the government.', d(-2, 6), '/jsmember/reports');
  n('u-c2', 'Field assessment requested', 'JS-2026-000002 — a verified JS Member will visit the garbage site and submit a field report.', d(-1, 2), '/citizen/complaints/JS-2026-000002');
  n('u-k1', 'New project open for bidding', 'PRJ-2026-001 — Water pipeline replacement, Sudama Nagar. Bid deadline in 5 days.', d(-2), '/contractor/opportunities');
  n('u-k1', 'Work in progress', 'PRJ-2026-002 — progress updates due. Resolution deadline in 3 days.', d(-1), '/contractor/projects');
  n('u-c3', 'Resolution progress', 'JS-2026-000006 — road restoration is 65% complete (contractor executing).', d(-1), '/citizen/complaints/JS-2026-000006');

  // ---------- audit logs ----------
  const a = (actorName: string, action: string, entity: string, at: string) =>
    db.auditLogs.push({ id: uuid(), actorId: 'seed', actorName, action, entity, at });

  a('Ravi Sharma', 'COMPLAINT_CREATED', 'JS-2026-000001', d(-2));
  a('JanSetu Routing Engine', 'COMPLAINT_ROUTED', 'JS-2026-000001 → IMC / Roads & Infrastructure', d(-1, 3));
  a('Kavita Rao', 'ASSESSMENT_REQUESTED', 'JS-2026-000002', d(-1, 2));
  a('Amit Patel', 'SITE_VISIT_STARTED', 'AS-2026-003 (GPS verified)', d(-2, 8));
  a('Amit Patel', 'FIELD_REPORT_SUBMITTED', 'JS-2026-000003', d(-2, 6));
  a('S.K. Dwivedi', 'PROJECT_CREATED', 'PRJ-2026-001', d(-2));
  a('Rajesh Buildwell', 'BID_SUBMITTED', 'BD-2026-001 on PRJ-2026-001', d(-1));
  a('S.K. Dwivedi', 'BID_AWARDED', 'BD-2026-002 on PRJ-2026-002 → BuildWell Infra', d(-4));
  a('Priya Verma', 'CITIZEN_VERIFIED_CLOSURE', 'JS-2026-000005', d(-2));
}









