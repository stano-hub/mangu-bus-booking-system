import axiosInstance from "./api/axiosInstance";

const principalService = {
  // Get all deputy-approved bookings
  getDeputyApprovedBookings: async () => {
    try {
      const res = await axiosInstance.get("/api/principal/deputy-approved");
      return res.data; // { success: true, bookings: [...] }
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch deputy-approved bookings" };
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
      throw err.response?.data || { message: "Failed to approve booking" };
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
      throw err.response?.data || { message: "Failed to reject booking" };
    }
  },
};

export default principalService;

