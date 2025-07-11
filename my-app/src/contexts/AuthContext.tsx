import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRoleType, AuthContextType } from '../types';
import { UserRole } from '../types';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Test user data
const TEST_USERS = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    password: '123456',
    role: UserRole.SALES_EXECUTIVE,
    department: 'Sales',
    region: 'North America'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.analyst@company.com',
    password: '123456',
    role: UserRole.PRICING_ANALYST,
    department: 'Pricing',
    region: 'Global'
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    password: '123456',
    role: UserRole.SALES_EXECUTIVE,
    department: 'Sales',
    region: 'Asia Pacific'
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    password: '123456',
    role: UserRole.PRICING_ANALYST,
    department: 'Pricing',
    region: 'Europe'
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    password: '123456',
    role: UserRole.SALES_EXECUTIVE,
    department: 'Sales',
    region: 'Europe'
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@company.com',
    password: '123456',
    role: UserRole.PRICING_ANALYST,
    department: 'Pricing',
    region: 'North America'
  }
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthProvider - useEffect running, checking localStorage');
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('AuthProvider - found stored user:', userData);
        setUser(userData);
        // Note: Navigation will be handled by the DashboardRoute component
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    } else {
      console.log('AuthProvider - no stored user found');
    }
    setIsLoading(false);
  }, []);

  // Debug effect to log user state changes
  useEffect(() => {
    console.log('AuthProvider - user state changed:', user);
  }, [user]);

  const login = async (email: string, password: string) => {
    console.log('AuthProvider - login called with:', email);
    setIsLoading(true);
    try {
      // Call real API
      const response = await authAPI.login({ email, password });
      
      // Create user object for the app
      const user: User = {
        id: response.user_id || Date.now().toString(),
        name: response.name || email.split('@')[0],
        email: email,
        role: response.role === 'SE' ? UserRole.SALES_EXECUTIVE : UserRole.PRICING_ANALYST,
        createdAt: new Date()
      };
      
      console.log('AuthProvider - API response role:', response.role);
      console.log('AuthProvider - mapped to frontend role:', user.role);
      
              console.log('AuthProvider - login successful, setting user:', user);
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('AuthProvider - user saved to localStorage, triggering navigation');
        // Trigger navigation based on role
        if (user.role === UserRole.SALES_EXECUTIVE) {
          navigate('/sales');
        } else if (user.role === UserRole.PRICING_ANALYST) {
          navigate('/analyst');
        }
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      
      // Fallback to test users if API fails
      console.log('AuthProvider - API failed, trying test users');
      const testUser = TEST_USERS.find(u => u.email === email && u.password === password);
      
      if (testUser) {
        const user: User = {
          id: testUser.id,
          name: testUser.name,
          email: testUser.email,
          role: testUser.role,
          createdAt: new Date()
        };
        
        console.log('AuthProvider - test user found, setting user:', user);
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('AuthProvider - test user saved to localStorage, triggering navigation');
        // Trigger navigation based on role
        if (user.role === UserRole.SALES_EXECUTIVE) {
          navigate('/sales');
        } else if (user.role === UserRole.PRICING_ANALYST) {
          navigate('/analyst');
        }
      } else {
        // Handle CORS errors specifically
        if (error instanceof Error && error.message.includes('CORS_ERROR')) {
          throw new Error('Backend API is not accessible. Please check if the backend is running and CORS is configured properly.');
        }
        
        throw new Error('Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRoleType) => {
    console.log('AuthProvider - signup called with:', { name, email, role });
    setIsLoading(true);
    try {
      // Call real API
      const response = await authAPI.register({
        username: name,
        email,
        password,
        role: role === UserRole.SALES_EXECUTIVE ? 'SE' : 'PA'
      });
      
      // Create user object for the app
      const user: User = {
        id: response.user_id || Date.now().toString(),
        name,
        email,
        role,
        createdAt: new Date()
      };
      
      console.log('AuthProvider - signup role:', role);
      console.log('AuthProvider - API response:', response);
      
      console.log('AuthProvider - signup successful, creating user:', user);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('AuthProvider - user saved to localStorage, triggering navigation');
      // Trigger navigation based on role
      if (user.role === UserRole.SALES_EXECUTIVE) {
        navigate('/sales');
      } else if (user.role === UserRole.PRICING_ANALYST) {
        navigate('/analyst');
      }
    } catch (error) {
      console.error('Signup error in AuthContext:', error);
      
      // Handle CORS errors specifically
      if (error instanceof Error && error.message.includes('CORS_ERROR')) {
        throw new Error('Backend API is not accessible. Please check if the backend is running and CORS is configured properly.');
      }
      
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('AuthProvider - logout called');
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    }
    setUser(null);
    localStorage.removeItem('user');
    // Navigation will be handled by the DashboardRoute component
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading
  };

  console.log('AuthProvider - rendering with value:', { user: value.user, isLoading: value.isLoading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 