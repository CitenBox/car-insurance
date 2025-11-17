const openai = require("../config/openai");

async function askAI(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // or whatever model you plan to use
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
}

module.exports = { askAI };
