// lib/subscribers/audit.subscriber.ts (یا جہاں بھی آپ نے یہ فائل رکھی ہے)

// 🚀 FIXED: Using Absolute Paths (@/) so Next.js never loses the file
import { eventBus } from "@/lib/events/event-bus";
import { EVENTS } from "@/lib/events/event-types";
import { adminDb } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";

export function registerAuditSubscriber() {
  // 🎧 Listen for STUDENT_CREATED event
  eventBus.subscribe(EVENTS.STUDENT_CREATED, async (payload) => {
    try {
      const { tenantId, studentId, studentData } = payload;

      // 📝 Write to Audit Logs in the background
      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "STUDENT_CREATED",
          targetId: studentId,
          details: `Student ${studentData.firstName || 'Unknown'} was enrolled into the system.`,
          timestamp: new Date().toISOString(),
          module: "Students",
          systemAction: true, 
        });

      logger.info(`Audit: Successfully logged creation of student: ${studentId}`);
    } catch (error) {
      logger.error("Audit: Failed to log event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for STUDENT_UPDATED event
  eventBus.subscribe(EVENTS.STUDENT_UPDATED, async (payload) => {
    try {
      const { tenantId, studentId, updates } = payload;
      await adminDb.collection("tenants").doc(tenantId).collection("audit_logs").add({
        action: "STUDENT_UPDATED",
        targetId: studentId,
        details: `Student ${studentId} was updated. Fields: ${Object.keys(updates || {}).join(", ")}`,
        timestamp: new Date().toISOString(),
        module: "Students",
        systemAction: true,
      });
    } catch (error) {
      logger.error("Audit: Failed to log student updated:", { metadata: { error } });
    }
  });

  // 🎧 Listen for STUDENT_DELETED event
  eventBus.subscribe(EVENTS.STUDENT_DELETED, async (payload) => {
    try {
      const { tenantId, studentId, studentData } = payload;
      await adminDb.collection("tenants").doc(tenantId).collection("audit_logs").add({
        action: "STUDENT_DELETED",
        targetId: studentId,
        details: `Student ${studentData?.fullName || studentId} was removed from the system.`,
        timestamp: new Date().toISOString(),
        module: "Students",
        systemAction: true,
      });
    } catch (error) {
      logger.error("Audit: Failed to log student deleted:", { metadata: { error } });
    }
  });

  // 🎧 Listen for STUDENT_PROMOTED event
  eventBus.subscribe(EVENTS.STUDENT_PROMOTED, async (payload) => {
    try {
      const { tenantId, studentIds, newClassGrade, newSection, academicYear, promotedBy } = payload;
      await adminDb.collection("tenants").doc(tenantId).collection("audit_logs").add({
        action: "STUDENT_PROMOTED",
        details: `${studentIds?.length || 0} students promoted to ${newClassGrade}-${newSection} (${academicYear}). By: ${promotedBy}.`,
        timestamp: new Date().toISOString(),
        module: "Students",
        systemAction: true,
      });
    } catch (error) {
      logger.error("Audit: Failed to log student promoted:", { metadata: { error } });
    }
  });

  // 🎧 Listen for CLASS_CHANGED event
  eventBus.subscribe(EVENTS.CLASS_CHANGED, async (payload) => {
    try {
      const { tenantId, studentId, oldClass, newClass } = payload;
      await adminDb.collection("tenants").doc(tenantId).collection("audit_logs").add({
        action: "CLASS_CHANGED",
        targetId: studentId,
        details: `Student ${studentId} class changed from ${oldClass} to ${newClass}.`,
        timestamp: new Date().toISOString(),
        module: "Students",
        systemAction: true,
      });
    } catch (error) {
      logger.error("Audit: Failed to log class changed:", { metadata: { error } });
    }
  });

  // 🎧 Listen for SECTION_CHANGED event
  eventBus.subscribe(EVENTS.SECTION_CHANGED, async (payload) => {
    try {
      const { tenantId, studentId, oldSection, newSection } = payload;
      await adminDb.collection("tenants").doc(tenantId).collection("audit_logs").add({
        action: "SECTION_CHANGED",
        targetId: studentId,
        details: `Student ${studentId} section changed from ${oldSection} to ${newSection}.`,
        timestamp: new Date().toISOString(),
        module: "Students",
        systemAction: true,
      });
    } catch (error) {
      logger.error("Audit: Failed to log section changed:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ADMISSION_APPROVED event
  eventBus.subscribe(EVENTS.ADMISSION_APPROVED, async (payload) => {
    try {
      const { tenantId, studentId, studentData } = payload;
      await adminDb.collection("tenants").doc(tenantId).collection("audit_logs").add({
        action: "ADMISSION_APPROVED",
        targetId: studentId,
        details: `Admission approved for ${studentData?.fullName || studentId} in class ${studentData?.classGrade || "N/A"}.`,
        timestamp: new Date().toISOString(),
        module: "Students",
        systemAction: true,
      });
    } catch (error) {
      logger.error("Audit: Failed to log admission approved:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ATTENDANCE_MARKED event
  eventBus.subscribe(EVENTS.ATTENDANCE_MARKED, async (payload) => {
    try {
      const { tenantId, attendanceId, studentId, date, status } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "ATTENDANCE_MARKED",
          targetId: attendanceId,
          details: `Attendance marked as ${status} for student ${studentId} on ${date}.`,
          timestamp: new Date().toISOString(),
          module: "Attendance",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log attendance marked event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ATTENDANCE_UPDATED event
  eventBus.subscribe(EVENTS.ATTENDANCE_UPDATED, async (payload) => {
    try {
      const { tenantId, attendanceId, updates } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "ATTENDANCE_UPDATED",
          targetId: attendanceId,
          details: `Attendance record updated: ${JSON.stringify(updates)}`,
          timestamp: new Date().toISOString(),
          module: "Attendance",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log attendance updated event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ATTENDANCE_DELETED event
  eventBus.subscribe(EVENTS.ATTENDANCE_DELETED, async (payload) => {
    try {
      const { tenantId, attendanceId, studentId } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "ATTENDANCE_DELETED",
          targetId: attendanceId,
          details: `Attendance record deleted for student ${studentId}.`,
          timestamp: new Date().toISOString(),
          module: "Attendance",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log attendance deleted event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ATTENDANCE_IMPORTED event
  eventBus.subscribe(EVENTS.ATTENDANCE_IMPORTED, async (payload) => {
    try {
      const { tenantId, recordCount, dates } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "ATTENDANCE_IMPORTED",
          details: `Bulk attendance imported: ${recordCount} records for dates: ${dates.join(", ")}.`,
          timestamp: new Date().toISOString(),
          module: "Attendance",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log attendance imported event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ASSIGNMENT_CREATED event
  eventBus.subscribe(EVENTS.ASSIGNMENT_CREATED, async (payload) => {
    try {
      const { tenantId, assignmentId, title, classGrade, subject } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "ASSIGNMENT_CREATED",
          targetId: assignmentId,
          details: `Assignment "${title}" created for class ${classGrade}, subject ${subject}.`,
          timestamp: new Date().toISOString(),
          module: "Teacher",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log assignment created event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ASSIGNMENT_DELETED event
  eventBus.subscribe(EVENTS.ASSIGNMENT_DELETED, async (payload) => {
    try {
      const { tenantId, assignmentId } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "ASSIGNMENT_DELETED",
          targetId: assignmentId,
          details: `Assignment ${assignmentId} was deleted.`,
          timestamp: new Date().toISOString(),
          module: "Teacher",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log assignment deleted event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for LESSON_PLAN_CREATED event
  eventBus.subscribe(EVENTS.LESSON_PLAN_CREATED, async (payload) => {
    try {
      const { tenantId, lessonPlanId, topic, date } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "LESSON_PLAN_CREATED",
          targetId: lessonPlanId,
          details: `Lesson plan "${topic}" created for date ${date}.`,
          timestamp: new Date().toISOString(),
          module: "Teacher",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log lesson plan created event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for BOOK_CREATED event
  eventBus.subscribe(EVENTS.BOOK_CREATED, async (payload) => {
    try {
      const { tenantId, bookId, title } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "BOOK_CREATED",
          targetId: bookId,
          details: `Book "${title}" added to library.`,
          timestamp: new Date().toISOString(),
          module: "Teacher",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log book created event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for BEHAVIOR_RECORDED event
  eventBus.subscribe(EVENTS.BEHAVIOR_RECORDED, async (payload) => {
    try {
      const { tenantId, studentId, points, reason } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "BEHAVIOR_RECORDED",
          targetId: studentId,
          details: `Behavior recorded for student ${studentId}: ${points} points - ${reason}.`,
          timestamp: new Date().toISOString(),
          module: "Teacher",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log behavior recorded event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for MARKS_ENTERED event
  eventBus.subscribe(EVENTS.MARKS_ENTERED, async (payload) => {
    try {
      const { tenantId, markId, studentId, subject, term, marksObtained, totalMarks } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "MARKS_ENTERED",
          targetId: markId,
          details: `Marks entered for student ${studentId}: ${marksObtained}/${totalMarks} in ${subject} (${term}).`,
          timestamp: new Date().toISOString(),
          module: "Examination",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log marks entered event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for MARKS_DELETED event
  eventBus.subscribe(EVENTS.MARKS_DELETED, async (payload) => {
    try {
      const { tenantId, markId, studentId, subject, term } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "MARKS_DELETED",
          targetId: markId,
          details: `Mark deleted for student ${studentId}: ${subject} (${term}).`,
          timestamp: new Date().toISOString(),
          module: "Examination",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log marks deleted event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for RESULT_PUBLISHED event
  eventBus.subscribe(EVENTS.RESULT_PUBLISHED, async (payload) => {
    try {
      const { tenantId, classGrade, section, term, studentCount, publishedBy } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "RESULT_PUBLISHED",
          details: `Results published for ${classGrade}-${section} (${term}): ${studentCount} students. Published by: ${publishedBy}.`,
          timestamp: new Date().toISOString(),
          module: "Examination",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log result published event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for QUIZ_CREATED event
  eventBus.subscribe(EVENTS.QUIZ_CREATED, async (payload) => {
    try {
      const { tenantId, quizId, title, classGrade, createdBy } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "QUIZ_CREATED",
          targetId: quizId,
          details: `Quiz "${title}" created for class ${classGrade} by ${createdBy}.`,
          timestamp: new Date().toISOString(),
          module: "Examination",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log quiz created event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for QUIZ_SUBMITTED event
  eventBus.subscribe(EVENTS.QUIZ_SUBMITTED, async (payload) => {
    try {
      const { tenantId, quizId, studentId, submissionId, percentage } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "QUIZ_SUBMITTED",
          targetId: submissionId,
          details: `Quiz ${quizId} submitted by student ${studentId}. Score: ${percentage}%.`,
          timestamp: new Date().toISOString(),
          module: "Examination",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log quiz submitted event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for QUIZ_DELETED event
  eventBus.subscribe(EVENTS.QUIZ_DELETED, async (payload) => {
    try {
      const { tenantId, quizId } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "QUIZ_DELETED",
          targetId: quizId,
          details: `Quiz ${quizId} was deleted.`,
          timestamp: new Date().toISOString(),
          module: "Examination",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log quiz deleted event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for HOMEWORK_CREATED event
  eventBus.subscribe(EVENTS.HOMEWORK_CREATED, async (payload) => {
    try {
      const { tenantId, homeworkId, title, classGrade, subject } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "HOMEWORK_CREATED",
          targetId: homeworkId,
          details: `Homework "${title}" created for class ${classGrade}, subject ${subject}.`,
          timestamp: new Date().toISOString(),
          module: "Academic",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log homework created event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for HOMEWORK_UPDATED event
  eventBus.subscribe(EVENTS.HOMEWORK_UPDATED, async (payload) => {
    try {
      const { tenantId, homeworkId, updates } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "HOMEWORK_UPDATED",
          targetId: homeworkId,
          details: `Homework ${homeworkId} updated: ${JSON.stringify(updates)}`,
          timestamp: new Date().toISOString(),
          module: "Academic",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log homework updated event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for HOMEWORK_DELETED event
  eventBus.subscribe(EVENTS.HOMEWORK_DELETED, async (payload) => {
    try {
      const { tenantId, homeworkId } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "HOMEWORK_DELETED",
          targetId: homeworkId,
          details: `Homework ${homeworkId} was deleted.`,
          timestamp: new Date().toISOString(),
          module: "Academic",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log homework deleted event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ASSIGNMENT_UPDATED event
  eventBus.subscribe(EVENTS.ASSIGNMENT_UPDATED, async (payload) => {
    try {
      const { tenantId, assignmentId, updates } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "ASSIGNMENT_UPDATED",
          targetId: assignmentId,
          details: `Assignment ${assignmentId} updated: ${JSON.stringify(updates)}`,
          timestamp: new Date().toISOString(),
          module: "Teacher",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log assignment updated event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ASSIGNMENT_SUBMITTED event
  eventBus.subscribe(EVENTS.ASSIGNMENT_SUBMITTED, async (payload) => {
    try {
      const { tenantId, assignmentId, studentId, submissionId } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "ASSIGNMENT_SUBMITTED",
          targetId: submissionId,
          details: `Assignment ${assignmentId} submitted by student ${studentId}.`,
          timestamp: new Date().toISOString(),
          module: "Teacher",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log assignment submitted event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for LESSON_PLAN_UPDATED event
  eventBus.subscribe(EVENTS.LESSON_PLAN_UPDATED, async (payload) => {
    try {
      const { tenantId, lessonPlanId, topic, date } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "LESSON_PLAN_UPDATED",
          targetId: lessonPlanId,
          details: `Lesson plan "${topic}" updated for date ${date}.`,
          timestamp: new Date().toISOString(),
          module: "Teacher",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log lesson plan updated event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for LESSON_PLAN_DELETED event
  eventBus.subscribe(EVENTS.LESSON_PLAN_DELETED, async (payload) => {
    try {
      const { tenantId, lessonPlanId } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "LESSON_PLAN_DELETED",
          targetId: lessonPlanId,
          details: `Lesson plan ${lessonPlanId} was deleted.`,
          timestamp: new Date().toISOString(),
          module: "Teacher",
          systemAction: true,
        });
    } catch (error) {
      logger.error("Audit: Failed to log lesson plan deleted event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for BUS_CREATED event
  eventBus.subscribe(EVENTS.BUS_CREATED, async (payload) => {
    try {
      const { tenantId, busId, busNumber, route } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "BUS_CREATED",
          targetId: busId,
          details: `Bus ${busNumber} (Route: ${route}) was added to the system.`,
          timestamp: new Date().toISOString(),
          module: "Transport",
          systemAction: true,
        });

      logger.info(`Audit: Bus created event logged for bus: ${busId}`);
    } catch (error) {
      logger.error("Audit: Failed to log bus created event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for BUS_UPDATED event
  eventBus.subscribe(EVENTS.BUS_UPDATED, async (payload) => {
    try {
      const { tenantId, busId, updates } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "BUS_UPDATED",
          targetId: busId,
          details: `Bus ${busId} was updated. Changes: ${JSON.stringify(updates)}`,
          timestamp: new Date().toISOString(),
          module: "Transport",
          systemAction: true,
        });

      logger.info(`Audit: Bus updated event logged for bus: ${busId}`);
    } catch (error) {
      logger.error("Audit: Failed to log bus updated event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for BUS_DELETED event
  eventBus.subscribe(EVENTS.BUS_DELETED, async (payload) => {
    try {
      const { tenantId, busId } = payload;

      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "BUS_DELETED",
          targetId: busId,
          details: `Bus ${busId} was removed from the system.`,
          timestamp: new Date().toISOString(),
          module: "Transport",
          systemAction: true,
        });

      logger.info(`Audit: Bus deleted event logged for bus: ${busId}`);
    } catch (error) {
      logger.error("Audit: Failed to log bus deleted event:", { metadata: { error } });
    }
  });

  // 🎧 Listen for PARENT_CREATED event
  eventBus.subscribe(EVENTS.PARENT_CREATED, async (payload) => {
    try {
      const { tenantId, parentId, email, studentIds, createdBy } = payload;
      await adminDb.collection("tenants").doc(tenantId).collection("audit_logs").add({
        action: "PARENT_CREATED",
        targetId: parentId,
        details: `Parent ${email} linked to ${studentIds?.length || 0} student(s). By: ${createdBy}.`,
        timestamp: new Date().toISOString(),
        module: "Parents",
        systemAction: true,
      });
    } catch (error) {
      logger.error("Audit: Failed to log parent created:", { metadata: { error } });
    }
  });

  // 🎧 Listen for PARENT_DELETED event
  eventBus.subscribe(EVENTS.PARENT_DELETED, async (payload) => {
    try {
      const { tenantId, parentId, deletedBy } = payload;
      await adminDb.collection("tenants").doc(tenantId).collection("audit_logs").add({
        action: "PARENT_DELETED",
        targetId: parentId,
        details: `Parent ${parentId} was removed. By: ${deletedBy}.`,
        timestamp: new Date().toISOString(),
        module: "Parents",
        systemAction: true,
      });
    } catch (error) {
      logger.error("Audit: Failed to log parent deleted:", { metadata: { error } });
    }
  });

  // 🎧 Listen for TIMETABLE_CREATED event
  eventBus.subscribe(EVENTS.TIMETABLE_CREATED, async (payload) => {
    try {
      const { tenantId, timetableId, day, period, subject, createdBy } = payload;
      await adminDb.collection("tenants").doc(tenantId).collection("audit_logs").add({
        action: "TIMETABLE_CREATED",
        targetId: timetableId,
        details: `Timetable entry created: ${subject} on day ${day}, period ${period}. By: ${createdBy}.`,
        timestamp: new Date().toISOString(),
        module: "Timetable",
        systemAction: true,
      });
    } catch (error) {
      logger.error("Audit: Failed to log timetable created:", { metadata: { error } });
    }
  });

  // 🎧 Listen for TIMETABLE_DELETED event
  eventBus.subscribe(EVENTS.TIMETABLE_DELETED, async (payload) => {
    try {
      const { tenantId, timetableId, deletedBy } = payload;
      await adminDb.collection("tenants").doc(tenantId).collection("audit_logs").add({
        action: "TIMETABLE_DELETED",
        targetId: timetableId,
        details: `Timetable entry ${timetableId} was deleted. By: ${deletedBy}.`,
        timestamp: new Date().toISOString(),
        module: "Timetable",
        systemAction: true,
      });
    } catch (error) {
      logger.error("Audit: Failed to log timetable deleted:", { metadata: { error } });
    }
  });

  // 🎧 Listen for VIDEO_CREATED event
  eventBus.subscribe(EVENTS.VIDEO_CREATED, async (payload) => {
    try {
      const { tenantId, videoId, title, createdBy } = payload;
      await adminDb.collection("tenants").doc(tenantId).collection("audit_logs").add({
        action: "VIDEO_CREATED",
        targetId: videoId,
        details: `Video lecture "${title}" created. By: ${createdBy}.`,
        timestamp: new Date().toISOString(),
        module: "Video Library",
        systemAction: true,
      });
    } catch (error) {
      logger.error("Audit: Failed to log video created:", { metadata: { error } });
    }
  });

  // 🎧 Listen for VIDEO_UPDATED event
  eventBus.subscribe(EVENTS.VIDEO_UPDATED, async (payload) => {
    try {
      const { tenantId, videoId, updatedBy } = payload;
      await adminDb.collection("tenants").doc(tenantId).collection("audit_logs").add({
        action: "VIDEO_UPDATED",
        targetId: videoId,
        details: `Video lecture ${videoId} was updated. By: ${updatedBy}.`,
        timestamp: new Date().toISOString(),
        module: "Video Library",
        systemAction: true,
      });
    } catch (error) {
      logger.error("Audit: Failed to log video updated:", { metadata: { error } });
    }
  });

  // 🎧 Listen for VIDEO_DELETED event
  eventBus.subscribe(EVENTS.VIDEO_DELETED, async (payload) => {
    try {
      const { tenantId, videoId, deletedBy } = payload;
      await adminDb.collection("tenants").doc(tenantId).collection("audit_logs").add({
        action: "VIDEO_DELETED",
        targetId: videoId,
        details: `Video lecture ${videoId} was deleted. By: ${deletedBy}.`,
        timestamp: new Date().toISOString(),
        module: "Video Library",
        systemAction: true,
      });
    } catch (error) {
      logger.error("Audit: Failed to log video deleted:", { metadata: { error } });
    }
  });

  // 🎧 Listen for FEE_DELETED event
  eventBus.subscribe(EVENTS.FEE_DELETED, async (payload) => {
    try {
      const { tenantId, feeId, studentId, deletedBy } = payload;
      await adminDb.collection("tenants").doc(tenantId).collection("audit_logs").add({
        action: "FEE_DELETED",
        targetId: feeId,
        details: `Fee record ${feeId} deleted for student ${studentId || "unknown"}. By: ${deletedBy}.`,
        timestamp: new Date().toISOString(),
        module: "Fees",
        systemAction: true,
      });
    } catch (error) {
      logger.error("Audit: Failed to log fee deleted:", { metadata: { error } });
    }
  });
}
