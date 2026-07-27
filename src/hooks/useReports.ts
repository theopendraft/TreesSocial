import { useState, useEffect } from "react";
import { reportsAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserAvatar?: string;
  reason: string;
  description: string;
  status: "pending" | "under_review" | "resolved" | "dismissed";
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

export const useReports = () => {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reports on mount
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await reportsAPI.getUserReports();
      if (response.success && response.data) {
        setReports(response.data);
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

  const createReport = async (reportData: {
    reportedUserId: string;
    reportedUserName: string;
    reportedUserAvatar?: string;
    reason: string;
    description: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await reportsAPI.createReport({
        ...reportData,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (response.success && response.data) {
        setReports((prev) => [response.data, ...prev]);
        toast({
          title: "Report submitted",
          description: "Your report has been submitted successfully",
        });
        return response.data;
      }
      return null;
    } catch (err) {
      const errorMessage = "Failed to submit report";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateReport = async (
    reportId: string,
    updates: Partial<UserReport>
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await reportsAPI.updateReport(reportId, updates);

      if (response.success && response.data) {
        setReports((prev) =>
          prev.map((report) =>
            report.id === reportId
              ? { ...report, ...updates, updatedAt: new Date().toISOString() }
              : report
          )
        );
        toast({
          title: "Report updated",
          description: "Report has been updated successfully",
        });
        return response.data;
      }
      return null;
    } catch (err) {
      const errorMessage = "Failed to update report";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getReportsByStatus = (status: UserReport["status"]): UserReport[] => {
    return reports.filter((report) => report.status === status);
  };

  const getPendingReportsCount = (): number => {
    return reports.filter((report) => report.status === "pending").length;
  };

  const getResolvedReportsCount = (): number => {
    return reports.filter((report) => report.status === "resolved").length;
  };

  const hasReportedUser = (userId: string): boolean => {
    return reports.some(
      (report) =>
        report.reportedUserId === userId &&
        ["pending", "under_review"].includes(report.status)
    );
  };

  const getReportReasons = (): string[] => {
    return [
      "Inappropriate content",
      "Harassment or bullying",
      "Spam",
      "Fake account",
      "Inappropriate photos",
      "Hate speech",
      "Violence or threats",
      "Scam or fraud",
      "Minor safety",
      "Intellectual property violation",
      "Other",
    ];
  };

  const getStatusColor = (status: UserReport["status"]): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "dismissed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: UserReport["status"]): string => {
    switch (status) {
      case "pending":
        return "Pending";
      case "under_review":
        return "Under Review";
      case "resolved":
        return "Resolved";
      case "dismissed":
        return "Dismissed";
      default:
        return "Unknown";
    }
  };

  return {
    // State
    reports,
    isLoading,
    error,

    // Actions
    createReport,
    updateReport,

    // Helpers
    getReportsByStatus,
    getPendingReportsCount,
    getResolvedReportsCount,
    hasReportedUser,
    getReportReasons,
    getStatusColor,
    getStatusText,

    // Refresh functions
    refreshReports: loadReports,
  };
};
