import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function DocumentCard({ document, onSummarize, onChat, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{document.name}</Text>
          <Text style={styles.meta}>{document.type} · {document.size}</Text>
        </View>
        <TouchableOpacity onPress={onDelete}>
          <Text style={styles.deleteIcon}>🗑</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tag}>
        <Text style={styles.tagText}>{document.subject}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButtonPrimary} onPress={onSummarize}>
          <Text style={styles.actionTextPrimary}>+ Tóm tắt AI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonSecondary} onPress={onChat}>
          <Text style={styles.actionTextSecondary}>Hỏi đáp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PRIMARY = '#4f46e5';

const styles = StyleSheet.create({
  card: { backgroundColor: '#fafafa', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 12, color: '#888', marginTop: 2 },
  deleteIcon: { fontSize: 16 },
  tag: { alignSelf: 'flex-start', backgroundColor: '#fee2e2', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 8 },
  tagText: { fontSize: 11, color: '#dc2626' },
  actionRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  actionButtonPrimary: { flex: 1, backgroundColor: '#ede9fe', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  actionTextPrimary: { color: PRIMARY, fontSize: 13, fontWeight: '600' },
  actionButtonSecondary: { flex: 1, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  actionTextSecondary: { color: '#333', fontSize: 13 },
});