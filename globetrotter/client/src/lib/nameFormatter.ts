/**
 * Smart first-name extractor:
 * Converts full names, compound usernames, email handles, and combined names
 * into a clean, capitalized first name.
 *
 * Examples:
 * - "romit kakadiya" -> "Romit"
 * - "romitkakadiya2703" -> "Romit"
 * - "romitkakadiya" -> "Romit"
 * - "krishbhingradiya" -> "Krish"
 * - "krishbhingradiya05" -> "Krish"
 * - "avipatel708" -> "Avi"
 * - "RomitKakadiya" -> "Romit"
 * - "mita.shah@example.com" -> "Mita"
 * - "Mita Shah" -> "Mita"
 */
export function extractFirstName(rawName?: string | null): string {
  if (!rawName) return "there";

  let clean = rawName.trim();
  if (!clean) return "there";

  // If email, extract username before @
  if (clean.includes("@")) {
    clean = clean.split("@")[0];
  }

  // If has space, dot, underscore, dash or comma: take first token
  const tokens = clean.split(/[\s._,-]+/);
  if (tokens.length > 1 && tokens[0].length > 0) {
    clean = tokens[0];
  }

  // If CamelCase / PascalCase like "RomitKakadiya", take first capital word
  const pascalMatch = clean.match(/^([A-Z][a-z]+)[A-Z]/);
  if (pascalMatch && pascalMatch[1]) {
    clean = pascalMatch[1];
  }

  // Remove trailing or inline numbers/digits (e.g., "romitkakadiya2703" -> "romitkakadiya")
  clean = clean.replace(/\d+/g, "");

  // Check known first-name prefixes if name is a joined word (e.g. "romitkakadiya" -> "romit", "krishbhingradiya" -> "krish")
  const knownPrefixes = [
    "romit",
    "krish",
    "avi",
    "mita",
    "aarav",
    "rohit",
    "rahul",
    "priya",
    "neha",
    "ananya",
    "aditya",
    "amit",
    "ankit",
    "chirag",
    "dev",
    "harsh",
    "jay",
    "karan",
    "manish",
    "meet",
    "nikhil",
    "parth",
    "pooja",
    "raj",
    "riya",
    "rohan",
    "sagar",
    "samir",
    "shivam",
    "tanvi",
    "varun",
    "yash",
    "alex",
    "john",
    "david",
    "emma",
    "sarah",
    "mike",
    "luke",
  ];

  const lower = clean.toLowerCase();
  for (const prefix of knownPrefixes) {
    if (lower.startsWith(prefix) && lower.length > prefix.length) {
      clean = prefix;
      break;
    }
  }

  // If name has a known surname suffix attached (e.g. "...kakadiya", "...bhingradiya", "...patel", "...shah")
  const knownSurnameSuffixes = [
    "kakadiya",
    "bhingradiya",
    "patel",
    "shah",
    "mehta",
    "sharma",
    "verma",
    "gupta",
    "singh",
    "kumar",
    "joshi",
    "desai",
    "pandya",
    "trivedi",
  ];

  for (const suffix of knownSurnameSuffixes) {
    if (lower.endsWith(suffix) && lower.length > suffix.length) {
      clean = lower.slice(0, lower.length - suffix.length);
      break;
    }
  }

  // Remove any remaining non-alphabetical symbols
  clean = clean.replace(/[^a-zA-Z]/g, "");

  if (!clean) return "there";

  // Capitalize first letter cleanly (e.g. "romit" -> "Romit")
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}
