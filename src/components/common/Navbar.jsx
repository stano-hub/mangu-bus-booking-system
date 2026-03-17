// src/components/common/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpeg";
import "./Navbar.css";
import authService from "../../services/authService";
// Correct in App.js, Navbar.jsx, etc.
import { useAuth } from '../../context/AuthContext';



import { 
  HiOutlineHome, 
  HiOutlineUser, 
  HiOutlineCalendar, 
  HiOutlineTruck, 
  HiOutlineAcademicCap,
  HiOutlineLogout,
  HiChevronRight
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const roleLinks = {
  admin: [
    { to: "/admin", label: "Dashboard", icon: HiOutlineHome },
    { to: "/admin/manage-teachers", label: "Manage Teachers", icon: HiOutlineAcademicCap },
    { to: "/admin/manage-buses", label: "Manage Buses", icon: HiOutlineTruck },
    { to: "/admin/all-bookings", label: "All Bookings", icon: HiOutlineCalendar },
  ],
  teacher: [
    { to: "/teacher", label: "Dashboard", icon: HiOutlineHome },
    { to: "/teacher/book", label: "Book a Bus", icon: HiOutlineTruck },
  ],
  deputy: [
    { to: "/deputy", label: "Dashboard", icon: HiOutlineHome },
    { to: "/deputy/pending-bookings", label: "Pending Bookings", icon: HiOutlineCalendar },
  ],
  principal: [
    { to: "/principal", label: "Dashboard", icon: HiOutlineHome },
    { to: "/principal/all-bookings", label: "All Bookings", icon: HiOutlineCalendar },
  ],
  driver: [
    { to: "/driver", label: "Dashboard", icon: HiOutlineHome },
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
    { to: "/profile", label: "Profile", icon: HiOutlineUser },
    ...(user ? roleLinks[user.role] || [] : []),
  ];

  return (
    <>
      <button className={`sidebar-toggle-btn ${isOpen ? "hidden" : ""}`} onClick={toggleSidebar} disabled={loading}>
        ☰
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.nav 
            className="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            ref={sidebarRef}
          >
            <div className="sidebar-header">
              <NavLink to="/" className="sidebar-logo" onClick={handleNavClick}>
                <img src={logo} alt="Mang'u Bus Booking Logo" />
              </NavLink>
              <button className="sidebar-close-btn" onClick={toggleSidebar}>
                ✕
              </button>
            </div>

            <ul className="sidebar-links">
              {links.map((link, index) => (
                <motion.li 
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NavLink
                    to={link.to}
                    className={({ isActive }) => (isActive ? "active" : "")}
                    onClick={handleNavClick}
                  >
                    <link.icon className="nav-icon" />
                    <span className="nav-label">{link.label}</span>
                    <HiChevronRight className="chevron-icon" />
                  </NavLink>
                </motion.li>
              ))}

              {user && (
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: links.length * 0.05 }}
                >
                  <button className="logout-btn" onClick={handleLogout} disabled={loading}>
                    <HiOutlineLogout className="nav-icon" />
                    <span className="nav-label">{loading ? "Logging out..." : "Logout"}</span>
                  </button>
                </motion.li>
              )}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
      
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
    </>
  );
}
