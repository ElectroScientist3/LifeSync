const User = require('../models/User');
const { sendFitnessReminder } = require('../services/notificationService');

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DEFAULT_MEAL_ARRAY = [
  { desc: "", calories: "" },
  { desc: "", calories: "" },
  { desc: "", calories: "" },
  { desc: "", calories: "" },
  { desc: "", calories: "" },
];

// Helper to convert Map to plain object (replace the old one)
function mapToObj(map, days, emptyValue) {
  const obj = {};
  days.forEach(day => {
    let val;
    if (map instanceof Map) {
      val = map.get(day);
    } else if (map && typeof map === "object") {
      val = map[day];
    }
    obj[day] = Array.isArray(val) ? val : emptyValue;
  });
  return obj;
}

// Helper to ensure all days are present
function ensureDays(obj, days, emptyValue) {
  const result = {};
  days.forEach(day => {
    if (obj && obj[day] && Array.isArray(obj[day])) {
      result[day] = obj[day];
    } else {
      result[day] = Array.isArray(emptyValue) ? [...emptyValue] : [];
    }
  });
  return result;
}

// Get user profile (protected)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: "User not found" });

    const userObj = user.toObject();

    // Normalize weeklyPlans
    userObj.weeklyPlans = ensureDays(userObj.weeklyPlans, daysOfWeek, []);

    // Normalize fitnessPlans (Map -> Object with arrays)
    userObj.fitnessPlans = ensureDays(
      mapToObj(user.fitnessPlans, daysOfWeek, []),
      daysOfWeek,
      []
    );

    // Normalize mealPlans (Map -> Object with arrays)
    userObj.mealPlans = ensureDays(
      mapToObj(user.mealPlans, daysOfWeek, DEFAULT_MEAL_ARRAY),
      daysOfWeek,
      DEFAULT_MEAL_ARRAY
    );

    res.json(userObj);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Convert plain object to Map
function objToMap(obj) {
    if (!obj || typeof obj !== "object") return new Map();
    const map = new Map();
    Object.keys(obj).forEach(key => {
        // Always set an array, even if value is undefined
        map.set(key, Array.isArray(obj[key]) ? obj[key] : []);
    });
    return map;
}

// Update user profile (protected)
exports.updateProfile = async (req, res) => {
  try {
    // Only allow these fields to be updated
    const allowedFields = [
      "weight", "height", "age", "gender", "bmi", "bmr", "dailyCalories",
      "fitnessGoal", "fitnessPlans", "mealPlans", "activity", "weeklyPlans",
      "reminders", "todos", "completed"
    ];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Validate types for plans
    if (updates.fitnessPlans) updates.fitnessPlans = objToMap(updates.fitnessPlans);
    if (updates.mealPlans) updates.mealPlans = objToMap(updates.mealPlans);
    // If you allow weeklyPlans, validate it's an object with arrays
    if (updates.weeklyPlans) {
      daysOfWeek.forEach(day => {
        if (!Array.isArray(updates.weeklyPlans[day])) updates.weeklyPlans[day] = [];
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Normalize before sending back
    const userObj = user.toObject();
    userObj.fitnessPlans = ensureDays(
      mapToObj(user.fitnessPlans, daysOfWeek, []),
      daysOfWeek,
      []
    );
    userObj.mealPlans = ensureDays(
      mapToObj(user.mealPlans, daysOfWeek, DEFAULT_MEAL_ARRAY),
      daysOfWeek,
      DEFAULT_MEAL_ARRAY
    );

    res.json(userObj);
  } catch (err) {
    console.error(err); // Log internal error
    res.status(500).json({ msg: "Server error" }); // Do not leak details
  }
};

exports.sendTestNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    await sendFitnessReminder(user.email, "This is a test notification from Lifesync+!");
    res.json({ msg: "Test notification sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to send test notification" });
  }
};