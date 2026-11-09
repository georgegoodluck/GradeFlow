import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';
import { ReportCard, ReportCardData } from '@/components/reports/ReportCard';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { studentId: string; termId: string } },
) {
  const session = await auth();
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  // 1. Fetch all data for the report card
  const data = await withTenant(session.user.schoolId, async (tx) => {
    const student = await tx.student.findUnique({
      where: { id: params.studentId },
      include: { class: true },
    });
    const school = await tx.school.findUnique({ where: { id: session.user.schoolId } });
    const term = await tx.term.findUnique({ where: { id: params.termId } });
    const scores = await tx.score.findMany({
      where: { studentId: params.studentId, termId: params.termId },
      include: { subject: true },
      orderBy: { subject: { name: 'asc' } },
    });

    // Fetch the overall position from our new rankings table
    const termResult = await tx.studentTermResult.findUnique({
      where: {
        studentId_termId: {
          studentId: params.studentId,
          termId: params.termId,
        },
      },
    });

    const overallAverage = scores.reduce((acc, curr) => acc + curr.total, 0) / (scores.length || 1);

    return {
      student,
      school,
      term,
      scores,
      overallAverage,
      position: termResult?.position,
    };
  });

  if (!data.student || !data.school || !data.term) {
    return new NextResponse('Report data not found', { status: 404 });
  }

  // 2. Render React to HTML string
  const html = renderToString(React.createElement(ReportCard, { data: data as ReportCardData }));

  // 3. Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // Inject Tailwind CDN and Print CSS
  await page.setContent(
    `
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600&family=Caveat:wght@600&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .font-serif { font-family: 'Playfair Display', serif; }
          .font-hand { font-family: 'Caveat', cursive; }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `,
    // Using 'domcontentloaded' fixes the TypeScript error in some Puppeteer setups
    { waitUntil: 'domcontentloaded' },
  );

  const pdfBuffer = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  await browser.close();

  // 4. Return PDF (Wrapping in Buffer.from fixes the NextResponse BodyInit error)
  return new NextResponse(Buffer.from(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="report-${data.student.lastName}.pdf"`,
    },
  });
}
