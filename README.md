# JanSetu

### From Citizen Report to Government Action

JanSetu is an end-to-end civic problem-to-resolution platform that connects citizens, verified field members, government authorities, and contractors through a transparent digital workflow.

Instead of being just a complaint-reporting application, JanSetu manages the complete lifecycle of a civic problem:

**Report → Verify → Route → Assess → Decide → Solve → Track → Verify → Close**

---

## Overview

Citizens can report civic problems such as:

* Road damage and potholes
* Garbage accumulation
* Broken streetlights
* Drainage problems
* Water leakage
* Other local civic issues

The platform captures evidence, GPS location, timestamps, and optional descriptions. Complaints can then be verified, routed to the appropriate government authority, assessed by a verified **JS Member** when required, converted into government actions or contractor projects, tracked through completion, and finally verified by both the government and citizen.

### Core Workflow

```text
Citizen
   ↓
Report Problem
   ↓
JanSetu Verification
   ↓
Duplicate / Community Verification
   ↓
Government Routing
   ↓
Government Review
   ↓
JS Member Field Verification
   ↓
Technical Report
   ↓
Government Decision
   ↓
Government Action / Contractor Project
   ↓
Progress Tracking
   ↓
Resolution
   ↓

Government Verification
   ↓
Citizen Verification
   ↓
Closed / Re-Complaint
```

---

# Key Features

## Citizen

Citizens can:

* Register and log in
* Report civic problems
* Capture photographs using the device camera
* Automatically capture current GPS location
* Add category and description
* Upload supporting evidence
* Track complaint status
* View complaint timeline
* Support existing complaints
* Confirm community problems
* Receive notifications
* Verify resolutions
* Submit re-complaints
* View Civil Score

The primary reporting flow is designed for mobile devices.

---

## JS Member

A **JS Member** is a unified field-verification role.

A JS Member may be a:

* Student
* Engineer
* Working professional
* Retired expert
* Social worker
* Local expert
* Other verified person

However, the platform treats all of them as one role:

```text
JS_MEMBER
```

### JS Member capabilities

* Apply for JS Membership
* Submit profile
* Submit education and profession
* Add skills and experience
* Upload resume
* Upload verification documents
* Select preferred categories
* Select service areas
* Wait for admin verification
* View verification status
* View assignments
* Accept or decline assignments
* Start site visits
* Verify site location through GPS
* Capture fresh photographs
* Conduct field investigation
* Submit technical reports
* Resubmit corrected reports
* View Field Trust Score
* View assignment history

> JS Members do not receive payments through JanSetu. The platform does not contain earnings, wallet, payout, salary, or site-visit-fee functionality.

---

## Government Officials

Government users can:

* View assigned complaints
* Search and filter complaints
* View complaint evidence
* View GPS information
* Review community confirmations
* Review duplicate information
* Request JS Member assessments
* Review technical reports
* Create government actions
* Configure and track deadlines
* Update progress
* Create contractor projects
* Review bids
* Record procurement decisions
* Track contractor projects
* Upload resolution evidence
* Verify completion
* Handle re-complaints
* View analytics

Government access is scoped according to:

* Organization
* Department
* Jurisdiction
* Assigned role
* Permissions

Government officials do not automatically receive access to every complaint.

---

## Contractors

Contractors can:

* Register their business
* Create a business profile
* Upload business documents
* Add service categories
* Add service areas
* Add experience
* View eligible projects
* View project details
* Submit bids
* Upload bid documents
* View bid status
* Manage awarded projects
* Upload progress evidence
* Upload completion evidence
* View performance information

JanSetu does **not** sell government tenders, and contractors do not pay JanSetu to win government work.

Government remains responsible for procurement and contractor selection according to applicable procedures.

---

## Admin

The Admin has platform-wide management capabilities.

### Admin modules

* Users
* Citizens
* JS Members
* Government Officials
* Contractors
* Complaints
* Assignments
* Reports
* Government Organizations
* Departments
* Jurisdictions
* Routing Rules
* SLA Rules
* Escalation Rules
* Projects
* Bids
* Scores
* Notifications
* Audit Logs
* Analytics

Admins can also:

