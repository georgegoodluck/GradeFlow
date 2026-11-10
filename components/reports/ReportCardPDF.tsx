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

// Define styles using Flexbox (Using standard fonts to prevent loading errors)
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
  logo: { width: 60, height: 60, marginRight: 15 },
  titleContainer: { flex: 1, alignItems: "center" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E",
    textTransform: "uppercase",
  },
  subtitle: { fontSize: 10, color: "#666", marginTop: 2 },
  motto: {
    backgroundColor: "#1C1C1E",
    color: "#C6A664",
    paddingVertical: 4,
    paddingHorizontal: 20,
    textAlign: "center",
    fontSize: 8,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 10,
  },
  infoLabel: { fontWeight: "bold", width: 80 },
  infoValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
    borderStyle: "dotted",
    paddingBottom: 2,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#1C1C1E",
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
  cell: { padding: 4, borderRightWidth: 1, borderRightColor: "#CCC" },
  colSubject: { width: "25%" },
  colCA: { width: "8%", textAlign: "center" },
  colExam: { width: "10%", textAlign: "center" },
  colTotal: { width: "10%", textAlign: "center" },
  colGrade: { width: "10%", textAlign: "center" },
  colRemark: { width: "17%", textAlign: "center" },
  mainLayout: { flexDirection: "row", gap: 15, marginTop: 10 },
  leftColumn: { flex: 2 },
  rightColumn: { flex: 1, gap: 10 },
  sidebarBox: { borderWidth: 1, borderColor: "#1C1C1E", padding: 8 },
  sidebarHeader: {
    backgroundColor: "#1C1C1E",
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 8,
    paddingVertical: 3,
    marginBottom: 5,
  },
  gradingKey: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F7",
    padding: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#CCC",
  },
  keyItem: { fontSize: 7, fontWeight: "bold" },
});

interface Props {
  schoolName: string;
  schoolMotto: string;
  logoUrl: string | null;
  student: {
    name: string;
    admissionNo: string;
    className: string;
    age: string;
    gender: string;
  };
  term: { name: string; session: string };
  scores: {
    subject: string;
    ca1: number;
    ca2: number;
    ca3: number;
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
  student,
  term,
  scores,
}: Props) {
  const grandTotal = scores.reduce((sum, s) => sum + s.total, 0);
  const average =
    scores.length > 0 ? (grandTotal / scores.length).toFixed(2) : "0.00";

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          {logoUrl ? <Image style={styles.logo} src={logoUrl} /> : null}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{schoolName}</Text>
            <Text style={styles.subtitle}>IBADAN, OYO STATE</Text>
            <View style={styles.motto}>
              <Text>{schoolMotto}</Text>
            </View>
          </View>
          <View style={{ width: 60 }} />
        </View>

        <Text style={styles.sectionTitle}>PRIMARY SCHOOL REPORT CARD</Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 15,
          }}
        >
          <View style={{ width: "45%" }}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>PUPIL&apos;S NAME</Text>
              <Text style={styles.infoValue}>{student.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CLASS</Text>
              <Text style={styles.infoValue}>{student.className}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ADMISSION NO.</Text>
              <Text style={styles.infoValue}>{student.admissionNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>TERM</Text>
              <Text style={styles.infoValue}>{term.name}</Text>
            </View>
          </View>
          <View style={{ width: "45%" }}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>SESSION</Text>
              <Text style={styles.infoValue}>{term.session}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>AGE</Text>
              <Text style={styles.infoValue}>{student.age}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>GENDER</Text>
              <Text style={styles.infoValue}>{student.gender}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DATE</Text>
              <Text style={styles.infoValue}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.mainLayout}>
          <View style={styles.leftColumn}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={[styles.cell, styles.colSubject]}>
                  <Text>SUBJECTS</Text>
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
                  style={[
                    styles.cell,
                    styles.colRemark,
                    { borderRightWidth: 0 },
                  ]}
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
                    style={[
                      styles.cell,
                      styles.colRemark,
                      { borderRightWidth: 0 },
                    ]}
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
                <View style={[styles.cell, { width: "50%" }]}>
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
                    { width: "20%", textAlign: "center", borderRightWidth: 0 },
                  ]}
                >
                  <Text>{average}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.sidebarBox}>
              <View style={styles.sidebarHeader}>
                <Text>ATTENDANCE</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 2,
                }}
              >
                <Text>No. of Days School Opened</Text>
                <Text>117</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 2,
                }}
              >
                <Text>No. of Days Present</Text>
                <Text>114</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 2,
                }}
              >
                <Text>No. of Days Absent</Text>
                <Text>3</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text>Attendance (%)</Text>
                <Text>97.4%</Text>
              </View>
            </View>

            <View style={styles.sidebarBox}>
              <View style={styles.sidebarHeader}>
                <Text>CONDUCT &amp; DEVELOPMENT</Text>
              </View>
              {[
                "Punctuality",
                "Neatness",
                "Honesty",
                "Respect for Others",
                "Self Control",
                "Initiative",
                "Co-operation",
              ].map((trait) => (
                <View
                  key={trait}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 2,
                  }}
                >
                  <Text>{trait}</Text>
                  <Text>⭐⭐⭐⭐⭐</Text>
                </View>
              ))}
            </View>

            <View
              style={[
                styles.sidebarBox,
                { backgroundColor: "#FDF6E3", flex: 1 },
              ]}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 8,
                  marginBottom: 4,
                  color: "#C6A664",
                }}
              >
                TEACHER&apos;S REMARK
              </Text>
              <Text style={{ fontSize: 9 }}>
                An outstanding result. Keep up the excellent work.
              </Text>
            </View>
          </View>
        </View>

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

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 30,
          }}
        >
          <View
            style={{
              width: "25%",
              borderTopWidth: 1,
              borderTopColor: "#1C1C1E",
              paddingTop: 4,
            }}
          >
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>
              CLASS TEACHER&apos;S SIGNATURE
            </Text>
          </View>
          <View
            style={{
              width: "25%",
              borderTopWidth: 1,
              borderTopColor: "#1C1C1E",
              paddingTop: 4,
            }}
          >
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>
              HEAD TEACHER&apos;S SIGNATURE
            </Text>
          </View>
          <View
            style={{
              width: "25%",
              borderTopWidth: 1,
              borderTopColor: "#1C1C1E",
              paddingTop: 4,
            }}
          >
            <Text style={{ fontSize: 7, fontWeight: "bold" }}>
              PARENT / GUARDIAN&apos;S SIGNATURE
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
