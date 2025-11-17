import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from './src/context/AuthContext';

// הספק שמקיף את כל האפליקציה
// ומספק את הקשר של האותנטיקציה
// כך שכל הרכיבים באפליקציה יכולים לגשת למידע על המשתמש
// ולפונקציות הלוגין והלוגאוט
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="HomePageScreen" />
    </AuthProvider>
  );
}
