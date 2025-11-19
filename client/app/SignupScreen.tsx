import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import api from '../src/api/api';

export default function SignupScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');

  const handleSignup = async () => {
    try {
      await api.post('/api/auth/signup', { username, email, password, fullName, department });

      Alert.alert('Success', 'Account created');
      router.push('/LoginScreen');
    } catch (err: any) {
      Alert.alert('Signup Failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput style={styles.input} placeholder="Username"   placeholderTextColor="#888" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Email"   placeholderTextColor="#888" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password"   placeholderTextColor="#888" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Full Name"   placeholderTextColor="#888"  value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Department" 
        placeholderTextColor="#888" value={department} onChangeText={setDepartment} />

      <Button title="Sign Up" onPress={handleSignup} />

      <Text style={styles.link} onPress={() => router.push('/LoginScreen')}>
        Back to Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
  link: { color: 'blue', textAlign: 'center', marginTop: 10 },
});
