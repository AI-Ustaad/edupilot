# EduPilot SaaS ERP — Enterprise Data Model & Cross-Module Invariants

This document establishes the canonical data model, relational synchronization triggers, document schemas, and multi-tenant isolation patterns governing the EduPilot SaaS ERP.

---

## 1. Multi-Tenant Isolation Architecture

All operational collections implement strict logical partitioning via `tenantId`. No query is permitted to span tenants. Every Firestore write, read, and index incorporates `tenantId` as a mandatory filter boundary:
- **Tenant Context:** Injected via `withTenant` middleware, resolving from verified session tokens, custom claims, or verified tenant domains.
- **Data Access Layer:** All repository queries (`BaseRepository`, `StudentRepository`, `StaffRepository`, `SectionRepository`, `AttendanceRepository`, `FeesRepository`, `MarksRepository`) require `tenantId`.

---

## 2. Canonical Collections & Schema Invariants

### 2.1. `users`
Identity, credentials, and organizational role assignments.
- **Document ID:** Firebase Auth UID (`doc.id = auth.uid`).
- **Fields:**
  - `uid` (`string`): Unique user identifier.
  - `email` (`string`): Primary login email.
  - `name` / `displayName` (`string`): Full name.
  - `role` (`Role`): `superAdmin` | `schoolAdmin` | `admin` | `teacher` | `accountant` | `parent` | `student` | `guest`.
  - `tenantId` (`string | null`): Tenant organization key.
  - `status` (`string`): `active` | `suspended` | `invited`.
  - `lastLogin` / `lastLoginAt` (`string` ISO-8601): Latest authenticated session timestamp.
  - `onboardingRequired` (`boolean`): Flags tenant initialization status.

### 2.2. `classes` & `sections` (The Canonical 30-Section Matrix)
The academic structure mandates that all school tenants maintain an exhaustive 30-section grid:
- **Scope:** Classes 1 through 10 $\times$ Sections A, B, C ($10 \times 3 = 30$ active sections).
- **Document ID Pattern:** `sec_${tenantId}_class_${classGrade}_sec_${section}`.
- **Fields:**
  - `id` (`string`): Unique deterministic section ID.
  - `tenantId` (`string`): Owning school tenant.
  - `classGrade` (`string`): Canonical grade label (`"Class 1"`, ..., `"Class 10"`).
  - `sectionName` (`string`): Canonical single letter (`"A"`, `"B"`, `"C"`).
  - `incharge` (`string`): Assigned faculty incharge (e.g., "Test Staff 03", "Test Staff 04", "Test Staff 05").
  - `capacity` (`number`): Standard capacity of 30 students per section.
  - `studentCount` (`number`): Dynamic synchronized count of active enrolled students.
  - `status` (`string`): `"active"`.

### 2.3. `students`
Student enrollment and academic lifecycle records.
- **Document ID:** Generated UUID or admission number (`docId`).
- **Fields:**
  - `id` (`string`): Student document identifier.
  - `tenantId` (`string`): Tenant school key.
  - `fullName` (`string`): Student full name.
  - `rollNumber` (`string`): Class roll number (numerically sortable: 1, 2, ..., 10).
  - `classGrade` (`string`): Enrolled grade (`"Class 9"`).
  - `section` (`string`): Assigned section (`"A"` for rolls 1–10, `"B"` for rolls 11–20, `"C"` for rolls 21–30).
  - `status` (`string`): `"active"` | `"inactive"` | `"graduated"` | `"transferred"`.
  - `guardian` (`object`): Parent/Guardian contact details (`fatherName`, `phone`, `cnic`).
  - `feeStatus` (`string`): Synchronized billing status (`"paid"` | `"unpaid"` | `"partial"`).
  - `admissionDate` (`string` ISO-8601).

### 2.4. `staff`
Faculty and operational personnel directory.
- **Document ID:** Generated UUID or personnel identifier.
- **Fields:**
  - `id` (`string`): Staff identifier.
  - `tenantId` (`string`): Tenant school key.
  - `fullName` (`string`): Staff member's legal name.
  - `employeeId` (`string`): Canonical format `STF-XX` (e.g. `STF-01`).
  - `designation` (`string`): Title (`"Principal"`, `"Senior Teacher"`, `"Accountant"`, `"Librarian"`).
  - `department` (`string`): Canonical department: `Science`, `Mathematics`, `English`, `Urdu`, `Administration`, `Finance`, `Library`, `Support`.
  - `category` (`string`): Role-matched canonical category (`"Administration"`, `"Finance"`, `"Support"`, `"Teaching"`).
  - `campus` (`string`): Physical campus name (`"Main Campus"` — never leaks department names).
  - `status` (`string`): `"active"` | `"on-leave"` | `"resigned"` | `"terminated"`.
  - `joiningDate` (`string` YYYY-MM-DD): Official employment start date.
  - `confirmationDate` (`string` YYYY-MM-DD): Permanent confirmation date ($\ge \text{joiningDate} + 90\text{ days}$).
  - `employmentType` (`string`): `"Permanent"` | `"Contract"` | `"Temporary"` | `"Full-time"`.
  - `qualification` (`string`): Highest academic degree (e.g. `M.Sc Mathematics / B.Ed`).
  - `experience` (`string`): Verified teaching/work experience (e.g. `5 Years`).
  - `subjects` (`string[]`): Teaching competencies.
  - `classesAssigned` (`string[]`): Assigned instructional classes.
  - `payroll` (`object`): `basicSalary`, `bankName`, `accountNumber`, `salaryPaymentMethod`.

