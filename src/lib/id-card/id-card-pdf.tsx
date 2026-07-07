import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export type MemberCardData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  joinedAt: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const styles = StyleSheet.create({
  page: { padding: 60, justifyContent: "center", alignItems: "center" },
  card: {
    width: 340,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#0c0e10",
    border: "1pt solid #2a2c30",
  },
  headerBand: {
    backgroundColor: "#ff5a1f",
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assocName: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  cardLabel: { color: "rgba(255,255,255,0.8)", fontSize: 8 },
  body: { padding: 20 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ff5a1f",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  initials: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  nameRole: { flex: 1 },
  memberName: { color: "#e7e7e7", fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  roleText: { color: "#ff5a1f", fontSize: 9 },
  info: { color: "#9aa0a6", fontSize: 9, marginBottom: 4 },
  infoLabel: { color: "#5a5f66", fontSize: 8 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#2a2c30", marginVertical: 10 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#08090a",
  },
  footerText: { color: "#555", fontSize: 7 },
  idText: { color: "#777", fontSize: 7, fontFamily: "Courier" },
});

export function IdCardDocument({
  members,
  associationName,
  validThrough,
}: {
  members: MemberCardData[];
  associationName: string;
  validThrough: string;
}) {
  return (
    <Document>
      {members.map((m) => (
        <Page key={m.id} size="A4" style={styles.page}>
          <View style={styles.card}>
            {/* Header band */}
            <View style={styles.headerBand}>
              <Text style={styles.assocName}>{associationName || "Association"}</Text>
              <Text style={styles.cardLabel}>MEMBER ID CARD</Text>
            </View>

            {/* Body */}
            <View style={styles.body}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.initials}>{getInitials(m.name)}</Text>
                </View>
                <View style={styles.nameRole}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.roleText}>{m.role}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.infoLabel}>EMAIL</Text>
              <Text style={styles.info}>{m.email}</Text>

              <Text style={styles.infoLabel}>PHONE</Text>
              <Text style={styles.info}>{m.phone}</Text>

              <Text style={styles.infoLabel}>MEMBER ID</Text>
              <Text style={styles.idText}>{m.id.slice(-10).toUpperCase()}</Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Joined: {m.joinedAt}</Text>
              <Text style={styles.footerText}>Valid through: {validThrough}</Text>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
}
