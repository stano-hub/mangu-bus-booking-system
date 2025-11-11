//src/hooks/queries/useBookings.js
import { useState, useEffect, useCallback } from "react";
import bookingService from "../../services/bookingService";

/**
 * Custom hook to manage user bookings
 * - Fetches all bookings for the logged-in user
 * - Allows refreshing bookings
 * - Handles loading and error states
 */
const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await bookingService.getMyBookings();
      setBookings(data?.bookings || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const refresh = () => {
    fetchBookings();
  };

  return { bookings, loading, error, refresh };
};

export default useBookings;
