const express = require("express");
const router = express.Router();
const { askAI } = require("../utils/ai");

router.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    const answer = await askAI(prompt);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

module.exports = router;
