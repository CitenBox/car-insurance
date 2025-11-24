import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import api, { API_ROUTES } from "../src/api/api";
import LottieWrapper from "../src/components/LottieWrapper"; // ✔ לוטי לכל הפלטפורמות

    //יוצרים types למספר השאלות ולתשובות המשתמש
type ParsedQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  images?: string[];
};
    //ניצור type לתשובות עבור מסד הנתונים
type AnswerForDB = {
  questionid: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};
    // ניצור type לשאלות מהשרת
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

  // ✔ חדש — מצב הצגת לוטי
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

  const generateQuestion = () => {
    if (data.length === 0 || testFinished) return;

    const randomIndex = Math.floor(Math.random() * data.length);
    const record = data[randomIndex];

    const { options, correctAnswer, images } = parseOptions(record.description4);
    if (options.length === 0) return;

    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      question: record.title2 || "שאלה ללא כותרת",
      options: shuffledOptions,
      correctAnswer,
      images,
    });

    setSelectedAnswer(null);
  };

  const handleAnswer = (option: string) => {
    if (testFinished) return;

    setSelectedAnswer(option);

    if (currentQuestion) {
      setAnswers(prev => [
        ...prev,
        {
          questionid: questionIndex + 1,
          questionText: currentQuestion.question,
          userAnswer: option,
          correctAnswer: currentQuestion.correctAnswer,
          isCorrect: option === currentQuestion.correctAnswer
        }
      ]);
    }

    if (option !== currentQuestion?.correctAnswer) {
      setWrongCount(prev => prev + 1);
    }

    setQuestionIndex(prev => prev + 1);
  };

  const finishTest = async () => {
    if (testFinished) return;
    setTestFinished(true);

    // ✔ הצגת מסך הלוטי
    setShowLottieFinish(true);

    const passed = wrongCount <= MAX_WRONG;
    const score = answers.filter(a => a.isCorrect).length;
    const totalQuestions = answers.length;
    const totalTime = TOTAL_TIME - timeLeft;

    try {
      const res = await api.post(API_ROUTES.FULLTEST.SUBMIT, {
        answers,
        score,
        totalQuestions,
        wrongAnswers: wrongCount,
        timeTaken: totalTime,
        improvements: []
      });

      const { aiInsights } = res.data || {};

      // ✔ מחכה שהאנימציה תרוץ 2.5 שניות
      setTimeout(() => {
        router.push({
          pathname: "/TestSummaryScreen",
          params: {
            answers: JSON.stringify(answers),
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

    if (questionIndex >= TOTAL_QUESTIONS) {
      finishTest();
      return;
    }

    generateQuestion();
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

  // ✔ מסך לוטי בזמן סיום המבחן
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

  if (loading)
    return <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />;

  if (!currentQuestion)
    return <Text style={styles.message}>טוען שאלות...</Text>;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <View style={styles.container}>
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
          style={styles.option}
          onPress={() => handleAnswer(option)}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
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
});

export default PracticeScreen;
