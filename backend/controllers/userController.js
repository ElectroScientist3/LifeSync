const User = require('../models/User');

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Helper to convert Map to plain object (replace the old one)
function mapToObj(map, days, emptyValue) {
  const obj = {};
  days.forEach(day => {
    let val;
    if (map && typeof map.get === "function") {
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
      mapToObj(user.mealPlans, daysOfWeek, [
        { desc: "", calories: "" },
        { desc: "", calories: "" },
        { desc: "", calories: "" },
        { desc: "", calories: "" },
        { desc: "", calories: "" },
      ]),
      daysOfWeek,
      [
        { desc: "", calories: "" },
        { desc: "", calories: "" },
        { desc: "", calories: "" },
        { desc: "", calories: "" },
        { desc: "", calories: "" },
      ]
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
    const updates = { ...req.body };

    // Convert fitnessPlans and mealPlans to Map if present
    if (updates.fitnessPlans) {
        updates.fitnessPlans = objToMap(updates.fitnessPlans);
    }
    if (updates.mealPlans) {
        updates.mealPlans = objToMap(updates.mealPlans);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select('-password');

    // Normalize before sending back
    const userObj = user.toObject();
    userObj.fitnessPlans = ensureDays(
      mapToObj(user.fitnessPlans, daysOfWeek, []),
      daysOfWeek,
      []
    );
    userObj.mealPlans = ensureDays(
      mapToObj(user.mealPlans, daysOfWeek, [
        { desc: "", calories: "" },
        { desc: "", calories: "" },
        { desc: "", calories: "" },
        { desc: "", calories: "" },
        { desc: "", calories: "" },
      ]),
      daysOfWeek,
      [
        { desc: "", calories: "" },
        { desc: "", calories: "" },
        { desc: "", calories: "" },
        { desc: "", calories: "" },
        { desc: "", calories: "" },
      ]
    );

    res.json(userObj);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};