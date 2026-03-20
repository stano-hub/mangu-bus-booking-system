import api from "./api/axiosInstance";

const classService = {
  getAllClasses: async () => {
    try {
      const response = await api.get("/api/classes");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createClass: async (classData) => {
    try {
      const response = await api.post("/api/classes", classData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteClass: async (id) => {
    try {
      const response = await api.delete(`/api/classes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default classService;
