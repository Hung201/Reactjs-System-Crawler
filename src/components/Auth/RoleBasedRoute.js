import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { USER_ROLES } from '../../utils/constants';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated } = useAuthStore();
    const location = useLocation();

    // Nếu chưa đăng nhập, chuyển đến login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Nếu không có user hoặc role
    if (!user || !user.role) {
        return <Navigate to="/dashboard" replace />;
    }

    // Kiểm tra quyền truy cập
    const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(user.role);

    if (!hasAccess) {
        // Nếu không có quyền, chuyển đến dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default RoleBasedRoute;
