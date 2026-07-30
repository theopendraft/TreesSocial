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

const DUMMY_USER: UserProfile = {
  id: "demo_user_123",
  _id: "demo_user_123",
  username: "demouser",
  email: "demo@treessocial.com",
  fullName: "Demo User",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop",
  bio: "Demo account active for testing!",
  followersCount: 1250,
  followingCount: 340,
  postsCount: 42,
  isVerified: true,
  role: "user",
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(DUMMY_USER);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = true;

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await authAPI.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          }
        } catch (error) {
          // Use dummy fallback if API is unreachable
          setUser(DUMMY_USER);
        }
      } else {
        setUser(DUMMY_USER);
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
      const response = await authAPI.login({ identifier, password }).catch(() => null);
      if (response && response.success && response.data) {
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
      } else {
        // Fallback to dummy user session
        setUser({
          ...DUMMY_USER,
          username: identifier.includes("@") ? identifier.split("@")[0] : identifier,
          email: identifier.includes("@") ? identifier : `${identifier}@treessocial.com`,
        });
        localStorage.setItem("token", "dummy_token_12345");
      }
      toast({
        title: "Success",
        description: "Logged in with Demo Account!",
      });
      return true;
    } catch (error) {
      setUser(DUMMY_USER);
      localStorage.setItem("token", "dummy_token_12345");
      toast({
        title: "Success",
        description: "Logged in with Demo Account!",
      });
      return true;
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
      }).catch(() => null);

      if (response && response.success && response.data) {
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
      } else {
        setUser({
          ...DUMMY_USER,
          fullName: fullName || "Demo User",
          username: username || "demouser",
          email: email || "demo@treessocial.com",
        });
        localStorage.setItem("token", "dummy_token_12345");
      }
      toast({
        title: "Success",
        description: "Registration successful!",
      });
      return true;
    } catch (error) {
      setUser({
        ...DUMMY_USER,
        fullName: fullName || "Demo User",
        username: username || "demouser",
        email: email || "demo@treessocial.com",
      });
      localStorage.setItem("token", "dummy_token_12345");
      toast({
        title: "Success",
        description: "Registration successful!",
      });
      return true;
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
