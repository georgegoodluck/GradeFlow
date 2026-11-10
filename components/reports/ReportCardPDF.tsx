// components/reports/ReportCardPDF.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica", fontSize: 9, color: "#1C1C1E" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#1C1C1E",
    paddingBottom: 10,
    marginBottom: 15,
  },
  logo: { width: 65, height: 65, marginRight: 15 },
  titleContainer: { flex: 1, alignItems: "center" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1C1C1E",
    textTransform: "uppercase",
  },
  subtitle: { fontSize: 9, color: "#666", marginTop: 2 },
  motto: {
    backgroundColor: "#1C1C1E",
    color: "#C6A664",
    paddingVertical: 3,
    paddingHorizontal: 15,
    textAlign: "center",
    fontSize: 7,
    marginTop: 4,
    letterSpacing: 1,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 8,
    letterSpacing: 1,
  },

  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoCol: { width: "48%" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  infoLabel: { fontWeight: "bold", fontSize: 8, color: "#666", width: 85 },
  infoValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
    borderStyle: "dotted",
    paddingBottom: 1,
    fontSize: 8,
  },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#1C1C1E",
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 7,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
  cell: {
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#CCC",
    fontSize: 8,
    justifyContent: "center",
  },

  // Updated Column Widths to accommodate the new fields
  colSubject: { width: "22%" },
  colCA: { width: "7%", textAlign: "center" },
  colCATotal: { width: "8%", textAlign: "center" },
  colExam: { width: "8%", textAlign: "center" },
  colTotal: { width: "8%", textAlign: "center" },
  colGrade: { width: "8%", textAlign: "center" },
  colRemark: { width: "18%", textAlign: "center" },

  footerGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  remarkBox: { width: "60%", borderWidth: 1, borderColor: "#CCC", padding: 8 },
  signatureBox: {
    width: "35%",
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1E",
    paddingBottom: 4,
    marginTop: 15,
  },

  gradingKey: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F7",
    padding: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#CCC",
  },
  keyItem: { fontSize: 7, fontWeight: "bold" },
});

interface Props {
  schoolName: string;
  schoolMotto: string;
  logoUrl: string | null;
  proprietressName: string;
  reportCardId: string;
  issueDate: string;
  student: {
    name: string;
    admissionNo: string;
    className: string;
    age: string;
    gender: string;
  };
  term: { name: string; session: string };
  teacherRemark: string;
  scores: {
    subject: string;
    ca1: number;
    ca2: number;
    ca3: number;
    caTotal: number;
    exam: number;
    total: number;
    grade: string;
    remark: string;
  }[];
}

