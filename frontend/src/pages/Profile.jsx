import { useState, useEffect } from "react";

function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    gender: "",
    weight: "",
    height: "",
    age: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [editProfile, setEditProfile] = useState(profile);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile({
        name: data.name || "",
        gender: data.gender || "",
        weight: data.weight || "",
        height: data.height || "",
        age: data.age || "",
        email: data.email || "",
      });
      setEditProfile({
        name: data.name || "",
        gender: data.gender || "",
        weight: data.weight || "",
        height: data.height || "",
        age: data.age || "",
        email: data.email || "",
      });
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setEditProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editProfile),
    });
    if (res.ok) {
      setProfile(editProfile);
      setMessage("Profile updated!");
      setEditing(false);
    } else {
      setMessage("Error updating profile.");
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setEditing(false);
    setMessage("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-blue-600 text-2xl animate-pulse">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-10 mt-10">
      <h2 className="text-3xl font-bold mb-8 text-purple-700 text-center">
        Profile
      </h2>
      {!editing ? (
        <div className="space-y-6 text-lg">
          <div>
            <span className="font-semibold">Name:</span> {profile.name}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {profile.email}
          </div>
          <div>
            <span className="font-semibold">Gender:</span> {profile.gender}
          </div>
          <div>
            <span className="font-semibold">Weight (kg):</span> {profile.weight}
          </div>
          <div>
            <span className="font-semibold">Height (cm):</span> {profile.height}
          </div>
          <div>
            <span className="font-semibold">Age:</span> {profile.age}
          </div>
          <button
            className="w-full bg-purple-600 text-white font-bold py-3 rounded mt-6 hover:bg-purple-700 transition"
            onClick={() => setEditing(true)}
          >
            Update Profile
          </button>
          {message && (
            <div className="text-center mt-2 text-green-600 font-semibold">
              {message}
            </div>
          )}
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSave}>
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <input
              name="name"
              className="w-full border rounded p-2"
              value={editProfile.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              name="email"
              className="w-full border rounded p-2 bg-gray-100"
              value={editProfile.email}
              disabled
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Gender</label>
            <select
              name="gender"
              className="w-full border rounded p-2"
              value={editProfile.gender}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-semibold mb-1">Weight (kg)</label>
              <input
                name="weight"
                type="number"
                min="1"
                className="w-full border rounded p-2"
                value={editProfile.weight}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1">Height (cm)</label>
              <input
                name="height"
                type="number"
                min="1"
                className="w-full border rounded p-2"
                value={editProfile.height}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Age</label>
            <input
              name="age"
              type="number"
              min="1"
              className="w-full border rounded p-2"
              value={editProfile.age}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white font-bold py-3 rounded mt-4 hover:bg-purple-700 transition"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-300 text-gray-800 font-bold py-3 rounded mt-4 hover:bg-gray-400 transition"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
          {message && (
            <div className="text-center mt-2 text-green-600 font-semibold">
              {message}
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default Profile;