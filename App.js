import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import LoginForm from './Log_In_Register/LoginForm';
import RegisterForm from './Log_In_Register/RegisterForm';

export default function App() {
  const [screen, setScreen] = useState('register'); // 'login' hoặc 'register'

  return (
    <View style={styles.container}>
      {screen === 'login' ? (
        <LoginForm onNavigateToRegister={() => setScreen('register')} />
      ) : (
        <RegisterForm onNavigateToLogin={() => setScreen('login')} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});