* Verify users
* Verify JS Members
* Verify contractors
* Configure organizations
* Configure departments
* Configure jurisdictions
* Configure routing rules
* Configure deadlines
* Configure escalation rules
* Manage complaints and assignments
* Manage scores
* Manage system settings

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui or equivalent component system
* Lucide Icons

## Backend

* Python
* FastAPI

## Database

* PostgreSQL

## ORM

* SQLAlchemy / SQLModel

## Authentication

* JWT
* Secure password hashing
* Refresh tokens
* HTTP-only secure cookies where appropriate

## Maps & Location

* Browser/device Geolocation API
* Mapbox or OpenStreetMap-compatible implementation

## File Storage

Development:

```text
Local File Storage
```

Production-ready architecture:

```text
Object Storage Abstraction
        ↓
Cloud Storage
```

## AI Architecture

JanSetu contains an abstraction layer for:

* Image classification
* Duplicate detection
* Category recommendation
* Routing recommendation
* GIS jurisdiction matching
* JS Member matching

The MVP can use mock AI services while keeping the architecture ready for real AI providers.

---

# Project Structure

```text
jan-setu/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── api/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── assets/
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── auth/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   └── tasks/
│   └── ...
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── WORKFLOW.md
│   └── SECURITY.md
│
├── scripts/
│
├── .env.example
├── .gitignore
└── README.md
```

---

# User Roles

JanSetu has exactly five primary roles:

| Role                  | Purpose                              |
| --------------------- | ------------------------------------ |
| `CITIZEN`             | Report and track civic problems      |
| `JS_MEMBER`           | Perform verified field assessments   |
| `GOVERNMENT_OFFICIAL` | Review, route and resolve complaints |
| `CONTRACTOR`          | Execute eligible government projects |
| `ADMIN`               | Manage and configure the platform    |

There are no separate Student, Working Professional, College, HOD, Principal, or Faculty roles.

Students and working professionals can become JS Members.

---

# Complaint Lifecycle

JanSetu uses controlled status transitions.

```text
SUBMITTED
   ↓
UNDER_REVIEW
   ↓
VERIFICATION_REQUIRED
   ↓
COMMUNITY_VERIFICATION
   ↓
VERIFIED
   ↓
FORWARDED_TO_GOVERNMENT
   ↓
TECHNICAL_ASSESSMENT_REQUIRED
   ↓
FIELD_ASSIGNMENT_CREATED
   ↓
FIELD_ASSIGNMENT_ACCEPTED
   ↓
SITE_VISIT_PENDING
   ↓
SITE_VISIT_VERIFIED
   ↓
REPORT_SUBMITTED
   ↓
REPORT_REVIEW
   ↓
TECHNICAL_REPORT_APPROVED
   ↓
GOVERNMENT_DECISION_PENDING
   ↓
┌───────────────────────────────┐
│ Government Action             │
│ OR                            │
│ Contractor Project            │
└───────────────────────────────┘
   ↓
WORK_IN_PROGRESS
   ↓
RESOLUTION_SUBMITTED
   ↓
GOVERNMENT_VERIFIED
   ↓
CITIZEN_VERIFICATION
   ↓
CLOSED
```

Additional states include:

```text
REPORT_CORRECTION_REQUIRED
CONTRACTOR_REQUIRED
PROJECT_CREATED
BIDDING_OPEN
BIDDING_CLOSED
BID_EVALUATION
CONTRACTOR_SELECTED
RE_COMPLAINT
REASSIGNED
OVERDUE
REJECTED
DUPLICATE
```

Status changes are controlled by a backend state-transition service rather than being freely editable by the frontend.

---

# Complaint ID

Every complaint receives a unique human-readable ID.

Example:

```text
JS-2026-000001
```

Format:

```text
JS-{YEAR}-{SEQUENCE}
```

---

# Citizen Reporting Flow

The primary reporting experience is:

```text
REPORT A PROBLEM
        ↓
Camera
        ↓
Capture Image
        ↓
GPS Permission
        ↓
Current Location
        ↓
Optional Details
        ↓
Submit
        ↓
Complaint ID
```

Captured location information includes:

* Latitude
* Longitude
* Accuracy
* Timestamp

If camera access is unavailable, normal file upload can be used as a fallback.

---

# Duplicate Detection

