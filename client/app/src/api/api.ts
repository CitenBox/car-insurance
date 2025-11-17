import { Platform } from 'react-native';
import axios from 'axios';

// כתובת ה-IP של המחשב שלכם ברשת המקומית
const LOCAL_IP = '192.168.1.5'; // החליפו לכתובת שלכם

// זיהוי פלטפורמה כדי לבחור את ה-Base URL המתאים
let API_BASE_URL = '';

if (Platform.OS === 'android') {
  // Android Emulator
  API_BASE_URL = 'http://10.0.2.2:3000/api/auth';
} else if (Platform.OS === 'ios') {
  // iOS Simulator
  API_BASE_URL = 'http://localhost:3000/api/auth';
} else {
  // מכשיר פיזי (iOS או Android)
  API_BASE_URL = `http://${LOCAL_IP}:3000/api/auth`;
}

// יצירת מופע axios עם הגדרות בסיסיות
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// פונקציה להוספה או הסרה של טוקן באותנטיקציה
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
