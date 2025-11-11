import bookingService from "./bookingService.js";
import userService from "./userService.js";
import busService from "./busService.js";
import deputyService from "./deputyService.js";
import principalService from "./principalService.js";
import driverService from "./driverService.js";

const dashboardService = {
  getDashboard: async (role, userId) => {
    try {
      switch (role) {
        case "teacher": {
          const { bookings: myBookings } = await bookingService.getMyBookings();
          const upcomingBookings = myBookings.filter(
            (b) => new Date(b.tripDate) >= new Date()
          );
          return {
            totalBookings: myBookings.length,
            upcomingBookings,
          };
        }

        case "admin": {
          const [usersRes, busesRes, allBookingsRes] = await Promise.all([
            userService.getAllUsers(),
            busService.getAllBuses(),
            bookingService.getAllBookings(),
          ]);
          const teachersCount = usersRes.users?.filter(u => u.role === "teacher").length || 0;
          return {
            teachersCount,
            busesCount: busesRes.buses?.length || 0,
            bookingsCount: allBookingsRes.bookings?.length || 0,
          };
        }

        case "deputy": {
          const { bookings: pendingBookings } = await deputyService.getPendingBookings();
          return {
            pendingBookings,
            totalPending: pendingBookings.length,
          };
        }

        case "principal": {
          const { bookings: deputyApprovedBookings } = await principalService.getDeputyApprovedBookings();
          return {
            deputyApprovedBookings,
            totalDeputyApproved: deputyApprovedBookings.length,
          };
        }

        case "driver": {
          const { bookings: trips } = await driverService.getTrips();
          const { bookings: extraBusesBookings } = await driverService.getExtraBuses();
          return {
            trips,
            extraBuses: extraBusesBookings,
          };
        }

        default:
          throw { message: `Unknown role: ${role}` };
      }
    } catch (err) {
      throw err.response?.data || { message: "Failed to fetch dashboard data" };
    }
  },
};

export default dashboardService;