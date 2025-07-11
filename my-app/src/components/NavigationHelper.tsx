import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export const NavigationHelper: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Navigate based on user role
      if (user.role === UserRole.SALES_EXECUTIVE) {
        navigate('/sales');
      } else if (user.role === UserRole.PRICING_ANALYST) {
        navigate('/analyst');
      }
    } else {
      // If no user, navigate to auth page
      navigate('/auth');
    }
  }, [user, navigate]);

  return null; // This component doesn't render anything
}; 