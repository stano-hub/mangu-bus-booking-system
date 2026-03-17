import axiosInstance from "./api/axiosInstance";

const driverService = {
  // Get all trips for driver
  getTrips: async () => {
    try {
      const res = await axiosInstance.get("/api/driver-panel/trips");
      return res.data; // { success: true, bookings: [...] }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // Acknowledge trip
  acknowledgeTrip: async (bookingId) => {
    try {
      const res = await axiosInstance.put(`/api/driver-panel/${bookingId}/acknowledge`);
      return res.data; // { success: true, message, booking: {...} }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
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
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },

  // Get all bookings with extra buses
  getExtraBuses: async () => {
    try {
      const res = await axiosInstance.get("/api/driver-panel/extra-buses");
      return res.data; // { success: true, bookings: [...] }
    } catch (err) {
      throw err; // Error already transformed by axiosInstance interceptor
    }
  },
};

export default driverService;

