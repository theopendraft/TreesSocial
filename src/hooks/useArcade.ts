import { useState, useEffect } from "react";
import { arcadeAPI, matchesAPI, Match } from "@/services/api";
import { toast } from "@/hooks/use-toast";

// Helper functions for demo notifications
const handleDemoError = (error: any, message: string) => {
  console.error(message, error);
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
};

const handleDemoSuccess = (message: string) => {
  toast({
    title: "Success",
    description: message,
  });
};

// Mock API functions for demo purposes
const demoAPI = {
  getPotentialMatches: async () => ({ success: true, data: [] }),
  getInteractions: async () => ({ success: true, data: [] }),
  getBlockedUsers: async () => ({ success: true, data: [] }),
  likeUser: async (userId: string) => ({
    success: true,
    matched: Math.random() > 0.8, // 20% chance of match
    matchId: Math.random().toString(36).substr(2, 9),
  }),
  superLikeUser: async (userId: string) => ({
    success: true,
    matched: Math.random() > 0.7, // 30% chance of match
    matchId: Math.random().toString(36).substr(2, 9),
  }),
  dislikeUser: async (userId: string) => ({ success: true }),
  passUser: async (userId: string) => ({ success: true }),
  blockUser: async (userId: string) => ({ success: true }),
  unblockUser: async (userId: string) => ({ success: true }),
};

interface UserPreference {
  basic: {
    ageRange: [number, number];
    distance: number;
    gender: string[];
  };
  appearance: {
    height: [number, number];
    bodyType: string[];
    ethnicity: string[];
  };
  lifestyle: {
    smoking: string[];
    drinking: string[];
    exercise: string[];
    diet: string[];
  };
  personality: {
    traits: string[];
    interests: string[];
    values: string[];
  };
}

