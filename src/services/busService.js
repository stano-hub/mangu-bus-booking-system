import axiosInstance from "./api/axiosInstance";

const busService = {
  // Add a new bus (admin)
  addBus: async (busData) => {
    try {
      const res = await axiosInstance.post("/api/buses", busData);
      return res.data; // { success: true, bus: {...} }
    } catch (err) {
      throw err.response?.data || { message: "Failed to add bus" };
    }
  },

  // Get all buses
  getAllBuses: async () => {
    try {
      const res = await axiosInstance.get("/api/buses");
      return res.data; // { success: true, buses: [...] }
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch buses" };
    }
  },

  // Get available buses for a date
  getAvailableBuses: async (date) => {
    try {
      const res = await axiosInstance.get(`/api/buses/available?date=${date}`);
      return res.data; // { success: true, buses: [...] }
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch available buses" };
    }
  },

  // Get a single bus by ID
  getBusById: async (busId) => {
    try {
      const res = await axiosInstance.get(`/api/buses/${busId}`);
      return res.data; // { success: true, bus: {...} }
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch bus" };
    }
  },

  // Update bus details
  updateBus: async (busId, updates) => {
    try {
      const res = await axiosInstance.put(`/api/buses/${busId}`, updates);
      return res.data; // { success: true, bus: {...} }
    } catch (err) {
      throw err.response?.data || { message: "Failed to update bus" };
    }
  },

  // Delete a bus by ID (admin)
  deleteBus: async (busId) => {
    try {
      const res = await axiosInstance.delete(`/api/buses/${busId}`);
      return res.data; // { success: true, message: "Bus deleted" }
    } catch (err) {
      throw err.response?.data || { message: "Failed to delete bus" };
    }
  },
};

export default busService;