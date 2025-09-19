const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  title: String,
  time: String,
  description: String,
  date: String,
});

const WeeklyPlanSchema = new mongoose.Schema({
  day: String,
  title: String,
  time: String,
  description: String,
}, { _id: true });

const TodoSchema = new mongoose.Schema({
  text: String,
  desc: String,
});

const MealSlotSchema = new mongoose.Schema({
  desc: String,
  calories: String,
});

const FitnessWorkoutSchema = new mongoose.Schema({
  name: String,
  desc: String,
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Profile fields
  weight: Number,
  height: Number,
  age: Number,
  gender: String,

  // Routine
  weeklyPlans: {
    type: Object, // <-- Use plain object, not Map
    default: {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    }
  },
  reminders: [ReminderSchema],
  todos: [TodoSchema],

  // Fitness
  bmi: String,
  bmr: String,
  dailyCalories: String,
  fitnessGoal: { type: String, default: "maintain" },
  fitnessPlans: { type: Map, of: [FitnessWorkoutSchema], default: {} },

  // Meals
  mealPlans: { type: Map, of: [MealSlotSchema], default: {} },

  completed: { type: Map, of: Boolean, default: {} },
  activity: { type: Number, default: 1.2 }, // Add this line
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
