// education/catalog/data/pakistan.catalog.ts
import { Country, Subject } from "../types.catalog";

export const PAKISTAN_SUBJECTS: Subject[] = [
  { id: "eng", name: "English", code: "ENG", department: "Languages", requiresLab: false },
  { id: "urd", name: "Urdu", code: "URD", department: "Languages", requiresLab: false },
  { id: "math", name: "Mathematics", code: "MTH", department: "Sciences", requiresLab: false },
  { id: "gk", name: "General Knowledge", code: "GK", department: "Humanities", requiresLab: false },
  { id: "sci", name: "General Science", code: "SCI", department: "Sciences", requiresLab: true },
  { id: "phy", name: "Physics", code: "PHY", department: "Sciences", requiresLab: true },
  { id: "chem", name: "Chemistry", code: "CHM", department: "Sciences", requiresLab: true },
  { id: "bio", name: "Biology", code: "BIO", department: "Sciences", requiresLab: true },
  { id: "cs", name: "Computer Science", code: "CS", department: "Computer Science", requiresLab: true },
  { id: "isl", name: "Islamiyat", code: "ISL", department: "Religious", requiresLab: false },
  { id: "pst", name: "Pakistan Studies", code: "PST", department: "Humanities", requiresLab: false },
  { id: "ss", name: "Social Studies", code: "SST", department: "Humanities", requiresLab: false },
  { id: "nazra", name: "Nazra Quran", code: "NZR", department: "Religious", requiresLab: false },
  { id: "tajweed", name: "Tajweed", code: "TJW", department: "Religious", requiresLab: false },
  { id: "duas", name: "Daily Duas", code: "DUAS", department: "Religious", requiresLab: false },
  { id: "quran", name: "Quran (Hifz/Tafseer)", code: "QRN", department: "Religious", requiresLab: false },
  { id: "fiqh", name: "Fiqh", code: "FQH", department: "Religious", requiresLab: false },
  { id: "arabic_lang", name: "Arabic Language", code: "ARA", department: "Languages", requiresLab: false },
  { id: "hadith", name: "Hadith", code: "HDT", department: "Religious", requiresLab: false },
];

