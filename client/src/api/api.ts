import { Platform } from 'react-native';
import axios from 'axios';

// כתובת ה-IP של המחשב שלכם ברשת המקומית (Correct IP)
const LOCAL_IP = '10.0.0.6';

// זיהוי פלטפורמה כדי לבחור את ה-Base URL המתאים
let BASE_URL = '';

// אנדרואיד אמולטור → גישה ל-localhost של המחשב
if (Platform.OS === 'android') {
  BASE_URL = 'http://10.0.2.2:3000';

} else {
  // iOS סימולטור + iOS מכשיר פיזי + Android מכשיר פיזי
  // כולם משתמשים ב-IP של המחשב ברשת
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
  AUTH_LOGIN: '/api/auth/login',
  AUTH_SIGNUP: '/api/auth/signup',
  AUTH_PROFILE: '/api/auth/profile',
  AI_ASK: '/api/ai/ask',
};

export default api;
