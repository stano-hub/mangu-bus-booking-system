import axiosInstance from "./api/axiosInstance";

const userService = {
  // ============================
  // 🔹 Get all users (Admin only)
  // ============================
  getAllUsers: async () => {
    try {
      const res = await axiosInstance.get("/api/users");
      return res.data; // Expected: { success: true, users: [...] }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // ============================
  // 🔹 Get all teachers (Accessible by everyone except drivers)
  // Uses dedicated /api/users/teachers endpoint
  // ============================
  getAllTeachers: async () => {
    try {
      const res = await axiosInstance.get("/api/users/teachers");
      return res.data; // Expected: { success: true, teachers: [...] }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // ============================
  // 🔹 Add new user (Admin only)
  // ============================
  addUser: async (userData) => {
    try {
      const res = await axiosInstance.post("/api/users", userData);
      return res.data; // Expected: { success: true, user: {...} }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // ============================
  // 🔹 Update user by ID (Admin only)
  // ============================
  updateUser: async (userId, updates) => {
    try {
      const res = await axiosInstance.put(`/api/users/${userId}`, updates);
      return res.data; // Expected: { success: true, user: {...} }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // ============================
  // 🔹 Delete user (Admin only)
  // ============================
  deleteUser: async (userId) => {
    try {
      const res = await axiosInstance.delete(`/api/users/${userId}`);
      return res.data; // Expected: { success: true, message: "User deleted" }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },
};

export default userService;
