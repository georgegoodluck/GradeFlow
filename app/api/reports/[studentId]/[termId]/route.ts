import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import {
  schools,
  students,
  classes,
  terms,
  subjects,
  scores,
} from "@/db/schema";
import { ReportCardPDF } from "@/components/reports/ReportCardPDF";
import { computeScore } from "@/lib/grading";

export const runtime = "nodejs";

type ProcessedScore = {
  subject: string;
  ca1: number;
  ca2: number;
  ca3: number;
  caTotal: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string; termId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.schoolId)
      return new NextResponse("Unauthorized", { status: 401 });

    const { studentId, termId } = await params;

    const [school] = await db
      .select()
      .from(schools)
      .where(eq(schools.id, session.user.schoolId))
      .limit(1);
    if (!school) return new NextResponse("School not found", { status: 404 });

    const [studentData] = await db
      .select({
        name: students.name,
        admissionNo: students.admissionNo,
        className: classes.name,
      })
      .from(students)
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(
        and(
          eq(students.id, studentId),
          eq(students.schoolId, session.user.schoolId),
        ),
      )
      .limit(1);
    if (!studentData)
      return new NextResponse("Student not found", { status: 404 });

    const [termData] = await db
      .select()
      .from(terms)
      .where(
        and(eq(terms.id, termId), eq(terms.schoolId, session.user.schoolId)),
      )
      .limit(1);
    if (!termData) return new NextResponse("Term not found", { status: 404 });

    const isThirdTerm = termData.name.toLowerCase().includes("third term");

    let processedScores: ProcessedScore[] = [];

    if (isThirdTerm) {
      // Fetch all terms in the same academic session
      const sessionTerms = await db
        .select()
        .from(terms)
        .where(
          and(
            eq(terms.schoolId, session.user.schoolId),
            eq(terms.session, termData.session),
          ),
        );

      const termIds = sessionTerms.map((t) => t.id);

      const allScores = await db
        .select({
          subjectId: subjects.id,
          subjectName: subjects.name,
          ca1: scores.ca1,
          ca2: scores.ca2,
          ca3: scores.ca3,
          exam: scores.exam,
          termId: scores.termId,
        })
        .from(scores)
        .innerJoin(subjects, eq(scores.subjectId, subjects.id))
        .where(
          and(
            eq(scores.studentId, studentId),
            eq(scores.schoolId, session.user.schoolId),
            inArray(scores.termId, termIds),
          ),
        );

      // Group by subject and compute cumulative averages
      const subjectMap = new Map<
        string,
        { name: string; scores: typeof allScores }
      >();
      for (const s of allScores) {
        if (!subjectMap.has(s.subjectId)) {
          subjectMap.set(s.subjectId, { name: s.subjectName, scores: [] });
        }
        subjectMap.get(s.subjectId)!.scores.push(s);
      }

      for (const { name, scores: subjectScores } of subjectMap.values()) {
        const avgCa1 =
          subjectScores.reduce((sum, s) => sum + s.ca1, 0) /
          subjectScores.length;
        const avgCa2 =
          subjectScores.reduce((sum, s) => sum + s.ca2, 0) /
          subjectScores.length;
        const avgCa3 =
          subjectScores.reduce((sum, s) => sum + s.ca3, 0) /
          subjectScores.length;
        const avgExam =
          subjectScores.reduce((sum, s) => sum + s.exam, 0) /
          subjectScores.length;

        const computed = computeScore({
          ca1: avgCa1,
          ca2: avgCa2,
          ca3: avgCa3,
          exam: avgExam,
        });

        processedScores.push({
          subject: name,
          ca1: Math.round(avgCa1 * 100) / 100,
          ca2: Math.round(avgCa2 * 100) / 100,
          ca3: Math.round(avgCa3 * 100) / 100,
          caTotal: Math.round((avgCa1 + avgCa2 + avgCa3) * 100) / 100,
          exam: Math.round(avgExam * 100) / 100,
          total: computed.total,
          grade: computed.grade,
          remark:
            computed.grade === "A"
              ? "Excellent"
              : computed.grade === "B"
                ? "Very Good"
                : "Good",
        });
      }
    } else {
      // Standard single-term processing
      const scoreData = await db
        .select({
          subjectName: subjects.name,
          ca1: scores.ca1,
          ca2: scores.ca2,
          ca3: scores.ca3,
          exam: scores.exam,
        })
        .from(scores)
        .innerJoin(subjects, eq(scores.subjectId, subjects.id))
        .where(
          and(
            eq(scores.studentId, studentId),
            eq(scores.termId, termId),
            eq(scores.schoolId, session.user.schoolId),
          ),
        );

      processedScores = scoreData.map((s) => {
        const computed = computeScore({
          ca1: s.ca1,
          ca2: s.ca2,
          ca3: s.ca3,
          exam: s.exam,
        });
        const caTotal = s.ca1 + s.ca2 + s.ca3;
        return {
          subject: s.subjectName,
          ca1: s.ca1,
          ca2: s.ca2,
          ca3: s.ca3,
          caTotal: caTotal,
          exam: s.exam,
          total: computed.total,
          grade: computed.grade,
          remark:
            computed.grade === "A"
              ? "Excellent"
              : computed.grade === "B"
                ? "Very Good"
                : "Good",
        };
      });
    }

    const pdfBuffer = await renderToBuffer(
      ReportCardPDF({
        schoolName: school.name,
        schoolMotto: "KNOWLEDGE, GODLINESS AND POWER",
        logoUrl: school.logoUrl,
        headOfSchoolTitle: school.headOfSchoolTitle || "Proprietress",
        headOfSchoolName: school.headOfSchoolName || "Mrs. A. O. Okafor",
        reportCardId: `RC-${studentData.admissionNo}-${termData.session.replace("/", "")}`,
        issueDate: new Date().toLocaleDateString(),
        student: {
          name: studentData.name,
          admissionNo: studentData.admissionNo,
          className: studentData.className ?? "N/A",
          age: "-",
          gender: "-",
        },
        term: {
          name: isThirdTerm ? `${termData.name} (Cumulative)` : termData.name,
          session: termData.session,
        },
        teacherRemark: "An outstanding result. Keep up the excellent work.",
        scores: processedScores,
      }),
    );

    const pdfUint8Array = new Uint8Array(pdfBuffer.length);
    pdfUint8Array.set(pdfBuffer);
    const blob = new Blob([pdfUint8Array], { type: "application/pdf" });

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${studentData.name.replace(/\s+/g, "_")}_report.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error("PDF generation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
