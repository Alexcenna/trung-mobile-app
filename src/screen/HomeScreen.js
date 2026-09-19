import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { auth } from '../../firebaseConfig';
import { subscribeToDocuments, addDocument, deleteDocument, updateDocumentSubject } from '../services/documentService';
import DocumentCard from '../components/DocumentCard';

const MAX_SIZE_KB = 700; // Firestore giới hạn 1MB/document, base64 phình ~1.33 lần

const getFileTypeInfo = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  if (ext === 'pdf') return { type: 'PDF' };
  if (ext === 'txt') return { type: 'TXT' };
  return { type: 'UNKNOWN' };
};

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

  const filters = useMemo(() => {
    const uniqueSubjects = [...new Set(documents.map((d) => d.subject).filter(Boolean))];
    return ['Tất cả', ...uniqueSubjects.filter((s) => s !== 'Chưa phân loại'), 'Chưa phân loại'];
  }, [documents]);

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'text/plain'],
    });
    if (result.canceled) return;

    const file = result.assets[0];
    const sizeKB = file.size / 1024;

    if (sizeKB > MAX_SIZE_KB) {
      Alert.alert('File quá lớn', `Vui lòng chọn file dưới ${MAX_SIZE_KB}KB (do giới hạn lưu trữ miễn phí).`);
      return;
    }

    const { type: fileType } = getFileTypeInfo(file.name);

    setUploading(true);
    try {
      if (fileType === 'TXT') {
        const textContent = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        await addDocument(auth.currentUser.uid, {
          name: file.name,
          type: 'TXT',
          size: `${sizeKB.toFixed(0)} KB`,
          textContent,
        });
      } else if (fileType === 'PDF') {
        const base64Content = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await addDocument(auth.currentUser.uid, {
          name: file.name,
          type: 'PDF',
          size: `${sizeKB.toFixed(0)} KB`,
          base64Content,
        });
      } else {
        Alert.alert('Không hỗ trợ', 'Định dạng file này chưa được hỗ trợ.');
        setUploading(false);
        return;
      }

      Alert.alert('Thành công', 'Đã tải lên tài liệu');
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleChangeSubject = async (docId, newSubject) => {
    try {
      await updateDocumentSubject(docId, newSubject);
    } catch (err) {
      Alert.alert('Lỗi', err.message);
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
        data={filters}
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
            onChangeSubject={handleChangeSubject}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có tài liệu nào. Bấm + để tải lên.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={handlePickDocument} disabled={uploading}>
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.fabText}>+</Text>}
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