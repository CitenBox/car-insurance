const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// GET /api/test/history
// מחזיר את כל המבחנים של המשתמש המחובר
// אפשרות לסינון לפי תאריך והצלחה/כישלון
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "משתמש לא נמצא" });

    let tests = [...user.test];

    // --- סינון לפי הצלחה/כישלון ---
    // ?status=passed או ?status=failed
    const { status, from, to } = req.query;

    if (status === "passed") {
      tests = tests.filter(t => t.passed === true);
    } else if (status === "failed") {
      tests = tests.filter(t => t.passed === false);
    }

    // --- סינון לפי תאריכים ---
    // ?from=YYYY-MM-DD&to=YYYY-MM-DD
    const fromDate = from ? new Date(from) : new Date(0);
    const toDate = to ? new Date(to) : new Date();

    tests = tests.filter(t => {
      const testDate = new Date(t.date);
      return testDate >= fromDate && testDate <= toDate;
    });

    // --- מיון מהחדש לישן ---
    tests.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(tests);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ message: "שגיאה בטעינת ההיסטוריה" });
  }
});

module.exports = router;
