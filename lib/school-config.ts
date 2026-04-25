export function generateClasses(level: string, type: string) {
  if (type === "madrissa") return ["Nazra", "Hifz", "Dars"];
  if (level === "primary") return ["1", "2", "3", "4", "5"];
  if (level === "elementary") return ["6", "7", "8"];
  if (level === "secondary") return ["9", "10"];
  return [];
}

export function generateSubjects(board: string, level: string, className: string) {
  const num = parseInt(className);

  if (board === "punjab") {
    if (num <= 5) return ["Urdu", "English", "Math", "Islamiyat", "Science"];
    if (num <= 8) return ["Urdu", "English", "Math", "Islamiyat", "Science", "Computer"];
    return ["Physics", "Chemistry", "Biology", "Math", "English", "Urdu"];
  }

  if (board === "federal") {
    return ["English", "Math", "Science", "Computer", "Islamiat"];
  }

  if (board === "madrissa") {
    return ["Quran", "Hadith", "Fiqh", "Arabic"];
  }

  return [];
}
