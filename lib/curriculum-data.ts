// lib/curriculum-data.ts

export interface Subject {
  name: string;
  type: "Compulsory" | "Optional" | "Practical";
}

export interface ClassLevel {
  name: string;
  subjects: Subject[];
}

export interface Curriculum {
  id: string;
  name: string;
  levels: {
    primary?: ClassLevel[];
    elementary?: ClassLevel[];
    high?: ClassLevel[];
    madrissa?: ClassLevel[];
  };
}

export const CURRICULUMS: Curriculum[] = [
  {
    id: "federal",
    name: "Federal Government (FBISE)",
    levels: {
      primary: [
        { name: "Prep", subjects: [ {name:"English Readiness", type:"Compulsory"}, {name:"Urdu Readiness", type:"Compulsory"}, {name:"Mathematics Readiness", type:"Compulsory"}, {name:"General Knowledge", type:"Compulsory"}, {name:"Islamiat (Basic)", type:"Compulsory"} ] },
        { name: "Class 1", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Knowledge", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"} ] },
        { name: "Class 2", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Knowledge", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"} ] },
        { name: "Class 3", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Social Studies", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"} ] },
        { name: "Class 4", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Social Studies", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Computer", type:"Optional"} ] },
        { name: "Class 5", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Social Studies", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Computer", type:"Optional"} ] },
      ],
      elementary: [
        { name: "Class 6", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Computer Science", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Social Studies", type:"Compulsory"} ] },
        { name: "Class 7", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Computer Science", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Social Studies", type:"Compulsory"} ] },
        { name: "Class 8", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Computer Science", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Social Studies", type:"Compulsory"} ] },
      ],
      high: [
        { name: "Class 9", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"Physics", type:"Compulsory"}, {name:"Chemistry", type:"Compulsory"}, {name:"Biology", type:"Optional"}, {name:"Computer Science", type:"Optional"} ] },
        { name: "Class 10", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"Physics", type:"Compulsory"}, {name:"Chemistry", type:"Compulsory"}, {name:"Biology", type:"Optional"}, {name:"Computer Science", type:"Optional"} ] },
      ]
    }
  },
  {
    id: "wifaq",
    name: "Wifaq-ul-Madaris",
    levels: {
      madrissa: [
        { name: "Nazra Quran", subjects: [ {name:"Nazra Quran", type:"Compulsory"}, {name:"Tajweed", type:"Compulsory"}, {name:"Dua", type:"Compulsory"}, {name:"Aqeedah", type:"Compulsory"} ] },
        { name: "Mutawassitah", subjects: [ {name:"Quran", type:"Compulsory"}, {name:"Tafseer", type:"Compulsory"}, {name:"Hadith", type:"Compulsory"}, {name:"Fiqh", type:"Compulsory"}, {name:"Arabic Grammar", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"English", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"} ] },
        { name: "Sanawiyyah Aammah", subjects: [ {name:"Quran", type:"Compulsory"}, {name:"Tafseer", type:"Compulsory"}, {name:"Hadith", type:"Compulsory"}, {name:"Fiqh", type:"Compulsory"}, {name:"Nahw", type:"Compulsory"}, {name:"Sarf", type:"Compulsory"}, {name:"Mantiq", type:"Compulsory"}, {name:"Arabic Literature", type:"Compulsory"} ] },
      ]
    }
  }
];
 Export a Map for older API routes compatibility
export const curriculumMap: Record<string, Curriculum> = CURRICULUMS.reduce((map, curr) => {
  map[curr.id] = curr;
  return map;
}, {} as Record<string, Curriculum>);
