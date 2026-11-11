import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

interface Props {
  schoolName: string;
  schoolMotto: string;
  logoUrl: string | null;
  headOfSchoolTitle: string;
  headOfSchoolName: string;
  reportCardId: string;
  issueDate: string;
  student: { name: string; admissionNo: string; className: string };
  term: { name: string; session: string };
  headRemark: string;
  scores: { subject: string; ca1: number; ca2: number; ca3: number; caTotal: number; exam: number; total: number; grade: string; remark: string; position?: number }[];
  isCumulative?: boolean;
  cumulativeAverage?: string;
}

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 8, fontFamily: "Helvetica", color: "#1e293b", backgroundColor: "#ffffff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1.5, borderBottomColor: "#0f172a", paddingBottom: 10, marginBottom: 10 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 50, height: 50, objectFit: "contain" },
  schoolName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#0f172a", textTransform: "uppercase" },
  schoolMotto: { fontSize: 8, fontFamily: "Helvetica-Oblique", color: "#64748b", marginTop: 2 },
  metaBlock: { alignItems: "flex-end" },
  metaText: { fontSize: 7, color: "#475569", marginBottom: 2 },
  metaValue: { fontFamily: "Helvetica-Bold", color: "#0f172a" },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, padding: 8, marginBottom: 10 },
  infoCol: { width: "33.33%", marginBottom: 4 },
  infoLabel: { fontSize: 6.5, color: "#64748b", textTransform: "uppercase", marginBottom: 1 },
  infoValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  table: { borderWidth: 1, borderColor: "#cbd5e1", marginBottom: 10 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#cbd5e1", minHeight: 18, alignItems: "center" },
  tableHeader: { backgroundColor: "#0f172a", color: "#ffffff", fontFamily: "Helvetica-Bold" },
  tableRowEven: { backgroundColor: "#f8fafc" },
  colSubject: { width: "24%", paddingHorizontal: 6 },
  colScore: { width: "7.5%", textAlign: "center" },
  colGrade: { width: "7%", textAlign: "center", fontFamily: "Helvetica-Bold" },
  colRemark: { width: "17%", paddingHorizontal: 6 },
  headerCellText: { fontSize: 7, color: "#ffffff", fontFamily: "Helvetica-Bold", textAlign: "center" },
  summarySection: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 10, gap: 16 },
  summaryBadge: { backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#cbd5e1", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 3, flexDirection: "row", alignItems: "center", gap: 6 },
  summaryLabel: { fontSize: 7.5, color: "#475569", fontFamily: "Helvetica-Bold" },
  summaryValue: { fontSize: 8.5, color: "#0f172a", fontFamily: "Helvetica-Bold" },
  footerGrid: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: 8 },
  remarkBox: { width: "58%", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 4, padding: 8, minHeight: 45 },
  remarkTitle: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#475569", marginBottom: 4, textTransform: "uppercase" },
  remarkContent: { fontSize: 7.5, fontFamily: "Helvetica-Oblique", color: "#1e293b" },
  signatureContainer: { width: "35%", alignItems: "center" },
  signatureBox: { width: "100%", borderBottomWidth: 1, borderBottomColor: "#0f172a", paddingBottom: 4, alignItems: "center", marginBottom: 4 },
  signatureText: { fontSize: 7, fontFamily: "Helvetica-Bold", textAlign: "center", color: "#0f172a" },
  signeeName: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#0f172a", marginTop: 2 },
  gradingKey: { marginTop: 8, paddingTop: 4, borderTopWidth: 1, borderTopColor: "#e2e8f0", flexDirection: "row", justifyContent: "center", gap: 14 },
  gradingKeyItem: { fontSize: 6.5, color: "#64748b" },
});

