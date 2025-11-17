import axios from 'axios';
 // כאן יש לשים את הכתובת של השרת שלך
 // לדוגמה: 'http://localhost:3000/api/auth' או כתובת IP של המחשב שלך ברשת המקומית
 // אם אתה מריץ על אמולטור של אנדרואיד, השתמש ב-
const API_BASE_URL = 'http://10.0.0.6:3000/api/auth';

// יצירת מופע של axios עם הגדרות בסיסיות
// לשימוש בכל הבקשות לשרת
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// פונקציה להגדרת טוקן האותנטיקציה בכותרות של כל הבקשות
// משתמשים בה אחרי הלוגין או הלוגאוט
// כדי להוסיף או להסיר את הטוקן מהכותרות
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
