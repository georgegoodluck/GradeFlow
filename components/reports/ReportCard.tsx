import { computeScore } from "@/lib/grading";

interface StudentInfo {
  name: string;
  admissionNo: string;
  className: string;
}

interface SubjectScore {
  subjectName: string;
  ca1: number;
  ca2: number;
  ca3: number;
  exam: number;
}

interface SchoolInfo {
  name: string;
  logoUrl: string | null;
}

interface TermInfo {
  name: string;
  session: string;
}

interface Props {
  school: SchoolInfo;
  student: StudentInfo;
  term: TermInfo;
  scores: SubjectScore[];
}

export function ReportCard({ school, student, term, scores }: Props) {
  const processed = scores.map((s) => {
    const computed = computeScore(s);
    return { ...s, ...computed };
  });

  const grandTotal = processed.reduce((sum, s) => sum + s.total, 0);
  const average = processed.length > 0 ? grandTotal / processed.length : 0;

  return (
    <div
      style={{
        width: "297mm", // A4 landscape
        minHeight: "210mm",
        padding: "15mm",
        fontFamily: "Inter, sans-serif",
        color: "#1C1C1E",
        backgroundColor: "#ffffff",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "2px solid #C6A664",
          paddingBottom: "10mm",
          marginBottom: "10mm",
        }}
      >
        {school.logoUrl && (
          <img
            src={school.logoUrl}
            alt="Logo"
            style={{
              width: "25mm",
              height: "25mm",
              objectFit: "contain",
              marginRight: "10mm",
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "32px",
              margin: 0,
              color: "#1C1C1E",
            }}
          >
            {school.name}
          </h1>
          <p style={{ margin: "4px 0 0", color: "#666", fontSize: "14px" }}>
            Official Terminal Report Card
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
            {term.name}
          </p>
          <p style={{ margin: "4px 0 0", color: "#666", fontSize: "14px" }}>
            {term.session}
          </p>
        </div>
      </div>

      {/* Student Info */}
      <div
        style={{
          display: "flex",
          gap: "20mm",
          marginBottom: "8mm",
          backgroundColor: "#F5F5F7",
          padding: "6mm",
          borderRadius: "4px",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Student Name
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 600 }}>
            {student.name}
          </p>
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Admission No
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 600 }}>
            {student.admissionNo}
          </p>
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Class
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 600 }}>
            {student.className}
          </p>
        </div>
      </div>

      {/* Score Table */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#1C1C1E", color: "#fff" }}>
            <th
              style={{
                textAlign: "left",
                padding: "10px",
                borderRadius: "4px 0 0 0",
              }}
            >
              Subject
            </th>
            <th style={{ textAlign: "center", padding: "10px" }}>CA1 (40)</th>
            <th style={{ textAlign: "center", padding: "10px" }}>CA2 (40)</th>
            <th style={{ textAlign: "center", padding: "10px" }}>CA3 (40)</th>
            <th style={{ textAlign: "center", padding: "10px" }}>Exam (60)</th>
            <th style={{ textAlign: "center", padding: "10px" }}>Total</th>
            <th
              style={{
                textAlign: "center",
                padding: "10px",
                borderRadius: "0 4px 0 0",
              }}
            >
              Grade
            </th>
          </tr>
        </thead>
        <tbody>
          {processed.map((s, i) => (
            <tr
              key={s.subjectName}
              style={{
                borderBottom: "1px solid #E5E5E5",
                backgroundColor: i % 2 === 0 ? "#fff" : "#FAFAFA",
              }}
            >
              <td style={{ padding: "10px", fontWeight: 500 }}>
                {s.subjectName}
              </td>
              <td style={{ padding: "10px", textAlign: "center" }}>{s.ca1}</td>
              <td style={{ padding: "10px", textAlign: "center" }}>{s.ca2}</td>
              <td style={{ padding: "10px", textAlign: "center" }}>{s.ca3}</td>
              <td style={{ padding: "10px", textAlign: "center" }}>{s.exam}</td>
              <td
                style={{
                  padding: "10px",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                {s.total}
              </td>
              <td style={{ padding: "10px", textAlign: "center" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontWeight: 700,
                    backgroundColor:
                      s.grade === "A"
                        ? "#D1FAE5"
                        : s.grade === "F"
                          ? "#FEE2E2"
                          : "#F3F4F6",
                    color:
                      s.grade === "A"
                        ? "#065F46"
                        : s.grade === "F"
                          ? "#991B1B"
                          : "#374151",
                  }}
                >
                  {s.grade}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div
        style={{
          marginTop: "10mm",
          display: "flex",
          justifyContent: "flex-end",
          gap: "20mm",
        }}
      >
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Grand Total
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "24px", fontWeight: 700 }}>
            {grandTotal.toFixed(2)}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Average
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "24px",
              fontWeight: 700,
              color: "#C6A664",
            }}
          >
            {average.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "15mm",
          left: "15mm",
          right: "15mm",
          borderTop: "1px solid #E5E5E5",
          paddingTop: "4mm",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "#999",
        }}
      >
        <p style={{ margin: 0 }}>Generated by School Grading SaaS</p>
        <p style={{ margin: 0 }}>{new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
