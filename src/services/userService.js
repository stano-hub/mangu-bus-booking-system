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
      throw err?.response?.data || { message: "Failed to fetch users" };
    }
  },

  // ============================
  // 🔹 Get all teachers (filtered client-side)
  // Note: This requires admin access to /api/users
  // For non-admin users, this will return 403
  // ============================
  getAllTeachers: async () => {
    try {
      const data = await userService.getAllUsers();
      const teachers = data.users?.filter((u) => u.role === "teacher") || [];
      return { success: true, teachers };
    } catch (err) {
      // Re-throw with status code for proper error handling
      const error = err?.response?.data || { message: "Failed to fetch teachers" };
      error.status = err?.response?.status || err?.status;
      throw error;
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
      throw err?.response?.data || { message: "Failed to add user" };
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
      throw err?.response?.data || { message: "Failed to update user" };
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
      throw err?.response?.data || { message: "Failed to delete user" };
    }
  },
};

export default userService;
