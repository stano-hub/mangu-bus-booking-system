// src/components/common/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpeg";
import "./Navbar.css";
import authService from "../../services/authService";
// Correct in App.js, Navbar.jsx, etc.
import { useAuth } from '../../context/AuthContext';



const roleLinks = {
  admin: [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/manage-teachers", label: "Manage Teachers" },
    { to: "/admin/manage-buses", label: "Manage Buses" },
    { to: "/admin/all-bookings", label: "All Bookings" },
  ],
  teacher: [
    { to: "/teacher", label: "Dashboard" },
  ],
  deputy: [
    { to: "/deputy", label: "Dashboard" },
  ],
  principal: [
    { to: "/principal", label: "Dashboard" },
  ],
  driver: [
    { to: "/driver", label: "Dashboard" },
  ],
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const handleNavClick = () => setIsOpen(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate("/auth");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const links = [
    { to: "/profile", label: "Profile" },
    ...(user ? roleLinks[user.role] || [] : []),
  ];

  return (
    <>
      <button className="sidebar-toggle-btn" onClick={toggleSidebar} disabled={loading}>
        {isOpen ? "✕" : "☰"}
      </button>

      <nav className={`sidebar ${isOpen ? "open" : ""}`} ref={sidebarRef}>
        <div className="sidebar-header">
          <NavLink to="/" className="sidebar-logo" onClick={handleNavClick}>
            <img src={logo} alt="Mang'u Bus Booking Logo" />
          </NavLink>
        </div>

        <ul className="sidebar-links">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={handleNavClick}
              >
                {link.label}
              </NavLink>
            </li>
          ))}

          {user && (
            <li>
              <button className="logout-btn" onClick={handleLogout} disabled={loading}>
                {loading ? "Logging out..." : "Logout"}
              </button>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}
