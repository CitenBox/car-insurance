import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, Text, ActivityIndicator, Alert } from 'react-native';

const RESOURCE_ID = 'bf7cb748-f220-474b-a4d5-2d59f93db28d';

const PracticeScreen = () => {
  const [data, setData] = useState([]); // כל הנתונים מה-API
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null); // השאלה הנוכחית
  const [userAnswer, setUserAnswer] = useState(''); // תשובת המשתמש

  // קריאה ל-API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://data.gov.il/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&limit=50`
      );
      const json = await response.json();
      setData(json.result.records || []);
    } catch (err) {
      Alert.alert('שגיאה', 'לא ניתן לטעון נתונים מה-API');
    } finally {
      setLoading(false);
    }
  };

  // יצירת שאלה אקראית
  const generateQuestion = () => {
    if (data.length === 0) return;
    const randomIndex = Math.floor(Math.random() * data.length);
    const record = data[randomIndex];
    const keys = Object.keys(record);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setCurrentQuestion({ key: randomKey, value: record[randomKey] });
    setUserAnswer('');
  };

  // בדיקה אם התשובה נכונה
  const checkAnswer = () => {
    if (!currentQuestion) return;

    if (userAnswer.trim().toLowerCase() === String(currentQuestion.value).toLowerCase()) {
      Alert.alert('נכון!', 'עוברים לשאלה הבאה', [{ text: 'OK', onPress: generateQuestion }]);
    } else {
      Alert.alert('טעות', 'נסה שוב');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      generateQuestion(); // מתחילים עם שאלה אקראית
    }
  }, [data]);

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />;

  if (!currentQuestion) return <Text style={styles.message}>טוען שאלות...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>נחש את הערך:</Text>
      <Text style={styles.question}>שדה: {currentQuestion.key}</Text>

      <TextInput
        style={styles.input}
        placeholder="הקלד את התשובה שלך"
        value={userAnswer}
        onChangeText={setUserAnswer}
      />

      <Button title="בדוק" onPress={checkAnswer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  question: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  message: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

export default PracticeScreen;
