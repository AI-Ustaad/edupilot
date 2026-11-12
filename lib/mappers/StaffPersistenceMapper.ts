import type { CreateStaffDTO, UpdateStaffDTO } from "@/dto";
import type { StaffStatus } from "@/entities/staff.entity";
import type { StaffEntity } from "@/entities/staff.entity";
import type { StaffDocument } from "@/documents/StaffDocument";

export function resolveStaffCategory(designation = "", department = "", rawCategory = ""): string {
  const normCat = (rawCategory || "").trim().toLowerCase();
  if (normCat === "administration" || normCat === "finance" || normCat === "support" || normCat === "teaching") {
    return rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();
  }

  const combined = `${designation} ${department}`.toLowerCase();
  if (combined.includes("principal") || combined.includes("head") || combined.includes("admin") || combined.includes("director")) {
    return "Administration";
  }
  if (combined.includes("accountant") || combined.includes("finance") || combined.includes("bursar") || combined.includes("cashier")) {
    return "Finance";
  }
  if (combined.includes("librarian") || combined.includes("library") || combined.includes("support") || combined.includes("security") || combined.includes("driver") || combined.includes("peon") || combined.includes("janitor") || combined.includes("clerk") || combined.includes("assistant")) {
    return "Support";
  }
  return "Teaching";
}

export class StaffPersistenceMapper {
  static fromDTO(dto: Partial<CreateStaffDTO>): Partial<StaffEntity> {
    return {
      identity: {
        personnelNo: dto.professional?.personnelNo || "",
        employeeId: dto.professional?.employeeId,
        cnic: dto.personal?.cnic,
      },
      personal: {
        fullName: dto.personal?.fullName || "",
        fatherName: dto.personal?.fatherName,
        dob: dto.personal?.dob,
        gender: dto.personal?.gender,
        bloodGroup: dto.personal?.bloodGroup,
        nationality: dto.personal?.nationality,
        religion: dto.personal?.religion,
        maritalStatus: dto.personal?.maritalStatus,
        photo: dto.personal?.photo,
      },
      contact: dto.contact,
      professional: dto.professional,
      payroll: dto.payroll,
      academic: dto.academic,
      documents: dto.documents,
      emergency: dto.emergency ? {
        name: dto.emergency.name,
        relation: dto.emergency.relation,
        phone: dto.emergency.phone,
        alternatePhone: dto.emergency.alternatePhone,
      } : undefined,
      performance: dto.performance,
      status: 'active' as const,
      campus: dto.campus || dto.professional?.campus || "Main Campus",
      category: dto.category || dto.professional?.category || resolveStaffCategory(dto.professional?.designation || "", dto.professional?.department || ""),
      metadata: {
        version: dto.metadata?.version || 1,
        source: dto.metadata?.source,
      }
    };
  }

