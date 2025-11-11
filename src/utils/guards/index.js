//src/utils/guards/index.js
// ==============================
// 🛡️ Route & Access Guards
// ==============================

// Check if user is logged in (JWT exists)
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user || null;
  } catch {
    return null;
  }
};

// Verify if current user has one of the allowed roles
export const hasRole = (allowedRoles = []) => {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
};

// Protect a route (redirects unauthenticated users)
export const requireAuth = (navigate) => {
  if (!isAuthenticated()) {
    navigate("/auth/signin", { replace: true });
    return false;
  }
  return true;
};

// Protect admin-only or role-based routes
export const requireRole = (navigate, allowedRoles = []) => {
  const user = getCurrentUser();
  if (!user || !allowedRoles.includes(user.role)) {
    navigate("/unauthorized", { replace: true });
    return false;
  }
  return true;
};

// Logout guard — clears all session data
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Check if JWT is expired (optional if backend handles it)
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // Treat invalid token as expired
  }
};

// Auto logout if token expired
export const autoLogoutIfExpired = (navigate) => {
  const token = localStorage.getItem("token");
  if (token && isTokenExpired(token)) {
    clearAuth();
    navigate("/auth/signin", { replace: true });
  }
};
