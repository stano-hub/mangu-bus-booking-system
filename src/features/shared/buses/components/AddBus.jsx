// src/features/shared/buses/components/AddBus.jsx
import React, { useState } from "react";
import busService from "../../../../services/busService";
import "../../../../features/shared/buses/buses.css";

const AddBus = () => {
  const [formData, setFormData] = useState({
    busNumber: "",
    capacity: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Quick client-side validation
    if (!formData.busNumber || !formData.capacity) {
      setMessage({ type: "error", text: "Bus number and capacity are required." });
      setLoading(false);
      return;
    }

    if (parseInt(formData.capacity) < 10) {
      setMessage({ type: "error", text: "Capacity must be at least 10." });
      setLoading(false);
      return;
    }

    try {
      const response = await busService.addBus({
        busNumber: formData.busNumber,
        capacity: parseInt(formData.capacity)
      });
      setMessage({
        type: "success",
        text: response.message || "Bus added successfully!",
      });

      // Reset form
      setFormData({
        busNumber: "",
        capacity: "",
      });
    } catch (err) {
      console.error("Error adding bus:", err);
      setMessage({
        type: "error",
        text: err.error || err.message || "Failed to add bus. Please check your input or try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-bus-container">
      <h2 className="add-bus-title">Add New Bus</h2>

      {message.text && (
        <div
          className={`message ${message.type === "error" ? "error" : "success"}`}
        >
          {message.text}
        </div>
      )}

      <form className="add-bus-form" onSubmit={handleSubmit}>
        <label>
          Bus Number:
          <input
            type="text"
            name="busNumber"
            value={formData.busNumber}
            onChange={handleChange}
            placeholder="e.g. BUS-01"
            required
          />
        </label>

        <label>
          Capacity:
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="e.g. 50"
            min="10"
            required
          />
        </label>

        <button type="submit" disabled={loading} className="add-bus-btn">
          {loading ? "Adding..." : "Add Bus"}
        </button>
      </form>
    </div>
  );
};

export default AddBus;
