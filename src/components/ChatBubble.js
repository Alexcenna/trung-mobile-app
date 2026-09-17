import { StyleSheet, Text, View } from 'react-native';

export default function ChatBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={isUser ? styles.textUser : styles.textAI}>{text}</Text>
      </View>
    </View>
  );
}

const PRIMARY = '#4f46e5';

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 4, paddingHorizontal: 12 },
  rowUser: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: 14, padding: 12 },
  bubbleUser: { backgroundColor: PRIMARY, borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: '#f0f0f0', borderBottomLeftRadius: 4 },
  textUser: { color: '#fff', fontSize: 14 },
  textAI: { color: '#222', fontSize: 14 },
});