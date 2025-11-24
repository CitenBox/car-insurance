const express = require("express");
const router = express.Router();
const User = require("../models/User"); // הנתיב ל-User.js שלך
const { protect } = require("../middleware/authMiddleware"); // אם אתה משתמש ב-JWT

// GET /api/user-points/:userId
router.get("/:userId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ userPoints: user.userPoints });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user-points/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ userPoints: user.userPoints });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
