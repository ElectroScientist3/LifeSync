import { useEffect, useState } from "react";

// Helper to get today's date in YYYY-MM-DD format
const getToday = () => new Date().toISOString().split("T")[0];
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const getCurrentDayIndex = () => new Date().getDay();

function Routine() {
  // Reminders state
  const [reminders, setReminders] = useState([]);
  const [reminderForm, setReminderForm] = useState({
    title: "",
    time: "",
    description: "",
    date: getToday(),
  });
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [editReminder, setEditReminder] = useState(null);

  // Weekly routine state
  const [weeklyPlans, setWeeklyPlans] = useState({
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  });
  const [weeklyForm, setWeeklyForm] = useState({
    day: daysOfWeek[getCurrentDayIndex()],
    title: "",
    time: "",
    description: "",
  });
  const [selectedDay, setSelectedDay] = useState(
    daysOfWeek[getCurrentDayIndex()]
  );

  // Track completed tasks for today (use unique key: day-time-title)
  const [completed, setCompleted] = useState({});

  // Todos state
  const [todos, setTodos] = useState([]);
  const [todoForm, setTodoForm] = useState({ text: "", desc: "" });
  const [editTodoIdx, setEditTodoIdx] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTodos(data.todos || []);
      setWeeklyPlans(
        data.weeklyPlans || {
          Sunday: [],
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
        }
      );
      setReminders(data.reminders || []);
      // Add other fields if needed
    };
    fetchProfile();
  }, []);

  // Add new reminder
  const handleReminderSubmit = async (e) => {
    e.preventDefault();
    const newReminders = [...reminders, { ...reminderForm }];
    setReminders(newReminders);
    setReminderForm({ title: "", time: "", description: "", date: getToday() });
    await saveReminders(newReminders);
  };

  // Edit reminder
  const handleEditReminder = async (e) => {
    e.preventDefault();
    const newReminders = reminders.map((r, idx) =>
      idx === editReminder.idx ? editReminder.data : r
    );
    setReminders(newReminders);
    setEditReminder(null);
    setSelectedReminder(null);
    await saveReminders(newReminders);
  };

  // Delete reminder
  const handleDeleteReminder = async (idx) => {
    const newReminders = reminders.filter((_, i) => i !== idx);
    setReminders(newReminders);
    setSelectedReminder(null);
    setEditReminder(null);
    await saveReminders(newReminders);
  };

  // Add new weekly plan
  const handleWeeklySubmit = async (e) => {
    e.preventDefault();
    const updatedPlans = {
      ...weeklyPlans,
      [weeklyForm.day]: [
        ...weeklyPlans[weeklyForm.day],
        {
          title: weeklyForm.title,
          time: weeklyForm.time,
          description: weeklyForm.description,
        },
      ],
    };
    setWeeklyPlans(updatedPlans);
    setWeeklyForm({
      day: daysOfWeek[getCurrentDayIndex()],
      title: "",
      time: "",
      description: "",
    });
    await saveWeeklyPlans(updatedPlans);
  };

  const saveWeeklyPlans = async (newPlans) => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:5000/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ weeklyPlans: newPlans }),
    });
  };

  // Delete weekly plan
  const handleDeletePlan = (day, idx) => {
    setWeeklyPlans({
      ...weeklyPlans,
      [day]: weeklyPlans[day].filter((_, i) => i !== idx),
    });
  };

  // Filter reminders for today, sorted by time
  const todaysReminders = reminders
    .filter((r) => r.date === getToday())
    .sort((a, b) => a.time.localeCompare(b.time));

  // All reminders sorted by date then time
  const allRemindersSorted = reminders
    .slice()
    .sort((a, b) =>
      a.date === b.date
        ? a.time.localeCompare(b.time)
        : a.date.localeCompare(b.date)
    );

  // Handle task completion (use unique key)
  const handleTaskToggle = (plan) => {
    const key = `${selectedDay}-${plan.time}-${plan.title}`;
    setCompleted((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Calculate today's completion percent
  const todayKey = daysOfWeek[getCurrentDayIndex()];
  const todayTasks = weeklyPlans[todayKey]
    ? weeklyPlans[todayKey].slice().sort((a, b) => a.time.localeCompare(b.time))
    : [];
  const todayTotal = todayTasks.length;
  const todayCompleted = todayTasks.filter(
    (plan) => completed[`${todayKey}-${plan.time}-${plan.title}`]
  ).length;
  const percent =
    todayTotal === 0 ? 0 : Math.round((todayCompleted / todayTotal) * 100);

  // Sort plans by time for timeline
  const sortedPlans = weeklyPlans[selectedDay]
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time));

  // Add todo
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!todoForm.text.trim()) return;
    const newTodos = [...todos, { ...todoForm }];
    setTodos(newTodos);
    setTodoForm({ text: "", desc: "" });
    setEditTodoIdx(null);

    // Send to backend
    const token = localStorage.getItem("token");
    await fetch("http://localhost:5000/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ todos: newTodos }),
    });
  };

  // Edit todo
  const handleEditTodo = (idx) => {
    setTodoForm(todos[idx]);
    setEditTodoIdx(idx);
  };

  // Save edited todo
  const handleSaveEditTodo = (e) => {
    e.preventDefault();
    setTodos(todos.map((t, idx) => (idx === editTodoIdx ? todoForm : t)));
    setTodoForm({ text: "", desc: "" });
    setEditTodoIdx(null);
  };

  // Delete todo
  const handleDeleteTodo = (idx) => {
    setTodos(todos.filter((_, i) => i !== idx));
    setEditTodoIdx(null);
  };

  const saveReminders = async (newReminders) => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:5000/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reminders: newReminders }),
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Weekly Routine Section */}
      <main className="flex-1 flex flex-col px-8 py-8 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-blue-700">Weekly Routine</h2>
          {/* Day Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {daysOfWeek.map((day, idx) => (
              <button
                key={day}
                className={`px-4 py-2 rounded-full font-semibold transition ${
                  selectedDay === day
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                } ${idx === getCurrentDayIndex() ? "ring-2 ring-blue-400" : ""}`}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
          {/* Add Plan Form */}
          <form
            onSubmit={handleWeeklySubmit}
            className="flex flex-col md:flex-row gap-2 items-end mb-8"
          >
            <select
              value={weeklyForm.day}
              onChange={(e) =>
                setWeeklyForm({ ...weeklyForm, day: e.target.value })
              }
              className="p-2 border rounded"
            >
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Plan Title"
              className="p-2 border rounded flex-1"
              value={weeklyForm.title}
              onChange={(e) =>
                setWeeklyForm({ ...weeklyForm, title: e.target.value })
              }
              required
            />
            <input
              type="time"
              className="p-2 border rounded"
              value={weeklyForm.time}
              onChange={(e) =>
                setWeeklyForm({ ...weeklyForm, time: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Description"
              className="p-2 border rounded flex-1"
              value={weeklyForm.description}
              onChange={(e) =>
                setWeeklyForm({ ...weeklyForm, description: e.target.value })
              }
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Add Plan
            </button>
          </form>

          {/* Progress bar for today */}
          {selectedDay === todayKey && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-blue-700">Today's Completion</span>
                <span className="text-blue-700 font-bold">{percent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Timeline for selected day */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h4 className="font-semibold mb-4 text-lg text-blue-700">
              {selectedDay}'s Timeline
            </h4>
            {sortedPlans.length === 0 ? (
              <p className="text-gray-500">No plans for {selectedDay}.</p>
            ) : (
              <ul className="relative border-l-2 border-blue-200 pl-6">
                {sortedPlans.map((plan, idx) => {
                  const key = `${selectedDay}-${plan.time}-${plan.title}`;
                  const isToday = selectedDay === todayKey;
                  return (
                    <li
                      key={key}
                      className={`flex justify-between items-center py-3 ${isToday ? "border-b border-blue-200" : ""
                        }`}
                    >
                      <div className="flex-1">
                        <div className="font-bold text-blue-900">
                          {plan.time} - {plan.title}
                        </div>
                        {plan.description && (
                          <div className="text-gray-700">{plan.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isToday && (
                          <button
                            onClick={() => handleTaskToggle(plan)}
                            className={`p-2 rounded-full transition-all ${
                              completed[key]
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                            }`}
                          >
                            {completed[key] ? "✓" : ""}
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDeletePlan(selectedDay, weeklyPlans[selectedDay].findIndex(
                              p => p.time === plan.time && p.title === plan.title
                            ))
                          }
                          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Weekly Table */}
          <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
            <h4 className="font-semibold mb-4 text-lg text-blue-700">
              Weekly Overview Table
            </h4>
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  {daysOfWeek.map((day) => (
                    <th
                      key={day}
                      className="px-4 py-2 border-b font-bold text-blue-700 bg-blue-50"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Find the max number of plans in any day */}
                {Array.from({
                  length: Math.max(
                    ...daysOfWeek.map((d) => weeklyPlans[d].length)
                  ),
                }).map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {daysOfWeek.map((day) => {
                      const plans = weeklyPlans[day]
                        .slice()
                        .sort((a, b) => a.time.localeCompare(b.time));
                      const plan = plans[rowIdx];
                      return (
                        <td
                          key={day}
                          className="px-4 py-2 border-b border-r align-top"
                        >
                          {plan ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-blue-900">
                                {plan.time} - {plan.title}
                              </span>
                              {plan.description && (
                                <span className="text-gray-600 text-xs">
                                  {plan.description}
                                </span>
                              )}
                              <button
                                onClick={() =>
                                  handleDeletePlan(
                                    day,
                                    weeklyPlans[day].findIndex(
                                      p =>
                                        p.time === plan.time &&
                                        p.title === plan.title
                                    )
                                  )
                                }
                                className="mt-1 text-xs text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Reminders Sidebar */}
      <aside className="w-full md:w-96 bg-white border-l shadow-lg flex flex-col h-full p-6 overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-green-700 text-center">
          Reminders
        </h3>
        {/* Add Reminder Form */}
        <form
          onSubmit={handleReminderSubmit}
          className="bg-gray-50 p-4 rounded mb-6 shadow"
        >
          <input
            type="text"
            name="title"
            placeholder="Reminder Title"
            className="w-full p-2 border rounded mb-2"
            value={reminderForm.title}
            onChange={(e) =>
              setReminderForm({ ...reminderForm, title: e.target.value })
            }
            required
          />
          <input
            type="time"
            name="time"
            className="w-full p-2 border rounded mb-2"
            value={reminderForm.time}
            onChange={(e) =>
              setReminderForm({ ...reminderForm, time: e.target.value })
            }
            required
          />
          <input
            type="date"
            name="date"
            min={getToday()}
            className="w-full p-2 border rounded mb-2"
            value={reminderForm.date}
            onChange={(e) =>
              setReminderForm({ ...reminderForm, date: e.target.value })
            }
            required
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            className="w-full p-2 border rounded mb-2"
            value={reminderForm.description}
            onChange={(e) =>
              setReminderForm({ ...reminderForm, description: e.target.value })
            }
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Add Reminder
          </button>
        </form>

        {/* Today's Reminders */}
        <div className="mb-4">
          <h4 className="font-semibold mb-1 text-green-700">
            Today's Reminders
          </h4>
          {todaysReminders.length === 0 ? (
            <p className="text-gray-500">No reminders for today.</p>
          ) : (
            <ul>
              {todaysReminders.map((r, idx) => (
                <li
                  key={idx}
                  className="mb-2 p-2 border rounded bg-white cursor-pointer hover:bg-blue-50 flex justify-between items-center"
                  onClick={() =>
                    setSelectedReminder({
                      ...r,
                      idx: reminders.indexOf(r),
                    })
                  }
                >
                  <div>
                    <div className="font-bold">
                      {r.time} - {r.title}
                    </div>
                    {r.description && (
                      <div className="text-gray-600">{r.description}</div>
                    )}
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteReminder(reminders.indexOf(r));
                    }}
                    className="ml-2 text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* All Reminders */}
        <div>
          <h4 className="font-semibold mb-1 text-green-700">All Reminders</h4>
          {allRemindersSorted.length === 0 ? (
            <p className="text-gray-500">No reminders added yet.</p>
          ) : (
            <ul>
              {allRemindersSorted.map((r, idx) => (
                <li
                  key={idx}
                  className="mb-2 p-2 border rounded bg-white cursor-pointer hover:bg-blue-50 flex justify-between items-center"
                  onClick={() => setSelectedReminder({ ...r, idx })}
                >
                  <div>
                    <div className="font-bold">
                      {r.date} {r.time} - {r.title}
                    </div>
                    {r.description && (
                      <div className="text-gray-600">{r.description}</div>
                    )}
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteReminder(r.idx ?? idx);
                    }}
                    className="ml-2 text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Reminder Details/Edit Modal */}
      {selectedReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h4 className="text-xl font-bold mb-2">Reminder Details</h4>
            {editReminder ? (
              <form onSubmit={handleEditReminder}>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-2"
                  value={editReminder.data.title}
                  onChange={(e) =>
                    setEditReminder({
                      ...editReminder,
                      data: { ...editReminder.data, title: e.target.value },
                    })
                  }
                  required
                />
                <input
                  type="time"
                  className="w-full p-2 border rounded mb-2"
                  value={editReminder.data.time}
                  onChange={(e) =>
                    setEditReminder({
                      ...editReminder,
                      data: { ...editReminder.data, time: e.target.value },
                    })
                  }
                  required
                />
                <input
                  type="date"
                  className="w-full p-2 border rounded mb-2"
                  min={getToday()}
                  value={editReminder.data.date}
                  onChange={(e) =>
                    setEditReminder({
                      ...editReminder,
                      data: { ...editReminder.data, date: e.target.value },
                    })
                  }
                  required
                />
                <textarea
                  className="w-full p-2 border rounded mb-2"
                  value={editReminder.data.description}
                  onChange={(e) =>
                    setEditReminder({
                      ...editReminder,
                      data: { ...editReminder.data, description: e.target.value },
                    })
                  }
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 px-4 py-2 rounded"
                    onClick={() => setEditReminder(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => handleDeleteReminder(editReminder.idx)}
                  >
                    Delete
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="mb-2">
                  <b>Title:</b> {selectedReminder.title}
                </div>
                <div className="mb-2">
                  <b>Time:</b> {selectedReminder.time}
                </div>
                <div className="mb-2">
                  <b>Date:</b> {selectedReminder.date}
                </div>
                {selectedReminder.description && (
                  <div className="mb-2">
                    <b>Description:</b> {selectedReminder.description}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() =>
                      setEditReminder({
                        idx: selectedReminder.idx,
                        data: { ...selectedReminder },
                      })
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="bg-gray-300 px-4 py-2 rounded"
                    onClick={() => setSelectedReminder(null)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => handleDeleteReminder(selectedReminder.idx)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* To-Do List */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h4 className="font-semibold mb-4 text-lg text-indigo-700">To-Do List</h4>
        <form
          onSubmit={editTodoIdx !== null ? handleSaveEditTodo : handleAddTodo}
          className="flex flex-col md:flex-row gap-2 items-end mb-4"
        >
          <input
            type="text"
            placeholder="To-Do"
            className="p-2 border rounded flex-1"
            value={todoForm.text}
            onChange={e => setTodoForm(f => ({ ...f, text: e.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            className="p-2 border rounded flex-1"
            value={todoForm.desc}
            onChange={e => setTodoForm(f => ({ ...f, desc: e.target.value }))}
          />
          <button
            type="submit"
            className="bg-indigo-500 text-white px-4 py-2 rounded"
          >
            {editTodoIdx !== null ? "Save" : "Add"}
          </button>
          {editTodoIdx !== null && (
            <button
              type="button"
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => {
                setTodoForm({ text: "", desc: "" });
                setEditTodoIdx(null);
              }}
            >
              Cancel
            </button>
          )}
        </form>
        <div className="bg-gray-50 rounded p-4 min-h-[80px]">
          {todos.length === 0 ? (
            <p className="text-gray-400 text-center">No to-dos yet.</p>
          ) : (
            <ul>
              {todos.map((todo, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center border-b py-2"
                >
                  <div>
                    <span className="font-semibold">{todo.text}</span>
                    {todo.desc && (
                      <span className="text-gray-600 text-sm ml-2">
                        ({todo.desc})
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => handleEditTodo(idx)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => handleDeleteTodo(idx)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Routine;