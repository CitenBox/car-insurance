import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IUser } from '../types/User';
import api, { setAuthToken } from '../api/api';

// הגדרת סוגי ההקשר

interface AuthContextProps {
  user: IUser | null;
  login: (token: string, user: IUser) => Promise<void>;
  logout: () => Promise<void>;
}

// יצירת הקשר עם ערכי ברירת מחדל
// הערכים האמיתיים יוגדרו ב־AuthProvider 
// שמקיף את האפליקציה
export const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: async () => {},
  logout: async () => {},
});

// ספק ההקשר שמנהל את מצב האותנטיקציה
// וטוקן האותנטיקציה
// מספק פונקציות ל־login ו־logout
// ושומר את המידע ב־AsyncStorage

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);

  // טוען אוטומטית Token מהאחסון
  // ומעדכן את מצב המשתמש כשהרכיב נטען
  // כך המשתמש נשאר מחובר גם אחרי סגירת האפליקציה
  // ומגדיר את הטוקן בכותרות של כל הבקשות
  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');

      if (token) setAuthToken(token);
      if (userData) setUser(JSON.parse(userData));
    };

    loadUser();
  }, []);
  // פונקציה לטיפול בלוגין
  // מקבלת טוקן ומידע משתמש
  // שומרת אותם ב־AsyncStorage
  // ומעדכנת את מצב המשתמש והטוקן בכותרות
  const login = async (token: string, userData: IUser) => {
    setUser(userData);
    setAuthToken(token);

    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');

    setAuthToken(null);
    setUser(null);
  };
  // מספק את הערכים של ההקשר לילדים
  // שמקיפים את האפליקציה
  // כולל את מצב המשתמש ופונקציות הלוגין והלוגאוט
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
