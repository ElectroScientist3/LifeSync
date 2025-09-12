import { useEffect, useState, useRef } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

function Dashboard() {
  const [message, setMessage] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(data.msg);
      } else {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchDashboard();
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Highlight active sidebar item based on route
  const isRoutine = location.pathname.endsWith("/routine");
  const isFitness = location.pathname.endsWith("/fitness");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white shadow flex flex-col py-8 transition-all duration-300 ${
          sidebarOpen ? "w-48" : "w-16"
        }`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        style={{ minWidth: sidebarOpen ? "12rem" : "4rem" }}
      >
        <button
          className={`flex items-center gap-2 px-4 py-3 text-left text-lg font-semibold hover:bg-blue-100 rounded-r-full mb-2 transition-colors ${
            isRoutine ? "bg-blue-200 text-blue-700" : ""
          }`}
          onClick={() => navigate("/dashboard/routine")}
        >
          <span role="img" aria-label="routine">
            📅
          </span>
          {sidebarOpen && "Routine"}
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-3 text-left text-lg font-semibold hover:bg-green-100 rounded-r-full transition-colors ${
            isFitness ? "bg-green-200 text-green-700" : ""
          }`}
          onClick={() => navigate("/dashboard/fitness")}
        >
          <span role="img" aria-label="fitness">
            💪
          </span>
          {sidebarOpen && "Fitness"}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <div className="flex justify-end items-center p-6">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((open) => !open)}
              className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl shadow hover:bg-blue-600 focus:outline-none"
              title="Account"
            >
              <span role="img" aria-label="user">
                👤
              </span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg z-10">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white p-8 rounded shadow-md w-96 text-center">
            <p className="mb-4">{message}</p>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
