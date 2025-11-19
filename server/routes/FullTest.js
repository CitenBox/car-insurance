const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware'); // ← רק זה

router.post('/submit', protect, async (req, res) => {
  try {
    const { answers, score, totalQuestions, timeTaken, improvements } = req.body;

    const wrongAnswers = totalQuestions - score;
    const passed = wrongAnswers <= 4;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'משתמש לא נמצא' });

    user.test.push({
      score,
      totalQuestions,
      wrongAnswers,
      timeTaken,
      passed,
      answered: answers,
      improvements
    });

    user.userPounts += score;

    await user.save();

    res.json({ message: 'Test saved', test: user.test });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'שגיאה בשמירת המבחן' });
  }
});

module.exports = router;
