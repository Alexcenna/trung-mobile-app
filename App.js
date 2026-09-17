import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

import LoginScreen from './src/screen/auth/LoginScreen';
import RegisterScreen from './src/screen/auth/RegisterScreen';
import HomeScreen from './src/screen/HomeScreen';
import SummaryScreen from './src/screen/SummaryScreen';
import ChatListScreen from './src/screen/ChatListScreen';
import ChatDetailScreen from './src/screen/ChatDetailScreen';
import ScanScreen from './src/screen/ScanScreen';
import ProfileScreen from './src/screen/ProfileScreen';
import BottomTabBar from './src/components/BottomTabBar';
import { createConversation } from './src/services/chatService';

export default function App() {
  const [authScreen, setAuthScreen] = useState('register');
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  const [homeView, setHomeView] = useState('list');
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [chatView, setChatView] = useState('list');
  const [activeConversation, setActiveConversation] = useState(null);

  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  if (checkingAuth) return <View style={styles.container} />;

  if (!user) {
    return (
      <View style={styles.container}>
        {authScreen === 'login' ? (
          <LoginScreen onNavigateToRegister={() => setAuthScreen('register')} />
        ) : (
          <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />
        )}
        <StatusBar style="auto" />
      </View>
    );
  }

  const handleOpenChatFromDocument = async (document) => {
    const convId = await createConversation(user.uid, document.id, document.name);
    setActiveConversation({ id: convId, documentName: document.name });
    setSelectedDocument(document);
    setChatView('detail');
    setActiveTab('chat');
  };

  return (
    <View style={styles.appContainer}>
      <View style={styles.screenContainer}>
        {activeTab === 'home' && homeView === 'list' && (
          <HomeScreen
            onOpenSummary={(doc) => { setSelectedDocument(doc); setHomeView('summary'); }}
            onOpenChat={handleOpenChatFromDocument}
          />
        )}
        {activeTab === 'home' && homeView === 'summary' && (
          <SummaryScreen document={selectedDocument} onBack={() => setHomeView('list')} />
        )}

        {activeTab === 'chat' && chatView === 'list' && (
          <ChatListScreen onOpenConversation={(conv) => { setActiveConversation(conv); setChatView('detail'); }} />
        )}
        {activeTab === 'chat' && chatView === 'detail' && (
          <ChatDetailScreen conversation={activeConversation} document={selectedDocument} onBack={() => setChatView('list')} />
        )}

        {activeTab === 'scan' && !scanResult && <ScanScreen onAnalysisResult={setScanResult} />}
        {activeTab === 'scan' && scanResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultHeader}>Kết quả phân tích</Text>
            <ScrollView><Text style={styles.resultText}>{scanResult}</Text></ScrollView>
            <TouchableOpacity style={styles.resetButton} onPress={() => setScanResult(null)}>
              <Text style={styles.resetText}>Quét đề khác</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      <BottomTabBar
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          setHomeView('list');
          setChatView('list');
        }}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20 },
  appContainer: { flex: 1, backgroundColor: '#fff' },
  screenContainer: { flex: 1 },
  resultContainer: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  resultHeader: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  resultText: { fontSize: 14, lineHeight: 22 },
  resetButton: { backgroundColor: '#4f46e5', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  resetText: { color: '#fff', fontWeight: '600' },
});