import axios from "axios";
import { Platform } from "react-native";

const LOCAL_IP = "192.168.1.106"; // כתובת ה-LAN שלך

let BASE_URL = "";

if (Platform.OS === "android") {
  BASE_URL = "http://10.0.2.2:3000";
} else if (Platform.OS === "ios" || Platform.OS === "web") {
  BASE_URL = "http://localhost:3000";
} else {
  BASE_URL = `http://${LOCAL_IP}:3000`;
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// פונקציה להוספה/הסרה של Authorization token
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Routes מותאמים ל-backend
export const API_ROUTES = {
  AUTH: "/api/auth",
  AI_ASK: "/api/ai/ask",
  QUESTIONS: "/api/questions",
  RANDOM_QUESTION: "/api/questions/random",
  FULLTEST: {
    SUBMIT: "/api/test",           // <--- POST למבחן מלא
    HISTORY: "/api/test/history",
  },
};

export default api;
