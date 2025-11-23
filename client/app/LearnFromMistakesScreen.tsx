import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api, { API_ROUTES } from '../src/api/api';

type AnswerForDB = {
  questionid: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  aiFeedback?: string;
};

type TestHistoryItem = {
  _id: string;
  date: string;
  score: number;
  totalQuestions: number;
  wrongAnswers: number;
  passed: boolean;
  answered: AnswerForDB[];
  aiInsights?: string;
};

const LearnFromMistakesScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [latestTest, setLatestTest] = useState<TestHistoryItem | null>(null);
  const [wrongAnswersOnly, setWrongAnswersOnly] = useState<AnswerForDB[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState<{ [key: number]: boolean }>({});

  const fetchAIFeedback = async (answer: AnswerForDB, index: number) => {
    if (answer.aiFeedback) return; // כבר יש משוב

    setLoadingFeedback(prev => ({ ...prev, [index]: true }));

    try {
      const res = await api.post('/api/learn/feedback', {
        question: answer.questionText,
        userAnswer: answer.userAnswer,
        correctAnswer: answer.correctAnswer,
      });

      // עדכון התשובה עם המשוב מה-AI
      setWrongAnswersOnly(prev =>
        prev.map((item, i) =>
          i === index ? { ...item, aiFeedback: res.data.feedback } : item
        )
      );
    } catch (err) {
      console.error('Error fetching AI feedback:', err);
      Alert.alert('שגיאה', 'לא ניתן לקבל משוב מה-AI');
    } finally {
      setLoadingFeedback(prev => ({ ...prev, [index]: false }));
    }
  };

  const fetchLatestTest = async () => {
    setLoading(true);
    try {
      const res = await api.get<TestHistoryItem[]>(API_ROUTES.FULLTEST.HISTORY);
      
      if (res.data.length === 0) {
        Alert.alert("אין מבחנים", "עדיין לא ביצעת אף מבחן.");
        setLoading(false);
        return;
      }

      // מיון לפי תאריך ולקיחת המבחן האחרון
      const sorted = res.data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = sorted[0];

      setLatestTest(latest);

      // סינון רק תשובות שגויות
      const wrong = latest.answered.filter(answer => !answer.isCorrect);
      
      // הסרת כפילויות - שאלה שטעו בה מספר פעמים תופיע רק פעם אחת
      const uniqueWrong = wrong.reduce((acc: AnswerForDB[], current) => {
        const exists = acc.find(item => item.questionText === current.questionText);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      setWrongAnswersOnly(uniqueWrong);

      if (uniqueWrong.length === 0) {
        Alert.alert("מעולה!", "במבחן האחרון לא היו תשובות שגויות!");
      }

    } catch (err) {
      console.error('Error fetching latest test:', err);
      Alert.alert("שגיאה", "לא ניתן לטעון את המבחן האחרון");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestTest();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#dc3545" />
        <Text style={styles.loadingText}>טוען מבחן אחרון...</Text>
      </View>
    );
  }

  if (!latestTest) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noDataText}>לא נמצאו מבחנים</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/HomePageScreen')}>
          <Text style={styles.backButtonText}>חזור לדף הבית</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (wrongAnswersOnly.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.perfectText}>🎉 כל הכבוד!</Text>
        <Text style={styles.noDataText}>במבחן האחרון לא היו תשובות שגויות</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/HomePageScreen')}>
          <Text style={styles.backButtonText}>חזור לדף הבית</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>למידה מטעויות עם עוזר AI 🤖</Text>
        <Text style={styles.headerSubtitle}>
          מבחן מיום: {new Date(latestTest.date).toLocaleDateString('he-IL')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {wrongAnswersOnly.length} תשובות שגויות מתוך {latestTest.totalQuestions}
        </Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {wrongAnswersOnly.map((answer, index) => (
          <View key={answer.questionid} style={styles.answerCard}>
            <Text style={styles.questionNumber}>שאלה #{answer.questionid}</Text>
            <Text style={styles.questionText}>{answer.questionText}</Text>

            <View style={styles.answerSection}>
              <Text style={styles.wrongAnswerLabel}>התשובה שלך (שגויה):</Text>
              <Text style={styles.wrongAnswerText}>{answer.userAnswer}</Text>
            </View>

            <View style={styles.answerSection}>
              <Text style={styles.correctAnswerLabel}>התשובה הנכונה:</Text>
              <Text style={styles.correctAnswerText}>{answer.correctAnswer}</Text>
            </View>

            {/* כפתור למשוב AI */}
            {!answer.aiFeedback ? (
              <TouchableOpacity
                style={styles.feedbackButton}
                onPress={() => fetchAIFeedback(answer, index)}
                disabled={loadingFeedback[index]}
              >
                {loadingFeedback[index] ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.feedbackButtonText}>💡 קבל משוב למידה מ-AI</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.aiFeedbackBox}>
                <Text style={styles.aiFeedbackHeader}>💡 משוב למידה:</Text>
                <Text style={styles.aiFeedbackText}>{answer.aiFeedback}</Text>
              </View>
            )}
          </View>
        ))}

        {latestTest.aiInsights && (
          <View style={styles.aiInsightsContainer}>
            <Text style={styles.aiHeader}>💡 ניתוח AI:</Text>
            <Text style={styles.aiText}>{latestTest.aiInsights}</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.closeButton} onPress={() => router.push('/HomePageScreen')}>
        <Text style={styles.closeButtonText}>חזור לדף הבית</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  header: {
    backgroundColor: '#dc3545',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
  },
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  answerCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
  },
  answerSection: {
    marginBottom: 10,
  },
  wrongAnswerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 5,
  },
  wrongAnswerText: {
    fontSize: 15,
    color: '#dc3545',
    backgroundColor: '#ffe6e6',
    padding: 10,
    borderRadius: 5,
  },
  correctAnswerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
  },
  correctAnswerText: {
    fontSize: 15,
    color: '#28a745',
    backgroundColor: '#e6ffe6',
    padding: 10,
    borderRadius: 5,
  },
  aiInsightsContainer: {
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#e7f3ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  aiHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#007bff',
  },
  aiText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#007bff',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  perfectText: {
    fontSize: 32,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackButton: {
    backgroundColor: '#6f42c1',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  aiFeedbackBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6f42c1',
  },
  aiFeedbackHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#6f42c1',
    marginBottom: 8,
  },
  aiFeedbackText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default LearnFromMistakesScreen;
