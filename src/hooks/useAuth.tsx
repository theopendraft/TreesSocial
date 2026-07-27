import React, { useState, useEffect, createContext, useContext } from "react";
import { authAPI, UserProfile } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (
    fullName: string,
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    options?: {
      autoMatchTarget?: string;
      autoMatchBy?: "id" | "email" | "username";
    }
  ) => Promise<boolean>;
  logout: () => void;
  checkUsername: (username: string) => Promise<boolean>;
  getUsernameSuggestions: (baseUsername: string) => Promise<string[]>;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await authAPI.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          // Silently remove invalid token - don't show error on initial load
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (
    identifier: string,
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ identifier, password });
      if (response.success && response.data) {
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        toast({
          title: "Success",
          description: "Login successful!",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description:
          error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fullName: string,
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    options?: {
      autoMatchTarget?: string;
      autoMatchBy?: "id" | "email" | "username";
    }
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (password !== confirmPassword) {
        toast({
          title: "Registration Failed",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return false;
      }

      const response = await authAPI.register({
        fullName,
        email,
        username,
        password,
        ...(options?.autoMatchTarget
          ? {
              autoMatchTarget: options.autoMatchTarget,
              autoMatchBy: options.autoMatchBy || "username",
            }
          : {}),
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        toast({
          title: "Success",
          description: "Registration successful!",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description:
          error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("token");
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  const checkUsername = async (username: string): Promise<boolean> => {
    try {
      const response = await authAPI.checkUsername(username);
      return (response.success && response.data?.available) || false;
    } catch (error) {
      console.error("Username check failed:", error);
      return false;
    }
  };

  const getUsernameSuggestions = async (
    baseUsername: string
  ): Promise<string[]> => {
    try {
      const response = await authAPI.checkUsername(baseUsername);
      return response.data?.suggestions || [];
    } catch (error) {
      console.error("Username suggestions failed:", error);
      return [];
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkUsername,
    getUsernameSuggestions,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
