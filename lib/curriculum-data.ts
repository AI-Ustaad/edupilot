// lib/curriculum-data.ts

export type SchoolType = "federal" | "punjab" | "madrassa";

export type SchoolLevel =
  | "primary"
  | "elementary"
  | "secondary"
  | "higherSecondary"
  | "nazra"
  | "hifz"
  | "darsNizamiIbtidaiya"
  | "darsNizamiSanawiya"
  | "darsNizamiAaliya"
  | "darsNizamiAlmiya";

export interface CurriculumData {
  name: string;
  classes: string[];
  subjects: string[];
}

// ========== CLASSES RANGES (As per your requirement) ==========
const primaryClasses = ["Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];
const elementaryClasses = ["Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8"];
const secondaryClasses = ["Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
const higherSecondaryClasses = ["Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];

// ========== FEDERAL SUBJECTS ==========
const federalPrimarySubjects = [
  "English", "Urdu", "Mathematics", "Islamiat / Ethics", "General Science",
  "Social Studies", "Computer", "Drawing / Art", "Physical Education"
];
const federalElementarySubjects = [
  "English", "Urdu", "Mathematics", "Islamiat / Ethics", "General Science",
  "Computer Science", "Pakistan Studies", "Geography", "Arabic", "Physical Education"
];
const federalSecondarySubjects = [
  "English", "Urdu", "Islamiat", "Pakistan Studies", "Mathematics",
  "Physics", "Chemistry", "Biology", "Computer Science"
];
const federalHigherSecondarySubjects = [
  "English", "Urdu", "Islamiat", "Pakistan Studies", "Biology", "Chemistry", "Physics"
];

// ========== PUNJAB SUBJECTS ==========
const punjabPrimarySubjects = [
  "English", "Urdu", "Mathematics", "Islamiat", "General Science",
  "Social Studies", "Nazra Quran", "Computer", "Art & Drawing", "Physical Education"
];
const punjabElementarySubjects = [
  "English", "Urdu", "Mathematics", "General Science", "Islamiat",
  "Computer Science", "Pakistan Studies", "Geography", "Arabic", "Physical Education"
];
const punjabSecondarySubjects = [
  "English", "Urdu", "Islamiat", "Pakistan Studies", "Mathematics",
  "Physics", "Chemistry", "Biology", "Computer Science"
];

// ========== MADRASSA SUBJECTS ==========
const madrassaNazraSubjects = [
  "Quran (Nazra)", "Tajweed", "Basic Duas", "Islamic Manners", "Urdu", "Mathematics"
];
const madrassaHifzSubjects = [
  "Hifz-ul-Quran", "Tajweed", "Qiraat", "Islamic Studies", "Basic Urdu", "Basic Mathematics"
];
const madrassaIbtidaiyaSubjects = [
  "Arabic Grammar (Sarf/Nahw)", "Urdu", "English", "Mathematics", "Fiqh",
  "Tafseer", "Hadith (Usool)", "Islamic History", "Pakistan Studies", "Computer"
];
const madrassaSanawiyaSubjects = [
  "Arabic Literature", "Advanced Nahw/Sarf", "Fiqh", "Tafseer", "Hadith",
  "Urdu", "English", "Mathematics", "Pakistan Studies", "Islamiat", "Computer"
];
const madrassaAaliyaSubjects = [
  "Tafseer", "Hadith", "Fiqh", "Usool-e-Fiqh", "Arabic Literature",
  "Islamic Philosophy", "English", "Urdu", "Pakistan Studies", "Computer"
];
const madrassaAlmiyaSubjects = [
  "Advanced Tafseer", "Advanced Hadith", "Advanced Fiqh", "Usool-e-Tafseer",
  "Usool-e-Hadith", "Arabic Literature", "Islamic Economics", "Dawah Training",
  "English", "Urdu", "Computer"
];

// ========== CURRICULUM MAP ==========
export const curriculumMap: Record<SchoolType, Record<string, CurriculumData>> = {
  federal: {
    primary: { name: "Primary (Prep to Class 5)", classes: primaryClasses, subjects: federalPrimarySubjects },
    elementary: { name: "Elementary (Prep to Class 8)", classes: elementaryClasses, subjects: federalElementarySubjects },
    secondary: { name: "Secondary (Prep to Class 10)", classes: secondaryClasses, subjects: federalSecondarySubjects },
    higherSecondary: { name: "Higher Secondary (Prep to Class 12)", classes: higherSecondaryClasses, subjects: federalHigherSecondarySubjects },
  },
  punjab: {
    primary: { name: "Primary (Prep to Class 5)", classes: primaryClasses, subjects: punjabPrimarySubjects },
    elementary: { name: "Elementary (Prep to Class 8)", classes: elementaryClasses, subjects: punjabElementarySubjects },
    secondary: { name: "Secondary (Prep to Class 10)", classes: secondaryClasses, subjects: punjabSecondarySubjects },
    higherSecondary: { name: "Higher Secondary (Prep to Class 12)", classes: higherSecondaryClasses, subjects: punjabSecondarySubjects },
  },
  madrassa: {
    nazra: { name: "Nazra (Primary Level)", classes: ["Nazra"], subjects: madrassaNazraSubjects },
    hifz: { name: "Hifz (Primary/Middle Level)", classes: ["Hifz"], subjects: madrassaHifzSubjects },
    darsNizamiIbtidaiya: { name: "Dars-e-Nizami (Ibtidaiya) - Middle", classes: ["Ibtidaiya 1", "Ibtidaiya 2", "Ibtidaiya 3", "Ibtidaiya 4", "Ibtidaiya 5"], subjects: madrassaIbtidaiyaSubjects },
    darsNizamiSanawiya: { name: "Dars-e-Nizami (Sanawiya Amma) - Secondary", classes: ["Sanawiya Amma 1", "Sanawiya Amma 2"], subjects: madrassaSanawiyaSubjects },
    darsNizamiAaliya: { name: "Dars-e-Nizami (Aaliya) - Intermediate", classes: ["Aaliya 1", "Aaliya 2"], subjects: madrassaAaliyaSubjects },
    darsNizamiAlmiya: { name: "Dars-e-Nizami (Almiya) - Bachelor/Master", classes: ["Almiya 1", "Almiya 2", "Almiya 3", "Almiya 4"], subjects: madrassaAlmiyaSubjects },
  },
};

export const schoolTypes = [
  { id: "federal", label: "Federal Govt (Federal Board)" },
  { id: "punjab", label: "Punjab Govt (Punjab Board)" },
  { id: "madrassa", label: "Madrassa (Wifaq ul Madaris)" },
];

export const getLevelsForSchoolType = (type: SchoolType) => {
  if (type === "madrassa") {
    return [
      { id: "nazra", label: "Nazra (ناظرہ) - Primary Level" },
      { id: "hifz", label: "Hifz (حفظ) - Primary/Middle Level" },
      { id: "darsNizamiIbtidaiya", label: "Dars-e-Nizami (ابتدائیہ) - Middle" },
      { id: "darsNizamiSanawiya", label: "Dars-e-Nizami (ثانویہ عامہ) - Secondary" },
      { id: "darsNizamiAaliya", label: "Dars-e-Nizami (عالیہ) - Intermediate" },
      { id: "darsNizamiAlmiya", label: "Dars-e-Nizami (عالمیہ) - Bachelor/Master" },
    ];
  }
  return [
    { id: "primary", label: "Primary (Prep to Class 5)" },
    { id: "elementary", label: "Elementary (Prep to Class 8)" },
    { id: "secondary", label: "Secondary (Prep to Class 10)" },
    { id: "higherSecondary", label: "Higher Secondary (Prep to Class 12)" },
  ];
};
