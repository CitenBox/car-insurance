import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IUser } from '../types/User';
import api, { setAuthToken } from '../api/api';

// הוספת points לשדה המשתמש
export interface IUserWithPoints extends IUser {
  points?: number; // נקודות המשתמש, אופציונלי
}

// הגדרת סוגי ההקשר כולל updatePoints ו-loadingAuthState
interface AuthContextProps {
  user: IUserWithPoints | null;
  login: (token: string, user: IUserWithPoints) => Promise<void>;
  logout: () => Promise<void>;
  updatePoints?: (points: number) => void;
  loadingAuthState: boolean; // מצב טעינה של המשתמש
}

// יצירת הקשר עם ערכי ברירת מחדל
export const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: async () => {},
  logout: async () => {},
  updatePoints: () => {},
  loadingAuthState: true,
});

// ספק ההקשר שמנהל את מצב האותנטיקציה והטוקן
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUserWithPoints | null>(null);
  const [loadingAuthState, setLoadingAuthState] = useState(true); // מצב טעינה בתחילת הריצה

  // טוען אוטומטית Token ומידע משתמש מהאחסון
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');

        if (token) setAuthToken(token);
        if (userData) setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setLoadingAuthState(false); // סיום טעינה
      }
    };

    loadUser();
  }, []);

  // פונקציה לטיפול בלוגין
  const login = async (token: string, userData: IUserWithPoints) => {
    setUser(userData);
    setAuthToken(token);

    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  // פונקציה לטיפול בלוגאוט
  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');

    setAuthToken(null);
    setUser(null);
  };

  // פונקציה לעדכון נקודות בזמן אמת
  const updatePoints = (points: number) => {
    if (user) {
      const updatedUser = { ...user, points };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updatePoints, loadingAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};
