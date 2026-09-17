import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function ProfileScreen() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setEmail(user.email);
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất khỏi tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (err) {
            Alert.alert('Lỗi', err.message);
          }
        },
      },
    ]);
  };

  const initial = email ? email.charAt(0).toUpperCase() : '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Cá nhân</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Sinh viên</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>
      </View>

      <View style={styles.menuCard}>
        <MenuItem icon="👤" label="Thông tin cá nhân" />
        <Divider />
        <MenuItem icon="🔒" label="Đổi mật khẩu" />
        <Divider />
        <MenuItem icon="📚" label="Môn học của tôi" />
        <Divider />
        <MenuItem icon="⚙️" label="Cài đặt" />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuItem({ icon, label }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const PRIMARY_COLOR = '#4f46e5';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  content: { padding: 20, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: PRIMARY_COLOR, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '600' },
  profileEmail: { fontSize: 14, color: '#666', marginTop: 2 },
  menuCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 24, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  menuIcon: { fontSize: 18, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15 },
  menuArrow: { fontSize: 18, color: '#ccc' },
  divider: { height: 1, backgroundColor: '#eee', marginLeft: 48 },
  logoutButton: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#fee2e2' },
  logoutText: { color: '#dc2626', fontSize: 16, fontWeight: '600' },
});