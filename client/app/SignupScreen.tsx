import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import api from './src/api/api';

export default function SignupScreen() {
  const router = useRouter();

  // פונקציה לטיפול בהרשמה
  // שולחת בקשה לשרת עם פרטי המשתמש
  // ומנווטת למסך הלוגין במקרה של הצלחה
  // מציגה התראה במקרה של כישלון
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');

  const handleSignup = async () => {
    try {
      await api.post('/signup', { username, email, password, fullName, department });
      Alert.alert('Success', 'Account created');
      router.push('/LoginScreen');
    } catch (err: any) {
      Alert.alert('Signup Failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Department" value={department} onChangeText={setDepartment} />

      <Button title="Sign Up" onPress={handleSignup} />

      <Text style={styles.link} onPress={() => router.push('/LoginScreen')}>Back to Login</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 16 },
  link: { color: 'blue', textAlign: 'center', marginTop: 10 },
});
