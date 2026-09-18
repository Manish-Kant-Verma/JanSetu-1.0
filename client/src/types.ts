<<<<<<< HEAD
export type Role = 'citizen' | 'jsmember' | 'government' | 'contractor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  verified: boolean;
  active: boolean;
  createdAt: string;
  skills?: string[];
  experience?: string;
  baseLocation?: { lat: number; lng: number; area: string };
  trustScore?: number;
  trustHistory?: ScoreEvent[];
  civilScore?: number;
  civilHistory?: ScoreEvent[];
  orgId?: string;
  department?: string;
  designation?: string;
  businessName?: string;
  gstNumber?: string;
  registrationNumber?: string;
  documents?: string[];
}

export interface ScoreEvent { at: string; delta: number; reason: string }

export interface TimelineEntry { status: string; at: string; by: string; byName?: string; note?: string }

export interface Complaint {
  id: string;
  numericId: number;
  citizenId: string;
  category: string;
  description: string;
  images: string[];
  gps: { lat: number; lng: number };
  areaName: string;
  createdAt: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  jurisdiction: { village: string; district: string; state: string };
  routedTo?: { orgId: string; orgName: string; department: string; ruleId?: string };
  routingExplanation?: string;
  reviewDeadlineAt?: string;
  resolutionDeadlineAt?: string;
  aiSuggestion?: { category: string; confidence: number; signals: string[] };
  linkedTo?: string;
  linkedBy?: string[];
  community: { userId: string; userName: string; at: string; image?: string }[];
  timeline: TimelineEntry[];
  assignmentId?: string;
  actionId?: string;
  projectId?: string;
  resolution?: { photo: string; date: string; details: string; submittedAt: string };
  govVerifiedAt?: string;
  citizenVerification?: { confirmed: boolean; at: string; reopenReason?: string };
  closedAt?: string;
  reopenOf?: string;
  overdueFlags: string[];
}

export interface FieldReport {
  condition: string;
  measurements: string;
  observations: string;
  probableCause: string;
  severity: string;
  recommendedAction: string;
  requiredResources: string;
  trafficImpact: string;
  safetyConcerns: string;
  images: string[];
  submittedAt: string;
  gpsVerified?: boolean;
}

export interface Assignment {
  id: string;
  complaintId: string;
  jsmemberId?: string;
  skillsRequired: string[];
  status: string;
  createdAt: string;
  deadlineAt: string;
  siteVisit?: { at: string; gps: { lat: number; lng: number }; gpsVerified: boolean };
  report?: FieldReport;
  reviewNote?: string;
  complaint?: Complaint;
  distanceKm?: number | null;
  skillMatch?: string[];
  matchScore?: number;
}

export interface GovAction {
  id: string;
  complaintId: string;
  type: string;
  title: string;
  details: string;
  status: string;
  createdAt: string;
  deadlineAt: string;
  progress: { at: string; percent: number; note: string }[];
}

export interface Project {
  id: string;
  code: string;
  complaintId: string;
  title: string;
  scope: string;
  category: string;
  location: string;
  gps: { lat: number; lng: number };
  budgetEstimate: number;
  eligibility: string;
  bidDeadlineAt: string;
  documents: string[];
  status: string;
  createdBy: string;
  awardedBidId?: string;
  awardedContractorId?: string;
  progress: { at: string; percent: number; note: string; images?: string[] }[];
  completedAt?: string;
  createdAt: string;
  bids?: Bid[];
  complaint?: Complaint;
  daysLeft?: number | null;
}

export interface Bid {
  id: string;
  projectId: string;
  contractorId: string;
  amount: number;
  proposal: string;
  timelineDays: number;
  documents: string[];
  status: string;
  submittedAt: string;
  contractorName?: string;
  project?: Project;
}

export interface Org {
  id: string;
  name: string;
  type: string;
  level: string;
  district: string;
  state: string;
  departments: string[];
  contactEmail?: string;
}

export interface RoutingRule {
  id: string;
  category: string;
  keywords: string[];
  level: string;
  orgId: string;
  department: string;
  slaDays: number;
  reviewDays: number;
  active: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  at: string;
}