JanSetu provides an MVP duplicate-detection system.

Potential inputs include:

* GPS distance
* Category
* Image metadata
* Image similarity
* Description similarity
* Time

The initial implementation can use configurable rules.

For example:

```text
Same Category
+
Nearby Location
+
Recent Complaint
=
Possible Duplicate
```

Citizens can then:

* Support the existing complaint
* Continue with a new complaint

Duplicate relationships can be resolved by authorized administrators or government users.

---

# Community Verification

Nearby users can confirm that a reported problem exists.

```text
"I Confirm This Problem"
```

The platform records:

* User
* Complaint
* Timestamp
* Optional evidence

Community confirmation counts provide supporting information but do not independently determine government action.

---

# Government Routing

Routing is configurable rather than hard-coded.

Routing can consider:

* Complaint category
* GPS
* Jurisdiction
* Government organization
* Department
* Government level
* Configured routing rules
* Priority

Example:

```text
Complaint Category
        +
Location
        +
Jurisdiction
        +
Routing Rules
        ↓
Relevant Authority
```

Routing reason is stored for transparency.

Example:

```text
Routed based on problem category,
jurisdiction and configured government rules.
```

AI may recommend a route, but configured rules and authorized human decisions remain authoritative.

---

# JS Member Field Verification

When a technical assessment is required:

```text
Government
    ↓
Create Assignment
    ↓
JS Member Matching
    ↓
Assignment
    ↓
Accept
    ↓
Start Site Visit
    ↓
GPS Verification
    ↓
Fresh Evidence
    ↓
Field Report
    ↓
Government Review
```

Matching can consider:

* Location
* Distance
* Skills
* Experience
* Availability
* Field Trust Score
* Previous performance

Authorized government/admin users can manually override recommendations.

---

# Field Report

A field report contains:

* Complaint ID
* Site location
* Visit date/time
* Existing condition
* Measurements
* Observations
* Probable cause
* Severity
* Recommended solution
* Required resources
* Fresh photographs
* Additional evidence
* JS Member information

Reports support draft saving, submission, correction, and resubmission.

---

# Trust & Score System

## Civil Score

Citizens can have a Civil Score based on factors such as:

* Verified reports
* Useful confirmations
* Evidence accuracy
* Legitimate activity
* Duplicate/spam history
* Resolution feedback

Example:

```text
Civil Score: 83/100
```

Score changes should be explainable and stored in score history.

## Field Trust Score

JS Members can have a Field Trust Score based on:

* Verified site visits
* Accepted reports
* On-time submissions
* GPS verification
* Evidence quality
* Corrections required
* Assignment completion

Example:

```text
Field Trust Score: 91/100
```

Scores are transparent rather than hidden black-box ratings.

---

# Contractor Workflow

Government can create a contractor project when contractor execution is required.

```text
Technical Report
       ↓
Government Decision
       ↓
Project Created
       ↓
Bidding Open
       ↓
Contractor Bids
       ↓
Bid Evaluation
       ↓
Selection Record
       ↓
Work In Progress
       ↓
Progress Updates
       ↓
Completion Evidence
       ↓
Government Verification
```

Contractor bids can contain:

* Amount
* Proposal
* Documents
* Timeline

The system does not automatically select the lowest bid. Government users record the applicable evaluation criteria and final decision.

---

# Deadlines & SLA

JanSetu provides a configurable deadline engine.

Core entities:

```text
SLAConfiguration
EscalationRule
```

Deadline records include:

* Start time
* Deadline
* Status
* Source rule

Notifications can be generated for:

```text
7 days remaining
2 days remaining
1 day remaining
Overdue
```

The platform does not hard-code or claim legal deadlines.

---

# Resolution & Re-Complaint

Government submits:

* Completion evidence
* Photographs
* Completion date
* Work details
* Documents

Then:

```text
RESOLUTION_SUBMITTED
        ↓
GOVERNMENT_VERIFIED
        ↓
CITIZEN_VERIFICATION
```

The citizen can select:

```text
YES, SOLVED
```

or:

```text
NOT SOLVED
```

If the citizen reports that the problem is not solved:

```text
RE-COMPLAINT
```

A re-complaint requires:

