import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { auth } from '../../firebaseConfig';
import { subscribeToDocuments, addDocument, deleteDocument } from '../services/documentService';
import DocumentCard from '../components/DocumentCard';

const FILTERS = ['Tất cả', 'Giải tích', 'Kinh tế vi mô', 'Kỹ thuật phần mềm'];

export default function HomeScreen({ onOpenSummary, onOpenChat }) {
  const [documents, setDocuments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const unsubscribe = subscribeToDocuments(userId, setDocuments);
    return unsubscribe;
  }, []);

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf'] });
    if (result.canceled) return;

    const file = result.assets[0];
    const sizeKB = (file.size / 1024).toFixed(0);

    if (file.size > 800 * 1024) {
      Alert.alert('File quá lớn', 'Vui lòng chọn file PDF dưới 800KB.');
      return;
    }

    setUploading(true);
    try {
      const base64Content = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await addDocument(auth.currentUser.uid, {
        name: file.name,
        type: 'PDF',
        size: `${sizeKB} KB`,
        base64Content,
      });

      Alert.alert('Thành công', 'Đã tải lên tài liệu');
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = activeFilter === 'Tất cả'
    ? documents
    : documents.filter((d) => d.subject === activeFilter);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tài liệu của tôi</Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={(item) => item}
        style={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === item && styles.filterChipActive]}
            onPress={() => setActiveFilter(item)}
          >
            <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filteredDocs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <DocumentCard
            document={item}
            onSummarize={() => onOpenSummary(item)}
            onChat={() => onOpenChat(item)}
            onDelete={() => deleteDocument(item.id)}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có tài liệu nào. Bấm + để tải lên.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={handlePickDocument} disabled={uploading}>
        <Text style={styles.fabText}>{uploading ? '...' : '+'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const PRIMARY = '#4f46e5';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  filterList: { marginBottom: 12, maxHeight: 40 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  filterChipActive: { backgroundColor: PRIMARY },
  filterText: { color: '#555', fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  listContent: { paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
});