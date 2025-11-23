import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

// כתובת ה-IP של המחשב שלכם ברשת המקומית
const LOCAL_IP = "192.168.10.55";

// זיהוי פלטפורמה כדי לבחור את ה-Base URL המתאים
const getBaseURL = () => {
  const isDevice =
    Constants.executionEnvironment === "standalone" ||
    Constants.executionEnvironment === "storeClient";

  if (Platform.OS === "android" && !isDevice) {
    // Android Emulator
    return "http://10.0.2.2:3000";
  }

  if (Platform.OS === "ios" && !isDevice) {
    // iOS Simulator
    return "http://localhost:3000";
  }
  if (Platform.OS === "web") {
    return "http://localhost:3000";
  }
  // iOS סימולטור + iOS מכשיר פיזי + Android מכשיר פיזי
  // כולם משתמשים ב-IP של המחשב ברשת
  return `http://${LOCAL_IP}:3000`;
};

const BASE_URL = getBaseURL();

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
