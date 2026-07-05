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
    early_childhood?: ClassLevel[];
    primary?: ClassLevel[];
    middle?: ClassLevel[];
    secondary?: ClassLevel[];
    higher_secondary?: ClassLevel[];
  };
}

export const CURRICULUMS: Curriculum[] = [
  {
    id: "punjab",
    name: "Punjab Board",
    levels: {
      early_childhood: [
        { name: "Play Group", subjects: [ {name:"English (Oral)", type:"Compulsory"}, {name:"Urdu (Oral)", type:"Compulsory"}, {name:"Numeracy", type:"Compulsory"}, {name:"General Awareness", type:"Compulsory"}, {name:"Creative Art", type:"Compulsory"}, {name:"Rhymes & Stories", type:"Compulsory"}, {name:"Physical Activities", type:"Compulsory"} ] },
        { name: "Nursery", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Numeracy", type:"Compulsory"}, {name:"General Knowledge", type:"Compulsory"}, {name:"Art & Craft", type:"Compulsory"}, {name:"Rhymes", type:"Compulsory"}, {name:"Physical Activities", type:"Compulsory"} ] },
        { name: "Prep / KG", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Knowledge", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Ethics", type:"Optional"}, {name:"Art & Craft", type:"Compulsory"}, {name:"Physical Education", type:"Compulsory"} ] },
      ],
      primary: [
        { name: "Class 1", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Knowledge", type:"Compulsory"}, {name:"Islamiat / Ethics", type:"Compulsory"}, {name:"Nazra Quran", type:"Compulsory"}, {name:"Art", type:"Compulsory"}, {name:"Physical Education", type:"Compulsory"} ] },
        { name: "Class 2", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Knowledge", type:"Compulsory"}, {name:"Islamiat / Ethics", type:"Compulsory"}, {name:"Nazra Quran", type:"Compulsory"}, {name:"Art", type:"Compulsory"}, {name:"Physical Education", type:"Compulsory"} ] },
        { name: "Class 3", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Social Studies", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Nazra Quran", type:"Compulsory"}, {name:"Art", type:"Compulsory"}, {name:"Physical Education", type:"Compulsory"} ] },
        { name: "Class 4", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Social Studies", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Nazra Quran", type:"Compulsory"}, {name:"Computer Studies", type:"Compulsory"}, {name:"Physical Education", type:"Compulsory"} ] },
        { name: "Class 5", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Social Studies", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Nazra Quran", type:"Compulsory"}, {name:"Computer Studies", type:"Compulsory"}, {name:"Physical Education", type:"Compulsory"} ] },
      ],
      middle: [
        { name: "Class 6", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Computer Science", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"Geography", type:"Compulsory"}, {name:"Arabic", type:"Optional"} ] },
        { name: "Class 7", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Computer Science", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"Geography", type:"Compulsory"}, {name:"Arabic", type:"Optional"} ] },
        { name: "Class 8", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Computer Science", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"Geography", type:"Compulsory"}, {name:"Arabic", type:"Optional"} ] },
      ],
      secondary: [
        { name: "Class 9 (Science)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"Physics", type:"Compulsory"}, {name:"Chemistry", type:"Compulsory"}, {name:"Biology / Computer Science", type:"Compulsory"} ] },
        { name: "Class 9 (Arts)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"General Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Education", type:"Compulsory"}, {name:"Civics", type:"Compulsory"}, {name:"Computer Science", type:"Optional"} ] },
        { name: "Class 10 (Science)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"Physics", type:"Compulsory"}, {name:"Chemistry", type:"Compulsory"}, {name:"Biology / Computer Science", type:"Compulsory"} ] },
        { name: "Class 10 (Arts)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"General Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Education", type:"Compulsory"}, {name:"Civics", type:"Compulsory"}, {name:"Computer Science", type:"Optional"} ] },
      ],
      higher_secondary: [
        { name: "Class 11 (Pre-Medical)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Biology", type:"Compulsory"}, {name:"Chemistry", type:"Compulsory"}, {name:"Physics", type:"Compulsory"} ] },
        { name: "Class 11 (Pre-Engineering)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"Chemistry", type:"Compulsory"}, {name:"Physics", type:"Compulsory"} ] },
        { name: "Class 11 (ICS)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Computer Science", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"Physics", type:"Compulsory"} ] },
        { name: "Class 11 (I.Com)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Principles of Accounting", type:"Compulsory"}, {name:"Principles of Commerce", type:"Compulsory"}, {name:"Business Mathematics", type:"Compulsory"} ] },
        { name: "Class 11 (FA Humanities)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Education", type:"Compulsory"}, {name:"Civics", type:"Compulsory"}, {name:"Sociology", type:"Compulsory"} ] },
      ]
    }
  },
  {
    id: "federal",
    name: "Federal Board (FBISE)",
    levels: {
      early_childhood: [
        { name: "Play Group", subjects: [ {name:"English Communication", type:"Compulsory"}, {name:"Urdu Communication", type:"Compulsory"}, {name:"Numeracy", type:"Compulsory"}, {name:"Creative Arts", type:"Compulsory"}, {name:"Physical Development", type:"Compulsory"} ] },
        { name: "Nursery", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Numeracy", type:"Compulsory"}, {name:"Environmental Awareness", type:"Compulsory"}, {name:"Art & Craft", type:"Compulsory"}, {name:"Physical Activities", type:"Compulsory"} ] },
        { name: "Prep / KG", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"Environmental Studies", type:"Compulsory"}, {name:"Islamiat / Ethics", type:"Compulsory"}, {name:"Creative Arts", type:"Compulsory"}, {name:"Physical Education", type:"Compulsory"} ] },
      ],
      primary: [
        { name: "Class 1", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Islamiat / Ethics", type:"Compulsory"}, {name:"Creative Arts", type:"Compulsory"}, {name:"Physical Education", type:"Compulsory"} ] },
        { name: "Class 2", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Islamiat / Ethics", type:"Compulsory"}, {name:"Creative Arts", type:"Compulsory"}, {name:"Physical Education", type:"Compulsory"} ] },
        { name: "Class 3", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Social Studies", type:"Compulsory"}, {name:"Islamiat / Ethics", type:"Compulsory"}, {name:"Creative Arts", type:"Compulsory"}, {name:"Physical Education", type:"Compulsory"} ] },
        { name: "Class 4", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Social Studies", type:"Compulsory"}, {name:"Islamiat / Ethics", type:"Compulsory"}, {name:"Computer Literacy", type:"Compulsory"}, {name:"Physical Education", type:"Compulsory"} ] },
        { name: "Class 5", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Social Studies", type:"Compulsory"}, {name:"Islamiat / Ethics", type:"Compulsory"}, {name:"Computer Literacy", type:"Compulsory"}, {name:"Physical Education", type:"Compulsory"} ] },
      ],
      middle: [
        { name: "Class 6", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"Computer Science", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Arabic", type:"Optional"} ] },
        { name: "Class 7", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"Computer Science", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Arabic", type:"Optional"} ] },
        { name: "Class 8", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"Computer Science", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Arabic", type:"Optional"} ] },
      ],
      secondary: [
        { name: "Class 9 (Science)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"Physics", type:"Compulsory"}, {name:"Chemistry", type:"Compulsory"}, {name:"Biology / Computer Science", type:"Compulsory"} ] },
        { name: "Class 9 (Humanities)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"General Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Education", type:"Compulsory"}, {name:"Economics", type:"Compulsory"} ] },
        { name: "Class 10 (Science)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"Physics", type:"Compulsory"}, {name:"Chemistry", type:"Compulsory"}, {name:"Biology / Computer Science", type:"Compulsory"} ] },
        { name: "Class 10 (Humanities)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Pakistan Studies", type:"Compulsory"}, {name:"General Mathematics", type:"Compulsory"}, {name:"General Science", type:"Compulsory"}, {name:"Education", type:"Compulsory"}, {name:"Economics", type:"Compulsory"} ] },
      ],
      higher_secondary: [
        { name: "Class 11 (Pre-Medical)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Biology", type:"Compulsory"}, {name:"Chemistry", type:"Compulsory"}, {name:"Physics", type:"Compulsory"} ] },
        { name: "Class 11 (Pre-Engineering)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"Chemistry", type:"Compulsory"}, {name:"Physics", type:"Compulsory"} ] },
        { name: "Class 11 (ICS)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Computer Science", type:"Compulsory"}, {name:"Mathematics", type:"Compulsory"}, {name:"Physics", type:"Compulsory"} ] },
        { name: "Class 11 (I.Com)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Accounting", type:"Compulsory"}, {name:"Commerce", type:"Compulsory"}, {name:"Economics", type:"Compulsory"} ] },
        { name: "Class 11 (Humanities)", subjects: [ {name:"English", type:"Compulsory"}, {name:"Urdu", type:"Compulsory"}, {name:"Islamiat", type:"Compulsory"}, {name:"Education", type:"Compulsory"}, {name:"Civics", type:"Compulsory"}, {name:"Sociology", type:"Compulsory"} ] },
      ]
    }
  }
];

// For backward compatibility if any old route imports curriculumMap
export const curriculumMap: Record<string, Curriculum> = CURRICULUMS.reduce((map, curr) => {
  map[curr.id] = curr;
  return map;
}, {} as Record<string, Curriculum>);
