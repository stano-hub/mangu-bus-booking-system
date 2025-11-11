import axiosInstance from "./api/axiosInstance";

const driverService = {
  // Get all trips for driver
  getTrips: async () => {
    try {
      const res = await axiosInstance.get("/api/driver-panel/trips");
      return res.data; // { success: true, bookings: [...] }
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch trips" };
    }
  },

  // Acknowledge trip
  acknowledgeTrip: async (bookingId) => {
    try {
      const res = await axiosInstance.put(`/api/driver-panel/${bookingId}/acknowledge`);
      return res.data; // { success: true, message, booking: {...} }
    } catch (err) {
      throw err.response?.data || { message: "Failed to acknowledge trip" };
    }
  },

  // Add extra bus to trip
  addExtraBus: async (bookingId, busData) => {
    try {
      const res = await axiosInstance.put(`/api/driver-panel/${bookingId}/extra-bus`, {
        busNumber: busData.busNumber,
        capacity: busData.capacity,
        description: busData.description // Optional
      });
      return res.data; // { success: true, message, booking: {...} }
    } catch (err) {
      throw err.response?.data || { message: "Failed to add extra bus" };
    }
  },

  // Get all bookings with extra buses
  getExtraBuses: async () => {
    try {
      const res = await axiosInstance.get("/api/driver-panel/extra-buses");
      return res.data; // { success: true, bookings: [...] }
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch extra buses" };
    }
  },
};

export default driverService;

