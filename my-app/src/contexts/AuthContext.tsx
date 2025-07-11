import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRoleType, AuthContextType } from '../types';
import { UserRole } from '../types';

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in test data
      const testUser = TEST_USERS.find(u => u.email === email && u.password === password);
      
      if (!testUser) {
        throw new Error('Invalid email or password');
      }
      
      // Create user object for the app
      const mockUser: User = {
        id: testUser.id,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role,
        createdAt: new Date()
      };
      
      console.log('AuthProvider - login successful, setting user:', mockUser);
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      console.log('AuthProvider - user saved to localStorage, navigation will be handled by DashboardRoute');
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw new Error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRoleType) => {
    console.log('AuthProvider - signup called with:', { name, email, role });
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = TEST_USERS.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Mock user data - in real app, this would come from API
      const mockUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role,
        createdAt: new Date()
      };
      
      console.log('AuthProvider - signup successful, creating user:', mockUser);
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      console.log('AuthProvider - user saved to localStorage, navigation will be handled by DashboardRoute');
    } catch (error) {
      console.error('Signup error in AuthContext:', error);
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('AuthProvider - logout called');
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