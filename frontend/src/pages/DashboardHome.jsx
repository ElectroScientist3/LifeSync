import { useEffect, useState } from "react";

const daysOfWeek = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];
const MEAL_SLOTS = [
  "Breakfast", "Morning Snacks", "Lunch", "Afternoon Snacks", "Dinner"
];

const getToday = () => new Date().toISOString().split("T")[0];
const getCurrentDayIndex = () => new Date().getDay();

// Shared Card component for consistent styling
const Card = ({ children, gradient, border, title, emoji, accent }) => (
  <div className={`bg-gradient-to-r ${gradient} rounded-xl shadow-lg p-6 border-l-8 ${border}`}>
    <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${accent}`}>
      <span role="img" aria-label="icon">{emoji}</span> {title}
    </h2>
    {children}
  </div>
);

function DashboardHome() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-blue-600 text-2xl animate-pulse">
        Loading...
      </div>
    );
  }
  if (!profile) return <div>Error loading profile.</div>;

  const todayIdx = getCurrentDayIndex();
  const todayName = daysOfWeek[todayIdx];
  const todayMeals =
    profile.mealPlans?.[todayName] || MEAL_SLOTS.map(() => ({ desc: "", calories: "" }));
  const todayFitness = profile.fitnessPlans?.[todayName] || [];
  const todayRoutine = profile.weeklyPlans?.[todayName] || [];
  const todayReminders = (profile.reminders || []).filter((r) => r.date === getToday());
  const todos = profile.todos || [];

  return (
    <div className="flex flex-col gap-8 p-8 bg-gradient-to-br from-blue-50 via-orange-50 to-green-50 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-orange-600 to-green-700 drop-shadow-lg text-center">
        Today's Overview
      </h1>

      {/* Routine */}
      <Card
        gradient="from-blue-100 to-blue-50"
        border="border-blue-400"
        title="Today's Routine"
        emoji="📅"
        accent="text-blue-700"
      >
        {todayRoutine.length === 0 ? (
          <p className="text-gray-500">No routine tasks for today.</p>
        ) : (
          <table className="min-w-full border text-sm bg-white rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b bg-blue-50 text-blue-700">Time</th>
                <th className="px-4 py-2 border-b bg-blue-50 text-blue-700">Title</th>
                <th className="px-4 py-2 border-b bg-blue-50 text-blue-700">Description</th>
              </tr>
            </thead>
            <tbody>
              {todayRoutine
                .slice()
                .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
                .map((plan, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 border-b">{plan.time || "--"}</td>
                    <td className="px-4 py-2 border-b font-semibold text-blue-900">{plan.title || "--"}</td>
                    <td className="px-4 py-2 border-b">{plan.description || "--"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Meal Routine */}
      <Card
        gradient="from-orange-100 to-orange-50"
        border="border-orange-400"
        title="Today's Meal Routine"
        emoji="🍽️"
        accent="text-orange-700"
      >
        <table className="min-w-full border text-sm bg-white rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b bg-orange-50 text-orange-700">Meal</th>
              <th className="px-4 py-2 border-b bg-orange-50 text-orange-700">Description</th>
              <th className="px-4 py-2 border-b bg-orange-50 text-orange-700">Calories</th>
            </tr>
          </thead>
          <tbody>
            {MEAL_SLOTS.map((slot, idx) => (
              <tr key={slot} className="hover:bg-orange-50 transition">
                <td className="px-4 py-2 border-b font-semibold text-orange-900">{slot}</td>
                <td className="px-4 py-2 border-b">{todayMeals[idx]?.desc || "--"}</td>
                <td className="px-4 py-2 border-b">{todayMeals[idx]?.calories || "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Fitness Routine */}
      <Card
        gradient="from-green-100 to-green-50"
        border="border-green-400"
        title="Today's Fitness Routine"
        emoji="💪"
        accent="text-green-700"
      >
        {todayFitness.length === 0 ? (
          <p className="text-gray-500">No fitness workouts for today.</p>
        ) : (
          <ul>
            {todayFitness.map((w, idx) => (
              <li key={idx} className="mb-2 flex items-center gap-2">
                <span className="font-semibold text-green-900">{w.name}</span>
                {w.desc && <span className="text-gray-600 text-sm">({w.desc})</span>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Reminders */}
      <Card
        gradient="from-purple-100 to-purple-50"
        border="border-purple-400"
        title="Today's Reminders"
        emoji="⏰"
        accent="text-purple-700"
      >
        {todayReminders.length === 0 ? (
          <p className="text-gray-500">No reminders for today.</p>
        ) : (
          <ul>
            {todayReminders.map((r, idx) => (
              <li key={idx} className="mb-2 flex items-center gap-4">
                <span className="font-semibold text-purple-900">{r.title}</span>
                <span className="text-gray-600">{r.time}</span>
                <span className="text-gray-600">{r.description}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* To-Do List */}
      <Card
        gradient="from-indigo-100 to-indigo-50"
        border="border-indigo-400"
        title="To-Do List"
        emoji="📝"
        accent="text-indigo-700"
      >
        {todos.length === 0 ? (
          <p className="text-gray-400">No to-dos yet.</p>
        ) : (
          <ul>
            {todos.map((todo, idx) => (
              <li key={idx} className="py-2 border-b last:border-b-0 text-indigo-900">
                {todo.text || todo}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default DashboardHome;