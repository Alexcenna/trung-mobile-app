import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';

export default function LoginScreen({ onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Thiếu email', 'Vui lòng nhập email ở ô trên trước, sau đó bấm "Quên mật khẩu?"');
      return;
    }
    Alert.alert(
      'Đặt lại mật khẩu',
      `Gửi email hướng dẫn đặt lại mật khẩu tới ${email}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi',
          onPress: async () => {
            try {
              await sendPasswordResetEmail(auth, email);
              Alert.alert('Đã gửi', 'Vui lòng kiểm tra hộp thư email để đặt lại mật khẩu.');
            } catch (err) {
              Alert.alert('Lỗi', err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Đăng Nhập</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotButton}>
        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Đang xử lý...' : 'Đăng Nhập'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={onNavigateToRegister}>
        <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, padding: 24 },
  title: { fontSize: 20, textAlign: 'center', marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  label: { width: 100, fontSize: 16 },
  input: { flex: 1, height: 40, backgroundColor: '#b0b0b0', borderRadius: 4, paddingHorizontal: 8 },
  forgotButton: { alignItems: 'flex-end', marginBottom: 16 },
  forgotText: { color: '#4a90d9', fontSize: 13 },
  button: {
    height: 44, backgroundColor: '#4a90d9', borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkButton: { marginTop: 12, alignItems: 'center' },
  linkText: { color: '#4a90d9', fontSize: 14 },
});