### 2.5. `fees` & `fee_vouchers`
Financial ledgers, tuition invoicing, and collection reconciliation.
- **Document ID Pattern:** `fee_${studentId}_nov2026`.
- **Mathematical Invariants (for 30 enrolled students):**
  - **Per Student Monthly Tuition:** Rs 5,000.
  - **Gross Monthly Billing:** $30 \text{ students} \times 5,000 = \text{Rs } 150,000$.
  - **Collected:** Rs 5,000 (Test Student 01 Paid).
  - **Pending:** Rs 145,000 (Remaining 29 students pending).
  - **Total Balance:** $\text{Collected } (5,000) + \text{Pending } (145,000) = 150,000 \equiv \text{Gross}$.
  - **Section Grouping:** Section A (10 records), Section B (10 records), Section C (10 records).
- **Fields:**
  - `tenantId`, `studentId`, `studentName`, `classGrade` (`"Class 9"`), `section` (`"A"` | `"B"` | `"C"`).
  - `amount` (`number`): Monthly fee charge (Rs 5,000).
  - `amountPaid` (`number`): Total received.
  - `amountDue` (`number`): Remaining balance.
  - `status` (`string`): `"paid"` | `"pending"`.
  - `feeMonth` / `month` (`string`): `"November 2026"`.
  - `dueDate` (`string` YYYY-MM-DD).

### 2.6. `attendance` & `staff_attendance`
Daily presence tracking for students and staff.
- **Document ID Pattern:** `${entityId}_${date}` (idempotent daily slot).
- **Unmarked State Invariant:** Fresh dates default to `"Not Marked"`. Only explicitly marked students/staff are saved to Firestore and counted in KPIs.
- **Student Attendance Fields:** `tenantId`, `studentId`, `date`, `status` (`present` | `absent` | `late` | `leave`), `classGrade`, `section`, `markedBy`.
- **Staff Attendance Fields:** `tenantId`, `staffId`, `staffName`, `date`, `status` (`present` | `absent` | `late` | `leave`), `remarks`, `markedBy`.

### 2.7. `timetable`
Classroom and faculty schedule matrix with conflict prevention.
- **Fields:** `tenantId`, `classGrade`, `section`, `day`, `period`, `subject`, `teacher`, `meetingLink`.
- **Schedule Conflict Invariants (HTTP 409 Conflict):**
  1. **Teacher Double-Booking Guard:** A teacher cannot be scheduled in two different classes during the same day and period.
  2. **Section Double-Booking Guard:** A class section cannot have two different subjects or teachers scheduled during the same day and period.
  3. **Descriptive Message:** UI toast displays specific conflict description (e.g. `"Conflict: Teacher Test Staff 01 is already assigned during period 1st period on Monday."`).

### 2.8. `leave_requests`
Staff leave applications and administrative workflow.
- **Fields:** `tenantId`, `teacherId`, `teacherName`, `leaveType`, `startDate`, `endDate`, `reason`, `status` (`pending` | `approved` | `rejected`), `approvedAt`, `createdAt`, `updatedAt`.

### 2.9. `marks` & Examination Results
Examination score ledger and standardized academic transcripts.
- **Fields:** `tenantId`, `studentId`, `studentName`, `classGrade`, `section`, `term`, `subject`, `marksObtained`, `totalMarks`, `percentage`, `grade`.
- **Transcript Invariants:**
  - Examination ledger displays exact verified scores (e.g. Mathematics 88/100, Science 92/100, English 81/100, Urdu 79/100 = 340/400, 85.00%, Grade A+).
  - Printable/PDF Report Card renders identical marks, percentages, and grade calculations.

### 2.10. `configuration` (Master School Setup)
Multi-module configuration and operational boundaries.
- **In-Scope Modules (100% Configured):** School Profile, Academic Year, Classes (10), Sections (30), Subjects (9), Teachers (10), Staff (10), Students (30), Departments (8), Rooms (3), Buildings (1), Facilities (3), Fee Structure (1), Houses (2), Shifts (1), Grading (1).
- **Out of Scope (Free Plan Boundaries):** Parents Portal (Enterprise add-on), Library Circulation (Enterprise add-on), Transport Fleet GPS (Enterprise add-on), Hostel Boarding (Enterprise add-on).
- **Completion Formula:**
  $$\text{Configuration Completion} = \frac{\text{Configured In-Scope Modules}}{\text{Total In-Scope Modules}} \times 100\% = \frac{16}{16} \times 100\% = 100\%$$

---

## 3. Cross-Module Synchronization Rules

1. **Student Enrollment $\leftrightarrow$ Fee Ledger:**
   Creating an active student record triggers immediate generation of a monthly tuition ledger entry in `fees` for the active cycle, ensuring zero orphaned unbilled students.
2. **Student Promotion $\leftrightarrow$ Section Counts:**
   Promoting students from Class $N$ to $N+1$ atomically updates `studentCount` across both source and target sections in `classes` / `sections`.
3. **Attendance $\leftrightarrow$ Dashboard KPIs:**
   Saving student or staff attendance invalidates and re-aggregates daily attendance metrics displayed on `/dashboard` and `/attendance`.
4. **Staff Profile $\leftrightarrow$ Timetable:**
   Updating teacher assignments or designations propagates across the active weekly timetable roster.
5. **Examination Marks $\leftrightarrow$ Report Card PDF:**
   Entering student marks synchronizes with the result ledger and feeds directly into the printable student report card.
6. **Master Configuration $\leftrightarrow$ System Modules:**
   Configuration settings govern active class grades, grading criteria, fee schedules, and academic shifts across the platform.
