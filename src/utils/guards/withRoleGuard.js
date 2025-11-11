//src/utils/guards/withRoleGuard.js
// src/utils/guards/withRoleGuard.js

import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "./index";

/**
 * Higher-Order Component (HOC) for protecting routes based on user roles.
 *
 * @param {React.ComponentType} Component - The component to render if access is allowed.
 * @param {Array<string>} allowedRoles - Roles that can access this component.
 * @returns {React.FC} - Protected component that either renders or redirects.
 */
const withRoleGuard = (Component, allowedRoles = []) => {
  const RoleProtectedComponent = (props) => {
    const user = getCurrentUser();

    // Not logged in
    if (!user) {
      return <Navigate to="/auth/signin" replace />;
    }

    // Logged in but role not allowed
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }

    // Authorized
    return <Component {...props} />;
  };

  return RoleProtectedComponent;
};

export default withRoleGuard;
