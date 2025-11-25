import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView
} from "react-native";
import api, { API_ROUTES } from "../src/api/api";
import LottieWrapper from "../src/components/LottieWrapper";

type ParsedQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  images?: string[];
};

type AnswerForDB = {
  questionid: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  title2: string;
  description4: string;
};

const TOTAL_QUESTIONS = 30;
const MAX_WRONG = 4;
const TOTAL_TIME = 40 * 60 * 1000;

const PracticeScreen = () => {
  const [data, setData] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<ParsedQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answers, setAnswers] = useState<AnswerForDB[]>([]);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [testFinished, setTestFinished] = useState(false);
  const [showLottieFinish, setShowLottieFinish] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<Question[]>(API_ROUTES.QUESTIONS + "/all");
      setData(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("שגיאה", "לא ניתן לטעון את השאלות מהשרת");
    } finally {
      setLoading(false);
    }
  };

  const parseOptions = (html?: string) => {
    if (!html) return { options: [], correctAnswer: "", images: [] };
    const liMatches = html.match(/<li><span.*?>(.*?)<\/span><\/li>/g) || [];
    const options: string[] = liMatches.map(li => {
      const textMatch = li.match(/<span.*?>(.*?)<\/span>/);
      return textMatch ? textMatch[1] : "";
    });
    const correctMatch = html.match(/<span id="correctAnswer.*?">(.*?)<\/span>/);
    const correctAnswer = correctMatch ? correctMatch[1] : options[0] || "";
    const imgMatches = html.match(/<img.*?src="(.*?)".*?>/g) || [];
    const images = imgMatches.map(img => {
      const srcMatch = img.match(/src="(.*?)"/);
      return srcMatch ? srcMatch[1] : "";
    });
    return { options, correctAnswer, images };
  };

  const generateQuestion = (index: number) => {
    if (data.length === 0 || testFinished) return;

    const record = data[index % data.length];
    const { options, correctAnswer, images } = parseOptions(record.description4);
    if (options.length === 0) return;
    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      question: record.title2 || "שאלה ללא כותרת",
      options: shuffledOptions,
      correctAnswer,
      images,
    });

    const existingAnswer = answers[index];
    setSelectedAnswer(existingAnswer ? existingAnswer.userAnswer : null);
  };

  const handleAnswer = (option: string) => {
    if (testFinished) return;

    setSelectedAnswer(option);

    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = {
        questionid: questionIndex + 1,
        questionText: currentQuestion?.question || "",
        userAnswer: option,
        correctAnswer: currentQuestion?.correctAnswer || "",
        isCorrect: option === currentQuestion?.correctAnswer
      };
      return newAnswers;
    });

    if (option !== currentQuestion?.correctAnswer) {
      setWrongCount(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex(prev => prev - 1);
    }
  };

  const goToNextQuestion = () => {
    if (questionIndex < TOTAL_QUESTIONS - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
  if (testFinished) return;
  setTestFinished(true);
  setShowLottieFinish(true);

  const answered = answers.filter(a => a !== undefined);

  const passed = wrongCount <= MAX_WRONG;
  const score = answered.filter(a => a.isCorrect).length;
  const totalQuestions = answered.length;
  const totalTime = TOTAL_TIME - timeLeft;

  try {
    const res = await api.post(API_ROUTES.FULLTEST.SUBMIT, {
      answers: answered,
      score,
      totalQuestions,
      wrongAnswers: wrongCount,
      timeTaken: totalTime,
      improvements: []
    });

    const { aiInsights } = res.data || {};

    setTimeout(() => {
      router.push({
        pathname: "/TestSummaryScreen",
        params: {
          answers: JSON.stringify(answered),
          passed: passed ? "true" : "false",
          aiInsights: aiInsights || ""
        }
      });
    }, 2500);
  } catch (err) {
    console.error("Error sending test results:", err);
    Alert.alert("שגיאה", "לא ניתן לשלוח את המבחן לשרת.");
  }
    };


  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (data.length === 0 || testFinished) return;
    generateQuestion(questionIndex);
  }, [questionIndex, data, testFinished]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          clearInterval(interval);
          finishTest();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (showLottieFinish) {
    return (
      <View style={styles.lottieContainer}>
        <LottieWrapper
          source={require('../assets/driving.json')}
          style={{ width: 250, height: 250 }}
        />
        <Text style={styles.loadingText}>מעבד את התוצאות...</Text>
      </View>
    );
  }

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />;
  if (!currentQuestion) return <Text style={styles.message}>טוען שאלות...</Text>;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <Text style={styles.questionNumber}>
        שאלה {questionIndex + 1} מתוך {TOTAL_QUESTIONS}
      </Text>

      <Text style={styles.timer}>
        זמן נותר: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </Text>

      <Text style={styles.title}>בחר את התשובה הנכונה:</Text>
      <Text style={styles.question}>{currentQuestion.question}</Text>

      {currentQuestion.images?.map((src, i) => (
        <Image key={i} source={{ uri: src }} style={styles.image} />
      ))}

      {currentQuestion.options.map((option, index) => (
        <TouchableOpacity
          key={`${option}-${index}`}
          style={[
            styles.option,
            selectedAnswer === option && { backgroundColor: "#d1e7ff" }
          ]}
          onPress={() => handleAnswer(option)}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, questionIndex === 0 && { opacity: 0.5 }]}
          disabled={questionIndex === 0}
          onPress={goToPreviousQuestion}
        >
          <Text style={styles.navButtonText}>שאלה קודמת</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={goToNextQuestion}>
          <Text style={styles.navButtonText}>
            {questionIndex === TOTAL_QUESTIONS - 1 ? "סיים" : "שאלה הבאה"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f4f8" },

  lottieContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
    color: "#1f2937",
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    color: "#4b5563",
    marginBottom: 8,
  },
  timer: {
    fontSize: 16,
    textAlign: "center",
    color: "#ef4444",
    fontWeight: "600",
    marginBottom: 15,
  },
  question: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 20,
    textAlign: "center",
    color: "#111827",
  },
  option: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#1f2937",
    fontWeight: "500",
  },
  message: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#6b7280",
  },
  image: {
    width: "100%",
    height: 220,
    resizeMode: "contain",
    marginVertical: 15,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  navButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PracticeScreen;
