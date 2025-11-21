const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const RESOURCE_ID = 'bf7cb748-f220-474b-a4d5-2d59f93db28d';
let cache = null;

// נתיב שמחזיר את כל השאלות בסדר אקראי
router.get('/all', async (req, res) => {
  try {
    if (!cache) {
      const response = await fetch(
        `https://data.gov.il/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&limit=1802`
      );
      const json = await response.json();
      cache = json.result.records || [];
    }

    // ערבוב אקראי של השאלות
    const shuffled = [...cache].sort(() => Math.random() - 0.5);

    res.json(shuffled);
  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
});

// נתיב שמחזיר שאלה אקראית אחת
router.get('/random', async (req, res) => {
  try {
    if (!cache) {
      const response = await fetch(
        `https://data.gov.il/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&limit=1802`
      );
      const json = await response.json();
      cache = json.result.records || [];
    }

    // בחירה אקראית של שאלה אחת
    const randomIndex = Math.floor(Math.random() * cache.length);
    const record = cache[randomIndex];

    const questionText = record.title2;
    const html = record.description4;

    const liMatches = html.match(/<li><span.*?>(.*?)<\/span><\/li>/g) || [];
    const options = liMatches.map(li => {
      const textMatch = li.match(/<span.*?>(.*?)<\/span>/);
      return textMatch ? textMatch[1] : '';
    });

    const correctMatch = html.match(/<span id="correctAnswer.*?">(.*?)<\/span>/);
    const correctAnswer = correctMatch ? correctMatch[1] : options[0];

    res.json({
      question: questionText,
      options,
      correctAnswer,
      questionId: randomIndex
    });

  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ message: 'בעיה בטעינת השאלה' });
  }
});

module.exports = router;