export const PAKISTAN_CATALOG: Country = {
  id: "pk",
  name: "Pakistan",
  code: "PK",
  Provinces: [
    { id: "punjab", name: "Punjab", countryId: "pk" },
    { id: "sindh", name: "Sindh", countryId: "pk" },
    { id: "kpk", name: "Khyber Pakhtunkhwa", countryId: "pk" },
    { id: "balochistan", name: "Balochistan", countryId: "pk" },
  ],
  // @ts-ignore
  authorities: [
    // 1. Punjab Government (Public School)
    {
      id: "punjab_gov",
      name: "Punjab Government (PCTB)",
      countryId: "pk",
      provinceId: "punjab",
      ownershipType: "Public",
      institutionType: "School",
      systems: [
        {
          id: "pctb_snc",
          name: "Single National Curriculum (SNC)",
          type: "National",
          versions: [
            {
              id: "snc_2024",
              name: "SNC 2024",
              year: "2024",
              levels: [
                { id: "primary", name: "Primary", grades: [
                  { id: "grade_1", name: "Grade 1", order: 1, levelId: "primary", schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "math", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "gk", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "isl", category: "Compulsory", defaultPeriods: 3 }, { subjectId: "nazra", category: "Compulsory", defaultPeriods: 3 }] } },
                  { id: "grade_5", name: "Grade 5", order: 5, levelId: "primary", schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "math", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "sci", category: "Compulsory", defaultPeriods: 5 }, { subjectId: "ss", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "isl", category: "Compulsory", defaultPeriods: 3 }, { subjectId: "nazra", category: "Compulsory", defaultPeriods: 3 }] } }
                ]},
                { id: "elementary", name: "Elementary (Middle)", grades: [
                  { id: "grade_6", name: "Grade 6", order: 6, levelId: "elementary", schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "math", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "sci", category: "Compulsory", defaultPeriods: 5 }, { subjectId: "ss", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "cs", category: "Compulsory", defaultPeriods: 3 }, { subjectId: "isl", category: "Compulsory", defaultPeriods: 3 }] } },
                  { id: "grade_7", name: "Grade 7", order: 7, levelId: "elementary", schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "math", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "sci", category: "Compulsory", defaultPeriods: 5 }, { subjectId: "ss", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "cs", category: "Compulsory", defaultPeriods: 3 }, { subjectId: "isl", category: "Compulsory", defaultPeriods: 3 }] } },
                  { id: "grade_8", name: "Grade 8", order: 8, levelId: "elementary", schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "math", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "sci", category: "Compulsory", defaultPeriods: 5 }, { subjectId: "ss", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "cs", category: "Compulsory", defaultPeriods: 3 }, { subjectId: "isl", category: "Compulsory", defaultPeriods: 3 }] } }
                ]},
                { id: "secondary", name: "Secondary", grades: [
                  { id: "grade_9", name: "Grade 9", order: 9, levelId: "secondary", schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "math", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "phy", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "chem", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "bio", category: "Elective", defaultPeriods: 4 }, { subjectId: "cs", category: "Elective", defaultPeriods: 4 }, { subjectId: "isl", category: "Compulsory", defaultPeriods: 3 }] } },
                  { id: "grade_10", name: "Grade 10", order: 10, levelId: "secondary", schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "math", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "phy", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "chem", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "bio", category: "Elective", defaultPeriods: 4 }, { subjectId: "cs", category: "Elective", defaultPeriods: 4 }, { subjectId: "pst", category: "Compulsory", defaultPeriods: 3 }] } }
                ]},
                { id: "higher_secondary", name: "Higher Secondary", grades: [
                  { id: "grade_11", name: "Grade 11", order: 11, levelId: "higher_secondary", schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "phy", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "chem", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "bio", category: "Elective", defaultPeriods: 6 }, { subjectId: "cs", category: "Elective", defaultPeriods: 6 }, { subjectId: "isl", category: "Compulsory", defaultPeriods: 3 }] } },
                  { id: "grade_12", name: "Grade 12", order: 12, levelId: "higher_secondary", schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "phy", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "chem", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "bio", category: "Elective", defaultPeriods: 6 }, { subjectId: "cs", category: "Elective", defaultPeriods: 6 }, { subjectId: "pst", category: "Compulsory", defaultPeriods: 3 }] } }
                ]}
              ]
            }
          ]
        }
      ]
    },
    // 🚀 NEW: 2. Private Schools (SNC Based)
    {
      id: "private_snc_pk",
      name: "Private School (SNC Based)",
      countryId: "pk",
      ownershipType: "Private",
      institutionType: "School",
      systems: [
        {
          id: "private_snc_sys",
          name: "Private SNC Curriculum",
          type: "National",
          versions: [
            {
              id: "pvt_snc_2024",
              name: "Private SNC 2024",
              year: "2024",
              levels: [
                { id: "primary", name: "Primary", grades: [
                  { id: "pvt_g1", name: "Class 1", order: 1, levelId: "primary", schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "math", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "gk", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "isl", category: "Compulsory", defaultPeriods: 3 }] } }
                ]},
                { id: "secondary", name: "Secondary", grades: [
                  { id: "pvt_g9", name: "Class 9", order: 9, levelId: "secondary", schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "math", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "phy", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "chem", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "bio", category: "Elective", defaultPeriods: 4 }, { subjectId: "cs", category: "Elective", defaultPeriods: 4 }] } }
                ]}
              ]
            }
          ]
        }
      ]
    },
    // 🚀 NEW: 3. Cambridge International (Private)
    {
      id: "cambridge_pk",
      name: "Cambridge International (Pakistan)",
      countryId: "pk",
      ownershipType: "Private",
      institutionType: "School",
      systems: [
        {
          id: "cambridge_cie",
          name: "Cambridge Assessment International Education",
          type: "International",
          versions: [
            {
              id: "cam_2023",
              name: "Cambridge 2023",
              year: "2023",
              levels: [
                { id: "primary", name: "Cambridge Primary", grades: [
                  { id: "cam_p1", name: "Stage 1", order: 1, levelId: "primary", schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Core", defaultPeriods: 6 }, { subjectId: "math", category: "Core", defaultPeriods: 6 }, { subjectId: "sci", category: "Core", defaultPeriods: 5 }, { subjectId: "cs", category: "Core", defaultPeriods: 3 }] } }
                ]},
                { id: "igcse", name: "IGCSE", grades: [
                  { id: "year_10", name: "Year 10", order: 10, levelId: "igcse", schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Core", defaultPeriods: 5 }, { subjectId: "math", category: "Core", defaultPeriods: 5 }, { subjectId: "phy", category: "Core", defaultPeriods: 4 }, { subjectId: "chem", category: "Core", defaultPeriods: 4 }, { subjectId: "bio", category: "Core", defaultPeriods: 4 }, { subjectId: "cs", category: "Core", defaultPeriods: 3 }] } }
                ]}
              ]
            }
          ]
        }
      ]
    },
    // 4. Wifaq-ul-Madaris (Madrassah)
    {
      id: "wifaq_ul_madaris",
      name: "Wifaq-ul-Madaris Al-Arabia Pakistan",
      countryId: "pk",
      ownershipType: "Private",
      institutionType: "Madrassah",
      madrassahCategory: "Dars-e-Nizami",
      systems: [
        {
          id: "wifaq_dars_e_nizami",
          name: "Dars-e-Nizami (Aalim Course)",
          type: "Religious",
          versions: [
            {
              id: "dars_2024",
              name: "Dars-e-Nizami 2024",
              year: "2024",
              levels: [
                { id: "foundation", name: "Foundation (Nazra)", grades: [
                  { id: "nazra_1", name: "Nazra Level 1", order: 1, levelId: "foundation", schemeOfStudy: { subjects: [{ subjectId: "nazra", category: "Core", defaultPeriods: 8 }, { subjectId: "tajweed", category: "Core", defaultPeriods: 4 }, { subjectId: "duas", category: "Core", defaultPeriods: 2 }] } }
                ]},
                { id: "mutawassitah", name: "Mutawassitah", grades: [
                  { id: "mut_1", name: "Mutawassitah Year 1", order: 2, levelId: "mutawassitah", schemeOfStudy: { subjects: [{ subjectId: "quran", category: "Core", defaultPeriods: 6 }, { subjectId: "fiqh", category: "Core", defaultPeriods: 6 }, { subjectId: "arabic_lang", category: "Core", defaultPeriods: 4 }, { subjectId: "hadith", category: "Core", defaultPeriods: 3 }] } }
                ]}
              ]
            }
          ]
        }
      ]
    }
  ]
};
