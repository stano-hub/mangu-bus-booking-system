// src/services/teacherService.js
import axiosInstance from "../api/axiosInstance";

const teacherService = {
  // Get all teachers
  getAllTeachers: async () => {
    try {
      const res = await axiosInstance.get("/api/teachers");
      return res.data; // array of teachers
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch teachers" };
    }
  },

  // Add a new teacher
  addTeacher: async (teacherData) => {
    try {
      const res = await axiosInstance.post("/api/teachers", teacherData);
      return res.data; // { teacher, message }
    } catch (err) {
      throw err.response?.data || { message: "Failed to add teacher" };
    }
  },

  // Delete a teacher by ID
  deleteTeacher: async (teacherId) => {
    try {
      const res = await axiosInstance.delete(`/api/teachers/${teacherId}`);
      return res.data; // { message: "Teacher deleted successfully" }
    } catch (err) {
      throw err.response?.data || { message: "Failed to delete teacher" };
    }
  },

  // Update teacher details
  updateTeacher: async (teacherId, updates) => {
    try {
      const res = await axiosInstance.put(`/api/teachers/${teacherId}`, updates);
      return res.data; // { teacher, message }
    } catch (err) {
      throw err.response?.data || { message: "Failed to update teacher" };
    }
  },
};

export default teacherService;
