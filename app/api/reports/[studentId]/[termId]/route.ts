import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { renderToStaticMarkup } from "react-dom/server";
import { eq, and } from "drizzle-orm";
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
import { ReportCard } from "@/components/reports/ReportCard";

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

    // Fetch school
    const [school] = await db
      .select()
      .from(schools)
      .where(eq(schools.id, session.user.schoolId))
      .limit(1);
    if (!school) return new NextResponse("School not found", { status: 404 });

    // Fetch student & class
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

    // Fetch term
    const [termData] = await db
      .select()
      .from(terms)
      .where(
        and(eq(terms.id, termId), eq(terms.schoolId, session.user.schoolId)),
      )
      .limit(1);
    if (!termData) return new NextResponse("Term not found", { status: 404 });

    // Fetch scores
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

    // Render React to HTML string
    const htmlContent = renderToStaticMarkup(
      ReportCard({
        school: { name: school.name, logoUrl: school.logoUrl },
        student: {
          name: studentData.name,
          admissionNo: studentData.admissionNo,
          className: studentData.className ?? "N/A",
        },
        term: { name: termData.name, session: termData.session },
        scores: scoreData,
      }),
    );

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
          <style>body { margin: 0; padding: 0; } @media print { body { -webkit-print-color-adjust: exact; } }</style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
    const page = await browser.newPage();

    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
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
