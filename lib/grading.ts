export function calculateGrade(total: number): string {
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 45) return 'D';
  if (total >= 40) return 'E';
  return 'F';
}

export function computeScore(ca1: number, ca2: number, ca3: number, exam: number) {
  const caAverage = (ca1 + ca2 + ca3) / 3;
  const total = caAverage + exam;
  return {
    caAverage: Math.round(caAverage * 100) / 100,
    total: Math.round(total * 100) / 100,
    grade: calculateGrade(total),
  };
}