export function ReportCardPDF({
  schoolName,
  schoolMotto,
  logoUrl,
  proprietressName,
  reportCardId,
  issueDate,
  student,
  term,
  teacherRemark,
  scores,
}: Props) {
  const grandTotal = scores.reduce((sum, s) => sum + s.total, 0);
  const average =
    scores.length > 0 ? (grandTotal / scores.length).toFixed(2) : "0.00";

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          {logoUrl ? (
            <Image style={styles.logo} src={logoUrl} />
          ) : (
            <View style={styles.logo} />
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{schoolName}</Text>
            <Text style={styles.subtitle}>Official Academic Report Card</Text>
            <View style={styles.motto}>
              <Text>{schoolMotto}</Text>
            </View>
          </View>
          <View style={{ width: 65 }} />
        </View>

        <Text style={styles.sectionTitle}>STUDENT PERFORMANCE REPORT</Text>

        {/* STUDENT & ACADEMIC INFO */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>FULL NAME</Text>
              <Text style={styles.infoValue}>{student.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>STUDENT ID</Text>
              <Text style={styles.infoValue}>{student.admissionNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CLASS</Text>
              <Text style={styles.infoValue}>{student.className}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>GENDER / AGE</Text>
              <Text style={styles.infoValue}>
                {student.gender} / {student.age}
              </Text>
            </View>
          </View>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ACADEMIC PERIOD</Text>
              <Text style={styles.infoValue}>
                {term.name} - {term.session}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ISSUE DATE</Text>
              <Text style={styles.infoValue}>{issueDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>REPORT CARD ID</Text>
              <Text style={styles.infoValue}>{reportCardId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>PROPRIETRESS</Text>
              <Text style={styles.infoValue}>{proprietressName}</Text>
            </View>
          </View>
        </View>

        {/* SCORE TABLE */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={[styles.cell, styles.colSubject]}>
              <Text>SUBJECT</Text>
            </View>
            <View style={[styles.cell, styles.colCA]}>
              <Text>CA 1</Text>
            </View>
            <View style={[styles.cell, styles.colCA]}>
              <Text>CA 2</Text>
            </View>
            <View style={[styles.cell, styles.colCA]}>
              <Text>CA 3</Text>
            </View>
            <View style={[styles.cell, styles.colCATotal]}>
              <Text>CA TOTAL</Text>
            </View>
            <View style={[styles.cell, styles.colExam]}>
              <Text>EXAM</Text>
            </View>
            <View style={[styles.cell, styles.colTotal]}>
              <Text>TOTAL</Text>
            </View>
            <View style={[styles.cell, styles.colGrade]}>
              <Text>GRADE</Text>
            </View>
            <View
              style={[styles.cell, styles.colRemark, { borderRightWidth: 0 }]}
            >
              <Text>REMARKS</Text>
            </View>
          </View>

          {scores.map((s, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={[styles.cell, styles.colSubject]}>
                <Text>{s.subject}</Text>
              </View>
              <View style={[styles.cell, styles.colCA]}>
                <Text>{s.ca1}</Text>
              </View>
              <View style={[styles.cell, styles.colCA]}>
                <Text>{s.ca2}</Text>
              </View>
              <View style={[styles.cell, styles.colCA]}>
                <Text>{s.ca3}</Text>
              </View>
              <View style={[styles.cell, styles.colCATotal]}>
                <Text>{s.caTotal}</Text>
              </View>
              <View style={[styles.cell, styles.colExam]}>
                <Text>{s.exam}</Text>
              </View>
              <View style={[styles.cell, styles.colTotal]}>
                <Text>{s.total}</Text>
              </View>
              <View style={[styles.cell, styles.colGrade]}>
                <Text>{s.grade}</Text>
              </View>
              <View
                style={[styles.cell, styles.colRemark, { borderRightWidth: 0 }]}
              >
                <Text>{s.remark}</Text>
              </View>
            </View>
          ))}

          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#F5F5F7",
              fontWeight: "bold",
            }}
          >
            <View style={[styles.cell, { width: "45%" }]}>
              <Text>GRAND TOTAL</Text>
            </View>
            <View style={[styles.cell, styles.colTotal]}>
              <Text>{grandTotal}</Text>
            </View>
            <View style={[styles.cell, styles.colGrade]}>
              <Text>AVG</Text>
            </View>
            <View
              style={[
                styles.cell,
                { width: "30%", textAlign: "center", borderRightWidth: 0 },
              ]}
            >
              <Text>{average}%</Text>
            </View>
          </View>
        </View>

        {/* FOOTER SECTION */}
        <View style={styles.footerGrid}>
          <View style={styles.remarkBox}>
            <Text style={{ fontWeight: "bold", fontSize: 8, marginBottom: 4 }}>
              TEACHER&apos;S REMARK
            </Text>
            <Text style={{ fontSize: 9 }}>{teacherRemark}</Text>
          </View>
          <View style={{ width: "35%" }}>
            <View style={styles.signatureBox}>
              <Text
                style={{ fontSize: 7, fontWeight: "bold", textAlign: "center" }}
              >
                PROPRIETRESS SIGNATURE
              </Text>
            </View>
          </View>
        </View>

        {/* GRADING KEY */}
        <View style={styles.gradingKey}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 8,
              backgroundColor: "#1C1C1E",
              color: "#FFF",
              padding: 2,
            }}
          >
            GRADING KEY
          </Text>
          <Text style={styles.keyItem}>A (70 – 100)</Text>
          <Text style={styles.keyItem}>B (60 – 69)</Text>
          <Text style={styles.keyItem}>C (50 – 59)</Text>
          <Text style={styles.keyItem}>D (45 – 49)</Text>
          <Text style={styles.keyItem}>E (40 – 44)</Text>
          <Text style={styles.keyItem}>F (0 – 39)</Text>
        </View>
      </Page>
    </Document>
  );
}
