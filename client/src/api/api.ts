import axios from "axios";
import { Platform } from "react-native";

// כתובת ה-IP של המחשב שלכם ברשת המקומית
const LOCAL_IP = "192.114.1.65";

// זיהוי פלטפורמה כדי לבחור את ה-Base URL המתאים
let BASE_URL = "";

if (Platform.OS === "android") {
  // Android Emulator
  BASE_URL = "http://10.0.2.2:3000";
} else if (Platform.OS === "ios") {
  // iOS Simulator
  BASE_URL = "http://localhost:3000";
} else if (Platform.OS === "web") {
  BASE_URL = "http://localhost:3000";
} else {
  // iOS סימולטור + iOS מכשיר פיזי + Android מכשיר פיזי
  // כולם משתמשים ב-IP של המחשב ברשת
  BASE_URL = `http://${LOCAL_IP}:3000`;
}

// יצירת axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// פונקציה להוספת טוקן
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// מסלולים מובנים
export const API_ROUTES = {
  AUTH: "/api/auth",
  AI_ASK: "/api/ai/ask",
};

export default api;
