import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from './src/context/AuthContext';

export default function HomePageScreen() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    router.push('/LoginScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.username || 'User'}!</Text>
      <Text style={styles.subtitle}>This is your homepage.</Text>

      <Button title="Go to Profile" onPress={() => router.push('/ProfileScreen')} />
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 20 },
});
