import axiosInstance from "./api/axiosInstance";

const driverService = {
  // ============================
  // 🔹 Create a new driver (Admin only)
  // ============================
  createDriver: async (driverData) => {
    try {
      const res = await axiosInstance.post("/api/drivers", driverData);
      return res.data; // Expected: { success: true, driver: {...} }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // ============================
  // 🔹 Get all drivers (Admin only)
  // ============================
  getAllDrivers: async () => {
    try {
      const res = await axiosInstance.get("/api/drivers");
      return res.data; // Expected: { success: true, drivers: [...] }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // ============================
  // 🔹 Get driver by ID (Admin only)
  // ============================
  getDriverById: async (driverId) => {
    try {
      const res = await axiosInstance.get(`/api/drivers/${driverId}`);
      return res.data; // Expected: { success: true, driver: {...} }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // ============================
  // 🔹 Update driver (Admin only)
  // ============================
  updateDriver: async (driverId, updates) => {
    try {
      const res = await axiosInstance.put(`/api/drivers/${driverId}`, updates);
      return res.data; // Expected: { success: true, driver: {...} }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // ============================
  // 🔹 Delete driver (Admin only)
  // ============================
  deleteDriver: async (driverId) => {
    try {
      const res = await axiosInstance.delete(`/api/drivers/${driverId}`);
      return res.data; // Expected: { success: true, message: "Driver deleted" }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },
};

export default driverService;
