//src/types/index.ts
// ==============================
// 🧩 Global App Types
// ==============================

// ---------- Auth ----------
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "teacher" | "admin" | "deputy" | "principal" | "driver";
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  message?: string;
}

export interface ProfileResponse {
  success: boolean;
  user: User;
  message?: string;
}

// ---------- Bus ----------
export interface Bus {
  _id: string;
  name: string;
  plateNumber: string;
  capacity: number;
  driverId?: string;
  route?: string;
  status?: "AVAILABLE" | "ON_TRIP" | "MAINTENANCE";
  createdAt?: string;
  updatedAt?: string;
}

// ---------- Booking ----------
export interface Booking {
  _id: string;
  teacherId: string;
  busId: string;
  tripDate: string;
  purpose: string;
  destination: string;
  status:
    | "PENDING"
    | "DEPUTY_APPROVED"
    | "PRINCIPAL_APPROVED"
    | "REJECTED"
    | "CANCELED";
  buses?: Bus[];
  extraBuses?: Bus[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingResponse {
  success: boolean;
  booking: Booking;
  message?: string;
}

export interface BookingsResponse {
  success: boolean;
  bookings: Booking[];
}

// ---------- Dashboard ----------
export interface DashboardData {
  totalBookings?: number;
  upcomingBookings?: Booking[];
  teachersCount?: number;
  busesCount?: number;
  bookingsCount?: number;
  pendingBookings?: Booking[];
  totalPending?: number;
  deputyApprovedBookings?: Booking[];
  totalDeputyApproved?: number;
  trips?: Booking[];
  extraBuses?: Bus[];
}

// ---------- API Error ----------
export interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, any>;
}

// ---------- Redux Auth State ----------
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  message: string | null;
}
