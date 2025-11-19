import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

const RESOURCE_ID = 'bf7cb748-f220-474b-a4d5-2d59f93db28d';

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
};

const PracticeScreen = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://data.gov.il/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&limit=182`
      );

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const json = await response.json();

      if (!json.success || !json.result.records) throw new Error('Invalid API response');

      setData(json.result.records);
    } catch (err: any) {
      console.error('Fetch failed:', err);
      Alert.alert(
        'שגיאה בטעינת השאלות',
        'לא ניתן לטעון את הנתונים מה-API, ודא שאתה מחובר לאינטרנט',
      );
    } finally {
      setLoading(false);
    }
  };

  const parseOptions = (html: string): { options: string[]; correctAnswer: string } => {
    const liMatches = html.match(/<li><span.*?>(.*?)<\/span><\/li>/g) || [];
    const options: string[] = liMatches.map(li => {
      const textMatch = li.match(/<span.*?>(.*?)<\/span>/);
      return textMatch ? textMatch[1] : '';
    });
    const correctMatch = html.match(/<span id="correctAnswer.*?">(.*?)<\/span>/);
    const correctAnswer = correctMatch ? correctMatch[1] : options[0];
    return { options, correctAnswer };
  };

  const generateQuestion = () => {
    if (data.length === 0) return;

    const randomIndex = Math.floor(Math.random() * data.length);
    const record = data[randomIndex];
    const { options, correctAnswer } = parseOptions(record.description4);
    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      question: record.title2,
      options: shuffledOptions,
      correctAnswer,
    });

    setSelectedAnswer(null);
  };

  const handleAnswer = (option: string) => {
    setSelectedAnswer(option);
    if (option === currentQuestion?.correctAnswer) {
      setTimeout(() => generateQuestion(), 2000);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) generateQuestion();
  }, [data]);

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />;

  if (!currentQuestion) return <Text style={styles.message}>טוען שאלות...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>בחר את התשובה הנכונה:</Text>
      <Text style={styles.question}>{currentQuestion.question}</Text>

      {currentQuestion.options.map((option, index) => {
        const isSelected = selectedAnswer === option;
        const isCorrect = option === currentQuestion.correctAnswer;

        let backgroundColor = '#fff';
        if (isSelected && isCorrect) backgroundColor = '#4CAF50';
        if (isSelected && !isCorrect) backgroundColor = '#F44336';

        return (
          <TouchableOpacity
            key={`${option}-${index}`}
            style={[styles.option, { backgroundColor }]}
            disabled={isSelected && isCorrect}
            onPress={() => handleAnswer(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        );
      })}

      {selectedAnswer && selectedAnswer === currentQuestion.correctAnswer && (
        <Text style={styles.correctText}>נכון! עוברים לשאלה הבאה בעוד 2 שניות...</Text>
      )}
      {selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer && (
        <Text style={styles.incorrectText}>טעות, נסה שוב!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f7f7f7' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  question: { fontSize: 18, marginBottom: 15, textAlign: 'center' },
  option: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 15, marginVertical: 8 },
  optionText: { fontSize: 16, textAlign: 'center' },
  correctText: { color: '#4CAF50', textAlign: 'center', marginTop: 10, fontSize: 16, fontWeight: 'bold' },
  incorrectText: { color: '#F44336', textAlign: 'center', marginTop: 10, fontSize: 16, fontWeight: 'bold' },
  message: { textAlign: 'center', marginTop: 50, fontSize: 16 },
});

export default PracticeScreen;
