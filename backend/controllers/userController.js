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

// Get user profile (protected)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Convert to plain object
    const userObj = user.toObject();

    // Ensure weeklyPlans is a plain object with all days as keys and arrays as values
    const normalizedWeeklyPlans = {};
    daysOfWeek.forEach(day => {
      normalizedWeeklyPlans[day] = Array.isArray(userObj.weeklyPlans?.[day])
        ? userObj.weeklyPlans[day]
        : [];
    });
    userObj.weeklyPlans = normalizedWeeklyPlans;

    res.json(userObj);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update user profile (protected)
exports.updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body }; // <-- inject here
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select('-password'); // <-- inject here
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};