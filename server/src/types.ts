export type Role = 'citizen' | 'jsmember' | 'government' | 'contractor' | 'admin';

export interface ScoreEvent { at: string; delta: number; reason: string }

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
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

export type ComplaintStatus =
  | 'submitted' | 'under_review' | 'verification_required' | 'community_verification' | 'verified'
  | 'forwarded_to_government' | 'technical_assessment_required' | 'field_assignment_created'
  | 'field_assignment_accepted' | 'site_visit_pending' | 'site_visit_verified' | 'report_submitted'
  | 'report_review' | 'correction_required' | 'technical_report_approved' | 'government_decision'
  | 'government_direct_action' | 'contractor_required' | 'project_created' | 'bidding'
  | 'contractor_selected' | 'work_in_progress' | 'resolution_submitted' | 'government_verified'
  | 'citizen_verification' | 'closed' | 'duplicate' | 'rejected' | 'reopened';

export interface TimelineEntry { status: ComplaintStatus; at: string; by: string; byName?: string; note?: string }

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
  status: ComplaintStatus;
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
  citizenVerification?: { confirmed: boolean; at: string; reopenReason?: string; newComplaintId?: string };
  closedAt?: string;
  reopenOf?: string;
  overdueFlags: string[];
}

export type FieldReport = {
  condition: string;
  measurements: string;
  observations: string;
  probableCause: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
  requiredResources: string;
  trafficImpact: string;
  safetyConcerns: string;
  images: string[];
  submittedAt: string;
  gpsVerified?: boolean;
};

export interface Assignment {
  id: string;
  complaintId: string;
  jsmemberId?: string;
  skillsRequired: string[];
  status: 'open' | 'accepted' | 'site_visit_started' | 'report_submitted' | 'report_verified' | 'correction_required' | 'completed' | 'expired';
  createdAt: string;
  deadlineAt: string;
  siteVisit?: { at: string; gps: { lat: number; lng: number }; gpsVerified: boolean };
  report?: FieldReport;
  reviewNote?: string;
}

export interface GovAction {
  id: string;
  complaintId: string;
  type: 'government_resources' | 'technical_specialist' | 'contractor';
  title: string;
  details: string;
  status: 'planned' | 'in_progress' | 'resolution_submitted' | 'verified' | 'completed';
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
  status: 'open_bidding' | 'evaluation' | 'awarded' | 'in_progress' | 'completed';
  createdBy: string;
  awardedBidId?: string;
  awardedContractorId?: string;
  progress: { at: string; percent: number; note: string; images?: string[] }[];
  completedAt?: string;
  createdAt: string;
}

export interface Bid {
  id: string;
  projectId: string;
  contractorId: string;
  amount: number;
  proposal: string;
  timelineDays: number;
  documents: string[];
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  submittedAt: string;
}

export interface Org {
  id: string;
  name: string;
  type: string;
  level: 'village' | 'block' | 'district' | 'state';
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

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  meta?: any;
  at: string;
}

export interface ContactMessage {
  id: string; name: string; email: string; subject: string; body: string; at: string;
}

export interface DB {
  users: User[];
  complaints: Complaint[];
  assignments: Assignment[];
  actions: GovAction[];
  projects: Project[];
  bids: Bid[];
  orgs: Org[];
  routingRules: RoutingRule[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  messages: ContactMessage[];
  counters: { complaint: number; project: number };
}
