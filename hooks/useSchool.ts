"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface Section {
  classGrade: string;
  sectionName: string;
  incharge?: string;
}

interface Student {
  id: string;
  fullName?: string;
  name?: string;
  rollNumber: number;
  classGrade: string;
  section: string;
}

export function useSchool() {
  const { user } = useAuth();
  if (!user) {
    throw new Error("User not loaded");
  }

  const schoolId = user.tenantId;
  const role = user.role;

  // Cascading data state
  const [classes, setClasses] = useState<string[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Step 1: Fetch settings once
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setClasses(data.classes || []);
        setAllSections(data.sections || []);
      })
      .catch(console.error)
      .finally(() => setLoadingSettings(false));
  }, []);

  // Step 2: Filter sections when class changes
  useEffect(() => {
    if (!selectedClass) {
      setFilteredSections([]);
      setSelectedSection("");
      setStudents([]);
      return;
    }
    const filtered = allSections.filter((s) => s.classGrade === selectedClass);
    setFilteredSections(filtered);
    setSelectedSection(""); // reset section
    setStudents([]);
  }, [selectedClass, allSections]);

  // Step 3: Fetch students when class & section are selected
  useEffect(() => {
    if (!selectedClass || !selectedSection) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    fetch(
      `/api/students?classGrade=${encodeURIComponent(selectedClass)}&section=${encodeURIComponent(selectedSection)}`
    )
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data || [];
        setStudents(list);
      })
      .catch(console.error)
      .finally(() => setLoadingStudents(false));
  }, [selectedClass, selectedSection]);

  return {
    schoolId,
    role,
    classes,
    sections: filteredSections,        // only sections of selected class
    students,
    selectedClass,
    setSelectedClass,
    selectedSection,
    setSelectedSection,
    loadingSettings,
    loadingStudents,
    resetSelections: () => {
      setSelectedClass("");
      setSelectedSection("");
      setStudents([]);
    },
  };
}
