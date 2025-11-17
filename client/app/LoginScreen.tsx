import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import api from './src/api/api';
import { AuthContext } from './src/context/AuthContext';
import { IUser } from './src/types/User';

// מסך הלוגין
// משתמש בהקשר האותנטיקציה כדי לקרוא לפונקציית הלוגין
// שולח בקשה לשרת עם האימייל והסיסמה
// ומעדכן את מצב האותנטיקציה במידה והלוגין הצליח    
// מציג התראה במקרה של כישלון
// ומנווט את המשתמש למסך הפרופיל אחרי לוגין מוצלח
export default function Login() {
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await api.post('/login', { email, password });
      const user: IUser = res.data;

      await login(user.token!, user);

      router.push('/ProfileScreen');
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <Button title="Login" onPress={handleLogin} />

      <Text style={styles.link} onPress={() => router.push('/SignupScreen')}>Sign Up</Text>
      <Text style={styles.link} onPress={() => router.push('/ForgotPasswordScreen')}>Forgot Password?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 16 },
  link: { color: 'blue', textAlign: 'center', marginTop: 10 },
});
