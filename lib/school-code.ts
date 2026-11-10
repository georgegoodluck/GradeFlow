/**
 * Generates a school code in the format: GDF-{INITIALS}-{3 DIGITS}
 * Example: "Hans Academy" -> "GDF-HA-101"
 */
export function generateSchoolCode(schoolName: string): string {
  // Extract initials from the school name
  const initials = schoolName
    .trim()
    .split(/\s+/) // split on whitespace
    .map((word) => word[0])
    .filter((char) => char && /[a-zA-Z]/.test(char))
    .join("")
    .toUpperCase()
    .slice(0, 3)
    .padEnd(2, "X"); // Ensure at least 2 letters

  // Generate a secure 53-digit number (100 - 999)
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  const digits = (100 + (randomBuffer[0] % 900)).toString();

  return `GDF-${initials}-${digits}`;
}