* Fresh image
* Current GPS
* Reason
* Optional description

The original complaint history remains intact.

---

# Notifications

Initial notification channel:

```text
In-App Notifications
```

The architecture can later support:

* Email
* SMS
* Push notifications

Notifications can be generated for complaint status changes, assignments, deadlines, reports, government actions, project updates, resolution verification, and re-complaints.

---

# Audit Logging

Important platform actions are recorded in an immutable audit trail.

Example fields:

```text
User
Action
Entity
Entity ID
Timestamp
Old Value
New Value
IP / Device Metadata
```

Examples:

* Complaint status changed
* Assignment created
* Report approved
* Government action created
* Bid submitted
* Resolution submitted
* Complaint reopened

Normal users cannot modify audit logs.

---

# Database

JanSetu uses PostgreSQL with relational entities including:

```text
User
UserProfile
Role
Verification

Complaint
ComplaintImage
ComplaintLocation
ComplaintStatusHistory
CommunityVerification

JSMemberProfile
JSMemberVerification
Assignment
SiteVisit
FieldEvidence
TechnicalReport
ReportReview

GovernmentOrganization
GovernmentDepartment
GovernmentLevel
GovernmentOfficial
Jurisdiction
JurisdictionBoundary
RoutingRule
EscalationRule
SLAConfiguration

GovernmentAction
ActionProgress
Resolution

BusinessProfile
ContractorVerification
Project
Bid
BidDocument
ContractorPerformance

CivilScore
FieldTrustScore
ScoreHistory

Notification
AuditLog
```

The database uses:

* Foreign keys
* Indexes
* Timestamps
* `created_by`
* `updated_by`
* Status history
* Soft deletion where appropriate

---

# API

JanSetu exposes REST APIs using FastAPI.

### Authentication

```http
POST /auth/register
POST /auth/login
POST /auth/refresh
```

### User

```http
GET /users/me
```

### Complaints

```http
POST /complaints
GET /complaints
GET /complaints/{id}
POST /complaints/{id}/support
POST /complaints/{id}/recomplain
```

### JS Members

```http
POST /js-members/apply
GET /js-members/profile
GET /js-members/assignments
```

### Assignments & Reports

```http
POST /assignments/{id}/accept
POST /assignments/{id}/start-visit
POST /assignments/{id}/evidence

POST /reports
PUT /reports/{id}
POST /reports/{id}/submit
```

### Government

```http
GET /government/complaints
POST /government/complaints/{id}/request-assessment
POST /government/actions
POST /government/resolutions
```

### Projects

```http
POST /projects
GET /projects
POST /projects/{id}/bids
GET /projects/{id}/bids
```

### Notifications & Scores

```http
GET /notifications
GET /scores
```

Admin APIs provide configuration and platform management functionality.

FastAPI automatically provides OpenAPI documentation.

---

# Authentication & Authorization

JanSetu implements:

* Registration
* Login
* Logout
* Refresh tokens
* Password reset architecture
* Email verification architecture
* Secure password hashing
* JWT authentication
* Role-based access control

Passwords are never stored in plaintext.

Private API routes must be protected by backend authorization.

The backend never trusts role information supplied only by the frontend.

---

# Security

Security controls include:

* Secure authentication
* RBAC
* Input validation
* MIME type validation
* File size limits
* Safe filenames
* Rate limiting
* CSRF protection where relevant
* Secure HTTP headers
* SQL injection protection
* XSS protection
* Server-side authorization
* Audit logging

## File Upload Security

Uploaded files are validated using:

* MIME type
* File extension
* File size
* Safe generated filenames

The application prevents executable uploads and does not expose arbitrary filesystem paths.

---

# Privacy

JanSetu follows role-based information visibility.

### Citizens

Only necessary information is exposed publicly.

### Government

Government officials receive information required for official complaint handling.

### JS Members

JS Members receive only information required for their assignments.

### Contractors

Contractors receive project and bidding information relevant to their work.

### Admin

Admins have broader platform management access.

Sensitive citizen information should not be unnecessarily exposed.

---

# Demo Mode

JanSetu includes a demonstration flow suitable for hackathons.

### Demo Scenario

