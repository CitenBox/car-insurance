const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const RESOURCE_ID = 'bf7cb748-f220-474b-a4d5-2d59f93db28d';
let cache = null;

router.get('/all', async (req, res) => {
  try {
    if (cache) return res.json(cache);
    // routes/question.js
    router.get("/:id", async (req, res) => {
      try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: "Question not found" });
        res.json(question);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });


    const response = await fetch(
      `https://data.gov.il/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&limit=1802`
    );

    const json = await response.json();

    cache = json.result.records || [];

    res.json(cache);

  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
});

module.exports = router;
