# JanSetu-1.0
JanSetu is a civic-tech platform that turns citizen-reported problems into verified technical reports and actionable government workflows, connecting citizens, technical institutions, government authorities, and local businesses for faster and smarter civic problem resolution.
# JanSetu

## From Citizen Report to Government Action

JanSetu is a civic problem reporting and resolution platform that connects citizens, technical educational institutions, students, and government authorities.

The platform allows citizens to report local civic problems simply by capturing an image and pressing the Send button.

The citizen can optionally provide additional information through text or voice in their local language.

JanSetu automatically captures the location of the reported problem and generates a unique complaint reference number.

The complaint is then shared with the relevant government authority and participating technical institution.

The institution's HOD/Principal decides the concerned department, number of students, and student team responsible for field verification.

Students visit the location, investigate the problem, prepare a technical report, and submit it through the platform.

The government authority can then use the verified technical report to take appropriate action and update the citizen through the application.

---

## Core Idea

**Citizen reports → College verifies → Government acts → Citizen tracks**

---

## Key Participants

- Citizens
- Technical Colleges / Institutions
- HOD / Principal
- Faculty Supervisors
- Student Teams
- Government Authorities

## Problem Statement

Many local civic problems such as damaged roads, blocked drainage systems, broken streetlights, water leakage, waste accumulation, and damaged public infrastructure remain difficult to report, verify, and track effectively.

Citizens may know that a problem exists but may not know:

- Which government department is responsible
- How to formally report the issue
- What technical information is required
- How to track the progress of the complaint

Government authorities may also need field-level information before taking action.

At the same time, technical educational institutions have students who can participate in real-world field investigations under institutional supervision.

JanSetu brings these stakeholders together through a single digital platform.

## Proposed Solution

JanSetu provides a complete workflow for reporting, verifying, and resolving civic problems.

### Workflow

1. Citizen captures an image of a civic problem.
2. Citizen optionally adds text or voice in a local language.
3. Application captures accurate geographical location.
4. A unique complaint reference number is generated.
5. Complaint information is sent to the relevant government authority and technical  institution.
6. HOD/Principal reviews the complaint.
7. HOD/Principal selects the appropriate department.
8. HOD/Principal decides the number of students required.
9. HOD/Principal assigns a student team and faculty supervisor.
10. Students visit the reported location.
11. Students verify the problem and collect technical evidence.
12. Students prepare and submit a technical report.
13. The report is shared with the government authority.
14. Government officials review the report and take appropriate action.
15. Complaint status is updated in the system.
16. Citizen receives updates and can track the complaint.
17. After resolution, the citizen can provide feedback.

### Complaint Lifecycle

`Reported → Assigned → Field Verification → Report Submitted → Government Action → Resolved`


## Features

### Citizen Features

- Photo-based problem reporting
- One-tap submission
- Automatic location capture
- Optional text description
- Optional voice description
- Local-language support
- Unique complaint reference number
- Complaint tracking
- Status notifications
- Resolution feedback

### College Features

- Institution dashboard
- Complaint monitoring
- Department-wise complaint management
- HOD/Principal control
- Student assignment
- Number of students decided by HOD/Principal
- Faculty supervisor assignment
- Field investigation management
- Technical report submission
- Report monitoring

### Government Features

- Government dashboard
- Complaint management
- Department-wise routing
- Technical report access
- Action status updates
- Evidence upload
- Complaint resolution
- Citizen notification
- Complaint history and audit trail

## User Roles

### Citizen

The citizen is the primary source of civic problem reports.

Responsibilities:

- Capture problem image
- Submit complaint
- Provide optional voice/text information
- Track complaint
- Provide feedback

### HOD / Principal

The HOD/Principal manages student participation within the institution.

Responsibilities:

- Review assigned complaints
- Select appropriate department
- Decide required number of students
- Assign student team
- Assign faculty supervisor
- Monitor investigation
- Review technical reports

### Faculty Supervisor

The faculty supervisor guides students during technical investigation.

Responsibilities:

- Guide student teams
- Review field observations
- Verify technical reports
- Provide academic supervision

### Students

Students perform field-level technical verification.

Responsibilities:

- Visit complaint location
- Inspect the problem
- Capture evidence
- Record technical observations
- Prepare technical report
- Submit report through the platform

### Government Authority

Government officials are responsible for taking action on reported problems.

Responsibilities:

- Receive complaints
- Review citizen reports
- Review technical reports
- Take appropriate action
- Update progress
- Upload completion evidence
- Resolve or reopen complaints

## Technology Stack

The platform can be developed using a modern web and mobile technology stack.

### Frontend

- Flutter for mobile application
- React.js for web dashboards
- HTML5
- CSS3
- JavaScript

### Backend

- FastAPI / Node.js
- REST APIs
- Authentication and authorization

### Database

- PostgreSQL

### Storage

- Cloud-based object storage for images, audio, and documents

### Location Services

- GPS / Location APIs
- Map integration

### Notifications

- Push notifications
- SMS / Email notifications where required

### AI Layer

- Image classification
- Speech-to-text
- Local-language processing
- Duplicate complaint detection
- Problem categorization