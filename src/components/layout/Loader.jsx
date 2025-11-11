// src/components/layout/Loader.jsx
import React from "react";
import "./Loader.css"; // optional, for spinner styles

export default function Loader() {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}
