import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export const NavigationHelper: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('NavigationHelper - user:', user, 'pathname:', location.pathname);
    
    // If we have a user and we're not already on a dashboard page, navigate to appropriate dashboard
    if (user && !location.pathname.startsWith('/sales') && !location.pathname.startsWith('/analyst') && !location.pathname.startsWith('/pr/')) {
      if (user.role === UserRole.SALES_EXECUTIVE) {
        console.log('NavigationHelper - navigating to /sales');
        navigate('/sales');
      } else if (user.role === UserRole.PRICING_ANALYST) {
        console.log('NavigationHelper - navigating to /analyst');
        navigate('/analyst');
      }
    } else if (!user && location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/test') {
      // If no user and not on login or signup page, navigate to login page
      console.log('NavigationHelper - no user, navigating to /login');
      navigate('/login');
    }
  }, [user, navigate, location.pathname]);

  return null; // This component doesn't render anything
}; 