export const useArcade = () => {
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [potentialMatches, setPotentialMatches] = useState<
    Array<{
      id: string;
      name: string;
      avatar?: string;
      age: number;
      location: string;
      bio?: string;
      interests: string[];
      matchScore: number;
    }>
  >([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [interactions, setInteractions] = useState<
    Array<{
      userId: string;
      userName: string;
      userAvatar?: string;
      action: "like" | "dislike" | "super_like" | "pass";
      timestamp: string;
    }>
  >([]);
  const [stats, setStats] = useState<{
    totalLikes: number;
    totalDislikes: number;
    totalSuperLikes: number;
    totalMatches: number;
    averageMatchScore: number;
  } | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<
    Array<{
      id: string;
      name: string;
      avatar?: string;
      blockedAt: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadPreferences();
    loadPotentialMatches();
    loadMatches();
    loadInteractions();
    loadStats();
    loadBlockedUsers();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await arcadeAPI.getPreferences();
      if (response.success && response.data) {
        setPreferences(response.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load preferences";
      setError(errorMessage);
      handleDemoError(err, "Failed to load preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPotentialMatches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await demoAPI.getPotentialMatches();
      if (response.success && response.data) {
        setPotentialMatches(response.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load potential matches";
      setError(errorMessage);
      handleDemoError(err, "Failed to load potential matches");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await arcadeAPI.getMatches();
      if (response.success && response.data) {
        setMatches(response.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load matches";
      setError(errorMessage);
      handleDemoError(err, "Failed to load matches");
    } finally {
      setIsLoading(false);
    }
  };

  const loadInteractions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await demoAPI.getInteractions();
      if (response.success && response.data) {
        setInteractions(response.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load interactions";
      setError(errorMessage);
      handleDemoError(err, "Failed to load interactions");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await arcadeAPI.getStatistics();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load stats";
      setError(errorMessage);
      handleDemoError(err, "Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBlockedUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await demoAPI.getBlockedUsers();
      if (response.success && response.data) {
        setBlockedUsers(response.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load blocked users";
      setError(errorMessage);
      handleDemoError(err, "Failed to load blocked users");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (
    updates: Partial<UserPreference>
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await arcadeAPI.updatePreferences(updates);
      if (response.success && response.data) {
        setPreferences(response.data);
      }
      handleDemoSuccess("Preferences updated successfully");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update preferences";
      setError(errorMessage);
      handleDemoError(err, "Failed to update preferences");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const likeUser = async (
    userId: string
  ): Promise<{ matched: boolean; matchId?: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await demoAPI.likeUser(userId);

      if (result.matched) {
        // Add to matches if it's a new match
        const matchedUser = potentialMatches.find((u) => u.id === userId);
        const newMatch: Match = {
          id: result.matchId!,
          userId: userId,
          name: matchedUser?.name || "Unknown",
          age: matchedUser?.age || 0,
          avatar: matchedUser?.avatar || "",
          bio: matchedUser?.bio || "",
          distance: 0,
          compatibility: matchedUser?.matchScore || 0,
          interests: matchedUser?.interests || [],
          photos: matchedUser?.avatar ? [matchedUser.avatar] : [],
        };
        setMatches((prev) => [...prev, newMatch]);
        handleDemoSuccess("It's a match! 🎉");
      } else {
        handleDemoSuccess("Like sent!");
      }

      // Remove from potential matches
      setPotentialMatches((prev) => prev.filter((u) => u.id !== userId));

      // Add to interactions
      const newInteraction = {
        userId,
        userName:
          potentialMatches.find((u) => u.id === userId)?.name || "Unknown",
        userAvatar: potentialMatches.find((u) => u.id === userId)?.avatar,
        action: "like" as const,
        timestamp: new Date().toISOString(),
      };
      setInteractions((prev) => [newInteraction, ...prev]);

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to like user";
      setError(errorMessage);
      handleDemoError(err, "Failed to like user");
      return { matched: false };
    } finally {
      setIsLoading(false);
    }
  };

  const superLikeUser = async (
    userId: string
  ): Promise<{ matched: boolean; matchId?: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await demoAPI.superLikeUser(userId);

      if (result.matched) {
        // Add to matches if it's a new match
        const matchedUser = potentialMatches.find((u) => u.id === userId);
        const newMatch: Match = {
          id: result.matchId!,
          userId: userId,
          name: matchedUser?.name || "Unknown",
          age: matchedUser?.age || 0,
          avatar: matchedUser?.avatar || "",
          bio: matchedUser?.bio || "",
          distance: 0,
          compatibility: matchedUser?.matchScore || 0,
          interests: matchedUser?.interests || [],
          photos: matchedUser?.avatar ? [matchedUser.avatar] : [],
        };
        setMatches((prev) => [...prev, newMatch]);
        handleDemoSuccess("Super like match! 🚀");
      } else {
        handleDemoSuccess("Super like sent!");
      }

      // Remove from potential matches
      setPotentialMatches((prev) => prev.filter((u) => u.id !== userId));

      // Add to interactions
      const newInteraction = {
        userId,
        userName:
          potentialMatches.find((u) => u.id === userId)?.name || "Unknown",
        userAvatar: potentialMatches.find((u) => u.id === userId)?.avatar,
        action: "super_like" as const,
        timestamp: new Date().toISOString(),
      };
      setInteractions((prev) => [newInteraction, ...prev]);

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to super like user";
      setError(errorMessage);
      handleDemoError(err, "Failed to super like user");
      return { matched: false };
    } finally {
      setIsLoading(false);
    }
  };

  const dislikeUser = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await demoAPI.dislikeUser(userId);

      // Remove from potential matches
      setPotentialMatches((prev) => prev.filter((u) => u.id !== userId));

      // Add to interactions
      const newInteraction = {
        userId,
        userName:
          potentialMatches.find((u) => u.id === userId)?.name || "Unknown",
        userAvatar: potentialMatches.find((u) => u.id === userId)?.avatar,
        action: "dislike" as const,
        timestamp: new Date().toISOString(),
      };
      setInteractions((prev) => [newInteraction, ...prev]);

      handleDemoSuccess("User passed");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to dislike user";
      setError(errorMessage);
      handleDemoError(err, "Failed to dislike user");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const passUser = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await demoAPI.passUser(userId);

      // Remove from potential matches
      setPotentialMatches((prev) => prev.filter((u) => u.id !== userId));

      // Add to interactions
      const newInteraction = {
        userId,
        userName:
          potentialMatches.find((u) => u.id === userId)?.name || "Unknown",
        userAvatar: potentialMatches.find((u) => u.id === userId)?.avatar,
        action: "pass" as const,
        timestamp: new Date().toISOString(),
      };
      setInteractions((prev) => [newInteraction, ...prev]);

      handleDemoSuccess("User passed");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to pass user";
      setError(errorMessage);
      handleDemoError(err, "Failed to pass user");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const blockUser = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await demoAPI.blockUser(userId);

      // Add to blocked users
      const blockedUser = {
        id: userId,
        name: potentialMatches.find((u) => u.id === userId)?.name || "Unknown",
        avatar: potentialMatches.find((u) => u.id === userId)?.avatar,
        blockedAt: new Date().toISOString(),
      };
      setBlockedUsers((prev) => [...prev, blockedUser]);

      // Remove from potential matches
      setPotentialMatches((prev) => prev.filter((u) => u.id !== userId));

      handleDemoSuccess("User blocked successfully");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to block user";
      setError(errorMessage);
      handleDemoError(err, "Failed to block user");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unblockUser = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await demoAPI.unblockUser(userId);

      // Remove from blocked users
      setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));

      handleDemoSuccess("User unblocked successfully");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to unblock user";
      setError(errorMessage);
      handleDemoError(err, "Failed to unblock user");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadPotentialMatches();
    loadMatches();
    loadInteractions();
    loadStats();
  };

  const clearError = () => {
    setError(null);
  };

  return {
    preferences,
    potentialMatches,
    matches,
    interactions,
    stats,
    blockedUsers,
    isLoading,
    error,
    updatePreferences,
    likeUser,
    superLikeUser,
    dislikeUser,
    passUser,
    blockUser,
    unblockUser,
    refreshData,
    clearError,
  };
};
