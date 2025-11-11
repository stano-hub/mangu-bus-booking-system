import axiosInstance from "./api/axiosInstance";

const deputyService = {
  // Get all pending bookings
  getPendingBookings: async () => {
    try {
      const res = await axiosInstance.get("/api/deputy/pending");
      return res.data; // { success: true, bookings: [...] }
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch pending bookings" };
    }
  },

  // Approve booking and assign buses
  approveBooking: async (bookingId, data) => {
    try {
      const res = await axiosInstance.put(`/api/deputy/${bookingId}/approve`, {
        buses: data.buses, // Array of bus IDs
        comment: data.comment // Optional
      });
      return res.data; // { success: true, booking: {...} }
    } catch (err) {
      throw err.response?.data || { message: "Failed to approve booking" };
    }
  },

  // Reject booking
  rejectBooking: async (bookingId, comment) => {
    try {
      const res = await axiosInstance.put(`/api/deputy/${bookingId}/reject`, {
        comment: comment // Optional
      });
      return res.data; // { success: true, booking: {...} }
    } catch (err) {
      throw err.response?.data || { message: "Failed to reject booking" };
    }
  },

  // Update booking (deputy can update any booking)
  updateBooking: async (bookingId, updates) => {
    try {
      const res = await axiosInstance.put(`/api/deputy/${bookingId}`, updates);
      return res.data; // { success: true, booking: {...} }
    } catch (err) {
      throw err.response?.data || { message: "Failed to update booking" };
    }
  },
};

export default deputyService;

