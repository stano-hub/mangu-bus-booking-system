// src/services/bookingService.js
import axiosInstance from "../api/axiosInstance";

const bookingService = {
  bookBus: async (bookingData) => {
    try {
      const res = await axiosInstance.post("/api/bookings", bookingData);
      return res.data; // { booking, message }
    } catch (err) {
      throw err.response?.data || { message: "Failed to book bus" };
    }
  },

  getMyBookings: async () => {
    try {
      const res = await axiosInstance.get("/api/teacher/my-bookings");
      return res.data; // array of bookings for logged-in teacher
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch your bookings" };
    }
  },

  updateBooking: async (bookingId, updates) => {
    try {
      const res = await axiosInstance.put(`/api/bookings/${bookingId}`, updates);
      return res.data; // { booking, message }
    } catch (err) {
      throw err.response?.data || { message: "Failed to update booking" };
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      const res = await axiosInstance.delete(`/api/bookings/${bookingId}`);
      return res.data; // { message: "Booking canceled successfully" }
    } catch (err) {
      throw err.response?.data || { message: "Failed to cancel booking" };
    }
  },

  getAllBookings: async () => {
    try {
      const res = await axiosInstance.get("/api/admin/bookings");
      return res.data; // array of all bookings
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch all bookings" };
    }
  },
};

export default bookingService;