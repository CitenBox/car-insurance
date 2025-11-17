import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../src/api/api';
import { AuthContext } from '../src/context/AuthContext';
import { IUser } from '../src/types/User';

// מסך הלוגין
// משתמש בהקשר האותנטיקציה כדי לקרוא לפונקציית הלוגין
// שולח בקשה לשרת עם האימייל והסיסמה
// ומעדכן את מצב האותנטיקציה במידה והלוגין הצליח    
// מציג התראה במקרה של כישלון
// ומנווט את המשתמש למסך הבית אם כבר מחובר או אחרי לוגין מוצלח
export default function Login() {
  const { login, user } = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // אם המשתמש כבר מחובר, מפנה למסך הבית אוטומטית
  useEffect(() => {
    if (user) {
      router.replace('/HomePageScreen');
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const res = await api.post('/login', { email, password });
      const user: IUser = res.data;

      await login(user.token!, user);

      router.push('/HomePageScreen');
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.message || err.message);
    }
  };

  // ➕ כפתור כניסה ללא הרשמה
  const handleGuestEnter = () => {
    router.push('/HomePageScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />

      <View style={{ marginVertical: 10 }} />
      <Button title="כניסה בלי הרשמה" onPress={handleGuestEnter} color="green" />

      <Text
        style={styles.link}
        onPress={() => router.push('/SignupScreen')}
      >
        Sign Up
      </Text>
      <Text
        style={styles.link}
        onPress={() => router.push('/ForgotPasswordScreen')}
      >
        Forgot Password?
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 16 },
  link: { color: 'blue', textAlign: 'center', marginTop: 10 },
});
