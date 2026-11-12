# EduPilot SaaS ERP — Enterprise Data Model & Cross-Module Invariants

This document establishes the canonical data model, relational synchronization triggers, document schemas, and multi-tenant isolation patterns governing the EduPilot SaaS ERP.

---

## 1. Multi-Tenant Isolation Architecture

All operational collections implement strict logical partitioning via `tenantId`. No query is permitted to span tenants. Every Firestore write, read, and index incorporates `tenantId` as a mandatory filter boundary:
- **Tenant Context:** Injected via `withTenant` middleware, resolving from verified session tokens, custom claims, or verified tenant domains.
- **Data Access Layer:** All repository queries (`BaseRepository`, `StudentRepository`, `StaffRepository`, `SectionRepository`, `AttendanceRepository`, `FeesRepository`) require `tenantId`.

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
- **Document ID Pattern:** `${tenantId}_class_${classGrade}_sec_${section}` (e.g. `sec_tenant123_class_9_sec_a`).
- **Fields:**
  - `id` (`string`): Unique deterministic section ID.
  - `tenantId` (`string`): Owning school tenant.
  - `classGrade` (`string`): Canonical grade number (`"1"`, `"2"`, ..., `"10"`).
  - `className` (`string`): Normalized display label (`"Class 1"`, ..., `"Class 10"`).
  - `sectionName` (`string`): Canonical single letter (`"A"`, `"B"`, `"C"`).
  - `room` (`string`): Assigned classroom identifier.
  - `capacity` (`number`): Default 30.
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
  - `classGrade` (`string`): Enrolled grade (`"1"` through `"10"`).
  - `section` (`string`): Assigned section (`"A"`, `"B"`, or `"C"`).
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
  - `designation` (`string`): Academic or operational title (`"Senior Teacher"`, `"Principal"`, etc.).
  - `department` (`string`): Canonical department: `Science`, `Mathematics`, `English`, `Urdu`, `Administration`, `Finance`, `Library`, `Support`.
  - `category` / `role` (`string`): `Teaching` | `Administration` | `Finance` | `Support`.
  - `status` (`string`): `"active"` | `"on-leave"` | `"resigned"` | `"terminated"`.
  - `joiningDate` (`string` YYYY-MM-DD): Official employment start date.
  - `confirmationDate` (`string` YYYY-MM-DD): Permanent confirmation date.
  - `qualification` (`string`): Highest academic degree (e.g. `M.Sc Mathematics / B.Ed`).
  - `experience` (`string`): Verified teaching/work experience (e.g. `5 Years`).
  - `subjects` (`string[]`): Teaching competencies.
  - `classesAssigned` (`string[]`): Assigned instructional classes.
  - `payroll` (`object`): `basicSalary`, `bankName`, `accountNumber`, `salaryPaymentMethod`.

### 2.5. `fees` & `fee_vouchers`
Financial ledgers, tuition invoicing, and collection reconciliation.
- **Document ID Pattern:** `${tenantId}_${studentId}_${billingMonth}` (e.g. `fee_testtenant_std01_2026-11`).
- **Mathematical Invariants (for 30 enrolled students):**
  - **Per Student Monthly Tuition:** Rs 5,000.
  - **Gross Monthly Billing:** $30 \text{ students} \times 5,000 = \text{Rs } 150,000$.
  - **Collected:** Rs 5,000 (Test Student 01 Paid).
  - **Pending:** Rs 145,000 (Remaining 29 students pending).
  - **Total Balance:** $\text{Collected} + \text{Pending} = 5,000 + 145,000 = 150,000$.
- **Fields:**
  - `tenantId`, `studentId`, `studentName`, `classGrade`, `section`.
  - `amount` (`number`): Monthly fee charge (Rs 5,000).
  - `amountPaid` (`number`): Total received.
  - `amountDue` (`number`): Remaining balance.
  - `status` (`string`): `"paid"` | `"unpaid"` | `"overdue"`.
  - `month` (`string` YYYY-MM): Target billing cycle.
  - `dueDate` (`string` YYYY-MM-DD).

### 2.6. `attendance` & `staff_attendance`
Daily presence tracking for students and staff.
- **Document ID Pattern:** `${entityId}_${date}` (idempotent daily slot).
- **Student Attendance Fields:** `tenantId`, `studentId`, `date`, `status` (`present` | `absent` | `late` | `leave`), `classGrade`, `section`, `markedBy`.
- **Staff Attendance Fields:** `tenantId`, `staffId`, `staffName`, `date`, `status` (`present` | `absent` | `late` | `leave`), `remarks`, `markedBy`.

### 2.7. `timetable`
Classroom and faculty schedule matrix with conflict prevention.
- **Fields:**
  - `tenantId` (`string`).
  - `classGrade` (`string`): Target grade.
  - `section` (`string`): Target section.
  - `day` (`string`): `"Monday"`, `"Tuesday"`, ..., `"Saturday"`.
  - `period` (`number`): Class period index (1 to 8).
  - `subject` (`string`): Subject name.
  - `teacherId` / `teacherName` (`string`): Assigned faculty.
  - `room` (`string`): Classroom number.
- **Schedule Conflict Invariants (HTTP 409 Conflict):**
  1. **Teacher Double-Booking Guard:** A teacher cannot be scheduled in two different classes during the same day and period.
  2. **Section Double-Booking Guard:** A class section cannot have two different subjects or teachers scheduled during the same day and period.

### 2.8. `leave_requests`
Staff leave applications and administrative workflow.
- **Fields:** `tenantId`, `teacherId`, `teacherName`, `leaveType`, `startDate`, `endDate`, `reason`, `status` (`pending` | `approved` | `rejected`), `approvedAt`, `createdAt`, `updatedAt`.

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
