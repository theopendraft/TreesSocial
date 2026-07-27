import { useState, useEffect } from "react";
import { adminAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface AdminReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: string;
  description: string;
  status: "pending" | "under_review" | "resolved" | "dismissed";
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

interface AdminAnalytics {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    bannedUsers: number;
  };
  contentStats: {
    totalPosts: number;
    postsToday: number;
    totalReports: number;
    pendingReports: number;
  };
  streamStats: {
    liveStreams: number;
    totalStreamTime: number;
    topStreamers: Array<{
      id: string;
      name: string;
      viewers: number;
    }>;
  };
}

export const useAdmin = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [reportTotal, setReportTotal] = useState(0);

  // Load data on mount
  useEffect(() => {
    loadUsers();
    loadReports();
    loadAnalytics();
  }, []);

  const loadUsers = async (page = 1, limit = 20) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.getUsers(page, limit);

      if (response.success && response.data) {
        const adminUsers = response.data.users.map((user: any) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          isVerified: user.isVerified || false,
          isBanned: user.isBanned || false,
          createdAt: user.createdAt || new Date().toISOString(),
          lastLogin: user.lastLogin,
        }));

        if (page === 1) {
          setUsers(adminUsers);
        } else {
          setUsers((prev) => [...prev, ...adminUsers]);
        }
        setUserTotal(response.data.total);
        setUserPage(page);
      }
    } catch (err) {
      const errorMessage = "Failed to load users";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadReports = async (page = 1, limit = 20) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.getReports(page, limit);

      if (response.success && response.data) {
        if (page === 1) {
          setReports(response.data.reports);
        } else {
          setReports((prev) => [...prev, ...response.data.reports]);
        }
        setReportTotal(response.data.total);
        setReportPage(page);
      }
    } catch (err) {
      const errorMessage = "Failed to load reports";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.getAnalytics();

      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (err) {
      const errorMessage = "Failed to load analytics";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const banUser = async (userId: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.banUser(userId, reason);

      if (response.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, isBanned: true } : user
          )
        );

        toast({
          title: "Success",
          description: "User has been banned successfully",
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = "Failed to ban user";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.unbanUser(userId);

      if (response.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, isBanned: false } : user
          )
        );

        toast({
          title: "Success",
          description: "User has been unbanned successfully",
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = "Failed to unban user";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportStatus = async (
    reportId: string,
    status: AdminReport["status"],
    notes?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.updateReport(reportId, status, notes);

      if (response.success) {
        setReports((prev) =>
          prev.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  status,
                  adminNotes: notes,
                  updatedAt: new Date().toISOString(),
                }
              : report
          )
        );

        toast({
          title: "Success",
          description: "Report status updated successfully",
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = "Failed to update report";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = (query: string): AdminUser[] => {
    if (!query.trim()) return users;

    const lowerQuery = query.toLowerCase();
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        user.name.toLowerCase().includes(lowerQuery)
    );
  };

  const filterReports = (status?: AdminReport["status"]): AdminReport[] => {
    if (!status) return reports;
    return reports.filter((report) => report.status === status);
  };

  const getReportStats = () => {
    const pending = reports.filter((r) => r.status === "pending").length;
    const underReview = reports.filter(
      (r) => r.status === "under_review"
    ).length;
    const resolved = reports.filter((r) => r.status === "resolved").length;
    const dismissed = reports.filter((r) => r.status === "dismissed").length;

    return { pending, underReview, resolved, dismissed };
  };

  const getUserStats = () => {
    const banned = users.filter((u) => u.isBanned).length;
    const verified = users.filter((u) => u.isVerified).length;
    const total = users.length;

    return { banned, verified, total };
  };

  const loadMoreUsers = async () => {
    if (users.length >= userTotal) return;
    await loadUsers(userPage + 1);
  };

  const loadMoreReports = async () => {
    if (reports.length >= reportTotal) return;
    await loadReports(reportPage + 1);
  };

  return {
    // State
    users,
    reports,
    analytics,
    isLoading,
    error,
    userTotal,
    reportTotal,

    // Actions
    banUser,
    unbanUser,
    updateReportStatus,

    // Helpers
    searchUsers,
    filterReports,
    getReportStats,
    getUserStats,

    // Pagination
    loadMoreUsers,
    loadMoreReports,

    // Refresh functions
    refreshUsers: () => loadUsers(1),
    refreshReports: () => loadReports(1),
    refreshAnalytics: loadAnalytics,
  };
};
