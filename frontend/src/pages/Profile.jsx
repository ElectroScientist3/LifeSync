import { useState, useEffect } from "react";

function Profile() {
  // Demo state; in a real app, fetch this from backend or context
  const [profile, setProfile] = useState({
    name: "John Doe",
    gender: "male",
    weight: 70, // kg
    height: 175, // cm
    age: 25,
    email: "john@example.com",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:5000/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });
    // Optionally refetch profile
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h2 className="text-3xl font-bold mb-6 text-purple-700">Profile</h2>
      <div className="space-y-4">
        <div>
          <span className="font-semibold">Name: </span>
          <span>{profile.name}</span>
        </div>
        <div>
          <span className="font-semibold">Email: </span>
          <span>{profile.email}</span>
        </div>
        <div>
          <span className="font-semibold">Gender: </span>
          <span className="capitalize">{profile.gender}</span>
        </div>
        <div>
          <span className="font-semibold">Weight: </span>
          <span>{profile.weight} kg</span>
        </div>
        <div>
          <span className="font-semibold">Height: </span>
          <span>{profile.height} cm</span>
        </div>
        <div>
          <span className="font-semibold">Age: </span>
          <span>{profile.age}</span>
        </div>
      </div>
    </div>
  );
}

export default Profile;