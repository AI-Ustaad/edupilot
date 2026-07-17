export const CURRICULUMS = [
  {
    id: "punjab", // 🟢 Backend relies on this exact ID
    name: "Punjab Single National Curriculum (SNC)",
    levels: {
      early_childhood: [
        { name: "Playgroup", subjects: [{ name: "ECCE", type: "Compulsory" }] },
        { name: "Nursery", subjects: [{ name: "English Phonics", type: "Compulsory" }, { name: "Urdu Huroof", type: "Compulsory" }, { name: "Basic Math", type: "Compulsory" }] },
        { name: "Prep (KG)", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "Nazra Quran", type: "Compulsory" }] }
      ],
      primary: [
        { name: "Class 1", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "General Knowledge", type: "Compulsory" }, { name: "Islamiyat", type: "Compulsory" }] },
        { name: "Class 2", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "General Knowledge", type: "Compulsory" }, { name: "Islamiyat", type: "Compulsory" }] },
        { name: "Class 3", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "General Knowledge", type: "Compulsory" }, { name: "Islamiyat", type: "Compulsory" }] },
        { name: "Class 4", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "General Science", type: "Compulsory" }, { name: "Social Studies", type: "Compulsory" }, { name: "Islamiyat", type: "Compulsory" }] },
        { name: "Class 5", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "General Science", type: "Compulsory" }, { name: "Social Studies", type: "Compulsory" }, { name: "Islamiyat", type: "Compulsory" }] }
      ],
      middle: [
        { name: "Class 6", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "General Science", type: "Compulsory" }, { name: "History & Geo", type: "Compulsory" }, { name: "Computer", type: "Compulsory" }, { name: "Islamiyat", type: "Compulsory" }] },
        { name: "Class 7", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "General Science", type: "Compulsory" }, { name: "History & Geo", type: "Compulsory" }, { name: "Computer", type: "Compulsory" }, { name: "Islamiyat", type: "Compulsory" }] },
        { name: "Class 8", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "General Science", type: "Compulsory" }, { name: "History & Geo", type: "Compulsory" }, { name: "Computer", type: "Compulsory" }, { name: "Islamiyat", type: "Compulsory" }] }
      ],
      secondary: [
        { name: "Class 9", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "Physics", type: "Compulsory" }, { name: "Chemistry", type: "Compulsory" }, { name: "Biology / Computer", type: "Optional" }, { name: "Islamiyat", type: "Compulsory" }] },
        { name: "Class 10", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "Physics", type: "Compulsory" }, { name: "Chemistry", type: "Compulsory" }, { name: "Biology / Computer", type: "Optional" }, { name: "Pakistan Studies", type: "Compulsory" }] }
      ],
      higher_secondary: [
        { name: "Class 11", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Islamiyat", type: "Compulsory" }, { name: "Physics", type: "Optional" }, { name: "Chemistry / Computer", type: "Optional" }, { name: "Mathematics / Biology", type: "Optional" }] },
        { name: "Class 12", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Pakistan Studies", type: "Compulsory" }, { name: "Physics", type: "Optional" }, { name: "Chemistry / Computer", type: "Optional" }, { name: "Mathematics / Biology", type: "Optional" }] }
      ]
    }
  },
  {
    id: "oxford", // 🟢 New System added safely
    name: "Oxford / Private Systems",
    levels: {
      early_childhood: [
        { name: "Nursery", subjects: [{ name: "English Phonics", type: "Compulsory" }, { name: "Numbers", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Art & Craft", type: "Compulsory" }] },
        { name: "Prep", subjects: [{ name: "Oxford English", type: "Compulsory" }, { name: "New Countdown", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "General Knowledge", type: "Compulsory" }] }
      ],
      primary: [
        { name: "Class 1", subjects: [{ name: "Oxford English", type: "Compulsory" }, { name: "New Countdown", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Amazing Science", type: "Compulsory" }] },
        { name: "Class 5", subjects: [{ name: "Oxford English", type: "Compulsory" }, { name: "New Countdown", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Amazing Science", type: "Compulsory" }] }
      ],
      middle: [
        { name: "Class 8", subjects: [{ name: "Oxford English", type: "Compulsory" }, { name: "New Countdown", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Amazing Science", type: "Compulsory" }, { name: "Computer Science", type: "Compulsory" }] }
      ],
      secondary: [
        { name: "Class 9", subjects: [{ name: "English", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "Physics", type: "Compulsory" }, { name: "Chemistry", type: "Compulsory" }] },
        { name: "Class 10", subjects: [{ name: "English", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "Physics", type: "Compulsory" }, { name: "Chemistry", type: "Compulsory" }] }
      ]
    }
  },
  {
    id: "federal", // 🟢 Backend relies on this exact ID
    name: "Federal Government (FBISE)",
    levels: {
      secondary: [
        { name: "Class 9", subjects: [{ name: "Physics", type: "Compulsory" }, { name: "Chemistry", type: "Compulsory" }, { name: "Biology", type: "Optional" }] },
        { name: "Class 10", subjects: [{ name: "Physics", type: "Compulsory" }, { name: "Chemistry", type: "Compulsory" }, { name: "Computer Science", type: "Optional" }] }
      ]
    }
  },
  {
    id: "wifaq", // 🟢 Backend relies on this exact ID
    name: "Wifaq-ul-Madaris Al-Arabia",
    levels: {
      madrissa: [
        { name: "Al-Ibtidaiyah", subjects: [{ name: "Quran Hifz", type: "Compulsory" }, { name: "Arabic Grammar", type: "Compulsory" }] },
        { name: "Al-Mutawassitah", subjects: [{ name: "Tajweed", type: "Compulsory" }, { name: "Nahw", type: "Compulsory" }, { name: "Sarf", type: "Compulsory" }] }
      ]
    }
  }
];
