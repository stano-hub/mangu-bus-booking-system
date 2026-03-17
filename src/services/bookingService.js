import axiosInstance from "./api/axiosInstance";

const bookingService = {
  // Book a new bus
  bookBus: async (bookingData) => {
    try {
      const res = await axiosInstance.post("/api/bookings", bookingData);
      return res.data; // { success: true, booking: {...} }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // Get bookings of the logged-in user
  getMyBookings: async () => {
    try {
      const res = await axiosInstance.get("/api/bookings");
      return res.data; // { success: true, bookings: [...] }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // Update a booking
  updateBooking: async (bookingId, updates) => {
    try {
      const res = await axiosInstance.put(`/api/bookings/${bookingId}`, updates);
      return res.data; // { success: true, booking: {...} }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    try {
      const res = await axiosInstance.delete(`/api/bookings/${bookingId}`);
      return res.data; // { success: true, message: "Booking canceled" }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // Get all bookings (admin/principal/deputy)
  getAllBookings: async () => {
    try {
      const res = await axiosInstance.get("/api/bookings/all");
      return res.data; // { success: true, bookings: [...] }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },
  // Resubmit a rejected booking
  resubmitBooking: async (bookingId, updates) => {
    try {
      const res = await axiosInstance.put(`/api/bookings/${bookingId}/resubmit`, updates);
      return res.data; // { success: true, booking: {...} }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },
  // Get a single booking by ID
  getBookingById: async (bookingId) => {
    try {
      const res = await axiosInstance.get(`/api/bookings/${bookingId}`);
      return res.data; // { success: true, booking: {...} }
    } catch (err) {
      throw err;
    }
  },
  // Add a comment to a booking
  addComment: async (bookingId, message) => {
    try {
      const res = await axiosInstance.post(`/api/bookings/${bookingId}/comment`, { message });
      return res.data; // { success: true, booking: {...} }
    } catch (err) {
      throw err;
    }
  },
};

export default bookingService;