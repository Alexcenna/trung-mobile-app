import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { subscribeToMessages, sendMessage } from '../services/chatService';
import { askQuestionAboutDocument } from '../services/aiService';
import ChatBubble from '../components/ChatBubble';

export default function ChatDetailScreen({ conversation, document, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(conversation.id, setMessages);
    return unsubscribe;
  }, [conversation.id]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const question = input.trim();
    setInput('');
    setSending(true);

    try {
      await sendMessage(conversation.id, 'user', question);
      const answer = await askQuestionAboutDocument(
        document?.base64Content || '',
        messages.map((m) => ({ role: m.role, text: m.text })),
        question
      );
      await sendMessage(conversation.id, 'ai', answer);
    } catch (err) {
      await sendMessage(conversation.id, 'ai', 'Xin lỗi, có lỗi xảy ra khi trả lời: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Hội thoại AI</Text>
          <Text style={styles.headerSubtitle}>{conversation.documentName}</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble role={item.role} text={item.text} />}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Đặt câu hỏi tiếp theo..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const PRIMARY = '#4f46e5';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  back: { fontSize: 28, marginRight: 12 },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  headerSubtitle: { fontSize: 12, color: '#888' },
  messageList: { paddingVertical: 8, flexGrow: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#fff', fontSize: 16 },
});