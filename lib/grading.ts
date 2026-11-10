export type Grade = "A" | "B" | "C" | "D" | "E" | "F";

export interface ScoreInput {
  ca1: number;
  ca2: number;
  ca3: number;
  exam: number;
}

export interface ComputedScore {
  caAverage: number;
  total: number;
  grade: Grade;
}

/**
 * Computes the CA average, total score, and grade.
 * CA1, CA2, CA3 are each out of 40.
 * CA Average = (CA1 + CA2 + CA3) / 3.
 * Exam is out of 60.
 * Total = CA Average + Exam.
 */
export function computeScore(input: ScoreInput): ComputedScore {
  // Ensure inputs are numbers and clamp them to their maximums
  const ca1 = Math.min(Math.max(input.ca1 || 0, 0), 40);
  const ca2 = Math.min(Math.max(input.ca2 || 0, 0), 40);
  const ca3 = Math.min(Math.max(input.ca3 || 0, 0), 40);
  const exam = Math.min(Math.max(input.exam || 0, 0), 60);

  const caAverage = (ca1 + ca2 + ca3) / 3;
  const total = caAverage + exam;

  return {
    caAverage: Math.round(caAverage * 100) / 100, // Round to 2 decimal places
    total: Math.round(total * 100) / 100,
    grade: calculateGrade(total),
  };
}

/**
 * Determines the grade based on the total score.
 */
export function calculateGrade(total: number): Grade {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
}
