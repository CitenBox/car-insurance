import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import api from "../src/api/api";

// ParsedQuestion – שאלה מוכנה להצגה, כולל אופציות, תשובה נכונה ואפשר תמונות.
type ParsedQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
    images?: string[];

};
// AnswerForDB – תשובות המשתמש כדי לשמור ב־DB. כולל האם התשובה נכונה.
// isCorrect – מאפשר לחשב score בקלות.
type AnswerForDB = {
  questionid: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

//נגדיר טיפוס שאלות עם ההגדרות id,tile2,description4

type Question = {
  id: string;
  title2: string;
  description4: string;
};

    type SubmitResponse ={
      aiInsights?:string;
    }

//נגדיר משנה של כמות השאלות ומקסימום שגיאות
const TOTAL_QUESTIONS = 30;
const MAX_WRONG = 5;

const PracticeScreen = () => {
  //ניצור סטייטים  
  // data(מספר השאלות ומקסימום שגיאות)
  // loading(מצב טעינה שאלות)
  // currentQuestion(השאלה הנוכחית)
  // selectedAnswer(התשובה שנבחרה)
  // blockClick(מצב לחיצה בלי הרשמה)
  // questionIndex(מספר השאלה הנוכחית)
  // wrongCount(מספר הטעויות שגויות)
  // answers(תשובות המשתמש)
  const [data, setData] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<ParsedQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [blockClick, setBlockClick] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answers, setAnswers] = useState<AnswerForDB[]>([]); // תשובות המשתמש
  const [startTime,setstartTime] = useState(new Date());
  const[questionTime,setQuestionTime] = useState(0);


  // ---- fetchData ----
  // fetchData מקבל את השאלות מהשרת ומחזירה אותן למסד הנתונים 
  //
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<Question[]>("/api/questions/all");
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("לא ניתן לטעון את השאלות מהשרת");
    } finally {
      setLoading(false);
    }
  };
// ניצור את פונקציית parseOptions
// הפונקצייה מקבלת פרמטר אחד בשם html שיכול להיות string או  undefined סימן שאלה מגיד אופציונלי)
// typescript אומר שהפונקצייה מחזירה אובייקט עם :
// option -מערך של מחרוזות
// currectSAnswer -התשובה הנכונה
// image? -תמונות אם יש(בתור מערך של מחרוזות)
  const parseOptions = (
  html?: string
): { options: string[]; correctAnswer: string; images?: string[] } => {
  // אם html לא קיים או הוא undefined מחזיר פרמטרים ריקים
  // תחזיר אובייקט ריק עם ערכים דיפולטיבים
  // (options :[]-אין אפשריות להציג תמונות)
  // correctAnswer:""-אם אין תשובה נכונה
  // images:[]-אם אין תמונות
  if (!html) return { options: [], correctAnswer: "", images: [] };
  //יוצרים משתנה קבוע לחיפוש כל האפשרויות
  // html.match מחפש את כל ההתאמות שך Regex בhtml 
  // ה Regex?

// Regex (או Regular Expression) זה כמו שפה קטנה בתוך קוד שמאפשרת לחפש תבניות בתוך טקסט.
// אפשר לחשוב על זה כמו חיפוש מתקדם ב־Word או בגוגל, אבל הרבה יותר חזק.

// למשל:

// "cat" – יחפש את המילה cat בדיוק.

// "c.t" – יחפש מילה שמתחילה ב־c, יש בה תו כלשהו באמצע, ומסתיימת ב־t → מתאים ל־cat, cot, cut.

// "c.*t" – מתאים לכל דבר שמתחיל ב־c ומסתיים ב־t, גם אם יש הרבה תווים באמצע → cat, caught, count.

// איך זה עובד בקוד שלך?
// const liMatches = html.match(/<li><span.*?>(.*?)<\/span><\/li>/g) || [];


// html.match(...) – מחפש בטקסט (html) כל מקום שתואם ל־Regex.

// /.../g – הסוגריים עם הקווים / זה ה־Regex עצמו, וה־g אומר חפש את כל המקומות, לא רק את הראשון.

// || [] – אם לא מצא כלום, תחזיר מערך ריק במקום null.

// <li><span.*?>(.*?)</span></li>


// פירוש פשוט:

// <li> – חפש תגית <li>.

// <span.*?> – בתוך ה־li יש תגית <span> עם כל מאפיין אפשרי.

// (.*?) – קח את הטקסט שבתוך ה־span.

// </span></li> – סוגר את התגיות.

// 💡 התוצאה: liMatches הוא מערך של כל השורות <li><span>תשובה</span></li> שמצאנו ב־HTM
  const liMatches = html.match(/<li><span.*?>(.*?)<\/span><\/li>/g) || [];
  const options: string[] = liMatches.map((li) => {
    const textMatch = li.match(/<span.*?>(.*?)<\/span>/);
    return textMatch ? textMatch[1] : "";
  });

  // html.match(/<span id="correctAnswer.*?">(.*?)<\/span>/) → מחפש <span> שבו id מתחיל ב־correctAnswer.

// correctMatch ? correctMatch[1] : options[0] || "" → אם מצאנו, קח את הטקסט שבתוך span.

// אחרת, קח את האפשרות הראשונה (options[0])

// ואם אין אפשרויות בכלל → מחרוזת ריקה.
  const correctMatch = html.match(/<span id="correctAnswer.*?">(.*?)<\/span>/);
  const correctAnswer = correctMatch ? correctMatch[1] : options[0] || "";

  // חיפוש תמונות
  
// html.match(/<img.*?src="(.*?)".*?>/g) → מחפש את כל תגי <img> עם src.

// imgMatches.map(...) → עבור כל תמונה שמצאנו, שולפים את כתובת ה‑src.

// אם לא מצאנו src → מחזירים מחרוזת ריקה.


  const imgMatches = html.match(/<img.*?src="(.*?)".*?>/g) || [];
  const images = imgMatches.map((img) => {
    const srcMatch = img.match(/src="(.*?)"/);
    return srcMatch ? srcMatch[1] : "";
  });
    // פשוט מחזירים אובייקט עם שלוש השדות 
    // option-כל האופציות
    // correctAnswer-התשובה הנכונה
    // images-תמונות אם יש
  return { options, correctAnswer, images };
};

        // ניצור פונקצייה שתבדוק מתי והאם לסיים את המבחן
      // בודק אם האינדקס של השאלות גדול שווה לסך כל השאלות מעל שווה ל30(מספר השאלות)
      // במידה וכן תסיים את המבחן