export function ReportCardPDF({
  schoolName, schoolMotto, logoUrl, headOfSchoolTitle, headOfSchoolName, reportCardId, issueDate, student, term, headRemark, scores, isCumulative = false, cumulativeAverage,
}: Props) {
  const grandTotal = scores.reduce((sum, s) => sum + s.total, 0);
  const calculatedAverage = scores.length > 0 ? (grandTotal / scores.length).toFixed(2) : "0.00";
  const displayAverage = isCumulative && cumulativeAverage ? cumulativeAverage : calculatedAverage;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl && <Image src={logoUrl} style={styles.logo} />}
            <View>
              <Text style={styles.schoolName}>{schoolName}</Text>
              <Text style={styles.schoolMotto}>{schoolMotto}</Text>
            </View>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaText}>REPORT ID: <Text style={styles.metaValue}>{reportCardId}</Text></Text>
            <Text style={styles.metaText}>DATE ISSUED: <Text style={styles.metaValue}>{issueDate}</Text></Text>
            <Text style={styles.metaText}>SESSION: <Text style={styles.metaValue}>{term.session} ({term.name})</Text></Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCol}><Text style={styles.infoLabel}>Student Name</Text><Text style={styles.infoValue}>{student.name}</Text></View>
          <View style={styles.infoCol}><Text style={styles.infoLabel}>Admission No.</Text><Text style={styles.infoValue}>{student.admissionNo}</Text></View>
          <View style={styles.infoCol}><Text style={styles.infoLabel}>Class</Text><Text style={styles.infoValue}>{student.className}</Text></View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.colSubject, styles.headerCellText, { textAlign: "left" }]}>Subject</Text>
            <Text style={[styles.colScore, styles.headerCellText]}>CA 1</Text>
            <Text style={[styles.colScore, styles.headerCellText]}>CA 2</Text>
            <Text style={[styles.colScore, styles.headerCellText]}>CA 3</Text>
            <Text style={[styles.colScore, styles.headerCellText]}>CA Total</Text>
            <Text style={[styles.colScore, styles.headerCellText]}>Exam</Text>
            <Text style={[styles.colScore, styles.headerCellText]}>Total</Text>
            <Text style={[styles.colGrade, styles.headerCellText]}>Grade</Text>
            <Text style={[styles.colScore, styles.headerCellText, { width: "7%" }]}>Pos</Text>
            <Text style={[styles.colRemark, styles.headerCellText, { textAlign: "left" }]}>Remarks</Text>
          </View>
          {scores.map((score, index) => (
            <View key={`${score.subject}-${index}`} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowEven : {}]}>
              <Text style={styles.colSubject}>{score.subject}</Text>
              <Text style={styles.colScore}>{score.ca1}</Text>
              <Text style={styles.colScore}>{score.ca2}</Text>
              <Text style={styles.colScore}>{score.ca3}</Text>
              <Text style={styles.colScore}>{score.caTotal}</Text>
              <Text style={styles.colScore}>{score.exam}</Text>
              <Text style={[styles.colScore, { fontFamily: "Helvetica-Bold" }]}>{score.total}</Text>
              <Text style={styles.colGrade}>{score.grade}</Text>
              <Text style={[styles.colScore, { width: "7%" }]}>{score.position ? `${score.position}` : "-"}</Text>
              <Text style={styles.colRemark}>{score.remark}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryBadge}><Text style={styles.summaryLabel}>GRAND TOTAL:</Text><Text style={styles.summaryValue}>{grandTotal}</Text></View>
          <View style={styles.summaryBadge}><Text style={styles.summaryLabel}>{isCumulative ? "CUMULATIVE AVERAGE:" : "TERM AVERAGE:"}</Text><Text style={styles.summaryValue}>{displayAverage}%</Text></View>
        </View>

        <View style={styles.footerGrid}>
          <View style={styles.remarkBox}>
            <Text style={styles.remarkTitle}>{headOfSchoolTitle}&apos;s Remark</Text>
            <Text style={styles.remarkContent}>{headRemark || "..."}</Text>
          </View>
          <View style={styles.signatureContainer}>
            <View style={styles.signatureBox}><Text style={styles.signatureText}>{headOfSchoolTitle.toUpperCase()} SIGNATURE</Text></View>
            <Text style={styles.signeeName}>{headOfSchoolName}</Text>
          </View>
        </View>

        <View style={styles.gradingKey}>
          <Text style={styles.gradingKeyItem}>A (75 - 100): Excellent</Text>
          <Text style={styles.gradingKeyItem}>B (65 - 74): Very Good</Text>
          <Text style={styles.gradingKeyItem}>C (50 - 64): Credit</Text>
          <Text style={styles.gradingKeyItem}>D (45 - 49): Pass</Text>
          <Text style={styles.gradingKeyItem}>F (0 - 44): Fail</Text>
        </View>
      </Page>
    </Document>
  );
}
