import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { auth } from '../../firebaseConfig';
import { subscribeToConversations } from '../services/chatService';

export default function ChatListScreen({ onOpenConversation }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const unsubscribe = subscribeToConversations(userId, setConversations);
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hội thoại của tôi</Text>
      <Text style={styles.subHeader}>{conversations.length} cuộc hội thoại đã lưu</Text>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => onOpenConversation(item)}>
            <Text style={styles.itemTitle}>{item.documentName}</Text>
            <Text style={styles.itemMeta}>Bấm để tiếp tục hội thoại</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có hội thoại nào. Mở 1 tài liệu và bấm "Hỏi đáp" để bắt đầu.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 16 },
  header: { fontSize: 24, fontWeight: 'bold' },
  subHeader: { fontSize: 13, color: '#888', marginBottom: 16 },
  item: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemTitle: { fontSize: 15, fontWeight: '600' },
  itemMeta: { fontSize: 12, color: '#999', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
});