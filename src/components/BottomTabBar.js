import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const TABS = [
  { key: 'home', label: 'Trang chủ', icon: '🏠' },
  { key: 'chat', label: 'Hội thoại', icon: '💬' },
  { key: 'scan', label: 'Quét đề', icon: '📷' },
  { key: 'profile', label: 'Cá nhân', icon: '👤' },
];

export default function BottomTabBar({ activeTab, onChangeTab }) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={() => onChangeTab(tab.key)}>
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff', paddingVertical: 8, paddingBottom: 20 },
  tabItem: { flex: 1, alignItems: 'center' },
  icon: { fontSize: 20 },
  label: { fontSize: 11, color: '#999', marginTop: 2 },
  labelActive: { color: '#4f46e5', fontWeight: '600' },
});