import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { summarizeDocument } from '../services/aiService';

const LEVELS = ['Ngắn', 'Trung bình', 'Chi tiết'];

export default function SummaryScreen({ document, onBack }) {
  const [level, setLevel] = useState('Trung bình');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const handleGenerate = async () => {
    if (!document.base64Content && !document.textContent) {
      Alert.alert('Thiếu nội dung', 'Tài liệu này chưa có dữ liệu để tóm tắt.');
      return;
    }
    setLoading(true);
    try {
      const result = await summarizeDocument(document, level);
      setSummary(result);
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'documents', document.id), {
        summaries: arrayUnion({ level, content: summary, createdAt: new Date().toISOString() }),
      });
      Alert.alert('Đã lưu', 'Bản tóm tắt đã được lưu lại', [
        { text: 'OK', onPress: () => onBack() },
      ]);
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Tóm tắt AI · {document.name}</Text>
      </View>

      {!summary ? (
        <View style={styles.form}>
          <Text style={styles.label}>Mức độ tóm tắt</Text>
          <View style={styles.levelRow}>
            {LEVELS.map((l) => (
              <TouchableOpacity
                key={l}
                style={[styles.levelChip, level === l && styles.levelChipActive]}
                onPress={() => setLevel(l)}
              >
                <Text style={[styles.levelText, level === l && styles.levelTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.generateButton} onPress={handleGenerate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateText}>Tạo tóm tắt</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.resultBox}>
            <Text style={styles.resultText}>{summary}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.generateButton} onPress={handleSave}>
            <Text style={styles.generateText}>Lưu bản tóm tắt này</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const PRIMARY = '#4f46e5';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  back: { fontSize: 28, marginRight: 12 },
  headerTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  form: { flex: 1 },
  label: { fontSize: 14, color: '#555', marginBottom: 8 },
  levelRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  levelChip: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f5f5f5', alignItems: 'center' },
  levelChipActive: { backgroundColor: PRIMARY },
  levelText: { color: '#555', fontSize: 13 },
  levelTextActive: { color: '#fff', fontWeight: '600' },
  generateButton: { backgroundColor: PRIMARY, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  generateText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  resultBox: { flex: 1, marginBottom: 16 },
  resultText: { fontSize: 14, lineHeight: 22, color: '#333' },
});