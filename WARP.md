# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
```bash
npm start          # Start dev server (http://localhost:3000)
npm run build      # Production build
npm test           # Run tests in watch mode
npm test -- --coverage  # Run tests with coverage
```

### Single Test Execution
```bash
npm test -- <filename>  # Run specific test file
npm test -- --testNamePattern="<pattern>"  # Run tests matching pattern
```

## Architecture

### Overview
React-based bus booking system frontend with role-based access control. Communicates with a backend API at `localhost:5000` (dev) or Render.com (production). Authentication uses JWT tokens stored in localStorage.

### User Roles & Access Control
The system implements a hierarchical approval workflow with 5 distinct roles:
- **Teacher**: Create bookings, view own bookings
- **Deputy**: Review and approve pending bookings (first approval)
- **Principal**: Final approval for deputy-approved bookings
- **Driver**: View assigned trips and extra buses
- **Admin**: Full system management (users, buses, all bookings)

**Protected Routes**: Each role-specific dashboard at `/{role}` is protected via `ProtectedRoute` component in `App.js`, which checks authentication state and role permissions.

### Authentication Flow
1. **AuthContext** (`src/context/AuthContext.js`) provides global auth state via React Context
2. **Token Management**: JWT stored in localStorage, automatically attached to API requests via axios interceptor
3. **Auto-login**: On mount, checks localStorage for token and fetches user profile to restore session
4. **Guards**: `withRoleGuard` HOC available but not actively used (prefer `ProtectedRoute` pattern in App.js)

### API Communication
**axiosInstance** (`src/services/api/axiosInstance.js`):
- Base URL switches between dev/prod automatically
- Request interceptor attaches JWT tokens (excludes login/signup endpoints)
- Response interceptor handles errors and CORS issues
- 15s timeout for Render cold starts
- withCredentials enabled for session cookies

### Service Layer Pattern
All API calls centralized in `src/services/`:
- **authService**: login, signup, logout, profile CRUD
- **bookingService**: create, read, update, cancel bookings
- **busService**: CRUD operations for buses
- **userService**: user management (admin only)
- **dashboardService**: aggregates data from other services per role

**Note**: dashboardService implements client-side filtering and aggregation, not pure API passthrough.

### Feature-Based Structure
Code organized by role under `src/features/{role}/`:
```
features/
├── admin/      # User management, bus management, all bookings
├── deputy/     # Pending bookings approval
├── principal/  # Deputy-approved bookings final approval
├── driver/     # Assigned trips, extra buses
├── teacher/    # Create bookings, view own bookings
└── shared/     # Cross-role components (BookBus, MyBookings)
```

Each feature contains:
- `pages/`: Dashboard components
- `components/`: Role-specific UI components

### State Management
- **Global Auth**: React Context (`AuthContext`)
- **Component State**: useState for local UI state
- **Data Fetching**: Custom hooks (e.g., `useBookings`) with loading/error states
- **No Redux**: Despite `src/store/authSlice.js` existing, Redux is not configured or used

### Booking Status Workflow
```
PENDING → DEPUTY_APPROVED → PRINCIPAL_APPROVED
   ↓              ↓
REJECTED      CANCELED
```

### Type Definitions
TypeScript types defined in `src/types/index.ts` but codebase is primarily JavaScript. Types document:
- User roles and structure
- Booking statuses and fields
- API response shapes
- Dashboard data structures

### Backend API Structure
**Important**: The backend expects specific field names that differ from early prototypes:

**Booking Creation** (`POST /api/bookings`):
```javascript
{
  purpose: string,        // e.g., "School Competition"
  venue: string,          // e.g., "National Stadium"
  tripDate: Date,         // ISO date string
  departureTime: string,  // e.g., "08:00"
  returnTime: string,     // e.g., "17:00"
  students: {
    form1: number,
    form2: number,
    form3: number,
    form4: number
  },
  accompanyingTeachers: [userId1, userId2] // Array of teacher IDs
}
```

**Bus Model**:
- Uses `busNumber` (not `name` or `plateNumber`)
- Has `capacity` and `status` fields

**Booking Workflow**:
1. Teacher creates booking request (status: PENDING)
2. Deputy approves (status: DEPUTY_APPROVED)
3. Deputy assigns buses to booking
4. Principal approves (status: PRINCIPAL_APPROVED)
5. Driver acknowledges (`driverAcknowledged: true`)
6. Teacher sees "Trip is set to go" when fully approved and acknowledged

## Development Patterns

### Creating New Protected Routes
Follow the pattern in `App.js`:
```javascript
<Route
  path="/new-route"
  element={
    <ProtectedRoute roles={["admin", "teacher"]}>
      <YourComponent />
    </ProtectedRoute>
  }
/>
```

### Adding New API Endpoints
1. Add method to appropriate service in `src/services/`
2. Follow existing pattern: try/catch with axiosInstance, throw transformed errors
3. Update TypeScript types in `src/types/index.ts` if needed

### Service Method Structure
```javascript
methodName: async (params) => {
  try {
    const res = await axiosInstance.method('/api/endpoint', data);
    return res.data; // { success: true, ...data }
  } catch (err) {
    throw err.response?.data || { message: 'Fallback error message' };
  }
}
```

### Dashboard Implementation
When adding role dashboards:
1. Fetch data via `dashboardService.getDashboard(role, userId)`
2. Use `useAuth()` hook to get current user
3. Handle loading/error states explicitly
4. Place in `src/features/{role}/pages/`