```text
Citizen
  ↓
Reports Pothole
  ↓
GPS Captured
  ↓
Complaint ID Generated
  ↓
Duplicate Check
  ↓
Community Confirmation
  ↓
Government Receives Complaint
  ↓
Government Requests Assessment
  ↓
JS Member Receives Assignment
  ↓
Site Visit
  ↓
Fresh GPS + Evidence
  ↓
Field Report
  ↓
Government Review
  ↓
Contractor Project
  ↓
Contractor Bid
  ↓
Government Selection
  ↓
Project Progress
  ↓
Completion
  ↓
Government Verification
  ↓
Citizen Verification
  ↓
CLOSED
```

The same demo can also demonstrate:

```text
NOT SOLVED
    ↓
RE-COMPLAINT
    ↓
Fresh Image
    ↓
Current GPS
    ↓
Case Reopened
```

---

# Environment Variables

Create a `.env` file based on `.env.example`.

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/jansetu

JWT_SECRET=your-development-secret
JWT_REFRESH_SECRET=your-refresh-secret

MAP_API_KEY=your-map-api-key

STORAGE_CONFIG=local

AI_API_KEY=your-ai-api-key

EMAIL_CONFIG=development
```

> Never commit real API keys, passwords, database credentials, JWT secrets, or other sensitive information to GitHub.

---

# Installation

## Prerequisites

Install:

* Node.js
* npm
* Python 3.x
* PostgreSQL
* Git

---

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/jan-setu.git
cd jan-setu
```

---

# Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux/macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure environment variables:

```bash
cp .env.example .env
```

Update the database configuration inside `.env`.

Run the backend:

```bash
uvicorn app.main:app --reload
```

The API should be available at:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the frontend environment file if required:

```bash
.env
```

Start development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE jansetu;
```

Configure:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/jansetu
```

Run database migrations using the project's configured migration system.

Example with Alembic:

```bash
alembic upgrade head
```

Seed development/demo data using the project's seed script.

Example:

```bash
python -m scripts.seed
```

---

# Development Workflow

The recommended development order is:

### Phase 1 — Foundation

```text
Project Setup
↓
Database
↓
Backend
↓
Authentication
↓
RBAC
```

### Phase 2 — Citizen Reporting

```text
Citizen UI
↓
Complaint Creation
↓
Camera
↓
GPS
↓
Image Upload
↓
Complaint ID
```

### Phase 3 — Verification

```text
Status History
↓
Duplicate Detection
↓
Community Confirmation
↓
Verification
```

### Phase 4 — Government

```text
Government Dashboard
↓
Routing Engine
↓
Government Actions
↓
Deadlines
```

### Phase 5 — JS Member

```text
Application
↓
Verification
↓
Assignments
↓
Site Visit
↓
GPS Evidence
↓
Field Report
```

### Phase 6 — Resolution

```text
Government Action
↓
Resolution
↓
Government Verification
↓
Citizen Verification
↓
Re-Complaint
```

### Phase 7 — Contractor

```text
Business Profile
↓
Projects
↓
Bids
↓
Evaluation
↓
Project Management
```

### Phase 8 — Trust System

```text
Civil Score
↓
Field Trust Score
↓
Contractor Performance
```

### Phase 9 — Intelligence

```text
AI Classification
↓
Duplicate Intelligence
↓
GIS Matching
↓
Routing Recommendations
↓
JS Member Matching
```

### Phase 10 — Production Readiness

```text
Testing
↓
Security
↓
Performance
↓
Documentation
↓
Deployment
```

---

# Testing

Backend tests should cover:

* Authentication
* Authorization
* Complaint creation
* Status transitions
* Routing
* Duplicate detection
* Assignment
* Report submission
* Resolution
* Re-complaint

Frontend tests should cover:

* Important components
* Form validation
* Protected routes

End-to-end testing should cover the complete complaint lifecycle.

Example:

```text
Citizen Registration
        ↓
Login
        ↓
Report Complaint
        ↓
GPS Capture
        ↓
Government Routing
        ↓
JS Member Assignment
        ↓
Site Visit
        ↓
Field Report
        ↓
Government Action
        ↓
Contractor Project
        ↓
Resolution
        ↓
Citizen Verification
        ↓
Closed
```

---

# Error Handling

API responses should follow a consistent structure.