export interface ScoreInfo {
  role: string;
  score: number | null;
  breakdown: { label: string; points: number; max: number; detail: string }[];
  history: ScoreEvent[];
  note?: string;
}
=======
export type Role = 'citizen' | 'jsmember' | 'government' | 'contractor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  verified: boolean;
  active: boolean;
  createdAt: string;
  skills?: string[];
  experience?: string;
  baseLocation?: { lat: number; lng: number; area: string };
  trustScore?: number;
  trustHistory?: ScoreEvent[];
  civilScore?: number;
  civilHistory?: ScoreEvent[];
  orgId?: string;
  department?: string;
  designation?: string;
  businessName?: string;
  gstNumber?: string;
  registrationNumber?: string;
  documents?: string[];
}

export interface ScoreEvent { at: string; delta: number; reason: string }

export interface TimelineEntry { status: string; at: string; by: string; byName?: string; note?: string }

export interface Complaint {
  id: string;
  numericId: number;
  citizenId: string;
  category: string;
  description: string;
  images: string[];
  gps: { lat: number; lng: number };
  areaName: string;
  createdAt: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  jurisdiction: { village: string; district: string; state: string };
  routedTo?: { orgId: string; orgName: string; department: string; ruleId?: string };
  routingExplanation?: string;
  reviewDeadlineAt?: string;
  resolutionDeadlineAt?: string;
  aiSuggestion?: { category: string; confidence: number; signals: string[] };
  linkedTo?: string;
  linkedBy?: string[];
  community: { userId: string; userName: string; at: string; image?: string }[];
  timeline: TimelineEntry[];
  assignmentId?: string;
  actionId?: string;
  projectId?: string;
  resolution?: { photo: string; date: string; details: string; submittedAt: string };
  govVerifiedAt?: string;
  citizenVerification?: { confirmed: boolean; at: string; reopenReason?: string };
  closedAt?: string;
  reopenOf?: string;
  overdueFlags: string[];
}

export interface FieldReport {
  condition: string;
  measurements: string;
  observations: string;
  probableCause: string;
  severity: string;
  recommendedAction: string;
  requiredResources: string;
  trafficImpact: string;
  safetyConcerns: string;
  images: string[];
  submittedAt: string;
  gpsVerified?: boolean;
}

export interface Assignment {
  id: string;
  complaintId: string;
  jsmemberId?: string;
  skillsRequired: string[];
  status: string;
  createdAt: string;
  deadlineAt: string;
  siteVisit?: { at: string; gps: { lat: number; lng: number }; gpsVerified: boolean };
  report?: FieldReport;
  reviewNote?: string;
  complaint?: Complaint;
  distanceKm?: number | null;
  skillMatch?: string[];
  matchScore?: number;
}

export interface GovAction {
  id: string;
  complaintId: string;
  type: string;
  title: string;
  details: string;
  status: string;
  createdAt: string;
  deadlineAt: string;
  progress: { at: string; percent: number; note: string }[];
}

export interface Project {
  id: string;
  code: string;
  complaintId: string;
  title: string;
  scope: string;
  category: string;
  location: string;
  gps: { lat: number; lng: number };
  budgetEstimate: number;
  eligibility: string;
  bidDeadlineAt: string;
  documents: string[];
  status: string;
  createdBy: string;
  awardedBidId?: string;
  awardedContractorId?: string;
  progress: { at: string; percent: number; note: string; images?: string[] }[];
  completedAt?: string;
  createdAt: string;
  bids?: Bid[];
  complaint?: Complaint;
  daysLeft?: number | null;
}

export interface Bid {
  id: string;
  projectId: string;
  contractorId: string;
  amount: number;
  proposal: string;
  timelineDays: number;
  documents: string[];
  status: string;
  submittedAt: string;
  contractorName?: string;
  project?: Project;
}

export interface Org {
  id: string;
  name: string;
  type: string;
  level: string;
  district: string;
  state: string;
  departments: string[];
  contactEmail?: string;
}

export interface RoutingRule {
  id: string;
  category: string;
  keywords: string[];
  level: string;
  orgId: string;
  department: string;
  slaDays: number;
  reviewDays: number;
  active: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  at: string;
}

export interface ScoreInfo {
  role: string;
  score: number | null;
  breakdown: { label: string; points: number; max: number; detail: string }[];
  history: ScoreEvent[];
  note?: string;
}
>>>>>>> 2cd601f11a0781319ed40161f27d581df975b6b8
