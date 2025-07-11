import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, UserRoleType, AuthContextType } from "../types";
import { UserRole } from "../types";
import { authAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthProvider - useEffect running, checking auth token");
    // Check for stored auth token on app load
    const token = localStorage.getItem("authToken");
    if (token) {
      // Try to get user profile from API
      authAPI
        .getProfile()
        .then((profileData) => {
          console.log("AuthProvider - found user profile:", profileData);
          const user: User = {
            id: profileData.id,
            name: profileData.username,
            email: profileData.email,
            role:
              profileData.role === "SE"
                ? UserRole.SALES_EXECUTIVE
                : UserRole.PRICING_ANALYST,
            createdAt: new Date(profileData.created_at),
          };
          setUser(user);
        })
        .catch((error) => {
          console.error("Error getting user profile:", error);
          // Remove invalid token
          localStorage.removeItem("authToken");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      console.log("AuthProvider - no auth token found");
      setIsLoading(false);
    }
  }, []);

  // Debug effect to log user state changes
  useEffect(() => {
    console.log("AuthProvider - user state changed:", user);
  }, [user]);

  const login = async (email: string, password: string) => {
    console.log("AuthProvider - login called with:", email);
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email, password });

      // Get user profile to get complete user data
      const profileData = await authAPI.getProfile();

      // Create user object for the app
      const user: User = {
        id: profileData.id,
        name: profileData.username,
        email: profileData.email,
        role:
          profileData.role === "SE"
            ? UserRole.SALES_EXECUTIVE
            : UserRole.PRICING_ANALYST,
        createdAt: new Date(profileData.created_at),
      };

      console.log("AuthProvider - login successful, setting user:", user);
      setUser(user);

      console.log("AuthProvider - user set, triggering navigation");
      // Trigger navigation based on role
      if (user.role === UserRole.SALES_EXECUTIVE) {
        navigate("/sales");
      } else if (user.role === UserRole.PRICING_ANALYST) {
        navigate("/analyst");
      }
    } catch (error) {
      console.error("Login error in AuthContext:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRoleType
  ) => {
    console.log("AuthProvider - signup called with:", { name, email, role });
    setIsLoading(true);
    try {
      const response = await authAPI.register({
        username: name,
        email,
        password,
        role: role === UserRole.SALES_EXECUTIVE ? "SE" : "PA",
      });

      // Get user profile to get complete user data
      const profileData = await authAPI.getProfile();

      // Create user object for the app
      const user: User = {
        id: profileData.id,
        name: profileData.username,
        email: profileData.email,
        role:
          profileData.role === "SE"
            ? UserRole.SALES_EXECUTIVE
            : UserRole.PRICING_ANALYST,
        createdAt: new Date(profileData.created_at),
      };

      console.log("AuthProvider - signup successful, creating user:", user);
      setUser(user);

      console.log("AuthProvider - user set, triggering navigation");
      // Trigger navigation based on role
      if (user.role === UserRole.SALES_EXECUTIVE) {
        navigate("/sales");
      } else if (user.role === UserRole.PRICING_ANALYST) {
        navigate("/analyst");
      }
    } catch (error) {
      console.error("Signup error in AuthContext:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log("AuthProvider - logout called");
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API call fails
    }
    setUser(null);
    // Navigation will be handled by the DashboardRoute component
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading,
  };

  console.log("AuthProvider - rendering with value:", {
    user: value.user,
    isLoading: value.isLoading,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
