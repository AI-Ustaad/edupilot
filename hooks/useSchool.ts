// hooks/useSchool.ts
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface Section {
  classGrade: string;
  sectionName: string;
}

interface Student {
  id: string;
  name?: string;
  fullName?: string;
  rollNumber: number;
  classGrade: string;
  section: string;
}

export function useSchool() {
  const { user } = useAuth();
  const schoolId = user?.tenantId;
  const role = user?.role;

  const [classes, setClasses] = useState<string[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        const rawClasses = json.data?.classes || json.classes || [];
        
        // صرف کلاسز کے نام نکالیں
        const flatClasses = rawClasses.map((c: any) => typeof c === 'string' ? c : c.name);
        setClasses(flatClasses);

        // سیکشنز کو الگ کر کے ترتیب دیں
        const flatSections: Section[] = [];
        rawClasses.forEach((c: any) => {
          if (c.name && c.sections && Array.isArray(c.sections)) {
            c.sections.forEach((sec: string) => {
              flatSections.push({ classGrade: c.name, sectionName: sec });
            });
          }
        });
        setAllSections(flatSections);
      })
      .catch(console.error)
      .finally(() => setLoadingSettings(false));
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setFilteredSections([]);
      setSelectedSection("");
      return;
    }
    const filtered = allSections.filter((s) => s.classGrade === selectedClass);
    setFilteredSections(filtered);
    setSelectedSection("");
  }, [selectedClass, allSections]);

  useEffect(() => {
    if (!selectedClass || !selectedSection) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    fetch(`/api/students?classGrade=${encodeURIComponent(selectedClass)}&section=${encodeURIComponent(selectedSection)}`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data || [];
        setStudents(list);
      })
      .catch(console.error)
      .finally(() => setLoadingStudents(false));
  }, [selectedClass, selectedSection]);

  return {
    schoolId, role, classes, sections: filteredSections, students,
    selectedClass, setSelectedClass, selectedSection, setSelectedSection,
    loadingSettings, loadingStudents,
  };
}
