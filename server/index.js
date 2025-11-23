const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// --- Load environment variables ---
dotenv.config();

// --- Connect to MongoDB ---
connectDB();

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// === Routes ===

// Auth routes
app.use("/api/auth", require("./routes/auth"));

// AI routes
app.use("/api/ai", require("./routes/ai"));

// שאלות רגילות
app.use("/api/questions", require("./routes/question"));

// שאלה רנדומלית
app.use("/api/questions/random", require("./routes/randomQuestion"));

// מבחן מלא (submit מבחן + היסטוריית מבחנים)
app.use("/api/test", require("./routes/FullTest"));

// היסטוריית מבחנים לכל משתמש
// ⚡ ראוט ההיסטוריה החדש
app.use("/api/test/history", require("./routes/history"));

// למידה מתשובות שגויות - משוב AI
app.use("/api/learn", require("./routes/learnMistakes"));

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