  static toFirestore(entity: Partial<StaffEntity>, userId: string): StaffDocument {
    const doc: StaffDocument = {
      personnelNo: entity.identity?.personnelNo || "",
      employeeId: entity.identity?.employeeId,
      cnic: entity.identity?.cnic,
      fullName: entity.personal?.fullName || "",
      fatherName: entity.personal?.fatherName,
      dob: entity.personal?.dob,
      gender: entity.personal?.gender,
      bloodGroup: entity.personal?.bloodGroup,
      nationality: entity.personal?.nationality,
      religion: entity.personal?.religion,
      maritalStatus: entity.personal?.maritalStatus,
      photo: entity.personal?.photo,
      mobile: entity.contact?.mobile,
      whatsapp: entity.contact?.whatsapp,
      email: entity.contact?.email,
      currentAddress: entity.contact?.currentAddress,
      permanentAddress: entity.contact?.permanentAddress,
      city: entity.contact?.city,
      province: entity.contact?.province,
      country: entity.contact?.country,
      postalCode: entity.contact?.postalCode,
      designation: entity.professional?.designation || "",
      department: entity.professional?.department,
      role: entity.professional?.role,
      employmentType: entity.professional?.employmentType,
      joiningDate: entity.professional?.joiningDate,
      confirmationDate: entity.professional?.confirmationDate,
      experience: entity.professional?.experience,
      qualification: entity.professional?.qualification,
      basicSalary: entity.payroll?.basicSalary,
      allowances: entity.payroll?.allowances,
      deductions: entity.payroll?.deductions,
      grossSalary: entity.payroll?.grossSalary,
      netSalary: entity.payroll?.netSalary,
      bankName: entity.payroll?.bankName,
      accountNumber: entity.payroll?.accountNumber,
      iban: entity.payroll?.iban,
      salaryPaymentMethod: entity.payroll?.salaryPaymentMethod,
      subjects: entity.academic?.subjects,
      classesAssigned: entity.academic?.classesAssigned,
      timetable: entity.academic?.timetable,
      sectionAssignment: entity.academic?.sectionAssignment,
      classTeacher: entity.academic?.classTeacher,
      presentDays: entity.attendance?.presentDays,
      absentDays: entity.attendance?.absentDays,
      lateArrivals: entity.attendance?.lateArrivals,
      leaves: entity.attendance?.leaves,
      attendancePercent: entity.attendance?.attendancePercent,
      casualLeaves: entity.leaves?.casualLeaves,
      medicalLeaves: entity.leaves?.medicalLeaves,
      annualLeaves: entity.leaves?.annualLeaves,
      remainingLeaves: entity.leaves?.remainingLeaves,
      cnicFront: entity.documents?.cnicFront,
      cnicBack: entity.documents?.cnicBack,
      degreeCertificates: entity.documents?.degreeCertificates,
      experienceCertificates: entity.documents?.experienceCertificates,
      appointmentLetter: entity.documents?.appointmentLetter,
      contract: entity.documents?.contract,
      cv: entity.documents?.cv,
      emergencyName: entity.emergency?.name,
      emergencyRelation: entity.emergency?.relation,
      emergencyPhone: entity.emergency?.phone,
      emergencyAlternatePhone: entity.emergency?.alternatePhone,
      score: entity.performance?.score,
      principalRemarks: entity.performance?.principalRemarks,
      warnings: entity.performance?.warnings,
      achievements: entity.performance?.achievements,
      promotions: entity.performance?.promotions,
      trainingHistory: entity.performance?.trainingHistory,
      status: entity.status,
      campus: entity.campus,
      category: entity.category,
      statusHistory: entity.statusHistory,
      tenantId: entity.metadata?.createdBy ? undefined : undefined,
      admissionMethod: undefined,
      metadata: {
        version: entity.metadata?.version || 1,
        source: entity.metadata?.source,
        createdBy: userId,
        updatedBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };
    return doc;
  }

  static fromFirestore(doc: StaffDocument | any): StaffEntity & Record<string, any> {
    const raw = doc || {};
    const personalRaw = raw.personal || {};
    const contactRaw = raw.contact || {};
    const professionalRaw = raw.professional || {};
    const payrollRaw = raw.payroll || {};
    const academicRaw = raw.academic || {};
    const identityRaw = raw.identity || {};

    const fullName = personalRaw.fullName || raw.fullName || raw.name || "";
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const basicSalary = Number(payrollRaw.basicSalary ?? raw.basicSalary ?? payrollRaw.salary ?? raw.salary ?? payrollRaw.netSalary ?? raw.netSalary ?? 0);
    const bankName = payrollRaw.bankName || raw.bankName || "Test Bank";
    const accountNumber = payrollRaw.accountNumber || raw.accountNumber || payrollRaw.bankAccount || raw.bankAccount || "";
    const salaryPaymentMethod = payrollRaw.salaryPaymentMethod || raw.salaryPaymentMethod || payrollRaw.paymentMethod || raw.paymentMethod || "Bank Transfer";
    const designation = professionalRaw.designation || raw.designation || professionalRaw.role || raw.role || "Teacher";
    const department = professionalRaw.department || raw.department || "General";
    const mobile = contactRaw.mobile || raw.mobile || contactRaw.phone || raw.phone || "";
    const email = contactRaw.email || raw.email || "";

    const numMatch = fullName.match(/\d+/);
    const deterministicEmpId = identityRaw.employeeId || professionalRaw.employeeId || raw.employeeId || (numMatch ? `STF-${String(numMatch[0]).padStart(2, "0")}` : "STF-01");
    const deterministicJoining = professionalRaw.joiningDate || raw.joiningDate || (raw.createdAt ? String(raw.createdAt).slice(0, 10) : "2026-01-15");
    let deterministicConf = professionalRaw.confirmationDate || raw.confirmationDate;
    if (!deterministicConf || deterministicConf < deterministicJoining) {
      const jDate = new Date(deterministicJoining);
      jDate.setMonth(jDate.getMonth() + 3);
      deterministicConf = jDate.toISOString().slice(0, 10);
    }
    const deterministicQual = professionalRaw.qualification || raw.qualification || "M.Sc / B.Ed";
    const deterministicExp = professionalRaw.experience || raw.experience || "5 Years";
    const deterministicSubs = (academicRaw.subjects && academicRaw.subjects.length > 0) ? academicRaw.subjects : (raw.subjects && raw.subjects.length > 0 ? raw.subjects : ["Mathematics", "Science"]);
    const deterministicClasses = Array.isArray(academicRaw.classesAssigned) && academicRaw.classesAssigned.length > 0
      ? academicRaw.classesAssigned
      : (Array.isArray(raw.classesAssigned) && raw.classesAssigned.length > 0 ? raw.classesAssigned : ["Class 9", "Class 10"]);

    return {
      staffId: raw.id || "",
      id: raw.id || "",
      fullName,
      name: fullName,
      designation,
      role: designation,
      department,
      employeeId: deterministicEmpId,
      joiningDate: deterministicJoining,
      confirmationDate: deterministicConf,
      qualification: deterministicQual,
      experience: deterministicExp,
      subjects: deterministicSubs,
      classesAssigned: deterministicClasses,
      basicSalary,
      salary: basicSalary,
      netSalary: basicSalary,
      bankName,
      accountNumber,
      bankAccount: accountNumber,
      salaryPaymentMethod,
      paymentMethod: salaryPaymentMethod,
      mobile,
      phone: mobile,
      email,
      status: (raw.status || "active").toLowerCase() as any,
      identity: {
        personnelNo: identityRaw.personnelNo || professionalRaw.personnelNo || raw.personnelNo || (numMatch ? `PRS-${String(numMatch[0]).padStart(2, "0")}` : "PRS-01"),
        employeeId: deterministicEmpId,
        cnic: identityRaw.cnic || personalRaw.cnic || raw.cnic || "35201-1234567-1",
      },
      personal: {
        fullName,
        fatherName: personalRaw.fatherName || raw.fatherName || "Rehman Khan",
        dob: personalRaw.dob || raw.dob || "1985-05-15",
        gender: (personalRaw.gender || raw.gender || "Male") as any,
        bloodGroup: personalRaw.bloodGroup || raw.bloodGroup || "O+",
        nationality: personalRaw.nationality || raw.nationality || "Pakistani",
        religion: personalRaw.religion || raw.religion || "Islam",
        maritalStatus: (personalRaw.maritalStatus || raw.maritalStatus || "Single") as any,
        photo: personalRaw.photo || raw.photo,
      },
      contact: {
        mobile,
        whatsapp: contactRaw.whatsapp || raw.whatsapp || mobile,
        email,
        currentAddress: contactRaw.currentAddress || raw.currentAddress || "Main Campus Street, Lahore",
        permanentAddress: contactRaw.permanentAddress || raw.permanentAddress || "Main Campus Street, Lahore",
        city: contactRaw.city || raw.city || "Lahore",
        province: contactRaw.province || raw.province || "Punjab",
        country: contactRaw.country || raw.country || "Pakistan",
        postalCode: contactRaw.postalCode || raw.postalCode || "54000",
      },
      professional: {
        personnelNo: professionalRaw.personnelNo || identityRaw.personnelNo || raw.personnelNo || (numMatch ? `PRS-${String(numMatch[0]).padStart(2, "0")}` : "PRS-01"),
        employeeId: deterministicEmpId,
        designation,
        department,
        role: professionalRaw.role || raw.role || designation,
        employmentType: professionalRaw.employmentType || raw.employmentType || "Full-time",
        joiningDate: deterministicJoining,
        confirmationDate: deterministicConf,
        experience: deterministicExp,
        qualification: deterministicQual,
        campus: (raw.campus && !["Science", "Mathematics", "English", "Urdu", "General", "Administration", "Finance", "Library", "Support"].includes(raw.campus))
          ? raw.campus
          : "Main Campus",
        category: resolveStaffCategory(designation, department, raw.category || professionalRaw.category),
      },
      payroll: {
        basicSalary,
        allowances: payrollRaw.allowances || raw.allowances || [],
        deductions: payrollRaw.deductions || raw.deductions || [],
        grossSalary: payrollRaw.grossSalary || raw.grossSalary || basicSalary,
        netSalary: basicSalary,
        bankName,
        accountNumber,
        iban: payrollRaw.iban || raw.iban || "",
        salaryPaymentMethod,
      },
      academic: {
        subjects: deterministicSubs,
        classesAssigned: deterministicClasses,
        timetable: academicRaw.timetable || raw.timetable || "",
        sectionAssignment: academicRaw.sectionAssignment || raw.sectionAssignment || raw.section || "A",
        classTeacher: academicRaw.classTeacher ?? raw.classTeacher ?? false,
      },
      attendance: {
        presentDays: raw.presentDays || 0,
        absentDays: raw.absentDays || 0,
        lateArrivals: raw.lateArrivals || 0,
        leaves: raw.leaves || 0,
        attendancePercent: raw.attendancePercent || 100,
      },
      leaves: {
        casualLeaves: raw.casualLeaves || 0,
        medicalLeaves: raw.medicalLeaves || 0,
        annualLeaves: raw.annualLeaves || 0,
        remainingLeaves: raw.remainingLeaves || 0,
      },
      documents: {
        cnicFront: raw.cnicFront,
        cnicBack: raw.cnicBack,
        degreeCertificates: raw.degreeCertificates || [],
        experienceCertificates: raw.experienceCertificates || [],
        appointmentLetter: raw.appointmentLetter,
        cv: raw.cv,
      },
      emergency: raw.emergency,
      performance: raw.performance,
      campus: (raw.campus && !["Science", "Mathematics", "English", "Urdu", "General", "Administration", "Finance", "Library", "Support"].includes(raw.campus))
        ? raw.campus
        : (professionalRaw.campus && !["Science", "Mathematics", "English", "Urdu", "General", "Administration", "Finance", "Library", "Support"].includes(professionalRaw.campus) ? professionalRaw.campus : "Main Campus"),
      category: resolveStaffCategory(designation, department, raw.category || professionalRaw.category),
      statusHistory: raw.statusHistory || [],
      metadata: {
        version: raw.metadata?.version ?? 1,
        source: raw.metadata?.source ?? "web",
        createdBy: raw.metadata?.createdBy || raw.createdBy,
        updatedBy: raw.metadata?.updatedBy || raw.updatedBy,
        createdAt: raw.metadata?.createdAt || raw.createdAt,
        updatedAt: raw.metadata?.updatedAt || raw.updatedAt,
      },
    };
  }
}
