import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { AuthContext } from '../src/context/AuthContext';
import api from '../src/api/api';
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();
  const { user, login, logout } = useContext(AuthContext);

  // מציג את פרטי הפרופיל של המשתמש
  // מאפשר עדכון של שם משתמש, שם מלא, מחלקה וסיסמה
  // שולח את העדכונים לשרת ומעדכן את הקשר האותנטיקציה
  // כולל אפשרות להתנתק מהאפליקציה
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [password, setPassword] = useState('');

  // פונקציה לטיפול בעדכון פרופיל
  // שולחת את הנתונים המעודכנים לשרת
  // ומעדכנת את הקשר האותנטיקציה עם המידע החדש
  const handleUpdate = async () => {
    try {
      const res = await api.put('/profile', { username, fullName, department, password });
      Alert.alert('Updated', 'Profile updated');
      login(user!.token!, res.data);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  // פונקציה לטיפול בהתנתקות
  // קוראת לפונקציית ה־logout מההקשר
  // ומנווטת את המשתמש למסך הלוגין
  const handleLogout = async () => {
    await logout();
    router.push('/LoginScreen');
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="username" />
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="fullName" />
      <TextInput style={styles.input} value={department} onChangeText={setDepartment} placeholder="department" />
      <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="New Password" />

      <Button title="Update Profile" onPress={handleUpdate} />

      <View style={{ marginVertical: 10 }} />
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 16 },
});
