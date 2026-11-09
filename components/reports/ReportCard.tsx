// import { format } from 'date-fns';

export type ReportCardData = {
  student: {
    firstName: string;
    lastName: string;
    admissionNo: string;
    class: { name: string };
  };
  school: {
    name: string;
    address: string | null;
    logoUrl: string | null;
  };
  term: {
    session: string;
    name: string;
  };
  scores: Array<{
    id: string;
    ca1: number;
    ca2: number;
    ca3: number;
    exam: number;
    total: number;
    grade: string | null;
    subjectRank: number | null;
    subject: { name: string };
  }>;
  overallAverage: number;
  position?: number | null;
};

export function ReportCard({ data }: { data: ReportCardData }) {
  const { student, school, term, scores, overallAverage, position } = data;

  return (
    <div className="text-ink mx-auto w-[297mm] bg-white p-8" style={{ minHeight: '210mm' }}>
      {/* Header */}
      <div className="border-gold border-b-2 pb-6 text-center">
        {school.logoUrl && (
          <img
            src={school.logoUrl}
            alt={`${school.name} logo`}
            className="mx-auto mb-4 h-20 object-contain"
          />
        )}
        <h1 className="text-gold-dark font-serif text-4xl tracking-widest uppercase">
          {school.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500 italic">
          {school.address || 'Excellence in Education'}
        </p>
        <div className="bg-ink mt-4 inline-block rounded-full px-6 py-2 text-sm font-semibold tracking-wider text-white">
          {term.session} — {term.name} Report Card
        </div>
      </div>

      {/* Student Info */}
      <div className="mt-6 flex justify-between border-b border-gray-200 pb-4 text-sm">
        <div>
          <p>
            <span className="font-semibold">Student:</span> {student.firstName} {student.lastName}
          </p>
          <p>
            <span className="font-semibold">Admission No:</span> {student.admissionNo}
          </p>
        </div>
        <div className="text-right">
          <p>
            <span className="font-semibold">Class:</span> {student.class.name}
          </p>
          <p>
            <span className="font-semibold">Position:</span>{' '}
            {position ? `${position}${getOrdinal(position)}` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Subject Table */}
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="bg-gold/10 text-gold-dark">
            <th className="py-2 text-left font-serif">Subject</th>
            <th className="py-2">CA1 (40)</th>
            <th className="py-2">CA2 (40)</th>
            <th className="py-2">CA3 (40)</th>
            <th className="py-2">Exam (60)</th>
            <th className="py-2">Total (100)</th>
            <th className="py-2">Grade</th>
            <th className="py-2">Pos</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {scores.map((s) => (
            <tr key={s.id} className="text-center">
              <td className="py-2 text-left font-medium">{s.subject.name}</td>
              <td>{s.ca1}</td>
              <td>{s.ca2}</td>
              <td>{s.ca3}</td>
              <td>{s.exam}</td>
              <td className="font-bold">{s.total}</td>
              <td>
                <span
                  className={`inline-block w-6 rounded text-white ${s.grade === 'A' ? 'bg-green-500' : s.grade === 'F' ? 'bg-red-500' : 'bg-gray-500'}`}
                >
                  {s.grade || '-'}
                </span>
              </td>
              <td>{s.subjectRank || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mt-8 flex justify-between">
        <div className="w-1/2 rounded-lg bg-gray-50 p-4">
          <h3 className="text-gold-dark font-serif text-lg">Overall Summary</h3>
          <p className="mt-2 text-sm">
            Total Average: <span className="text-lg font-bold">{overallAverage.toFixed(2)}%</span>
          </p>
          <p className="text-sm">
            Final Grade: <span className="font-bold">{getOverallGrade(overallAverage)}</span>
          </p>
        </div>

        <div className="w-1/2 text-right">
          <div className="mt-4">
            <p className="font-hand text-xl text-blue-700">
              &quot;Keep up the excellent work!&quot;
            </p>
            <p className="mt-2 text-xs text-gray-400">Class Teacher&apos;s Remark</p>
          </div>
          <div className="mt-8 border-t border-gray-300 pt-2 text-center text-xs">
            Principal&apos;s Signature
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers
function getOrdinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function getOverallGrade(avg: number) {
  if (avg >= 70) return 'A - Excellent';
  if (avg >= 60) return 'B - Very Good';
  if (avg >= 50) return 'C - Good';
  if (avg >= 45) return 'D - Pass';
  if (avg >= 40) return 'E - Fair';
  return 'F - Needs Improvement';
}
