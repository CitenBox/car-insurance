import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../src/context/AuthContext';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomePageScreen() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      {/* Welcome */}
      <Text style={styles.title}>Welcome, {user?.username || 'User'}!</Text>

      {/* ספירת נקודות בצד שמאל */}
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsLabel}>Your Points:</Text>
        <Text style={styles.pointsValue}>{user?.points || 0}</Text>
      </View>

      {/* כפתורים */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/PracticeScreen')}
          activeOpacity={0.7}>

          <MaterialIcons name="question-answer" size={50} color="#007bff" />
          <Text style={styles.buttonText}>תרגולות ושאלות</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/FullTestScreen')}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="file-alt" size={50} color="#28a745" />
          <Text style={styles.buttonText}>מבחן מלא</Text>
        </TouchableOpacity>
      </View>

      {/* כפתור AI Chat בצד ימין למטה */}
      <TouchableOpacity
        style={styles.aiButton}
        activeOpacity={0.7}
        onPress={() => router.push('/AIChatScreen')}
      >
        <MaterialCommunityIcons name="robot" size={28} color="#fff" />
        <Text style={styles.aiButtonText}>AI Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  pointsContainer: {
    marginBottom: 40,
    alignSelf: 'flex-start',
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
  },
  pointsLabel: {
    fontSize: 18,
    color: '#fff',
  },
  pointsValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    padding: 20,
    borderRadius: 12,
    width: '45%',
  },
  buttonText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  aiButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6f42c1',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 5,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
