import axiosInstance from "./api/axiosInstance";

const bookingService = {
  // Book a new bus
  bookBus: async (bookingData) => {
    try {
      const res = await axiosInstance.post("/api/bookings", bookingData);
      return res.data; // { success: true, booking: {...} }
    } catch (err) {
      throw err.response?.data || { message: "Failed to book bus" };
    }
  },

  // Get bookings of the logged-in user
  getMyBookings: async () => {
    try {
      const res = await axiosInstance.get("/api/bookings");
      return res.data; // { success: true, bookings: [...] }
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch your bookings" };
    }
  },

  // Update a booking
  updateBooking: async (bookingId, updates) => {
    try {
      const res = await axiosInstance.put(`/api/bookings/${bookingId}`, updates);
      return res.data; // { success: true, booking: {...} }
    } catch (err) {
      throw err.response?.data || { message: "Failed to update booking" };
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    try {
      const res = await axiosInstance.delete(`/api/bookings/${bookingId}`);
      return res.data; // { success: true, message: "Booking canceled" }
    } catch (err) {
      throw err.response?.data || { message: "Failed to cancel booking" };
    }
  },

  // Get all bookings (admin/principal/deputy)
  getAllBookings: async () => {
    try {
      const res = await axiosInstance.get("/api/bookings/all");
      return res.data; // { success: true, bookings: [...] }
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch all bookings" };
    }
  },
};

export default bookingService;