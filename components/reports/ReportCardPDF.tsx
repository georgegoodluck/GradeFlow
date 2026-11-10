// ... (imports and styles)
interface Props {
  schoolName: string;
  schoolMotto: string;
  logoUrl: string | null;
  headOfSchoolTitle: string;
  headOfSchoolName: string;
  reportCardId: string;
  issueDate: string;
  student: { name: string; admissionNo: string; className: string; age: string; gender: string };
  term: { name: string; session: string };
  teacherRemark: string;
  scores: { subject: string; ca1: number; ca2: number; ca3: number; caTotal: number; exam: number; total: number; grade: string; remark: string }[];
  isCumulative?: boolean;
  cumulativeAverage?: string;
}

export function ReportCardPDF({ ..., isCumulative, cumulativeAverage }: Props) {
  const grandTotal = scores.reduce((sum, s) => sum + s.total, 0);
  const average = isCumulative ? cumulativeAverage : (grandTotal / scores.length).toFixed(2);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header with schoolName, motto, logo */}
        
        {/* ... Info Grid ... */}
        
        {/* Table with scores */}
        
        <View style={styles.footerGrid}>
          {/* Teacher Remark */}
          {/* Empty Signature Box */}
          <View style={{ width: "35%" }}>
            <View style={styles.signatureBox}>
              <Text style={{ fontSize: 7, fontWeight: "bold", textAlign: "center" }}>
                {headOfSchoolTitle.toUpperCase()} SIGNATURE
              </Text>
            </View>
          </View>
        </View>
        
        {/* Grading Key */}
      </Page>
    </Document>
  );
}