export const PERMISSIONS = {
  students: {
    view: "students.view",
    create: "students.create",
    update: "students.update",
    delete: "students.delete",
  },
  staff: {
    view: "staff.view",
    create: "staff.create",
    update: "staff.update",
    delete: "staff.delete",
  },
  fees: {
    view: "fees.view",
    create: "fees.create",
    update: "fees.update",
    delete: "fees.delete",
    collect: "fees.collect",
  },
  attendance: {
    view: "attendance.view",
    create: "attendance.create",
    update: "attendance.update",
    delete: "attendance.delete",
  },
  homework: {
    view: "homework.view",
    create: "homework.create",
    update: "homework.update",
    delete: "homework.delete",
  },
  settings: {
    view: "settings.view",
    update: "settings.update",
    manage: "settings.manage",
  }
  // ضرورت کے مطابق مزید modules یہاں شامل کریں...
} as const;

// Typescript Union Type (تاکہ پورے پروجیکٹ میں auto-complete اور strict checking ہو)
export type Permission = 
  | "students.view" | "students.create" | "students.update" | "students.delete"
  | "staff.view" | "staff.create" | "staff.update" | "staff.delete"
  | "fees.view" | "fees.create" | "fees.update" | "fees.delete" | "fees.collect"
  | "attendance.view" | "attendance.create" | "attendance.update" | "attendance.delete"
  | "homework.view" | "homework.create" | "homework.update" | "homework.delete"
  | "settings.view" | "settings.update" | "settings.manage";
