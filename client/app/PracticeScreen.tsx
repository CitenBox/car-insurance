import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import api from "../src/api/api";

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<Question[]>("/api/questions/all");
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
    if (questionIndex >= TOTAL_QUESTIONS) {
      finishTest();
      return;
    }
    if (data.length === 0) return;

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
    generateQuestion();
  };

  const finishTest = async () => {
    const passed = wrongCount <= MAX_WRONG;
    const score = answers.filter(a => a.isCorrect).length;
    const totalQuestions = answers.length;
    const totalTime = TOTAL_TIME - timeLeft;

    try {
      const res = await api.post("/api/fulltest/submit", {
        answers,
        score,
        totalQuestions,
        wrongAnswers: wrongCount,
        timeTaken: totalTime,
        improvements: []
      });

      const { aiInsights } = res.data || {};

      router.push({
        pathname: "/TestSummaryScreen",
        params: {
          answers: JSON.stringify(answers),
          passed: passed ? 'true' : 'false',
          aiInsights: aiInsights || ''
        }
      });
    } catch (err) {
      console.error("Error sending test results:", err);
      Alert.alert("שגיאה", "לא ניתן לשלוח את המבחן לשרת. בדוק את החיבור או את הנתיב.");
    }

    setCurrentQuestion(null);
    setAnswers([]);
    setQuestionIndex(0);
    setWrongCount(0);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) generateQuestion();
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          clearInterval(interval);
          finishTest();
          return 0;
        }

        if (prev <= 5 * 60 * 1000 && prev % 60000 < 1000) {
          const minutesLeft = Math.ceil(prev / 60000);
          Alert.alert("התראה", `נותרו ${minutesLeft} דקות למבחן`);
        }

        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading)
    return <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />;

  if (!currentQuestion)
    return <Text style={styles.message}>חושב על שאלות ...</Text>;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <View style={styles.container}>
      <Text style={styles.questionNumber}>
        שאלה {questionIndex + 1} מתוך {TOTAL_QUESTIONS}
      </Text>
      <Text style={styles.timer}>זמן נותר: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</Text>

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
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#f7f7f7" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  question: { fontSize: 18, marginBottom: 15, textAlign: "center" },
  option: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 15, marginVertical: 8 },
  optionText: { fontSize: 16, textAlign: "center" },
  message: { textAlign: "center", marginTop: 50, fontSize: 16 },
  questionNumber: { fontSize: 16, marginBottom: 5, textAlign: "center", color: "#333" },
  timer: { fontSize: 16, textAlign: "center", color: "#ff0000", marginBottom: 10 },
  image: { width: "100%", height: 200, resizeMode: "contain", marginVertical: 10, borderRadius: 5, backgroundColor: "#eaeaea" },
});

export default PracticeScreen;
