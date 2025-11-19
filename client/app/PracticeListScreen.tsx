import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../src/api/api";

type PracticeItem = {
  id: string;
  title2: string;
  description4: string; // HTML עם השאלה, אפשרויות ותשובה
};

type ParsedQuestion = {
  question: string;
  correctAnswer: string;
  images?: string[];
};

export default function PracticeListScreen() {
  const [loading, setLoading] = useState(false);
  const [practices, setPractices] = useState<PracticeItem[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<ParsedQuestion | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPractices = async () => {
    setLoading(true);
    try {
      const res = await api.get<PracticeItem[]>("/api/questions/all");
      setPractices(res.data);
    } catch (err) {
      console.error(err);
      alert("לא ניתן לטעון את התרגולות מהשרת");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPractices();
  }, []);

  const parseQuestion = (html: string): ParsedQuestion => {
    // מחלץ את השאלה
    const questionMatch = html.match(/<h1.*?>(.*?)<\/h1>/) || html.match(/<p.*?>(.*?)<\/p>/);
    const questionText = questionMatch ? questionMatch[1] : "שאלה ללא טקסט";

    // מחלץ את התשובה הנכונה
    const correctMatch = html.match(/<span id="correctAnswer.*?">(.*?)<\/span>/);
    const correctAnswer = correctMatch ? correctMatch[1] : "";

    // מחלץ תמונות אם יש
    const imgMatches = html.match(/<img.*?src="(.*?)".*?>/g) || [];
    const images = imgMatches.map((img) => {
      const srcMatch = img.match(/src="(.*?)"/);
      return srcMatch ? srcMatch[1] : "";
    });

    return { question: questionText, correctAnswer, images };
  };

  const handlePress = (item: PracticeItem) => {
    const parsed = parseQuestion(item.description4);
    setSelectedQuestion(parsed);
    setShowModal(true);
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>תרגולות ושאלות</Text>

      <FlatList
        data={practices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handlePress(item)}>
            <Text style={styles.itemText}>{item.title2}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal להצגת השאלה, תמונות ותשובה */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>שאלה:</Text>
            <Text style={styles.modalQuestion}>{selectedQuestion?.question}</Text>

            {selectedQuestion?.images?.map((src, i) => (
              <Image key={i} source={{ uri: src }} style={styles.image} />
            ))}

            <Text style={[styles.modalTitle, { marginTop: 15 }]}>תשובה:</Text>
            <Text style={styles.modalAnswer}>{selectedQuestion?.correctAnswer}</Text>

            <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
              <Text style={styles.closeText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  item: { padding: 15, backgroundColor: "#e9ecef", borderRadius: 10, marginBottom: 10 },
  itemText: { fontSize: 16 },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  modalQuestion: { fontSize: 16, marginTop: 10, textAlign: "center" },
  modalAnswer: { fontSize: 16, marginTop: 5, textAlign: "center", color: "#28a745" },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: "#007bff",
    borderRadius: 8,
  },
  closeText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginVertical: 10,
    borderRadius: 5,
    backgroundColor: "#eaeaea",
  },
});
