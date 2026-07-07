import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#1a1a1a" },
  title: { fontSize: 20, marginBottom: 2 },
  subtitle: { fontSize: 10, color: "#777", marginBottom: 20 },
  line: { borderBottomWidth: 1, borderBottomColor: "#e5e5e5", marginVertical: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: "#777" },
  value: { fontWeight: "bold" },
  amountLabel: { color: "#777", marginBottom: 4 },
  amount: { fontSize: 18, fontWeight: "bold" },
  footer: { marginTop: 30, fontSize: 9, color: "#aaa" },
});

export type ReceiptData = {
  associationName: string;
  receiptNo: string;
  date: string;
  memberName: string;
  categoryName: string;
  method: string;
  amount: number;
  note?: string;
};

export function ReceiptDocument({ data }: { data: ReceiptData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{data.associationName || "Association"}</Text>
        <Text style={styles.subtitle}>Payment Receipt</Text>

        <View style={styles.line} />

        <View style={styles.row}>
          <Text style={styles.label}>Receipt No</Text>
          <Text style={styles.value}>{data.receiptNo}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text>{data.date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Member</Text>
          <Text>{data.memberName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Category</Text>
          <Text>{data.categoryName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>
          <Text>{data.method}</Text>
        </View>
        {data.note && (
          <View style={styles.row}>
            <Text style={styles.label}>Note</Text>
            <Text>{data.note}</Text>
          </View>
        )}

        <View style={styles.line} />
        <Text style={styles.amountLabel}>Amount Received</Text>
        <Text style={styles.amount}>₹ {data.amount.toFixed(2)}</Text>

        <Text style={styles.footer}>
          This is a system-generated receipt and does not require a signature.
        </Text>
      </Page>
    </Document>
  );
}
