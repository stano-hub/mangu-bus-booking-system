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
  
  // Delete all cancelled bookings (Admin only)
  deleteAllCancelledBookings: async () => {
    try {
      const res = await axiosInstance.delete("/api/bookings/cancelled");
      return res.data;
    } catch (err) {
      throw err;
    }
  },
  // Delete a single booking (Admin only, only if status is CANCELLED)
  deleteBookingAdmin: async (bookingId) => {
    try {
      const res = await axiosInstance.delete(`/api/bookings/${bookingId}/delete`);
      return res.data;
    } catch (err) {
      throw err;
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
  
  // Upload a document to Supabase storage
  uploadDocument: async (file) => {
    try {
      const { supabase } = await import("./supabaseClient");
      const bucket = process.env.REACT_APP_SUPABASE_STORAGE_BUCKET || 'TRM Deals';
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `booking-docs/${fileName}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { publicUrl, fileName: file.name };
    } catch (err) {
      console.error('Supabase upload error:', err);
      throw new Error('Failed to upload document to storage');
    }
  },
  // Upload multiple documents to Supabase storage
  uploadDocuments: async (files) => {
    try {
      const { supabase } = await import("./supabaseClient");
      const bucket = process.env.REACT_APP_SUPABASE_STORAGE_BUCKET || 'TRM Deals';
      
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `booking-docs/${fileName}`;

        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        return { url: publicUrl, name: file.name };
      });

      return await Promise.all(uploadPromises);
    } catch (err) {
      console.error('Supabase upload error:', err);
      throw new Error('Failed to upload documents to storage');
    }
  },
};

export default bookingService;