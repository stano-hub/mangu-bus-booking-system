# Mangu Bus Booking System - API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Bookings](#bookings)
3. [Buses](#buses)
4. [Deputy](#deputy)
5. [Driver Panel](#driver-panel)
6. [Drivers](#drivers)
7. [Principal](#principal)
8. [Profile](#profile)
9. [Users](#users)

---

## Authentication

Base path: `/api/auth`

### POST `/api/auth/register`
**Description:** Register a new user

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "teacherId": "123",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+254712345678"
}
```

**Notes:**
- Self-registration always creates a user with role "teacher"
- Roles like "admin", "principal", "deputy" and "driver" can only be assigned later by an existing admin

**Response:**
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": { /* User object */ }
}
```

---

### POST `/api/auth/login`
**Description:** Login user with teacherId or email

**Access:** Public

**Request Body:**
```json
{
  "teacherId": "123",
  "email": "john@example.com",
  "password": "password123"
}
```

**Notes:**
- Either `teacherId` OR `email` must be provided (not both required)
- Token is valid for 1 day

**Response:**
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": { /* User object */ }
}
```

---

### POST `/api/auth/logout`
**Description:** Logout user

**Access:** Authenticated (Bearer token required)

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Bookings

Base path: `/api/bookings`

### POST `/api/bookings`
**Description:** Create a new booking (Teacher)

**Access:** Authenticated (Teacher role)

**Request Body:**
```json
{
  "purpose": "Educational trip",
  "venue": "National Museum",
  "tripDate": "2024-12-15",
  "departureTime": "08:00",
  "returnTime": "17:00",
  "students": {
    "form1": 20,
    "form2": 15,
    "form3": 10,
    "form4": 5
  },
  "accompanyingTeachers": ["teacher_id_1", "teacher_id_2"]
}
```

**Required Fields:** `purpose`, `venue`, `tripDate`, `departureTime`, `returnTime`, `accompanyingTeachers`

---

### GET `/api/bookings`
**Description:** Get current user's bookings (Teacher)

**Access:** Authenticated (Any role)

**Response:** List of user's bookings

---

### PUT `/api/bookings/:id`
**Description:** Edit booking (Teacher, only if PENDING or REJECTED)

**Access:** Authenticated (Teacher role)

**Parameters:**
- `id` - Booking ID

**Request Body:** Any booking fields to update

---

### DELETE `/api/bookings/:id`
**Description:** Cancel booking (Teacher, cannot cancel if PRINCIPAL_APPROVED)

**Access:** Authenticated (Teacher role)

**Parameters:**
- `id` - Booking ID

---

### PUT `/api/bookings/:id/resubmit`
**Description:** Resubmit a rejected booking (Teacher)

**Access:** Authenticated (Teacher role)

**Parameters:**
- `id` - Booking ID

**Request Body:** Optional fields to update before resubmitting

---

### GET `/api/bookings/all`
**Description:** Get all bookings (Admin/Principal/Deputy)

**Access:** Authenticated (Admin, Principal, or Deputy role)

**Response:** List of all bookings

---

### GET `/api/bookings/:id`
**Description:** Get booking by ID (Admin/Principal/Deputy)

**Access:** Authenticated (Admin, Principal, or Deputy role)

**Parameters:**
- `id` - Booking ID

---

## Buses

Base path: `/api/buses`

### POST `/api/buses`
**Description:** Add a new bus (Admin only)

**Access:** Authenticated (Admin role)

**Request Body:**
```json
{
  "registrationNumber": "KDG 595C",
  "description": "Uhuru bus",
  "capacity": 45,
  "isActive": true
}
```

**Required Fields:** `registrationNumber`, `description`, `capacity`

---

### GET `/api/buses`
**Description:** Get all buses (Any authenticated user)

**Access:** Authenticated (Any role)

---

### GET `/api/buses/:id`
**Description:** Get bus by ID (Any authenticated user)

**Access:** Authenticated (Any role)

**Parameters:**
- `id` - Bus ID

---

### PUT `/api/buses/:id`
**Description:** Update bus (Admin only)

**Access:** Authenticated (Admin role)

**Parameters:**
- `id` - Bus ID

**Request Body:**
```json
{
  "registrationNumber": "KDG 595C",
  "description": "Uhuru bus (Updated)",
  "capacity": 50,
  "status": "unavailable",
  "isActive": false
}
```

**Note:** `status` can be `available` or `unavailable`

---

## Deputy

Base path: `/api/deputy`

### GET `/api/deputy/pending`
**Description:** Get all pending bookings (Deputy only)

**Access:** Authenticated (Deputy role)

---

### GET `/api/deputy/available-buses`
**Description:** Get all available fleet buses (Deputy only)

**Access:** Authenticated (Deputy role)

---

### PUT `/api/deputy/:id/approve`
**Description:** Approve booking and assign buses (Deputy only)

**Access:** Authenticated (Deputy role)

**Parameters:**
- `id` - Booking ID

**Request Body:**
```json
{
  "buses": ["bus_id_1", "bus_id_2"],
  "comment": "Approved with 2 buses"
}
```

**Required Fields:** `buses`

---

### PUT `/api/deputy/:id/reject`
**Description:** Reject booking (Deputy only)

**Access:** Authenticated (Deputy role)

**Parameters:**
- `id` - Booking ID

**Request Body:**
```json
{
  "comment": "Insufficient buses available"
}
```

---

### PUT `/api/deputy/:id`
**Description:** Update booking (Deputy only, can update any booking)

**Access:** Authenticated (Deputy role)

**Parameters:**
- `id` - Booking ID

**Request Body:** Any booking fields to update

---

## Driver Panel

Base path: `/api/driver-panel`

### GET `/api/driver-panel/trips`
**Description:** Get all trips for driver (Driver only)

**Access:** Authenticated (Driver role)

**Note:** Returns principal-approved or acknowledged trips

---

### PUT `/api/driver-panel/:id/acknowledge`
**Description:** Acknowledge trip (Driver only)

**Access:** Authenticated (Driver role)

**Parameters:**
- `id` - Booking ID

---

### PUT `/api/driver-panel/:id/extra-bus`
**Description:** Add extra bus to trip (Driver only)

**Access:** Authenticated (Driver role)

**Parameters:**
- `id` - Booking ID

**Request Body:**
```json
{
  "busNumber": "EXTRA-01",
  "capacity": 40,
  "description": "Borrowed from another school"
}
```

**Required Fields:** `busNumber`, `capacity`

---

### GET `/api/driver-panel/extra-buses`
**Description:** Get all bookings with extra buses (Driver only)

**Access:** Authenticated (Driver role)

---

## Drivers

Base path: `/api/drivers`

### POST `/api/drivers`
**Description:** Create a new driver (Admin only)

**Access:** Authenticated (Admin role)

**Request Body:**
```json
{
  "name": "Driver Name",
  "email": "driver@example.com",
  "phone": "+254712345678",
  "password": "password123"
}
```

**Required Fields:** `name`, `email`, `password`

---

### GET `/api/drivers`
**Description:** Get all drivers (Admin only)

**Access:** Authenticated (Admin role)

---

### GET `/api/drivers/:id`
**Description:** Get driver by ID (Admin only)

**Access:** Authenticated (Admin role)

**Parameters:**
- `id` - Driver ID

---

### PUT `/api/drivers/:id`
**Description:** Update driver (Admin only)

**Access:** Authenticated (Admin role)

**Parameters:**
- `id` - Driver ID

**Request Body:** Any driver fields to update

---

### DELETE `/api/drivers/:id`
**Description:** Delete driver (Admin only)

**Access:** Authenticated (Admin role)

**Parameters:**
- `id` - Driver ID

---

## Principal

Base path: `/api/principal`

### GET `/api/principal/deputy-approved`
**Description:** Get all deputy-approved bookings (Principal only)

**Access:** Authenticated (Principal role)

---

### PUT `/api/principal/:id/principal-approve`
**Description:** Approve booking (Principal only)

**Access:** Authenticated (Principal role)

**Parameters:**
- `id` - Booking ID

**Request Body:**
```json
{
  "comment": "Approved for trip"
}
```

---

### PUT `/api/principal/:id/principal-reject`
**Description:** Reject booking (Principal only)

**Access:** Authenticated (Principal role)

**Parameters:**
- `id` - Booking ID

**Request Body:**
```json
{
  "comment": "Rejection reason"
}
```

---

## Profile

Base path: `/api/profile`

### GET `/api/profile`
**Description:** Get current user's profile (Any authenticated user)

**Access:** Authenticated (Any role)

---

### PUT `/api/profile`
**Description:** Update current user's profile (Any authenticated user)

**Access:** Authenticated (Any role)

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "teacherId": "456",
  "password": "newpassword123",
  "phone": "+254712345678"
}
```

---

## Users

Base path: `/api/users`

### POST `/api/users`
**Description:** Create a new user (Admin only)

**Access:** Authenticated (Admin role)

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "teacherId": "456",
  "role": "deputy",
  "password": "password123"
}
```

**Required Fields:** `name`, `role`

**Note:** `role` can be: `teacher`, `admin`, `principal`, `deputy`, `driver`

---

### GET `/api/users`
**Description:** Get all users (Admin only)

**Access:** Authenticated (Admin role)

---

### GET `/api/users/teachers`
**Description:** Get all teachers (Accessible by everyone except drivers)

**Access:** Authenticated (Admin, Teacher, Principal, or Deputy role)

---

### PUT `/api/users/:id`
**Description:** Update user role or password (Admin only)

**Access:** Authenticated (Admin role)

**Parameters:**
- `id` - User ID

**Request Body:**
```json
{
  "role": "principal",
  "password": "newpassword123"
}
```

---

### DELETE `/api/users/:id`
**Description:** Delete a user (Admin only)

**Access:** Authenticated (Admin role)

**Parameters:**
- `id` - User ID

---

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Not Authorized |
| 403 | Access Denied (insufficient permissions) |
| 404 | Not Found |
| 500 | Server Error |

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

## User Roles

- **teacher** - Can create and manage their own bookings
- **admin** - Full system access, user management
- **principal** - Can approve/reject deputy-approved bookings
- **deputy** - Can approve/reject pending bookings and assign buses
- **driver** - Can acknowledge trips and manage extra buses

## Booking Status Flow

1. `PENDING` → `DEPUTY_APPROVED` (Deputy approves and assigns buses)
2. `DEPUTY_APPROVED` → `PRINCIPAL_APPROVED` (Principal approves)
3. `PRINCIPAL_APPROVED` → `ACKNOWLEDGED` (Driver acknowledges)
4. Any status can transition to `REJECTED` (with reason)
