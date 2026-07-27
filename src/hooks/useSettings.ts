import { useState, useEffect } from "react";
import { settingsAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface UserSettings {
  account: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
  };
  privacy: {
    profileVisibility: "public" | "friends" | "private";
    showOnlineStatus: boolean;
    allowMessagesFrom: "everyone" | "friends" | "none";
    showLastSeen: boolean;
    allowProfileViews: boolean;
  };
  notifications: {
    newMatches: boolean;
    messages: boolean;
    likes: boolean;
    superLikes: boolean;
    subscriptionUpdates: boolean;
    streamNotifications: boolean;
  };
  app: {
    theme: "light" | "dark" | "system";
    language: string;
    timezone: string;
    autoPlayVideos: boolean;
    soundEffects: boolean;
  };
}

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await settingsAPI.getSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      const errorMessage = "Failed to load settings";
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

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedSettings = { ...settings, ...updates } as UserSettings;
      const response = await settingsAPI.updateAll(updatedSettings);
      if (response.success && response.data) {
        setSettings(response.data);
        toast({
          title: "Success",
          description: "Settings updated successfully",
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = "Failed to update settings";
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

  const updateAccountSettings = async (
    updates: Partial<UserSettings["account"]>
  ) => {
    if (!settings) return false;

    const response = await settingsAPI.updateAccount(updates);
    if (response.success) {
      const merged = {
        ...settings,
        account: { ...settings.account, ...updates },
      } as UserSettings;
      setSettings(merged);
      return true;
    }
    return false;
  };

  const updatePrivacySettings = async (
    updates: Partial<UserSettings["privacy"]>
  ) => {
    if (!settings) return false;
    const response = await settingsAPI.updatePrivacy(updates);
    if (response.success) {
      const merged = {
        ...settings,
        privacy: { ...settings.privacy, ...updates },
      } as UserSettings;
      setSettings(merged);
      return true;
    }
    return false;
  };

  const updateNotificationSettings = async (
    updates: Partial<UserSettings["notifications"]>
  ) => {
    if (!settings) return false;
    const response = await settingsAPI.updateNotifications(updates);
    if (response.success) {
      const merged = {
        ...settings,
        notifications: { ...settings.notifications, ...updates },
      } as UserSettings;
      setSettings(merged);
      return true;
    }
    return false;
  };

  const updateAppSettings = async (updates: Partial<UserSettings["app"]>) => {
    if (!settings) return false;
    const response = await settingsAPI.updateApp(updates);
    if (response.success) {
      const merged = {
        ...settings,
        app: { ...settings.app, ...updates },
      } as UserSettings;
      setSettings(merged);
      return true;
    }
    return false;
  };

  const exportSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await settingsAPI.exportSettings();
      if (response.success && response.data) {
        // Create and download file
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `settings-export-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Settings exported successfully",
        });
      }
    } catch (err) {
      const errorMessage = "Failed to export settings";
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

  const resetSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await settingsAPI.resetSettings();
      if (response.success) {
        await loadSettings(); // Reload settings from server
        toast({
          title: "Success",
          description: "Settings reset to default values",
        });
      }
    } catch (err) {
      const errorMessage = "Failed to reset settings";
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

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    updateAccountSettings,
    updatePrivacySettings,
    updateNotificationSettings,
    updateAppSettings,
    exportSettings,
    resetSettings,
    refreshSettings: loadSettings,
    clearError: () => setError(null),
  };
};
