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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string; termId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.schoolId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { studentId, termId } = await params;

    // 1. Fetch School
    const [school] = await db
      .select()
      .from(schools)
      .where(eq(schools.id, session.user.schoolId))
      .limit(1);
    if (!school) return new NextResponse("School not found", { status: 404 });

    // 2. Fetch Student
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

    // 3. Fetch Term
    const [termData] = await db
      .select()
      .from(terms)
      .where(
        and(eq(terms.id, termId), eq(terms.schoolId, session.user.schoolId)),
      )
      .limit(1);
    if (!termData) return new NextResponse("Term not found", { status: 404 });

    // 4. Fetch Scores (and the remark from the first score row)
    const scoreData = await db
      .select({
        subjectName: subjects.name,
        ca1: scores.ca1,
        ca2: scores.ca2,
        ca3: scores.ca3,
        exam: scores.exam,
        remark: scores.remark,
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

    // 5. Process Scores
    const processedScores = scoreData.map((s) => {
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

    // 6. Extract Teacher Remark (using the first available remark)
    const teacherRemark = scoreData.find((s) => s.remark)?.remark || "";

    // 7. Generate PDF
    const pdfBuffer = await renderToBuffer(
      ReportCardPDF({
        schoolName: school.name,
        schoolMotto: school.motto || "KNOWLEDGE, GODLINESS AND POWER", // Dynamic motto
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
        term: { name: termData.name, session: termData.session },
        teacherRemark: teacherRemark, // <-- REAL REMARK
        scores: processedScores,
      }),
    );

    // 8. Return Response
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
