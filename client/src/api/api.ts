import { Platform } from 'react-native';
import axios from 'axios';

// כתובת ה-IP של המחשב שלכם ברשת המקומית
const LOCAL_IP = '192.168.1.5'; // עדכן לפי הצורך

// זיהוי פלטפורמה כדי לבחור את ה-Base URL המתאים
let BASE_URL = '';

if (Platform.OS === 'android') {
  // Android Emulator
  BASE_URL = 'http://10.0.2.2:3000';
} else if (Platform.OS === 'ios') {
  // iOS Simulator
  BASE_URL = 'http://localhost:3000';
} else {
  // מכשיר פיזי
  BASE_URL = `http://${LOCAL_IP}:3000`;
}

// יצירת axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// פונקציה להוספת טוקן
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// מסלולים מובנים
export const API_ROUTES = {
  AUTH: '/api/auth',
  AI_ASK: '/api/ai/ask',
};

export default api;
