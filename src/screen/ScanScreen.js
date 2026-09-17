import { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput, Image,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { extractTextFromImage, analyzeProblem } from '../services/aiService';

export default function ScanScreen({ onAnalysisResult }) {
  const [imageUri, setImageUri] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  const runOCR = async (uri) => {
    setOcrLoading(true);
    setOcrText('');
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const text = await extractTextFromImage(base64);
      setOcrText(text.trim());
    } catch (err) {
      Alert.alert('Lỗi nhận dạng', err.message);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleCapture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập camera');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      runOCR(result.assets[0].uri);
    }
  };

  const handlePickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      runOCR(result.assets[0].uri);
    }
  };

  const handleAnalyze = async () => {
    if (!ocrText.trim()) {
      Alert.alert('Thiếu nội dung', 'Vui lòng chờ nhận dạng xong hoặc nhập nội dung đề bài');
      return;
    }
    setAnalyzeLoading(true);
    try {
      const result = await analyzeProblem(ocrText);
      onAnalysisResult(result);
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Quét đề bài</Text>

        <View style={styles.imageBox}>
          {imageUri
            ? <Image source={{ uri: imageUri }} style={styles.image} />
            : <Text style={styles.placeholder}>Chưa có ảnh</Text>}
        </View>

        <View style={styles.captureRow}>
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
            <Text style={styles.captureText}>📷 Chụp ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButtonOutline} onPress={handlePickFromLibrary}>
            <Text style={styles.captureTextOutline}>🖼 Chọn ảnh</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>
          Nội dung nhận dạng {ocrLoading && '(đang nhận dạng...)'}
        </Text>

        {ocrLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#4f46e5" />
          </View>
        ) : (
          <TextInput
            style={styles.textArea}
            multiline
            value={ocrText}
            onChangeText={setOcrText}
            placeholder="Nội dung nhận dạng sẽ hiện ở đây, bạn có thể chỉnh sửa nếu chưa chính xác..."
          />
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.analyzeButton}
        onPress={handleAnalyze}
        disabled={analyzeLoading || ocrLoading}
      >
        {analyzeLoading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.analyzeText}>Gửi đến AI để phân tích</Text>}
      </TouchableOpacity>
    </View>
  );
}

const PRIMARY = '#4f46e5';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  imageBox: {
    height: 180, backgroundColor: '#f5f5f5', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  placeholder: { color: '#aaa' },
  captureRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  captureButton: {
    flex: 1, backgroundColor: PRIMARY, borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  captureText: { color: '#fff', fontWeight: '600' },
  captureButtonOutline: {
    flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  captureTextOutline: { color: '#333', fontWeight: '600' },
  label: { fontSize: 13, color: '#555', marginBottom: 6 },
  loadingBox: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 10,
    height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  textArea: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12,
    minHeight: 150, textAlignVertical: 'top',
  },
  analyzeButton: {
    backgroundColor: PRIMARY, borderRadius: 10, paddingVertical: 14, alignItems: 'center',
    marginHorizontal: 16, marginBottom: 20,
  },
  analyzeText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});