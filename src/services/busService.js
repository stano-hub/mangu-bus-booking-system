// src/services/busService.js
import axiosInstance from "../api/axiosInstance";

const busService = {
  // Add a new bus
  addBus: async (busData) => {
    try {
      const res = await axiosInstance.post("/api/buses", busData);
      return res.data; // { bus, message }
    } catch (err) {
      throw err.response?.data || { message: "Failed to add bus" };
    }
  },

  // Get all buses
  getAllBuses: async () => {
    try {
      const res = await axiosInstance.get("/api/buses");
      return res.data; // array of buses
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch buses" };
    }
  },

  // Get available buses for a specific date
  getAvailableBuses: async (date) => {
    try {
      const res = await axiosInstance.get(`/api/buses/available?date=${date}`);
      return res.data; // array of available buses
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch available buses" };
    }
  },

  // Delete a bus by ID
  deleteBus: async (busId) => {
    try {
      const res = await axiosInstance.delete(`/api/buses/${busId}`);
      return res.data; // { message: "Bus deleted successfully" }
    } catch (err) {
      throw err.response?.data || { message: "Failed to delete bus" };
    }
  },

  // Update bus details
  updateBus: async (busId, updates) => {
    try {
      const res = await axiosInstance.put(`/api/buses/${busId}`, updates);
      return res.data; // { bus, message }
    } catch (err) {
      throw err.response?.data || { message: "Failed to update bus" };
    }
  },
};

export default busService;