Example:

```json
{
  "success": false,
  "message": "Location permission is required",
  "code": "LOCATION_REQUIRED"
}
```

The application should:

* Show meaningful user-facing errors
* Avoid exposing stack traces
* Log technical errors securely
* Return appropriate HTTP status codes

---

# Mock Services

External services can initially use mock adapters:

```text
MockAIService
MockMapService
MockNotificationService
```

The application should communicate through service interfaces instead of directly depending on mock implementations.

This allows real providers to be integrated later without redesigning the core application.

---

# Design Philosophy

JanSetu is designed as a serious civic-tech platform.

### Visual Direction

* Light background
* Dark navy/charcoal typography
* Subtle pastel accents
* Rounded cards
* Clean dashboards
* Minimal shadows
* Clear typography
* Responsive layouts
* Professional civic-tech appearance

The UI should avoid:

* Excessive gradients
* Excessive animations
* Clutter
* Large decorative graphics
* Generic SaaS-template styling

---

# Responsive Design

JanSetu supports:

* Desktop
* Laptop
* Tablet
* Mobile

The citizen reporting flow is optimized primarily for mobile devices.

Government and admin dashboards are optimized for larger screens while remaining responsive.

---

# Architecture Principles

The project follows:

* TypeScript strict mode
* Python type hints
* Reusable components
* Service-layer architecture
* Repository pattern where useful
* Schema validation
* Clean API contracts
* Centralized error handling
* Environment-based configuration
* Meaningful naming

Avoid:

* Giant components
* Duplicated code
* Hard-coded business rules
* Hard-coded demo data inside UI components
* Fake buttons
* Fake loading states
* Unnecessary dependencies

---

# Important Design Rules

JanSetu must:

1. Store real complaint data.
2. Use real APIs.
3. Use real authentication.
4. Protect role-based routes.
5. Store complaint status in PostgreSQL.
6. Generate timelines from status history.
7. Actually upload images.
8. Capture GPS through browser/device APIs.
9. Record JS Member site visits.
10. Store field reports.
11. Store government actions.
12. Store deadlines.
13. Store notifications.
14. Generate audit logs.
15. Maintain re-complaint relationships.
16. Keep routing configurable.
17. Keep AI recommendations separate from final human decisions.
18. Avoid automatic lowest-bid selection.
19. Avoid unnecessary exposure of personal information.

---

# Future Improvements

Potential future extensions include:

* Real AI image classification
* Advanced duplicate image detection
* GIS-based jurisdiction detection
* Automated category recommendations
* Smart JS Member matching
* Email notifications
* SMS notifications
* Push notifications
* Cloud object storage
* Advanced analytics
* Mobile applications
* Multilingual citizen interface
* Advanced government integrations

---

# Project Documentation

Additional technical documentation:

```text
docs/
├── ARCHITECTURE.md
├── DATABASE.md
├── API.md
├── WORKFLOW.md
└── SECURITY.md
```

These documents should contain detailed architecture, database design, API contracts, workflow rules, and security practices.

---

# Hackathon MVP Goal

The most important part of JanSetu is the complete complaint lifecycle.

```text
REPORT
   ↓
GOVERNMENT
   ↓
JS MEMBER
   ↓
ACTION
   ↓
RESOLUTION
   ↓
CITIZEN VERIFICATION
```

Everything else—AI, analytics, scoring, contractor tools, and advanced intelligence—is secondary to making this core workflow reliable and demonstrable.

A functional MVP should successfully demonstrate:

```text
Citizen
→ Report
→ GPS
→ Complaint ID
→ Verification
→ Government Routing
→ JS Member Assessment
→ Government Decision
→ Action / Contractor
→ Resolution
→ Government Verification
→ Citizen Verification
→ CLOSED
```

---

# License

Add the project's chosen license here.

Example:

```text
MIT License
```

---

# Contributors

**JanSetu Team**

Built as a civic-tech project focused on connecting citizen-reported problems with structured government action and transparent resolution tracking.

---

## JanSetu

**From Citizen Report to Government Action**

```text
SEE → CAPTURE → VERIFY → ROUTE → ASSESS
→ DECIDE → SOLVE → TRACK → VERIFY → CLOSE
```
