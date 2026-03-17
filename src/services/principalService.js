import axiosInstance from "./api/axiosInstance";

const principalService = {
  // Get all deputy-approved bookings
  getDeputyApprovedBookings: async () => {
    try {
      const res = await axiosInstance.get("/api/principal/deputy-approved");
      return res.data; // { success: true, bookings: [...] }
    } catch (err) {
      // Re-throw for proper error handling
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // Approve booking (principal)
  approveBooking: async (bookingId, comment) => {
    try {
      const res = await axiosInstance.put(`/api/principal/${bookingId}/principal-approve`, {
        comment: comment // Optional
      });
      return res.data; // { success: true, booking: {...} }
    } catch (err) {
      // Re-throw for proper error handling
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // Reject booking (principal)
  rejectBooking: async (bookingId, comment) => {
    try {
      const res = await axiosInstance.put(`/api/principal/${bookingId}/principal-reject`, {
        comment: comment // Optional
      });
      return res.data; // { success: true, booking: {...} }
    } catch (err) {
      // Re-throw for proper error handling
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },
};

export default principalService;
