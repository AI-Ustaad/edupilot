# RBAC Architecture Inventory - EduPilot

## 1. students
- **Permissions used:** - `students.view`
  - `students.create`
  - `students.update`
  - `students.delete`
- **Routes using it:** - `app/(protected)/students/page.tsx`
  - `app/(protected)/students/add/page.tsx`
  - `app/(protected)/student-profile/page.tsx`
  - `app/api/v1/students/*`
- **Services using it:** - `services/student.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Academic -> Students)
- **UI references:** - `components/student360/StudentHeader.tsx`

---

## 2. staff
- **Permissions used:** - `staff.view`
  - `staff.create`
  - `staff.update`
  - `staff.delete`
- **Routes using it:** - `app/(protected)/staff/page.tsx`
  - `app/(protected)/staff/add/page.tsx`
  - `app/(protected)/staff-profile/page.tsx`
  - `app/api/v1/staff/*`
- **Services using it:** - `services/staff.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Staff -> Staff Management)
- **UI references:** - `app/(protected)/staff/page.tsx` elements

---

## 3. fees
- **Permissions used:** - `fees.view`
  - `fees.create`
  - `fees.update`
  - `fees.delete`
  - `fees.collect`
- **Routes using it:** - `app/(protected)/fees/page.tsx`
  - `app/api/v1/fees/*`
- **Services using it:** - `services/fees.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Finance -> Fees)
- **UI references:** - `app/(protected)/fees/page.tsx` tables

---

## 4. attendance
- **Permissions used:** - `attendance.view`
  - `attendance.create`
  - `attendance.update`
  - `attendance.delete`
- **Routes using it:** - `app/(protected)/attendance/page.tsx`
  - `app/api/v1/attendance/*`
- **Services using it:** - `services/attendance.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Operations -> Attendance)
- **UI references:** - `app/(protected)/attendance/page.tsx` grids

---

## 5. homework
- **Permissions used:** - `homework.view`
  - `homework.create`
  - `homework.update`
  - `homework.delete`
- **Routes using it:** - `app/(protected)/teacher/homework/page.tsx`
  - `app/api/v1/homework/*`
- **Services using it:** - `services/homework.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Staff -> Post Homework)
- **UI references:** - `app/(protected)/teacher/homework/page.tsx` forms

---

## 6. settings
- **Permissions used:** - `settings.view`
  - `settings.update`
  - `settings.manage`
- **Routes using it:** - `app/(protected)/settings/page.tsx`
  - `app/(protected)/settings/whitelabel/page.tsx`
  - `app/api/v1/settings/*`
  - `app/api/v1/admin/feature-flags`
- **Services using it:** - `services/settings.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Admin Tools -> Settings)
- **UI references:** - `app/(protected)/settings/whitelabel/page.tsx`

---

## 7. buses
- **Permissions used:** - `buses.view`
  - `buses.create`
  - `buses.update`
  - `buses.delete`
- **Routes using it:** - `app/(protected)/admin/buses/page.tsx`
  - `app/api/v1/buses/*`
- **Services using it:** - `services/bus.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Operations -> Buses)
- **UI references:** - `app/(protected)/admin/buses/page.tsx` tables

---

## 8. parents
- **Permissions used:** - `parents.view`
  - `parents.create`
  - `parents.update`
  - `parents.delete`
- **Routes using it:** - `app/(protected)/admin/parents/page.tsx`
  - `app/(protected)/parent/dashboard/page.tsx`
  - `app/api/v1/parents/*`
- **Services using it:** - `services/parent.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Staff -> Parents)
- **UI references:** - `app/(protected)/parent/dashboard/page.tsx`

---

## 9. videoLectures
- **Permissions used:** - `videoLectures.view`
  - `videoLectures.create`
  - `videoLectures.delete`
- **Routes using it:** - `app/(protected)/video-lectures/page.tsx`
  - `app/(protected)/teacher/video-lectures/page.tsx`
  - `app/api/v1/video-lectures/*`
- **Services using it:** - `services/video.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Academic -> Video Library)
- **UI references:** - `app/(protected)/video-lectures/page.tsx`

---

## 10. ledger
- **Permissions used:** - `ledger.view`
  - `ledger.create`
  - `ledger.update`
  - `ledger.delete`
- **Routes using it:** - `app/api/v1/ledger/*`
- **Services using it:** - `services/ledger.service.ts`
- **Menu references:** - *Pending linkage in sidebar*
- **UI references:** - Accounting ledger views

---

## 11. subscriptions
- **Permissions used:** - `subscriptions.view`
  - `subscriptions.create`
  - `subscriptions.update`
  - `subscriptions.delete`
  - `subscriptions.activate`
- **Routes using it:** - `app/(protected)/settings/billing/page.tsx`
  - `app/api/v1/subscriptions/*`
- **Services using it:** - `services/subscription.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Admin Tools -> Billing)
- **UI references:** - `app/(protected)/settings/billing/page.tsx`

---

## 12. marks
- **Permissions used:** - `marks.view`
  - `marks.create`
  - `marks.update`
  - `marks.delete`
- **Routes using it:** - `app/(protected)/marks/page.tsx`
  - `app/(protected)/result/page.tsx`
  - `app/api/v1/marks/*`
- **Services using it:** - `services/marks.service.ts`
- **Menu references:** - *Pending dedicated group*
- **UI references:** - `app/(protected)/marks/page.tsx`

---

## 13. analytics
- **Permissions used:** - `analytics.view`
- **Routes using it:** - `app/(protected)/admin/analytics/page.tsx`
  - `app/(protected)/super-admin/analytics/page.tsx`
  - `app/api/v1/analytics/*`
- **Services using it:** - `services/analytics.service.ts`
- **Menu references:** - *Super Admin & Admin dashboards*
- **UI references:** - Analytics charts components

---

## 14. assignments
- **Permissions used:** - `assignments.view`
  - `assignments.create`
  - `assignments.update`
  - `assignments.delete`
  - `assignments.grade`
- **Routes using it:** - `app/(protected)/teacher/assignments/page.tsx`
  - `app/(protected)/teacher/assignments/submissions/page.tsx`
  - `app/api/v1/assignments/*`
- **Services using it:** - `services/assignment.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Staff -> Assignments)
- **UI references:** - Submission review dashboards

---

## 15. quizzes
- **Permissions used:** - `quizzes.view`
  - `quizzes.create`
  - `quizzes.update`
  - `quizzes.delete`
  - `quizzes.grade`
- **Routes using it:** - `app/(protected)/teacher/quizzes/page.tsx`
  - `app/(protected)/teacher/quizzes/results/page.tsx`
  - `app/(protected)/ai-exam-questions/page.tsx`
  - `app/api/v1/quizzes/*`
- **Services using it:** - `services/quiz.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Staff -> Quizzes / Exam Center)
- **UI references:** - Quiz result components

---

## 16. lessonPlans
- **Permissions used:** - `lessonPlans.view`
  - `lessonPlans.create`
  - `lessonPlans.update`
  - `lessonPlans.delete`
- **Routes using it:** - `app/(protected)/teacher/lesson-plans/page.tsx`
  - `app/api/v1/lesson-plans/*`
- **Services using it:** - `services/lesson-plan.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Staff -> Lesson Plans)
- **UI references:** - Lesson plan builder interfaces

---

## 17. chat
- **Permissions used:** - `chat.view`
  - `chat.send`
  - `chat.delete`
- **Routes using it:** - `app/(protected)/teacher/chat/page.tsx`
  - `app/(protected)/parent/chat/page.tsx`
  - `app/api/v1/chat/*`
- **Services using it:** - `services/chat.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Staff -> Chat, Parent -> Chat)
- **UI references:** - Real-time messaging interfaces

---

## 18. audit
- **Permissions used:** - `audit.view`
- **Routes using it:** - `app/(protected)/admin/audit/page.tsx`
  - `app/api/v1/audit/*`
- **Services using it:** - `services/audit.service.ts`
- **Menu references:** - `components/SidebarLayout.tsx` (Admin Tools -> Audit Logs)
- **UI references:** - Activity logs viewer
