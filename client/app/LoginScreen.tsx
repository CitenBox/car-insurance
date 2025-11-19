import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import api from '../src/api/api';
import { AuthContext } from '../src/context/AuthContext';
import { IUser } from '../src/types/User';

export default function Login() {
  const { login, user } = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/HomePageScreen');
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const res = await api.post('api/auth/login', { email, password });
      const user: IUser = res.data;

      await login(user.token!, user);
      router.push('/HomePageScreen');
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.message || err.message);
    }
  };

  const handleGuestEnter = () => {
    router.push('/HomePageScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />

      <View style={{ marginVertical: 10 }} />
      <Button title="כניסה בלי הרשמה" onPress={handleGuestEnter} color="green" />

      <Text style={styles.link} onPress={() => router.push('/SignupScreen')}>
        Sign Up
      </Text>

      <Text style={styles.link} onPress={() => router.push('/ForgotPasswordScreen')}>
        Forgot Password?
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
