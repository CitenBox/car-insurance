const openai = require("../config/openai");

async function askAI(prompt) {
  try {
    // Use a broadly available chat model. Change to a different model if you have access.
    const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
    });

    // Safely extract text from various possible response shapes
    if (response && response.choices && response.choices.length > 0) {
      const choice = response.choices[0];
      if (choice.message && choice.message.content) return choice.message.content;
      if (choice.text) return choice.text;
    }

    // Fallback: return a stringified response for easier debugging
    return JSON.stringify(response);
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
}

// פונקציה לקבלת משוב למידה על שאלה שגויה ספציפית
async function getQuestionFeedback(question, userAnswer, correctAnswer) {
  try {
    const prompt = `
אתה מורה מנוסה לתאוריה בנהיגה. תלמיד טעה בשאלה הבאה:

שאלה: ${question}
תשובה של התלמיד: ${userAnswer}
התשובה הנכונה: ${correctAnswer}

אנא ספק משוב קצר ומועיל (2-3 משפטים) הכולל:
1. הסבר קצר מדוע התשובה הנכונה היא נכונה
2. טיפ אחד להשתפר בהקשר של תוכן השאלה
3. דגש על הנקודה הקריטית שיש לזכור

התשובה צריכה להיות בעברית, ברורה ותמציתית.
`;

    return await askAI(prompt);
  } catch (error) {
    console.error("Error getting question feedback:", error);
    return "לא ניתן לקבל משוב למידה כרגע.";
  }
}

module.exports = { askAI, getQuestionFeedback };