const generateQuestion = () => {
  if (questionIndex >= TOTAL_QUESTIONS || wrongCount >= MAX_WRONG) {
    finishTest();
    return;
  }
    // בודקים אם אורך הדאטה של השאלות שווה ל0 נעשה return
  if (data.length === 0) return;
        // ניצור פונקצייה ליצירת random שתעשה באמצעות Math.floor(Math.random() * data.length)
  const randomIndex = Math.floor(Math.random() * data.length);
  // ניצור פונקצייה ליצירת record ( record-הוא השאלה הנבחרת כרגע, שהיא אובייקט מהסוג Question) שתעשה באמצעות data[randomIndex]
  const record = data[randomIndex];
    // ניצור פונקצייה ליצירת options שתעשה באמצעות parseOptions ושמחזירה אובייקט עם פרמטרי options, correctAnswer, images
  const { options, correctAnswer, images } = parseOptions(record.description4);
  if (options.length === 0) return;
      // ניצור פונקצייה ליצירת shuffledOptions שתעשה באמצעות options.sort(() => Math.random() - 0.5)
  const shuffledOptions = options.sort(() => Math.random() - 0.5);
        // מעדכן את השאלה הנוכחית עם הכותרת, האופציות, התשובה הנכונה והתמונות
  setCurrentQuestion({
    question: record.title2 || "שאלה ללא כותרת",
    options: shuffledOptions,
    correctAnswer,
    images,
  });
      // ניצור פונקצייה ליצירת setSelectedAnswer שתעשה באמצעות null
// וניצור פונקצייה ליצירת setBlockClick שתעשה באמצעות false
  setSelectedAnswer(null);
  setBlockClick(false);
  // ניצור פונקצייה ליצירת setQuestionTime שתעשה באמצעות new Date()
    setQuestionTime(Date.now());
};


    // מטפל בבחירת תשובה:
// אם לחיצה חסומה – לא עושה כלום
// אחרת – מעדכן את התשובה שנבחרה ומוסיף אותה למערך התשובות

 const handleAnswer = (option: string) => {
  const timeTaken=Date.now()-questionTime;
  if (blockClick) return;
      // ניצור פונקצייה ליצירת setSelectedAnswer שתעשה באמצעות פרמטרי option
  setSelectedAnswer(option);
      // אם המשתמש לא מחובר או שאינו במצב הבית – לא עושה כלום
      // אחרת – מעדכן את תשובות המשתמש ומוסיף אותן למערך התשובות

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
      // אם התשובה הנכונה – מעדכן את blockClick ומוסיף אותה למערך התשובות
      // אחרת – מעדכן את wrongCount ומוסיף אותו למערך התשובות
if (option === currentQuestion?.correctAnswer) {
    setBlockClick(true);
    setTimeout(() => {
        setQuestionIndex(prev => prev + 1); // <-- רק כאן
        generateQuestion();
    }, 1500);
  } else {
    const newWrongCount = wrongCount + 1;
    setWrongCount(prev => prev + 1);
    // setQuestionIndex(prev => prev + 1);
        // אם שגיאה – מסיים את המבחן ומוסיף אותו למערך התשובות
    if (newWrongCount >= MAX_WRONG) {
      finishTest(false);
    }
  }
};
      // יוצרים פונקציה לסיים את המבחן ומוסיף אותו למערך התשובות
