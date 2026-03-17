import axiosInstance from "./api/axiosInstance";

const deputyService = {
  // Get all pending bookings
  getPendingBookings: async () => {
    try {
      const res = await axiosInstance.get("/api/deputy/pending");
      return res.data; // { success: true, bookings: [...] }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
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
      throw err; // Error already transformed by axiosInstance interceptor
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
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // Update booking (deputy can update any booking)
  updateBooking: async (bookingId, updates) => {
    try {
      const res = await axiosInstance.put(`/api/deputy/${bookingId}`, updates);
      return res.data; // { success: true, booking: {...} }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },
  // Get available buses (Deputy)
  getAvailableBuses: async () => {
    try {
      const res = await axiosInstance.get("/api/deputy/available-buses");
      return res.data; // { success: true, buses: [...] }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },
};

export default deputyService;

