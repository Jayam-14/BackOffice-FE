import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export const NavigationHelper: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only navigate if we're on the root path and have a user
    if (location.pathname === '/' && user) {
      // Navigate based on user role
      if (user.role === UserRole.SALES_EXECUTIVE) {
        navigate('/sales');
      } else if (user.role === UserRole.PRICING_ANALYST) {
        navigate('/analyst');
      }
    } else if (!user && location.pathname !== '/auth') {
      // If no user and not on auth page, navigate to auth page
      navigate('/auth');
    }
  }, [user, navigate, location.pathname]);

  return null; // This component doesn't render anything
}; 