const finishTest = async (passed: boolean = true) => {
  alert(passed ? "המבחן הסתיים בהצלחה!" : "המבחן נכשל!");

  const score = TOTAL_QUESTIONS - wrongCount;
  const totalQuestions = questionIndex;
  const totalTime = Date.now() - startTime.getTime(); // חישוב זמן סיום

  try {
    const res = await api.post<SubmitResponse>("/api/FullTest/submit", {
      answers,
      score,
      totalQuestions,
      timeTaken: totalTime,
    });

    if (res.data.aiInsights) {
      router.push({
        pathname: "/AIQuizScreen",
        params: { autoMessage: res.data.aiInsights }
      });
    }
  } catch (err) {
    console.error("Error sending test results:", err);
  }

  // איפוס מצבים
  setCurrentQuestion(null);
  setAnswers([]);
  setQuestionIndex(0);
  setWrongCount(0);
  router.push('/HomePageScreen');
};



  // ---- Effects ----
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) generateQuestion();
  }, [data]);

// ניצור useeffect לקביעת זמן ההתחלה של המבחן
useEffect(()=>{
  setstartTime(new Date());
},[]);


  // ---- UI ----
  if (loading)
    return (
      <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
    );

  if (!currentQuestion)
    return <Text style={styles.message}>חושב על שאלות ...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.questionNumber}>
  שאלה {questionIndex + 1} מתוך {TOTAL_QUESTIONS}
</Text>

      <Text style={styles.title}>בחר את התשובה הנכונה:</Text>
      <Text style={styles.question}>{currentQuestion.question}</Text>

       {/* הצגת תמונות אם יש */}
    {currentQuestion.images?.map((src, i) => (
      <Image
        key={i}
        source={{ uri: src }}
        style={styles.image}
      />
    ))}

      {currentQuestion.options.map((option, index) => {
        const isSelected = selectedAnswer === option;
        const isCorrect = option === currentQuestion.correctAnswer;

        let backgroundColor = "#fff";
        if (isSelected && isCorrect) backgroundColor = "#4CAF50";
        if (isSelected && !isCorrect) backgroundColor = "#F44336";

        return (
          <TouchableOpacity
            key={`${option}-${index}`}
            style={[styles.option, { backgroundColor }]}
            disabled={blockClick} // מונע לחיצה רק אחרי תשובה נכונה
            onPress={() => handleAnswer(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        );
      })}

      {selectedAnswer && selectedAnswer === currentQuestion.correctAnswer && (
        <Text style={styles.correctText}>
          נכון! עוברים לשאלה הבאה...
        </Text>
      )}
      {selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer && (
        <Text style={styles.incorrectText}>טעות, נסה שוב!</Text>
      )}
      <TouchableOpacity
  style={styles.aiButton}
  activeOpacity={0.7}
  onPress={() =>
    router.push({
      pathname: "/AIQuizScreen",
      params: {
        question: currentQuestion?.question,
        options: JSON.stringify(currentQuestion?.options || []),
      }
    })
  }
>
  <MaterialCommunityIcons name="robot" size={28} color="#fff" />
  <Text style={styles.aiButtonText}>שאל את ה־AI</Text>
</TouchableOpacity>

    </View>
  );
};

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f7f7f7",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  question: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
  },
  option: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    marginVertical: 8,
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
  },
  correctText: {
    color: "#4CAF50",
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  incorrectText: {
    color: "#F44336",
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  message: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
  questionNumber: {
  fontSize: 16,
  marginBottom: 5,
  textAlign: "center",
  color: "#333",
},
   image: {          // <-- הוסף כאן
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginVertical: 10,
    borderRadius: 5,
    backgroundColor: "#eaeaea",
  },
  aiButton: {
  position: "absolute",
  bottom: 30,
  right: 20,
  backgroundColor: "#007AFF",
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 30,
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  elevation: 5,
},
aiButtonText: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "600",
},
});

export default PracticeScreen;
